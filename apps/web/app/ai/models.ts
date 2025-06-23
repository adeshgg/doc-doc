import { google } from "@ai-sdk/google"
import { EmbeddingModel } from "ai"

export const model = google("gemini-2.0-flash-001")

export const modelWithStructuredOutputs = google("gemini-2.0-flash-001", {
  structuredOutputs: true,
})

export const embeddingModel: EmbeddingModel<string> =
  google.textEmbeddingModel("text-embedding-004")
