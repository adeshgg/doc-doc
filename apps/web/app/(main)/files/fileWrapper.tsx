"use client"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { Suspense, useEffect, useState } from "react"
import { FilesTable } from "./file-table"

export function FilesTableWrapper() {
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    setIsInitialLoad(false)
  }, [])

  if (isInitialLoad) {
    return (
      <Suspense
        fallback={<DataTableSkeleton columnCount={5} filterCount={2} />}
      >
        <FilesTable />
      </Suspense>
    )
  }

  return <FilesTable />
}
