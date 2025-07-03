import { getImageTextFromUrlUsingLLM, getPdfContentFromUrl } from "@/lib/embed"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { db, eq } from "@workspace/db"
import { chunk, file, FILE_TYPE_VALUES } from "@workspace/db/schema"
import { embedMany, generateObject } from "ai"
import { inngest } from "./client"
import { embeddingModel, model } from "@/app/ai/models"

export const fileEmbed = inngest.createFunction(
  {
    id: "doc-doc",
    retries: 10,
    // rateLimit: {
    //   limit: 10,
    //   period: "20m",
    //   key: "event.data.ownerId",
    // },
    onFailure: async ({ event, error }) => {
      console.log("event")
      console.dir(event, { depth: null })

      const { id } = event.data.event.data

      await db
        .update(file)
        .set({
          status: "indexed",
          updatedAt: new Date(), // Manually update the 'updatedAt' timestamp
        })
        .where(eq(file.id, id))
        .returning({
          id: file.id,
          status: file.status,
        })
    },
  },
  { event: "doc/file.embed" },
  async ({ event, step }) => {
    const { id: fileId, ownerId, name, url } = event.data

    // Step 1: Fetch content based on the file type
    const content = await step.run("fetch-file-content", async () => {
      if (url.endsWith(".pdf")) {
        return await getPdfContentFromUrl(url)
      } else {
        return await getImageTextFromUrlUsingLLM(url)
      }
    })

    const fileType = await step.run("get-file-type", async () => {
      const initialContent = content.substring(0, 2000)

      const { object: type } = await generateObject({
        model: model,
        prompt: initialContent,
        output: "enum",
        enum: [...FILE_TYPE_VALUES],
        system:
          `You are given the starting 2000 character of a file` +
          `Classify the file as either` +
          `${FILE_TYPE_VALUES.map(type => `"${type}"`).join(", ")}`,
      })

      return type
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
          model: embeddingModel,
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
          status: "indexed",
          type: fileType,
          updatedAt: new Date(), // Manually update the 'updatedAt' timestamp
        })
        .where(eq(file.id, fileId))
        .returning({
          id: file.id,
          status: file.status,
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
