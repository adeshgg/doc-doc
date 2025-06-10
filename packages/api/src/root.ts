import { postRouter } from "./router/post"
import { createTRPCRouter } from "./trpc"
import { userRouter } from "./router/user"
import { fileRouter } from "./router/file"
import { chatRouter } from "./router/chat"
import { chunkRouter } from "./router/chunk"

export const appRouter = createTRPCRouter({
  auth: userRouter,
  post: postRouter,
  file: fileRouter,
  chat: chatRouter,
  chunk: chunkRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
