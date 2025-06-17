import {
  file,
  FILE_STATUS,
  FILE_TYPE_VALUES,
  fileTypeEnum,
} from "@workspace/db/schema"
import { privateProcedure } from "../trpc"
import { and, asc, count, db, desc, eq, ilike, inArray } from "@workspace/db"
import { z } from "zod"

export const getFilesSchema = z.object({
  // Pagination
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(10),
  // Sorting
  sort: z
    .array(
      z.object({
        id: z.enum(["name", "status", "type", "createdAt"]), // Valid sortable columns
        desc: z.boolean(),
      })
    )
    .optional(),
  // Basic Filters
  name: z.string().optional(),
  status: z.array(z.enum(FILE_STATUS)).optional(),
  type: z.array(z.enum(FILE_TYPE_VALUES)).optional(),
})

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

  getFiles: privateProcedure
    .input(getFilesSchema)
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { page, perPage, sort, name, status, type } = input

      try {
        const offset = (page - 1) * perPage

        const whereClause = and(
          eq(file.ownerId, userId),
          name ? ilike(file.name, `%${name}%`) : undefined,
          status && status.length > 0
            ? inArray(file.status, status)
            : undefined,
          type && type.length > 0 ? inArray(file.type, type) : undefined
        )

        const orderBy =
          sort && sort.length > 0
            ? sort.map(s => (s.desc ? desc(file[s.id]) : asc(file[s.id])))
            : [desc(file.updatedAt)]

        const dataQuery = db
          .select()
          .from(file)
          .where(whereClause)
          .orderBy(...orderBy)
          .limit(perPage)
          .offset(offset)

        const countQuery = db
          .select({ count: count() })
          .from(file)
          .where(whereClause)

        // Await both promises
        const [data, totalResult] = await Promise.all([dataQuery, countQuery])

        const total = totalResult[0]?.count ?? 0
        const pageCount = Math.ceil(total / perPage)

        return { data, pageCount }
      } catch (err) {
        console.error("Error fetching files:", err)
        return { data: [], pageCount: 0 }
      }
    }),
}
