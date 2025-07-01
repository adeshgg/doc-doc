"use client"

import type { Column, Table } from "@tanstack/react-table"
import { CloudUpload, X } from "lucide-react"
import * as React from "react"

import { DataTableDateFilter } from "@/components/data-table/data-table-date-filter"
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter"
import { DataTableSliderFilter } from "@/components/data-table/data-table-slider-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { UploadFileDialog } from "@/app/(main)/files/upload-file-dialog"
import { useSession } from "@workspace/api/auth/client"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { toast } from "sonner"

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const { data } = useSession()

  const isFiltered = table.getState().columnFilters.length > 0

  const columns = React.useMemo(
    () => table.getAllColumns().filter(column => column.getCanFilter()),
    [table, table.getRowModel().rows]
  )

  const onReset = React.useCallback(() => {
    table.resetColumnFilters()
  }, [table])

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map(column => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={onReset}
          >
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <div className="hidden md:block">{children}</div>
        <DataTableViewOptions table={table} />
        {data?.user.isGuest ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="w-fit"
                onClick={() => {
                  toast.warning("This feature is not available to guest users")
                }}
              >
                <CloudUpload className="mr-2 size-4" aria-hidden="true" />
                Upload
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>This feature is not available to guest users</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <UploadFileDialog />
        )}
      </div>
    </div>
  )
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null

      switch (columnMeta.variant) {
        case "text":
          return (
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={event => column.setFilterValue(event.target.value)}
              className="h-8 w-40 lg:w-56"
            />
          )

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={event => column.setFilterValue(event.target.value)}
                className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="bg-accent text-muted-foreground absolute bottom-0 right-0 top-0 flex items-center rounded-r-md px-2 text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          )

        case "range":
          return (
            <DataTableSliderFilter
              column={column}
              title={columnMeta.label ?? column.id}
            />
          )

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
            />
          )

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === "multiSelect"}
            />
          )

        default:
          return null
      }
    }, [column, columnMeta])

    return onFilterRender()
  }
}
