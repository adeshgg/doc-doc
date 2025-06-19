import {
  createParser,
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"
import { FILE_STATUS, FILE_TYPE_VALUES } from "@workspace/db/schema"
import { z } from "zod"

export type Session = {
  session: {
    id: string
    createdAt: Date
    updatedAt: Date
    userId: string
    expiresAt: Date
    token: string
    ipAddress?: string | null | undefined | undefined
    userAgent?: string | null | undefined | undefined
  }
  user: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
    image?: string | null | undefined | undefined
  }
} | null

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

// 2. Define a Zod schema for your sorting state for type safety.
const sortingStateSchema = z.array(
  z.object({
    id: z.enum(["name", "status", "type", "createdAt"]),
    desc: z.boolean(),
  })
)

// 3. Create a dedicated parser for the sorting state using createParser.
const parseAsSortingState = createParser({
  parse: value => {
    try {
      // First, parse the string from the URL into a JavaScript object.
      const parsedJson = JSON.parse(value)
      // Then, validate the object against our Zod schema.
      const result = sortingStateSchema.safeParse(parsedJson)
      // Return the valid data or null if validation fails.
      return result.success ? result.data : null
    } catch {
      // Return null if JSON.parse itself fails.
      return null
    }
  },
  serialize: (value: z.infer<typeof sortingStateSchema>) => {
    // To keep the URL clean, only stringify if we have a non-empty array.
    if (value && value.length > 0) {
      return JSON.stringify(value)
    }
    // Return an empty string to remove the parameter from the URL.
    return ""
  },
})

// 4. Use your new custom parser in the searchParamsCache definition.
export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),

  // ✅ Use the new, correct parser for the 'sort' parameter
  sort: parseAsSortingState.withDefault([{ id: "createdAt", desc: true }]),

  name: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(FILE_STATUS)).withDefault([]),
  type: parseAsArrayOf(z.enum(FILE_TYPE_VALUES)).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
})
