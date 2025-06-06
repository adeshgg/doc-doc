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

export const chat = pgTable("chat", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  messages: json("messages").notNull(),
  authorId: text("author_id").notNull(),
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
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    fileId: text("file_id").notNull(),
    content: text("content").notNull(),
    //   embedding: real("embedding").array().notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
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
}))

// TODO : Export schema
