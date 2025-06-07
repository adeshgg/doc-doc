import { google } from "@ai-sdk/google"
import { generateText, LanguageModelV1 } from "ai"
import { PdfReader } from "pdfreader"

// A small helper function for waiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const systemPrompt =
  `Extract the text out of this image` +
  `Make sure to capute all the details` +
  `Format the result a readable text` +
  `Just return the extracted text, no extra message`

// export async function getImageTextFromUrlUsingLLM(url: string) {
//   console.log("url", url)
//   const imageUrl = url.split("?")[0]
//   console.log(imageUrl)
//   const { text } = await generateText({
//     model: google("gemini-2.0-flash-001", {
//       structuredOutputs: true,
//     }) as LanguageModelV1,
//     system: systemPrompt,
//     messages: [
//       {
//         role: "user",
//         content: [
//           {
//             type: "image",
//             image: new URL(imageUrl!),
//           },
//         ],
//       },
//     ],
//   })

//   console.log(text)

//   return text
// }

// Later when implementing async worker add re-tries there instead

/**
 * Gets text from an image URL using a Google Gemini model,
 * with a retry mechanism to handle transient errors like 404s from Vercel Blob.
 *
 * @param url The public URL of the image file.
 * @param systemPrompt The system prompt to guide the LLM.
 * @returns The extracted text from the image.
 */
export async function getImageTextFromUrlUsingLLM(url: string) {
  let lastError: Error | null = null
  const maxRetries = 10 // Total attempts
  const initialDelay = 1500 // Start with a 1.5-second delay

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Attempt ${i + 1}] Processing image URL:`, url)
      // It's good practice to remove query params if they are not needed by the final URL
      const imageUrl = url.split("?")[0]

      // The entire generateText call is retried because the fetch happens inside it.
      const { text } = await generateText({
        model: google("gemini-1.5-flash-latest") as LanguageModelV1,
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

      console.log("Successfully extracted text from image.")
      // On success, return the text and exit the loop.
      return text
    } catch (error) {
      lastError = error as Error
      console.error(`Attempt ${i + 1} failed: ${lastError.message}`)

      // Don't wait after the final attempt
      if (i < maxRetries - 1) {
        const waitTime = initialDelay * (i + 1) // Increase delay for subsequent retries
        console.log(`Retrying in ${waitTime / 1000}s...`)
        await delay(waitTime)
      }
    }
  }

  // If all retries failed, throw a final, informative error.
  throw new Error(
    `Failed to process image after ${maxRetries} attempts. Last error: ${lastError?.message}`
  )
}

export async function getPdfContentFromUrl(url: string): Promise<string> {
  let lastError: Error | null = null
  const maxRetries = 10 // Try a total of 10 times
  const initialDelay = 1000 // Start with a 1000ms delay

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`[Attempt ${i + 1}] Fetching URL:`, url)
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
    } catch (error) {
      lastError = error as Error
      console.log(
        `Attempt ${i + 1} failed. Retrying in ${initialDelay * (i + 1)}ms...`
      )
      // Wait before the next attempt, with increasing delay (exponential backoff)
      await delay(initialDelay * (i + 1))
    }
  }

  // If all retries fail, throw the last error we captured
  throw new Error(
    `Failed to fetch PDF after ${maxRetries} attempts. Last error: ${lastError?.message}`
  )
}
