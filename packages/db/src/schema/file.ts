import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { user } from "./user"
import { relations } from "drizzle-orm"
import { chunk } from "./chat"
import { createInsertSchema } from "drizzle-zod"

export const file = pgTable("file", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
})

export const fileRelations = relations(file, ({ one, many }) => ({
  owner: one(user, {
    fields: [file.ownerId],
    references: [user.id],
  }),
  chunks: many(chunk),
}))

export const insertFileBuildSchema = createInsertSchema(file).omit({
  id: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
})
