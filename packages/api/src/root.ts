import { createTRPCRouter } from "./trpc"
import { fileRouter } from "./router/file"
import { chatRouter } from "./router/chat"
import { chunkRouter } from "./router/chunk"

export const appRouter = createTRPCRouter({
  file: fileRouter,
  chat: chatRouter,
  chunk: chunkRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
