import { google } from "@ai-sdk/google"
import { generateText, LanguageModelV1 } from "ai"
// import pdf from "pdf-parse"
// import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js"
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
    model: google("gemini-2.0-flash-001", {
      structuredOutputs: true,
    }) as LanguageModelV1,
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

// export async function getPdfContentFromUrl(url: string): Promise<string> {
//   const response = await fetch(url)
//   const arrayBuffer = await response.arrayBuffer()
//   const buffer = Buffer.from(arrayBuffer)
//   const data = await pdf(buffer)
//   return data.text
// }

// export async function getPdfContentFromUrl(url: string): Promise<string> {
//   const response = await fetch(url)

//   if (!response.ok) {
//     throw new Error(`Failed to fetch PDF from ${url}: ${response.statusText}`)
//   }

//   const arrayBuffer = await response.arrayBuffer()
//   const buffer = Buffer.from(arrayBuffer)

//   // THE NEW FIX:
//   // Provide a minimal, safe option to prevent the library from
//   // entering its internal test mode.
//   const options = {
//     max: 0, // 0 means no page limit
//   }

//   const data = await pdf(buffer, options)
//   return data.text
// }

// Add the dependency: npm install pdfreader

export async function getPdfContentFromUrl(url: string): Promise<string> {
  //   Need to solve this
  //   and add on delete cascase, so that on file delete chunks get deleted as well
  //   remove other pdf parsers,
  // use langchain to read pdf is possible
  console.log("url", url)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())

  return new Promise((resolve, reject) => {
    let allText = ""
    // The reader processes items one by one
    new PdfReader(null).parseBuffer(buffer, (err, item) => {
      if (err) {
        // Handle parsing errors
        reject(err)
      } else if (!item) {
        // End of buffer has been reached
        resolve(allText.trim())
      } else if (item.text) {
        // Append text items
        allText += item.text + " "
      }
    })
  })
}

// You might need to add this dependency: npm install pdfjs-dist

// This line is a workaround to prevent pdf.js from loading a "worker" file,
// which isn't needed for server-side text extraction.
// pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.js"

// export async function getPdfContentFromUrl(url: string): Promise<string> {
//   const response = await fetch(url)
//   if (!response.ok) {
//     throw new Error(`Failed to fetch PDF: ${response.statusText}`)
//   }
//   const arrayBuffer = await response.arrayBuffer()

//   // Load the PDF from the buffer
//   const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
//   const pdf = await loadingTask.promise

//   const allText = []
//   for (let i = 1; i <= pdf.numPages; i++) {
//     const page = await pdf.getPage(i)
//     const textContent = await page.getTextContent()
//     const pageText = textContent.items
//       .map(item => ("str" in item ? item.str : ""))
//       .join(" ")
//     allText.push(pageText)
//   }

//   return allText.join("\n\n")
// }
