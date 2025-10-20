import { google } from "@ai-sdk/google"
import { EmbeddingModel } from "ai"

export const model = google("gemini-2.5-flash-lite")

export const modelWithStructuredOutputs = google("gemini-2.5-flash-lite", {
  structuredOutputs: true,
})

export const embeddingModel: EmbeddingModel<string> =
  google.textEmbeddingModel("text-embedding-004")
