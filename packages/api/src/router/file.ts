import { file } from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { db } from "@workspace/db"
import { z } from "zod"

export const fileRouter = {
  uploadFile: privateProcedure
    .input(
      z.object({
        url: z.string().url(),
        pathname: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const newFile = await db
        .insert(file)
        .values({
          ownerId: userId,
          url: input.url,
          path: input.pathname,
          name: input.name,
        })
        .returning()

      return newFile[0]
    }),
}
