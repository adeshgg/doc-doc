import { z } from "zod"
import { privateProcedure, publicProcedure } from "../trpc.js"
import { TRPCError, TRPCRouterRecord } from "@trpc/server"
import {
  insertPostBuildSchema,
  post,
  updatePostBuildSchema,
} from "@workspace/db/schema"
import { db } from "@workspace/db"
import { and, desc, eq } from "drizzle-orm"

export const postRouter = {
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async opts => {
      // sleep(3)
      return {
        greeting: `hello ${opts.input.text}`,
      }
    }),
  getPosts: privateProcedure.query(async () => {
    return await db.select().from(post).orderBy(desc(post.updatedAt))
  }),
  createPost: privateProcedure
    .input(insertPostBuildSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const createdPost = await db
        .insert(post)
        .values({
          title: input.title,
          description: input.description,
          authorId: userId,
        })
        .returning()

      return createdPost
    }),
  updatePost: privateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const updatedPost = await db
        .update(post)
        .set(input)
        .where(and(eq(post.id, input.id), eq(post.authorId, userId)))
        .returning()

      if (!updatedPost.length) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      return updatedPost
    }),
  deletePost: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const deletedPost = await db
        .delete(post)
        .where(and(eq(post.id, input.id), eq(post.authorId, userId)))
        .returning()

      if (!deletedPost.length) {
        throw new TRPCError({ code: "FORBIDDEN" })
      }

      return deletedPost
    }),
} satisfies TRPCRouterRecord

const sleep = (seconds: number = 1): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}
