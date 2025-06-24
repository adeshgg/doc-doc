import { chunk } from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { and, db, eq, inArray } from "@workspace/db"
import { z } from "zod"

export const chunkRouter = {
  getChunksByUserId: privateProcedure.query(async ({ ctx }) => {
    return await db.select().from(chunk).where(eq(chunk.userId, ctx.userId))
  }),
  getChunksByFileId: privateProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      return await db
        .select()
        .from(chunk)
        .where(
          and(eq(chunk.userId, ctx.userId), inArray(chunk.fileId, input.ids))
        )
    }),
}
