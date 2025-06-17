"use client"

// 💡 1. All necessary imports are included
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  type VisibilityState,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  type Parser,
  type UseQueryStateOptions,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs"

import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { getSortingStateParser } from "@/lib/parsers"
import type { ExtendedColumnSort } from "@/types/data-table"

const PAGE_KEY = "page"
const PER_PAGE_KEY = "perPage"
const SORT_KEY = "sort"
const ARRAY_SEPARATOR = ","
const DEBOUNCE_MS = 300
const THROTTLE_MS = 50

interface UseDataTableProps<TData>
  extends Omit<
      TableOptions<TData>,
      | "state"
      | "pageCount"
      | "getCoreRowModel"
      | "manualFiltering"
      | "manualPagination"
      | "manualSorting"
    >,
    Required<Pick<TableOptions<TData>, "pageCount">> {
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[]
  }
  history?: "push" | "replace"
  debounceMs?: number
  throttleMs?: number
  clearOnDefault?: boolean
  enableAdvancedFilter?: boolean
  scroll?: boolean
  shallow?: boolean
  startTransition?: React.TransitionStartFunction
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount = -1,
    initialState,
    history = "replace",
    debounceMs = DEBOUNCE_MS,
    throttleMs = THROTTLE_MS,
    clearOnDefault = false,
    enableAdvancedFilter = false,
    scroll = false,
    shallow = true,
    startTransition,
    ...tableProps
  } = props

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const queryStateOptions = React.useMemo<
    Omit<UseQueryStateOptions<string>, "parse">
  >(
    () => ({
      history,
      scroll,
      shallow,
      throttleMs,
      debounceMs,
      clearOnDefault,
      startTransition,
    }),
    [
      history,
      scroll,
      shallow,
      throttleMs,
      debounceMs,
      clearOnDefault,
      startTransition,
    ]
  )

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    initialState?.rowSelection ?? {}
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialState?.columnVisibility ?? {})

  const [page, setPage] = useQueryState(
    PAGE_KEY,
    parseAsInteger.withOptions(queryStateOptions).withDefault(1)
  )
  const [perPage, setPerPage] = useQueryState(
    PER_PAGE_KEY,
    parseAsInteger
      .withOptions(queryStateOptions)
      .withDefault(initialState?.pagination?.pageSize ?? 10)
  )

  const pagination: PaginationState = React.useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: perPage,
    }),
    [page, perPage]
  )

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue
      void setPage(newPagination.pageIndex + 1)
      void setPerPage(newPagination.pageSize)
    },
    [pagination, setPage, setPerPage]
  )

  const columnIds = React.useMemo(
    () => new Set(columns.map(column => column.id).filter(Boolean) as string[]),
    [columns]
  )

  const [sorting, setSorting] = useQueryState(
    SORT_KEY,
    getSortingStateParser<TData>(columnIds)
      .withOptions(queryStateOptions)
      .withDefault(initialState?.sorting ?? [])
  )

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue
      setSorting(newSorting as ExtendedColumnSort<TData>[])
    },
    [sorting, setSorting]
  )

  // 💡 2. The logic for parsing filters from the URL is now correctly included.
  const filterableColumns = React.useMemo(() => {
    if (enableAdvancedFilter) return []
    return columns.filter(column => column.enableColumnFilter)
  }, [columns, enableAdvancedFilter])

  const filterParsers = React.useMemo(() => {
    if (enableAdvancedFilter) return {}

    return filterableColumns.reduce<
      Record<string, Parser<string> | Parser<string[]>>
    >((acc, column) => {
      if (column.id) {
        if (column.meta?.options) {
          acc[column.id] = parseAsArrayOf(
            parseAsString,
            ARRAY_SEPARATOR
          ).withOptions(queryStateOptions)
        } else {
          acc[column.id] = parseAsString.withOptions(queryStateOptions)
        }
      }
      return acc
    }, {})
  }, [filterableColumns, queryStateOptions, enableAdvancedFilter])

  const [filterValues] = useQueryStates(filterParsers)

  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    if (enableAdvancedFilter) return []

    return Object.entries(filterValues).reduce<ColumnFiltersState>(
      (filters, [key, value]) => {
        if (value !== null && value !== undefined) {
          filters.push({
            id: key,
            value: value,
          })
        }
        return filters
      },
      []
    )
  }, [filterValues, enableAdvancedFilter])

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialColumnFilters)

  const debouncedNavigate = useDebouncedCallback((params: URLSearchParams) => {
    if (startTransition) {
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    } else {
      router.push(`${pathname}?${params.toString()}`)
    }
  }, debounceMs)

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      if (enableAdvancedFilter) return

      const nextState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnFilters)
          : updaterOrValue
      setColumnFilters(nextState)

      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set(PAGE_KEY, "1")

      for (const filter of nextState) {
        if (typeof filter.id === "string" && filter.value) {
          const value = Array.isArray(filter.value)
            ? filter.value.join(ARRAY_SEPARATOR)
            : String(filter.value)

          if (value) {
            newParams.set(filter.id, value)
          } else {
            newParams.delete(filter.id)
          }
        }
      }

      for (const oldFilter of columnFilters) {
        if (
          typeof oldFilter.id === "string" &&
          !nextState.some(f => f.id === oldFilter.id)
        ) {
          newParams.delete(oldFilter.id)
        }
      }

      debouncedNavigate(newParams)
    },
    [columnFilters, searchParams, debouncedNavigate, enableAdvancedFilter]
  )

  const table = useReactTable({
    ...tableProps,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  return { table }
}
