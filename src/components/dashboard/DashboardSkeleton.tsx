import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted/50",
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-3xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-14 h-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-40 h-5" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-7 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </div>

      {/* Today card skeleton */}
      <Skeleton className="w-full h-44 rounded-2xl" />

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      {/* Community skeleton */}
      <div className="space-y-3">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>

      {/* Quote skeleton */}
      <Skeleton className="h-24 rounded-2xl" />

      {/* Quick actions skeleton */}
      <div className="grid grid-cols-4 gap-2">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>

      {/* XP bar skeleton */}
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  );
}
