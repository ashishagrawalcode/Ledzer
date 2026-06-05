import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
  badge?: string
  backHref?: string
}

export function PageHeader({ title, subtitle, actions, className, badge, backHref }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6', className)}>
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-2 group"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
        ) : badge ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal/10 border border-teal/20 text-teal text-[10px] font-semibold uppercase tracking-wider mb-2">
            {badge}
          </span>
        ) : null}

        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
          {backHref && badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal/10 border border-teal/20 text-teal text-[10px] font-semibold uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        
        {subtitle && <p className="text-sm text-foreground/40 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}