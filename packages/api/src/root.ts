import { postRouter } from "./router/post"
import { createTRPCRouter } from "./trpc"
import { userRouter } from "./router/user"

export const appRouter = createTRPCRouter({
  auth: userRouter,
  post: postRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
