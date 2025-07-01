"use client"

import { Message as PreviewMessage } from "@/components/message"
import { useScrollToBottom } from "@/components/use-scroll-to-bottom"
import { useTRPC } from "@/trpc/react"
import { useChat } from "@ai-sdk/react"
import { useQueryClient } from "@tanstack/react-query"
import { TextShimmer } from "@workspace/ui/components/text-shimmer"
import { Message } from "ai"
import { motion } from "motion/react"
import FileSelector from "./file-selector"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@workspace/api/auth/client"

const suggestedActions = [
  {
    title: "What's the summary",
    label: "of these documents?",
    action: "what's the summary of these documents?",
  },
  {
    title: "What disease",
    label: "is the patient suffering from?",
    action: "what disease is the patient suffering from?",
  },
]

export function Chat({
  id,
  initialMessages,
}: {
  id: string
  initialMessages: Array<Message>
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data } = useSession()

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  const { messages, handleSubmit, input, setInput, append, status } = useChat({
    body: { id, selectedFiles: [...selectedFiles] },
    initialMessages,
    onFinish: () => {
      if (data?.user.isGuest) {
        return
      }
      if (initialMessages.length === 0) {
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getChatsByUserId.queryKey(),
        })
      }
      router.replace(`/chat/${id}`)
    },
  })

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>()

  return (
    <div className="w-full pb-40">
      <div
        ref={messagesContainerRef}
        className="flex w-full flex-col items-center gap-4 pt-4"
      >
        {messages.map((message, index) => (
          <PreviewMessage
            key={`${id}-${index}`}
            role={message.role}
            content={message.content}
          />
        ))}
        {status === "submitted" && (
          <div className="ml-20 flex w-full flex-row gap-4 px-4 md:w-[500px] md:px-0">
            <TextShimmer className="font-mono text-sm" duration={1.8}>
              Generating response...
            </TextShimmer>
          </div>
        )}
        <div ref={messagesEndRef} className="min-h-[1px] flex-shrink-0" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center border-t border-zinc-200 bg-opacity-10 bg-clip-padding backdrop-blur backdrop-contrast-100 backdrop-saturate-100 backdrop-filter dark:border-zinc-800">
        <div className="w-full p-4 md:max-w-[500px]">
          {messages.length === 0 && (
            <div className="mx-auto mb-3 grid w-full gap-2 sm:grid-cols-2">
              {suggestedActions.map((suggestedAction, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  key={index}
                  className={index > 1 ? "hidden sm:block" : "block"}
                >
                  <button
                    onClick={async () => {
                      append({
                        role: "user",
                        content: suggestedAction.action,
                      })
                    }}
                    className="flex w-full flex-col rounded-lg border border-zinc-200 p-2 text-left text-sm text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <span className="font-medium">{suggestedAction.title}</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {suggestedAction.label}
                    </span>
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <form
            className="relative flex w-full flex-row items-center gap-2"
            onSubmit={handleSubmit}
          >
            <input
              className="flex-1 rounded-md bg-zinc-100 px-2 py-1.5 text-zinc-800 outline-none dark:bg-zinc-700 dark:text-zinc-300"
              placeholder="Send a message..."
              value={input}
              onChange={event => {
                setInput(event.target.value)
              }}
            />
            <FileSelector
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
            />
          </form>
        </div>
      </div>
    </div>
  )
}
