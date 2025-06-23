import { wrapLanguageModel } from "ai"
import { ragMiddleware } from "./rag-middleware"
import { model } from "./models"

export const customModel = wrapLanguageModel({
  model,
  middleware: ragMiddleware,
})
