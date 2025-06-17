import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { getSortingStateParser } from "./parsers"
import { File, FILE_STATUS, FILE_TYPE_VALUES } from "@workspace/db/schema"
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

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: parseAsArrayOf(
    z.object({
      id: z.enum(["name", "status", "type", "createdAt"]), // Valid sortable columns
      desc: z.boolean(),
    })
  ).withDefault([{ id: "createdAt", desc: true }]),
  name: parseAsString.withDefault(""),
  status: parseAsArrayOf(z.enum(FILE_STATUS)).withDefault([]),
  type: parseAsArrayOf(z.enum(FILE_TYPE_VALUES)).withDefault([]),
  createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
  // advanced filter
})
