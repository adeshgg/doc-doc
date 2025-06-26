import { Chat } from "@/components/chat"
import { caller } from "@/trpc/server"
import { auth } from "@workspace/api/auth"
import { Message } from "ai"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import React from "react"

type Params = Promise<{ id: string }>

const Page = async ({ params }: { params: Params }) => {
  const { id } = await params

  const previousChats = await caller.chat.getChatById({ id })

  if (!previousChats) {
    notFound()
  }

  // type casting
  const chat = {
    ...previousChats,
    messages: previousChats.messages as Message[],
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (chat.authorId !== session?.user.id) {
    notFound()
  }

  return <Chat key={chat.id} id={chat.id} initialMessages={chat.messages} />
}

export default Page
