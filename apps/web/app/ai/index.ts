import { google } from "@ai-sdk/google"
import { wrapLanguageModel } from "ai"
import { ragMiddleware } from "./rag-middleware"

// export const customModel = google("gemini-2.0-flash-001")
export const customModel = wrapLanguageModel({
  model: google("gemini-2.0-flash-001"),
  middleware: ragMiddleware,
})
