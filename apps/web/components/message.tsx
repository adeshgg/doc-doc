"use client"

import { motion } from "motion/react"
import { ReactNode } from "react"
import { Markdown } from "./markdown"
import { BotIcon, UserIcon } from "lucide-react"
import { TextShimmer } from "@workspace/ui/components/text-shimmer"

export const Message = ({
  role,
  content,
}: {
  role: string
  content: string | ReactNode
}) => {
  return (
    <motion.div
      className={`flex w-full flex-row gap-4 px-4 first-of-type:pt-5 md:w-[500px] md:px-0 md:first-of-type:pt-10`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-[24px] flex-shrink-0 flex-col items-center justify-center text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-4 text-zinc-800 dark:text-zinc-300">
          <Markdown>{content as string}</Markdown>
        </div>
      </div>
    </motion.div>
  )
}
