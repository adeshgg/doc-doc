import * as React from "react"
import { Suspense } from "react"
import { prefetch, HydrateClient, trpc } from "@/trpc/server"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { SearchParams, searchParamsCache } from "@/lib/types"
import { FilesTable } from "./file-table"
import { auth } from "@workspace/api/auth"
import { headers } from "next/headers"
import LoginFirst from "@/components/login-first"

interface FilesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function FilesPage(props: FilesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return <LoginFirst resource="Files" />
  }

  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  prefetch(trpc.file.getFiles.queryOptions(search))
  prefetch(trpc.file.getFileStatusCounts.queryOptions())
  prefetch(trpc.file.getFileTypeCounts.queryOptions())

  return (
    <HydrateClient>
      <Suspense
        fallback={<DataTableSkeleton columnCount={5} filterCount={2} />}
      >
        <FilesTable />
      </Suspense>
    </HydrateClient>
  )
}
