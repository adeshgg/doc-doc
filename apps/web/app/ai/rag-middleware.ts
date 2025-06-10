import { caller } from "@/trpc/server"
import { google } from "@ai-sdk/google"
import {
  cosineSimilarity,
  embed,
  generateObject,
  generateText,
  LanguageModelV1Middleware,
} from "ai"
import { z } from "zod"

const middlewareSchema = z.object({
  allFiles: z.boolean(),
})

export const ragMiddleware: LanguageModelV1Middleware = {
  transformParams: async ({ params }) => {
    console.log("first middleware", params)

    const { prompt: messages, providerMetadata } = params

    const { success, data } = middlewareSchema.safeParse(providerMetadata)
    if (!success) {
      return params
    }

    console.log("allFiles ? ", data.allFiles)

    const recentMessage = messages.pop()

    console.log("recentMessage\n")
    console.dir(recentMessage, { depth: null })

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

    console.log("lastUserMessageContent\n")
    console.dir(lastUserMessageContent, { depth: null })

    const { object: classification } = await generateObject({
      // fast model for classification:
      // model: openai("gpt-4o-mini", { structuredOutputs: true }),
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: true,
      }),
      output: "enum",
      enum: ["question", "statement", "other"],
      system: "classify the user message as a question, statement, or other",
      prompt: lastUserMessageContent,
    })

    console.log("classification\n")
    console.dir(classification, { depth: null })

    // only use RAG for questions
    if (classification !== "question") {
      console.log("short circuiting RAG: Printing params\n")
      console.dir(params, { depth: null })
      messages.push(recentMessage)
      return params
    }

    // Use hypothetical document embeddings:
    const { text: hypotheticalAnswer } = await generateText({
      // fast model for generating hypothetical answer:
      // model: openai("gpt-4o-mini", { structuredOutputs: true }),
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: true,
      }),
      system: "Answer the users question:",
      prompt: lastUserMessageContent,
    })

    console.log("hypotheticalAnswer\n")
    console.dir(hypotheticalAnswer, { depth: null })

    // Embed the hypothetical answer
    const { embedding: hypotheticalAnswerEmbedding } = await embed({
      // model: openai.embedding("text-embedding-3-small"),
      model: google.textEmbeddingModel("text-embedding-004"),
      value: hypotheticalAnswer,
    })

    const chunksForAllUserFiles = await caller.chunk.getChunksByUserId()

    const chunksWithSimilarity = chunksForAllUserFiles.map(chunk => ({
      ...chunk,
      similarity: cosineSimilarity(
        hypotheticalAnswerEmbedding,
        chunk.embedding
      ),
    }))

    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity)
    const k = 10
    const topKChunks = chunksWithSimilarity.slice(0, k)

    console.log("topKChunks\n")
    console.dir(topKChunks, { depth: null })

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

    console.log("final params\n")
    console.dir({ ...params, prompt: messages }, { depth: null })
    return { ...params, prompt: messages }
  },
}
