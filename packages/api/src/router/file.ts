import { file, insertFileBuildSchema } from "@workspace/db/schema"
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

      console.log("Adding file to DB:", input)

      const newFile = await db
        .insert(file)
        .values({
          // url: input.url,
          // pathname: input.pathname,
          // ownerId: userId,
          ownerId: userId,
          url: input.url,
          path: input.pathname,
          name: input.name,
          // You could add other fields from the input here if your schema supports it
        })
        .returning()

      return newFile[0]
    }),
}
