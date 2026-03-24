import { Skeleton } from "@/components/ui/skeleton";

export function RuleOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((section) => (
        <div key={section} className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HitListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-md" />
        ))}
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 bg-secondary px-4 py-3">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-4 flex-1 max-w-[300px]" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="divide-y divide-border">
            {[0, 1, 2].map((j) => (
              <div key={j} className="flex items-center gap-3 px-4 py-2.5">
                <Skeleton className="h-5 w-14 rounded" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 flex-1 max-w-[200px]" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
