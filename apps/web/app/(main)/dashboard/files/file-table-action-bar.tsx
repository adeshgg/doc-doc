import { Table } from "@tanstack/react-table"
import { File } from "@workspace/db/schema"
import React from "react"
import { DeleteFilesDialog } from "./delete-file-dialog"

type FileTableActionBarProps = {
  table: Table<File>
}

const FileTableActionBar = ({ table }: FileTableActionBarProps) => {
  const seletedRows = table.getFilteredSelectedRowModel().rows

  const files = seletedRows.map(row => row.original)

  return (
    <DeleteFilesDialog
      files={files}
      onSuccess={() => {
        table.toggleAllRowsSelected(false)
      }}
    />
  )
}

export default FileTableActionBar
