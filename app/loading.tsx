// Home page loading — full page since Navbar is inside the page component
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar skeleton */}
      <header className="border-b border-zinc-100 h-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-4 w-20 bg-zinc-200 animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-zinc-200 animate-pulse rounded" />
            <div className="h-8 w-24 bg-zinc-200 animate-pulse rounded-lg" />
          </div>
        </div>
      </header>

      {/* Hero skeleton */}
      <section className="bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center space-y-6">
          <div className="h-3 w-40 bg-zinc-700 animate-pulse rounded mx-auto" />
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="h-10 bg-zinc-700 animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-zinc-700 animate-pulse rounded mx-auto" />
          </div>
          <div className="h-4 w-96 bg-zinc-700 animate-pulse rounded mx-auto" />
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="h-11 w-32 bg-zinc-600 animate-pulse rounded-xl" />
            <div className="h-11 w-36 bg-zinc-700 animate-pulse rounded-xl" />
          </div>
        </div>
      </section>

      {/* Event grid skeleton */}
      <section className="max-w-6xl mx-auto px-4 py-16 space-y-8 w-full">
        <div className="flex items-center justify-between">
          <div className="h-7 w-48 bg-zinc-200 animate-pulse rounded" />
          <div className="h-4 w-20 bg-zinc-200 animate-pulse rounded" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="h-44 bg-zinc-200 animate-pulse" />
              <div className="p-4 space-y-2 bg-white">
                <div className="h-4 bg-zinc-200 animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-zinc-200 animate-pulse rounded" />
                <div className="space-y-1 pt-1">
                  <div className="h-3 w-32 bg-zinc-100 animate-pulse rounded" />
                  <div className="h-3 w-28 bg-zinc-100 animate-pulse rounded" />
                </div>
                <div className="pt-2 border-t border-zinc-100">
                  <div className="h-4 w-20 bg-zinc-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
