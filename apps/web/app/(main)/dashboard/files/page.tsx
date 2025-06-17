import * as React from "react"
import { Suspense } from "react"

import { prefetch, HydrateClient, trpc } from "@/trpc/server"

// import { Shell } from "@/components/shell"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
// import { FilesTable } from "./_components/files-table"
import { SearchParams, searchParamsCache } from "@/lib/types"
import { FilesTable } from "./file-table"
// import { searchParamsCache } from "./_lib/validations"

interface FilesPageProps {
  searchParams: Promise<SearchParams>
}

export default async function FilesPage(props: FilesPageProps) {
  // 1. Parse and validate the search params from the URL
  const searchParams = await props.searchParams
  const search = searchParamsCache.parse(searchParams)

  //   const validFilters = getValidFilters(search.filters)

  // 2. Prefetch all necessary queries using the parsed search params.
  // This loads the data on the server without blocking the render.
  prefetch(trpc.file.getFiles.queryOptions(search))
  prefetch(trpc.file.getFileStatusCounts.queryOptions())
  prefetch(trpc.file.getFileTypeCounts.queryOptions())

  return (
    <HydrateClient>
      {/* 4. Suspense shows a skeleton while the server is prefetching the data */}
      <Suspense
        fallback={<DataTableSkeleton columnCount={5} filterCount={2} />}
      >
        <FilesTable />
      </Suspense>
    </HydrateClient>
  )
}
