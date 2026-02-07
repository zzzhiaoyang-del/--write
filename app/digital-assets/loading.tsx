export default function DigitalAssetsLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-96 bg-muted animate-pulse rounded max-w-2xl" />
          <div className="h-5 w-48 bg-muted animate-pulse rounded mt-6" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-6 w-24 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 w-full bg-muted animate-pulse rounded" />
                ))}
              </div>
              <div className="h-10 w-full bg-muted animate-pulse rounded mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
