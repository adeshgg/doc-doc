import { addChatBuildSchema, chat } from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { db, desc, eq } from "@workspace/db"
import { z } from "zod"

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
            messages,
          })
          .where(eq(chat.id, id))
      }

      return await db.insert(chat).values({
        id,
        authorId: ctx.userId,
        messages,
      })
    }),
  getChatById: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, input.id))
      return selectedChat
    }),
  getChatsByUserId: privateProcedure.query(async ({ ctx }) => {
    const chats = await db
      .select()
      .from(chat)
      .where(eq(chat.authorId, ctx.userId))
      .orderBy(desc(chat.updatedAt))

    return chats.map(chat => ({
      id: chat.id,
      title: chat.messages[0]?.content || "Untitled Chat",
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }))
  }),
}
