import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-6">
      <span className="sr-only">Loading your dashboard…</span>
      <div aria-hidden className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full rounded" />
          </div>
          <Skeleton className="hidden h-10 w-36 sm:block" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="h-30 gap-3 p-5">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="h-68 gap-2 px-6 py-5 lg:col-span-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="mt-6 flex-1" />
          </Card>
          <Card className="h-68 gap-2 px-6 py-5">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="mt-6 flex-1" />
          </Card>
        </div>
        <Card className="h-96 gap-2 px-6 py-5">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="mt-6 flex-1" />
        </Card>
      </div>
    </div>
  );
}
