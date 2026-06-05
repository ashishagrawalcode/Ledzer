export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="h-8 w-56 bg-foreground/5 rounded-xl mb-2" />
          <div className="h-4 w-40 bg-foreground/3 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-foreground/5 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 border border-border/5 h-32" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border/5 h-[340px]" />
        <div className="glass rounded-2xl p-6 border border-border/5 h-[340px]" />
      </div>
      <div className="glass rounded-2xl border border-border/5 h-64" />
    </div>
  )
}