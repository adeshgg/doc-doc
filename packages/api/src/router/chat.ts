import { addChatBuildSchema, chat } from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { db, eq } from "@workspace/db"

export const chatRouter = {
  addChat: privateProcedure
    .input(addChatBuildSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, messages } = input
      const selectedChat = await db.select().from(chat).where(eq(chat.id, id))

      if (selectedChat.length > 0) {
        return await db
          .update(chat)
          .set({
            messages: JSON.stringify(messages),
          })
          .where(eq(chat.id, id))
      }

      return await db.insert(chat).values({
        id,
        authorId: ctx.userId,
        messages: JSON.stringify(messages),
      })
    }),
}
