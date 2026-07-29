import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/layout/table-skeleton";

export default function AgendamentosLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <TableSkeleton columns={6} />
    </div>
  );
}
