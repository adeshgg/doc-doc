import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"
import React from "react"
import { Chat } from "@/components/chat"
import { generateId } from "ai"

const ChatPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const chatId = generateId()

  return (
    <Chat key={chatId} id={chatId} initialMessages={[]} session={session} />
  )
}

export default ChatPage
