"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ResultsSkeleton() {
  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Signal score */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>

      <Skeleton className="h-px w-full" />

      {/* Truth cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-xl bg-secondary/50 p-6">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
