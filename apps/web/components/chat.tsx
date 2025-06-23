"use client"

import { Message as PreviewMessage } from "@/components/message"
import { useScrollToBottom } from "@/components/use-scroll-to-bottom"
import { Session } from "@/lib/types"
import { useTRPC } from "@/trpc/react"
import { useChat } from "@ai-sdk/react"
import { useQueryClient } from "@tanstack/react-query"
import { TextShimmer } from "@workspace/ui/components/text-shimmer"
import { Message } from "ai"
import { motion } from "motion/react"

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
  session,
}: {
  id: string
  initialMessages: Array<Message>
  session: Session | null
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { messages, handleSubmit, input, setInput, append, status } = useChat({
    body: { id, allFiles: true },
    initialMessages,
    onFinish: () => {
      if (initialMessages.length === 0) {
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getChatsByUserId.queryKey(),
        })
      }
      window.history.replaceState({}, "", `/chat/${id}`)
    },
  })

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>()

  return (
    <div className="w-full pb-40">
      <div
        ref={messagesContainerRef}
        className="flex flex-col gap-4 w-full items-center pt-4"
      >
        {messages.map((message, index) => (
          <PreviewMessage
            key={`${id}-${index}`}
            role={message.role}
            content={message.content}
          />
        ))}

        {status === "submitted" && (
          <TextShimmer className="font-mono text-sm" duration={1}>
            Generating response...
          </TextShimmer>
        )}
        <div ref={messagesEndRef} className="flex-shrink-0 min-h-[1px]" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center border-t border-zinc-200 dark:border-zinc-800 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100">
        <div className="p-4 w-full md:max-w-[500px]">
          {messages.length === 0 && (
            <div className="grid sm:grid-cols-2 gap-2 w-full mx-auto mb-3">
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
                    className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
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
            className="flex flex-row gap-2 relative items-center w-full"
            onSubmit={handleSubmit}
          >
            <input
              className="bg-zinc-100 rounded-md px-2 py-1.5 flex-1 outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300"
              placeholder="Send a message..."
              value={input}
              onChange={event => {
                setInput(event.target.value)
              }}
            />
          </form>
        </div>
      </div>
    </div>
  )
}
