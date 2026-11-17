// DataTable: shadcn's Data Table recipe (https://ui.shadcn.com/docs/components/base/data-table), made reusable here
// instead of copied into each project. Built on TanStack Table v9 and the Table component: sorting, filtering,
// column visibility, row selection and pagination. Define columns with createDataTableColumnHelper<Row>() so they
// carry the features this table registers; DataTableColumnHeader makes a header sortable and hideable.
// Not part of shadcn's registry, so the weekly shadcn sync never touches this file.
import * as React from "react"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table"
import { cn } from "cn"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  Settings2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// TanStack Table v9 registers features (and the filter/sort functions columns use) up front.
const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
})

type DataTableFeatures = typeof dataTableFeatures

/** Column helper typed for DataTable: createDataTableColumnHelper<Payment>().accessor("email", { … }). */
function createDataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}

type DataTableProps<TData extends RowData> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<DataTableFeatures, TData, any>[]
  data: TData[]
  /** A column id to filter by from a search field above the table. */
  filterColumn?: string
  filterPlaceholder?: string
  /** Rows per page (default 10). */
  pageSize?: number
  pageSizes?: number[]
  /** Show the Columns menu to hide and show columns (default true). */
  columnToggle?: boolean
  /** Show "n of m row(s) selected" (default: when rows can be selected and some are). */
  selectionCount?: boolean
  /** Shown when no rows match. */
  empty?: React.ReactNode
  /** More controls, at the right end of the toolbar. */
  toolbar?: React.ReactNode
  getRowId?: (row: TData, index: number) => string
  onRowSelectionChange?: (selection: RowSelectionState) => void
  className?: string
}

function DataTable<TData extends RowData>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Filter…",
  pageSize = 10,
  pageSizes = [10, 20, 30, 50],
  columnToggle = true,
  selectionCount,
  empty = "No results.",
  toolbar,
  getRowId,
  onRowSelectionChange,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize })

  React.useEffect(() => onRowSelectionChange?.(rowSelection), [rowSelection, onRowSelectionChange])

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
  })

  const filter = filterColumn ? table.getColumn(filterColumn) : undefined
  const rows = table.getRowModel().rows
  const showToolbar = Boolean(filter || columnToggle || toolbar)

  return (
    <div data-slot="data-table" className={cn("flex w-full flex-col gap-4", className)}>
      {showToolbar && (
        <div className="flex items-center gap-2">
          {filter && (
            <Input
              placeholder={filterPlaceholder}
              value={(filter.getFilterValue() as string) ?? ""}
              onChange={(event) => filter.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          )}
          <div className="ml-auto flex items-center gap-2">
            {toolbar}
            {columnToggle && <DataTableViewOptions table={table} />}
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length || 1}
                  className="h-24 text-center text-muted-foreground"
                >
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} pageSizes={pageSizes} selectionCount={selectionCount} />
    </div>
  )
}

/** A header that sorts (ascending, descending) and hides its column from a menu. */
function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  className?: string
}) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={className}>{title}</div>
  }
  const sorted = column.getIsSorted()
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" className="-ml-2.5 data-popup-open:bg-accent" />}
        >
          <span>{title}</span>
          {sorted === "desc" ? <ArrowDownIcon /> : sorted === "asc" ? <ArrowUpIcon /> : <ChevronsUpDownIcon />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {column.getCanSort() && (
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                <ArrowUpIcon />
                Asc
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                <ArrowDownIcon />
                Desc
              </DropdownMenuItem>
            </DropdownMenuGroup>
          )}
          {column.getCanSort() && column.getCanHide() && <DropdownMenuSeparator />}
          {column.getCanHide() && (
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOffIcon />
              Hide
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/** The Columns menu: a checkbox per column that can be hidden. */
function DataTableViewOptions<TData extends RowData>({
  table,
}: {
  table: TanstackTable<DataTableFeatures, TData>
}) {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanHide() && (column.accessorFn !== undefined || column.columnDef.header))
  if (columns.length === 0) {
    return null
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Settings2Icon />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Page controls, rows per page, and how many rows are selected. */
function DataTablePagination<TData extends RowData>({
  table,
  pageSizes = [10, 20, 30, 50],
  selectionCount,
}: {
  table: TanstackTable<DataTableFeatures, TData>
  pageSizes?: number[]
  selectionCount?: boolean
}) {
  const selected = table.getFilteredSelectedRowModel().rows.length
  const showSelection = selectionCount ?? selected > 0
  const pageCount = Math.max(1, table.getPageCount())
  const { pageIndex, pageSize } = table.store.state.pagination ?? { pageIndex: 0, pageSize: 10 }
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-2 text-sm">
      <div className="flex-1 text-muted-foreground">
        {showSelection &&
          `${selected} of ${table.getFilteredRowModel().rows.length} row(s) selected.`}
      </div>
      <div className="flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            {pageSize} per page
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {pageSizes.map((size) => (
              <DropdownMenuItem key={size} onClick={() => table.setPageSize(size)}>
                {size} per page
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="tabular-nums">
          Page {pageIndex + 1} of {pageCount}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden sm:inline-flex"
            aria-label="First page"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden sm:inline-flex"
            aria-label="Last page"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTableViewOptions,
  DataTablePagination,
  createDataTableColumnHelper,
  dataTableFeatures,
  type DataTableFeatures,
  type DataTableProps,
}
