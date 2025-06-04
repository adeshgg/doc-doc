import { publicProcedure } from "../trpc.js"
import { TRPCRouterRecord } from "@trpc/server"
import { db } from "@workspace/db"
import { user } from "@workspace/db/schema"

export const userRouter = {
  getUsers: publicProcedure.query(async () => {
    return await db.select().from(user)
  }),
} satisfies TRPCRouterRecord

const sleep = (seconds: number = 1): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}
