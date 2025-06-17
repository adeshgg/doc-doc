"use client"

import { useSearchParams } from "next/navigation"
import { useSuspenseQuery } from "@tanstack/react-query"

// import { api, trpc } from "@/trpc/react";
// import { getFilesSchema } from "@/server/api/routers/file/validations"

import { useDataTable } from "@/hooks/use-data-table"
// import { getFilesTableColumns } from "./files-table-columns"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useTRPC } from "@/trpc/react"
import { searchParamsCache } from "@/lib/types"
import { getFilesTableColumns } from "./file-table-column"
import {
  useMemo,
  // useTransition
} from "react"

export function FilesTable() {
  //   const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()

  // 1. Parse search params on the client to drive the queries.
  const search = searchParamsCache.parse(Object.fromEntries(searchParams))

  const trpc = useTRPC()

  // 2. Use `useSuspenseQuery`. It will read from the cache on first load,
  // or suspend the component if data is being fetched on the client.
  const { data: filesResponse } = useSuspenseQuery(
    trpc.file.getFiles.queryOptions(search)
  )

  // You can also fetch the other data in the same way if needed by the UI
  const { data: statusCounts } = useSuspenseQuery(
    trpc.file.getFileStatusCounts.queryOptions()
  )
  const { data: typeCounts } = useSuspenseQuery(
    trpc.file.getFileTypeCounts.queryOptions()
  )
  // ... etc.

  // 3. Destructure the data. No need for `|| {}` or `?.` because Suspense
  // guarantees the data is available here.
  const { data, pageCount } = filesResponse

  // 4. Memoize columns and initialize the data table hook.
  const columns = useMemo(
    () =>
      getFilesTableColumns({
        statusCounts,
        typeCounts,
        setRowAction: () => {}, // Replace with your actual state setter if needed
      }),
    []
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    // startTransition,
    // Add other options your useDataTable hook supports
    // For example, to enable sorting:
    initialState: {
      sorting: [
        {
          id: "createdAt",
          desc: true,
        },
      ],
    },
  })

  return (
    // <div className={cn(isPending && "opacity-50 animate-pulse")}>
    <DataTable table={table}>
      <DataTableToolbar table={table} />
      {/*
          Your toolbar components (like filters, etc.) go here.
          They will interact with the `table` instance to update
          the URL search params, which triggers a re-fetch.
          */}
    </DataTable>
    // </div>
  )
}
