"use client"

import { useSearchParams } from "next/navigation"
import {
  useQueryClient,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query"
import { Row } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table" //
import { searchParamsCache } from "@/lib/types"
import { useTRPC } from "@/trpc/react"
import { File } from "@workspace/db/schema"
import { cn } from "@workspace/ui/lib/utils"

import FileTableActionBar from "./file-table-action-bar"
import { DeleteFilesDialog } from "./delete-file-dialog"
import { getFilesTableColumns } from "./file-table-column"

export interface DataTableRowAction<TData> {
  row: Row<TData>
  variant: "update" | "delete"
}

export function FilesTable() {
  const [isTransitionPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const search = searchParamsCache.parse(Object.fromEntries(searchParams))

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const getFilesQueryOptions = trpc.file.getFiles.queryOptions(search)
  const getFileStatusCountsQueryOptions =
    trpc.file.getFileStatusCounts.queryOptions()
  const getFileTypeCountsQueryOptions =
    trpc.file.getFileTypeCounts.queryOptions()

  const { data: filesResponse, isPending: isFilesPending } = useQuery({
    ...getFilesQueryOptions,
    placeholderData: keepPreviousData,
  })

  const { data: statusCounts } = useQuery(getFileStatusCountsQueryOptions)
  const { data: typeCounts } = useQuery(getFileTypeCountsQueryOptions)

  const [rowAction, setRowAction] = useState<DataTableRowAction<File> | null>(
    null
  )
  const prevFilesDataRef = useRef<File[]>(null)

  const data = filesResponse?.data ?? []
  const pageCount = filesResponse?.pageCount ?? -1 // Use -1 or 0 as a safe default

  const columns = useMemo(() => {
    // Ensure statusCounts and typeCounts are defined before creating columns
    if (!statusCounts || !typeCounts) return []
    return getFilesTableColumns({
      statusCounts,
      typeCounts,
      setRowAction,
    })
  }, [statusCounts, typeCounts, setRowAction])

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    startTransition,
    enableSorting: true,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
  })

  useEffect(() => {
    if (!filesResponse) return // Guard clause for the initial render
    const oldData = prevFilesDataRef.current
    const newData = filesResponse.data
    if (oldData) {
      const oldProcessingIds = new Set(
        oldData
          .filter(file => file.status === "processing")
          .map(file => file.id)
      )
      if (oldProcessingIds.size > 0) {
        const newProcessingIds = new Set(
          newData
            .filter(file => file.status === "processing")
            .map(file => file.id)
        )
        const aFileHasFinished = [...oldProcessingIds].some(
          id => !newProcessingIds.has(id)
        )
        if (aFileHasFinished) {
          queryClient.invalidateQueries({
            queryKey: getFileStatusCountsQueryOptions.queryKey,
          })
          queryClient.invalidateQueries({
            queryKey: getFileTypeCountsQueryOptions.queryKey,
          })
        }
      }
    }
    prevFilesDataRef.current = newData
  }, [
    filesResponse,
    queryClient,
    getFileStatusCountsQueryOptions,
    getFileTypeCountsQueryOptions,
  ])

  if (isFilesPending || !statusCounts || !typeCounts) {
    return <DataTableSkeleton columnCount={5} filterCount={2} />
  }

  return (
    <div
      className={cn("mt-12", isTransitionPending && "opacity-90 animate-pulse")}
    >
      <DataTable table={table} actionBar={<FileTableActionBar table={table} />}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} />
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
