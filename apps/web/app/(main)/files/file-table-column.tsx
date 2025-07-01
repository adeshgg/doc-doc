"use client"

import type { DataTableRowAction } from "@/types/data-table" // You'll need to define this type
import type { CheckedState } from "@radix-ui/react-checkbox"
import type { ColumnDef } from "@tanstack/react-table"
import type { File } from "@workspace/db/schema"
import { FILE_STATUS, FILE_TYPE_VALUES } from "@workspace/db/schema"
import {
  ArrowUpDown,
  CheckCircle,
  CircleDashed,
  HelpCircle,
  Paperclip,
  XCircle,
} from "lucide-react"
import * as React from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { getFileStatusIcon, getFileStatusToolTip } from "./utils"

interface GetFilesTableColumnsProps {
  statusCounts: Record<File["status"], number>
  typeCounts: Record<File["type"], number>
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<File> | null>
  >
}

export function getFilesTableColumns({
  statusCounts,
  typeCounts,
  setRowAction,
}: GetFilesTableColumnsProps): ColumnDef<File>[] {
  return [
    // Column 1: Select Checkbox
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value: CheckedState) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: CheckedState) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    // Column 2: File Name
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Name" />
        <div>Name</div>
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[20rem] truncate font-medium">
            {row.getValue("name")}
          </div>
        )
      },
      meta: {
        label: "Name",
        placeholder: "Search names...",
        variant: "text",
        icon: Paperclip,
      },
      enableColumnFilter: true,
    },
    // Column 3: Status
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Status" />
        <div>Status</div>
      ),
      cell: ({ cell }) => {
        const status = cell.getValue<File["status"]>()
        if (!status) return null
        const Icon = getFileStatusIcon(status)
        const toolTip = getFileStatusToolTip(status)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-pointer gap-1 py-1 capitalize [&>svg]:size-3.5"
              >
                <Icon />
                <span>{status}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{toolTip}</p>
            </TooltipContent>
          </Tooltip>
        )
      },
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: FILE_STATUS.map(status => ({
          label: status.charAt(0).toUpperCase() + status.slice(1),
          value: status,
          count: statusCounts[status] ?? 0,
          icon: getFileStatusIcon(status),
        })),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },
    // Column 4: Type
    {
      id: "type",
      accessorKey: "type",
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Type" />
        <div>Type</div>
      ),
      cell: ({ cell }) => {
        const type = cell.getValue<File["type"]>()
        if (!type) return null
        //   const Icon = getFilePriorityIcon(priority);
        return (
          <Badge
            variant="outline"
            className="gap-1 py-1 capitalize [&>svg]:size-3.5"
          >
            {/* <Icon /> */}
            <span>{type}</span>
          </Badge>
        )
      },
      meta: {
        label: "Type",
        variant: "multiSelect",
        options: FILE_TYPE_VALUES.map(type => ({
          label: type.charAt(0).toUpperCase() + type.slice(1),
          value: type,
          count: typeCounts[type] ?? 0,
          // icon: getFilePriorityIcon(type),
        })),
        icon: ArrowUpDown,
      },
      enableColumnFilter: true,
    },
    // Column 5: Created At
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Created At" />
        <div>Created At</div>
      ),
      cell: ({ cell }) => new Date(cell.getValue<Date>()).toLocaleDateString(),
      //   meta: {
      //     label: "Created At",
      //     variant: "dateRange",
      //     icon: CalendarIcon,
      //   },
      //   enableColumnFilter: true,
    },
    // Column 6: Actions
    // {
    //   id: "actions",
    //   cell: ({ row }) => (
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button
    //           aria-label="Open menu"
    //           variant="ghost"
    //           className="flex size-8 p-0 data-[state=open]:bg-muted"
    //         >
    //           <Ellipsis className="size-4" aria-hidden="true" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="end" className="w-40">
    //         <DropdownMenuItem
    //           className="cursor-pointer"
    //           onSelect={() => setRowAction({ row, variant: "delete" })}
    //         >
    //           Delete
    //         </DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   ),
    //   size: 40,
    // },
  ]
}
