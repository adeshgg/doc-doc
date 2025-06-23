import { File, file, FILE_STATUS, FILE_TYPE_VALUES } from "@workspace/db/schema"
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

  getFileByType: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    const allFiles = await db
      .select()
      .from(file)
      .where(and(eq(file.ownerId, userId), eq(file.status, "indexed")))

    const groupedFiles: Record<string, File[]> = {}

    for (const file of allFiles) {
      const group = groupedFiles[file.type]
      if (group) {
        group.push(file)
      } else {
        groupedFiles[file.type] = [file]
      }
    }
    return groupedFiles
  }),

  getFileStatusCounts: privateProcedure.query(async ({ ctx }) => {
    const statusCounts = await db
      .select({ status: file.status, count: count() })
      .from(file)
      .where(eq(file.ownerId, ctx.userId))
      .groupBy(file.status)

    // 2. Define the initial shape with all possible statuses set to 0
    const initialCounts = Object.fromEntries(
      FILE_STATUS.map(status => [status, 0])
    ) as Record<File["status"], number>

    // 3. Use .reduce() to transform the array into the desired object format
    const formattedCounts = statusCounts.reduce((acc, { status, count }) => {
      acc[status] = count
      return acc
    }, initialCounts)

    // 4. Return the formatted object directly from the API
    return formattedCounts
  }),

  getFileTypeCounts: privateProcedure.query(async ({ ctx }) => {
    const typeCounts = await db
      .select({ type: file.type, count: count() })
      .from(file)
      .where(eq(file.ownerId, ctx.userId))
      .groupBy(file.type)

    const initialCounts = Object.fromEntries(
      FILE_TYPE_VALUES.map(type => [type, 0])
    ) as Record<File["type"], number>

    const formattedCounts = typeCounts.reduce((acc, { type, count }) => {
      acc[type] = count
      return acc
    }, initialCounts)

    return formattedCounts
  }),

  deleteFiles: privateProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx
      const { ids } = input

      try {
        await db
          .delete(file)
          .where(and(eq(file.ownerId, userId), inArray(file.id, ids)))

        return { success: true }
      } catch (err) {
        console.error("Error deleting files:", err)
        return { success: false }
      }
    }),
}
