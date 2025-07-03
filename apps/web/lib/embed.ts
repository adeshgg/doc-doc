import { modelWithStructuredOutputs } from "@/app/ai/models"
import { generateText, LanguageModelV1 } from "ai"
import { PdfReader } from "pdfreader"

const systemPrompt =
  `For the image given you need to perform a two step action:` +
  `1. Figure out if the image is medical scan (X-ray, CT scan, ...)` +
  `Or if it a image of a document (prescription, bill, ...)` +
  `2.1. If it is an image of a document then` +
  `Extract the text out of this image` +
  `Make sure to capture all the details` +
  `Format the result a readable text` +
  `Just return the extracted text, no extra message` +
  `2.2 If the image is a medical scan then` +
  `Consider yourself as a medical expert assistant` +
  `describe this image in as much detail as possible` +
  `You can use medical jargon. Perform an indepth assessment of the medical image` +
  `Make it as useful for your medical expert as possible`

export async function getImageTextFromUrlUsingLLM(url: string) {
  const imageUrl = url.split("?")[0]
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
