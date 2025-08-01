import { caller } from "@/trpc/server"
import {
  cosineSimilarity,
  embed,
  generateObject,
  generateText,
  LanguageModelV1Middleware,
} from "ai"
import { z } from "zod"
import { embeddingModel, modelWithStructuredOutputs } from "./models"

const middlewareSchema = z.object({
  selectedFiles: z.array(z.string()),
})

export const ragMiddleware: LanguageModelV1Middleware = {
  transformParams: async ({ params }) => {
    const { prompt: messages, providerMetadata } = params

    const { success, data } = middlewareSchema.safeParse(providerMetadata)
    if (!success) {
      return params
    }

    const recentMessage = messages.pop()

    if (!recentMessage || recentMessage.role !== "user") {
      if (recentMessage) {
        messages.push(recentMessage)
      }
      return params
    }

    const lastUserMessageContent = recentMessage.content
      .filter(content => content.type === "text")
      .map(content => content.text)
      .join("\n")

    const { object: classification } = await generateObject({
      // fast model for classification:
      model: modelWithStructuredOutputs,
      output: "enum",
      enum: ["yes", "no"],
      system:
        `classify the users message to yes or no` +
        `yes: If it requires a document look up` +
        `no: If it is a general question or statement that can be answered without requiring any other information from a document`,
      prompt: lastUserMessageContent,
    })

    // only use RAG for questions
    if (
      classification !== "yes" ||
      !data.selectedFiles ||
      data.selectedFiles.length < 1
    ) {
      console.log("short circuiting RAG: Printing params\n")
      console.dir(params, { depth: null })
      messages.push(recentMessage)
      return params
    }

    // Use hypothetical document embeddings:
    const { text: hypotheticalAnswer } = await generateText({
      // fast model for generating hypothetical answer:
      model: modelWithStructuredOutputs,
      system: "Answer the users question:",
      prompt: lastUserMessageContent,
    })

    // Embed the hypothetical answer
    const { embedding: hypotheticalAnswerEmbedding } = await embed({
      model: embeddingModel,
      value: hypotheticalAnswer,
    })

    const chunksForSelectedFiles = await caller.chunk.getChunksByFileId({
      ids: data.selectedFiles,
    })

    const chunksWithSimilarity = chunksForSelectedFiles.map(chunk => ({
      ...chunk,
      similarity: cosineSimilarity(
        hypotheticalAnswerEmbedding,
        chunk.embedding
      ),
    }))

    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity)
    const k = 10
    const topKChunks = chunksWithSimilarity.slice(0, k)

    messages.push({
      role: "user",
      content: [
        ...recentMessage.content,
        {
          type: "text",
          text: "Here is some relevant information that you can use to answer the question:",
        },
        ...topKChunks.map(chunk => ({
          type: "text" as const,
          text: chunk.content,
        })),
      ],
    })

    return { ...params, prompt: messages }
  },
}
