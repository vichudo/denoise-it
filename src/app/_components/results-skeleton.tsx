"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ResultsSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-10">
      {/* Verdict banner */}
      <Skeleton className="h-[62px] w-full rounded-2xl" />

      {/* Abstract */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>

      <Skeleton className="h-px w-full opacity-50" />

      {/* Signal section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-3.5 rounded-sm" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-2.5 w-4" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/50 px-5 py-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-4">
                  <Skeleton className="h-3.5 w-4/5" />
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="h-3 w-6" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-3 border-t border-border/30 pt-2">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-px w-full opacity-30" />

      {/* Noise section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-3.5 rounded-sm" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2.5 w-4" />
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border/20 px-4 py-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
                <Skeleton className="h-2.5 w-4/5" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
