export default function EventDetailLoading() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Back link */}
      <div className="h-4 w-32 bg-zinc-200 animate-pulse rounded" />

      {/* Hero */}
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-4">
          <div className="space-y-2">
            <div className="h-9 bg-zinc-200 animate-pulse rounded" />
            <div className="h-9 w-2/3 bg-zinc-200 animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-56 bg-zinc-100 animate-pulse rounded" />
            <div className="h-4 w-48 bg-zinc-100 animate-pulse rounded" />
            <div className="h-4 w-40 bg-zinc-100 animate-pulse rounded" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 w-full bg-zinc-100 animate-pulse rounded" />
            <div className="h-3 w-full bg-zinc-100 animate-pulse rounded" />
            <div className="h-3 w-4/5 bg-zinc-100 animate-pulse rounded" />
          </div>
        </div>
        <div className="md:col-span-2 aspect-square bg-zinc-200 animate-pulse rounded-2xl" />
      </div>

      {/* Tiers */}
      <div className="space-y-4">
        <div className="h-7 w-24 bg-zinc-200 animate-pulse rounded" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="h-5 w-28 bg-zinc-200 animate-pulse rounded" />
                  <div className="h-3 w-36 bg-zinc-100 animate-pulse rounded" />
                </div>
                <div className="h-8 w-16 bg-zinc-200 animate-pulse rounded" />
              </div>
              <div className="h-1.5 bg-zinc-100 animate-pulse rounded-full" />
              <div className="h-10 bg-zinc-100 animate-pulse rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
