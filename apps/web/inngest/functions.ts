import { db, desc, eq } from "@workspace/db"
import { inngest } from "./client"
import { chat, chunk, file } from "@workspace/db/schema"
import { getImageTextFromUrlUsingLLM, getPdfContentFromUrl } from "@/lib/embed"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { embedMany } from "ai"
import { google } from "@ai-sdk/google"

export const helloWorld = inngest.createFunction(
  {
    id: "hello-world",
    retries: 10,
    onFailure: async ({ event, error }) => {
      // Update file status to fail

      console.log("event")
      console.dir(event, { depth: null })

      const { id } = event.data.event.data

      await db
        .update(file)
        .set({
          state: "done",
          updatedAt: new Date(), // Manually update the 'updatedAt' timestamp
        })
        .where(eq(file.id, id))
        .returning({
          id: file.id,
          state: file.state,
        })
    },
  },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const { id: fileId, ownerId, name, url } = event.data

    // Step 1: Fetch content based on the file type
    const content = await step.run("fetch-file-content", async () => {
      if (url.endsWith(".pdf")) {
        return await getPdfContentFromUrl(url)
      } else {
        // Assuming any other URL is an image
        return await getImageTextFromUrlUsingLLM(url)
      }
    })

    // Step 2: Split the fetched content into smaller chunks
    const chunkedContent = await step.run(
      "split-content-into-chunks",
      async () => {
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 100, // Added for better context between chunks
        })
        return await textSplitter.createDocuments([content])
      }
    )

    // Step 3: Generate embeddings for each chunk in batches
    const allEmbeddings = await step.run("generate-embeddings", async () => {
      const batchSize = 90
      const embeddings: number[][] = []

      for (let i = 0; i < chunkedContent.length; i += batchSize) {
        const batch = chunkedContent.slice(i, i + batchSize)
        const { embeddings: batchEmbeddings } = await embedMany({
          model: google.textEmbeddingModel("text-embedding-004"),
          values: batch.map(chunk => chunk.pageContent),
        })
        embeddings.push(...batchEmbeddings)
      }
      return embeddings
    })

    // Step 4: Prepare and insert the chunks and their embeddings into the database
    await step.run("insert-chunks-into-db", async () => {
      const chunksToInsert = chunkedContent.map((chunk, i) => ({
        id: `${ownerId}/${name}/${i}`,
        userId: ownerId,
        fileId: fileId,
        content: chunk.pageContent,
        embedding: allEmbeddings[i],
      }))

      await insertChunks({ chunks: chunksToInsert })
    })

    await step.run("update-file-state", async () => {
      await db
        .update(file)
        .set({
          state: "done",
          updatedAt: new Date(), // Manually update the 'updatedAt' timestamp
        })
        .where(eq(file.id, fileId))
        .returning({
          id: file.id,
          state: file.state,
        })
    })

    return {
      success: true,
      message: "File processed and embedded successfully.",
    }
  }
)

async function insertChunks({ chunks }: { chunks: any[] }) {
  return await db.insert(chunk).values(chunks)
}
