import { postRouter } from "./router/post"
import { createTRPCRouter } from "./trpc"
import { userRouter } from "./router/user"
import { fileRouter } from "./router/file"

export const appRouter = createTRPCRouter({
  auth: userRouter,
  post: postRouter,
  file: fileRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
