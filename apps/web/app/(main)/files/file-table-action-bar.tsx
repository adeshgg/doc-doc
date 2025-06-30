"use client"

import { Table } from "@tanstack/react-table"
import { File } from "@workspace/db/schema"
import { DeleteFilesDialog } from "./delete-file-dialog"
import { useSession } from "@workspace/api/auth/client"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { Button } from "@workspace/ui/components/button"
import { toast } from "sonner"
import { Trash } from "lucide-react"

type FileTableActionBarProps = {
  table: Table<File>
}

const FileTableActionBar = ({ table }: FileTableActionBarProps) => {
  const seletedRows = table.getFilteredSelectedRowModel().rows

  const files = seletedRows.map(row => row.original)

  const { data } = useSession()

  return (
    <>
      {data?.user.isGuest ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => {
                toast.warning("This feature is not available to guest users")
              }}
            >
              <Trash className="mr-2 size-4" aria-hidden="true" />
              Delete ({files.length})
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This feature is not available to guest users</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <DeleteFilesDialog
          files={files}
          onSuccess={() => {
            table.toggleAllRowsSelected(false)
          }}
        />
      )}
    </>
  )
}

export default FileTableActionBar
