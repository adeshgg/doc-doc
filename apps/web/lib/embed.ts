import { modelWithStructuredOutputs } from "@/app/ai/models"
import { generateText, LanguageModelV1 } from "ai"
import { PdfReader } from "pdfreader"

const systemPrompt =
  `Extract the text out of this image` +
  `Make sure to capute all the details` +
  `Format the result a readable text` +
  `Just return the extracted text, no extra message`

export async function getImageTextFromUrlUsingLLM(url: string) {
  console.log("url", url)
  const imageUrl = url.split("?")[0]
  console.log(imageUrl)
  const { text } = await generateText({
    model: modelWithStructuredOutputs as LanguageModelV1,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            image: new URL(imageUrl!),
          },
        ],
      },
    ],
  })

  console.log(text)

  return text
}

export async function getPdfContentFromUrl(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    // If it's a 404, we want to retry. For other errors, we might want to fail faster.
    if (response.status === 404) {
      throw new Error(`Failed to fetch PDF: Not Found (status 404)`)
    }
    // For other server errors, throw a different message
    throw new Error(
      `Failed to fetch PDF: ${response.statusText} (status ${response.status})`
    )
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  return new Promise((resolve, reject) => {
    let allText = ""
    new PdfReader(null).parseBuffer(buffer, (err, item) => {
      if (err) reject(err)
      else if (!item) resolve(allText.trim())
      else if (item.text) allText += item.text + " "
    })
  })
}
