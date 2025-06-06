import { chunk, file, insertChunkBuildSchema } from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { db, eq } from "@workspace/db"
import { z } from "zod"
import {
  getImageTextFromUrlUsingLLM,
  getPdfContentFromUrl,
} from "../utils/embed"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { embedMany } from "ai"
import { google } from "@ai-sdk/google"

export const fileRouter = {
  uploadFile: privateProcedure
    .input(
      z.object({
        url: z.string().url(),
        pathname: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const newFile = await db
        .insert(file)
        .values({
          ownerId: userId,
          url: input.url,
          path: input.pathname,
          name: input.name,
        })
        .returning()

      if (newFile[0]?.id) {
        await addChunk(newFile[0].id)
      }

      return newFile
    }),
}

// Create a seperate worker later on
async function addChunk(id: string) {
  const fileToChunk = await db.select().from(file).where(eq(file.id, id))
  const fileUrl = fileToChunk[0]?.url || ""
  const fileName = fileToChunk[0]?.name
  const userId = fileToChunk[0]?.ownerId
  const fileId = fileToChunk[0]?.id

  let content: string
  if (!fileUrl.endsWith(".pdf")) {
    content = await getImageTextFromUrlUsingLLM(fileUrl)
  } else {
    content = await getPdfContentFromUrl(fileUrl)
  }
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
  })
  const chunkedContent = await textSplitter.createDocuments([content])

  const batchSize = 90
  const allEmbeddings: number[][] = []

  for (let i = 0; i < chunkedContent.length; i += batchSize) {
    const batch = chunkedContent.slice(i, i + batchSize)
    const { embeddings } = await embedMany({
      // model: openai.embedding("text-embedding-3-small"),
      model: google.textEmbeddingModel("text-embedding-004"),
      values: batch.map(chunk => chunk.pageContent),
    })
    allEmbeddings.push(...embeddings)
  }

  await insertChunks({
    chunks: chunkedContent.map((chunk, i) => ({
      id: `${userId}/${fileName}/${i}`,
      fileId: fileId,
      content: chunk.pageContent,
      embedding: allEmbeddings[i],
    })),
  })
}

// export async function insertChunks({ chunks }: { chunks: typeof insertChunkBuildSchema[]}) {
//   return await db.insert(chunk).values(chunks)
// }

//  update later
export async function insertChunks({ chunks }: { chunks: any[] }) {
  return await db.insert(chunk).values(chunks)
}
