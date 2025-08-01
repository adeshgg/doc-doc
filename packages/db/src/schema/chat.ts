import { relations } from "drizzle-orm"
import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core"
import { user } from "./user"
import { file } from "./file"
import { createInsertSchema } from "drizzle-zod"

export type Message = {
  role: "user" | "assistant" | "system"
  content: string
  parts?: {
    type: string
    text: string
  }[]
}

export const chat = pgTable("chat", {
  id: text("id").notNull().primaryKey(),
  messages: json("messages").$type<Message[]>().notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
})

export const chatRelations = relations(chat, ({ one }) => ({
  author: one(user, {
    fields: [chat.authorId],
    references: [user.id],
  }),
}))

export const chunk = pgTable(
  "chunk",
  {
    id: text("id").notNull().primaryKey(),
    fileId: uuid("file_id")
      .notNull()
      .references(() => file.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    //   embedding: real("embedding").array().notNull(),
    embedding: vector("embedding", { dimensions: 768 }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  table => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
)

export const chunkRelations = relations(chunk, ({ one }) => ({
  file: one(file, {
    fields: [chunk.fileId],
    references: [file.id],
  }),
  user: one(user, {
    fields: [chunk.userId],
    references: [user.id],
  }),
}))

export const insertChunkBuildSchema = createInsertSchema(chunk)
export const addChatBuildSchema = createInsertSchema(chat).omit({
  authorId: true,
})
