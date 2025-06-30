import { customModel } from "@/app/ai"
import { caller } from "@/trpc/server"
import { auth } from "@workspace/api/auth"
import { streamText } from "ai"
import { headers } from "next/headers"

export async function POST(request: Request) {
  const { id, messages, selectedFiles } = await request.json()

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
    providerOptions: {
      selectedFiles,
    },
    onFinish: async ({ text }) => {
      // Save chats only for logged in users
      if (session.user.isGuest) {
        return
      }
      await caller.chat.addChat({
        id,
        messages: [...messages, { role: "assistant", content: text }],
      })
    },
  })

  return result.toDataStreamResponse({})
}
