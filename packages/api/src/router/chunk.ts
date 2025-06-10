import { chunk } from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { db, eq } from "@workspace/db"

export const chunkRouter = {
  getChunksByUserId: privateProcedure.query(async ({ ctx }) => {
    return await db.select().from(chunk).where(eq(chunk.userId, ctx.userId))
  }),
}
