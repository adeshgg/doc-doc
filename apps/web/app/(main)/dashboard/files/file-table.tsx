"use client"

import { useSearchParams } from "next/navigation"
import { useSuspenseQuery } from "@tanstack/react-query"

import { useDataTable } from "@/hooks/use-data-table"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useTRPC } from "@/trpc/react"
import { searchParamsCache } from "@/lib/types"
import { getFilesTableColumns } from "./file-table-column"
import { useMemo, useState, useTransition } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { Row } from "@tanstack/react-table"
import { File } from "@workspace/db/schema"
import { DeleteFilesDialog } from "./delete-file-dialog"
import FileTableActionBar from "./file-table-action-bar"

export interface DataTableRowAction<TData> {
  row: Row<TData>
  variant: "update" | "delete"
}

export function FilesTable() {
  const [isPending, startTransition] = useTransition()
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

  const [rowAction, setRowAction] = useState<DataTableRowAction<File> | null>(
    null
  )

  // 4. Memoize columns and initialize the data table hook.
  const columns = useMemo(
    () =>
      getFilesTableColumns({
        statusCounts,
        typeCounts,
        setRowAction,
      }),
    [statusCounts, typeCounts]
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    startTransition,
    // Add other options your useDataTable hook supports
    // For example, to enable sorting:
    enableSorting: true,
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
    <div className={cn("mt-12", isPending && "opacity-90 animate-pulse")}>
      {/* <div> */}
      <DataTable table={table} actionBar={<FileTableActionBar table={table} />}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
      <DeleteFilesDialog
        open={rowAction?.variant === "delete"}
        onOpenChange={() => setRowAction(null)}
        files={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </div>
  )
}
