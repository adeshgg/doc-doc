import { file, insertFileBuildSchema } from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { db } from "@workspace/db"

export const fileRouter = {
  uploadFile: privateProcedure
    .input(insertFileBuildSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx

      // put to the blob and success create the file db entry
      //  file path should be user.email/filename
      const createFile = await db
        .insert(file)
        .values({
          url: input.url,
          ownerId: userId,
        })
        .returning()

      return createFile
    }),
}
