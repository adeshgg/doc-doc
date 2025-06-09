import { customModel } from "@/app/ai"
import { auth } from "@workspace/api/auth"
import { streamText } from "ai"
import { headers } from "next/headers"

export async function POST(request: Request) {
  const { id, messages } = await request.json()

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const result = streamText({
    model: customModel,
    system:
      "you are a friendly assistant! keep your responses concise and helpful.",
    messages,
    onFinish: async ({ text }) => {
      console.log("final response from LLM", text)
    },
  })

  return result.toDataStreamResponse({})
}
