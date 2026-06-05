import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  className?: string
  headerClassName?: string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  loading?: boolean
  className?: string
  rowClassName?: (row: T) => string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyTitle = 'No data found',
  emptyDescription = 'Nothing here yet.',
  emptyAction,
  loading = false,
  className,
  rowClassName,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className={cn('glass rounded-2xl border border-border/5 overflow-hidden', className)}>
        <div className="animate-pulse">
          <div className="flex gap-4 px-6 py-4 border-b border-border/5">
            {columns.map((col) => (
              <div key={col.key} className="h-3 bg-foreground/5 rounded flex-1" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 border-b border-border/3">
              {columns.map((col) => (
                <div key={col.key} className="h-4 bg-foreground/3 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('glass rounded-2xl border border-border/5 overflow-hidden', className)}>
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-foreground/3 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-border/10 rounded" />
          </div>
          <p className="text-base font-medium text-foreground/40">{emptyTitle}</p>
          <p className="text-sm text-foreground/20 max-w-xs">{emptyDescription}</p>
          {emptyAction && <div className="mt-2">{emptyAction}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('glass rounded-2xl border border-border/5 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-border/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-3.5 text-left text-[10px] font-semibold text-foreground/30 uppercase tracking-wider whitespace-nowrap',
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className={cn(
                  'hover:bg-foreground/[0.02] transition-colors duration-150',
                  rowClassName?.(row)
                )}
                style={{ height: '56px' }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn('px-6 py-4 text-sm text-foreground/80 whitespace-nowrap', col.className)}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}