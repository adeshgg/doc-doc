import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import React from "react"
import { DataTableDemo } from "./base"

const Table = () => {
  return (
    <React.Suspense
      fallback={
        <DataTableSkeleton
          columnCount={7}
          filterCount={2}
          cellWidths={[
            "10rem",
            "30rem",
            "10rem",
            "10rem",
            "6rem",
            "6rem",
            "6rem",
          ]}
          shrinkZero
        />
      }
    >
      <DataTableDemo />
    </React.Suspense>
  )
}

export default Table
