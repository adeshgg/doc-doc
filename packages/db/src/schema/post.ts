import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod"
import { user } from "./user"

export const post = pgTable("post", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  title: text("context").notNull(),
  description: text("description").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
})

export const postRelations = relations(post, ({ one }) => ({
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
}))

export const insertPostBuildSchema = createInsertSchema(post).omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
})
export const selectPostBuildSchema = createSelectSchema(post)
// should not let the user update post id and authorId
export const updatePostBuildSchema = createUpdateSchema(post).omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
})
