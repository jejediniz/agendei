import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-16 w-full rounded-xl sm:col-span-2 lg:col-span-1" />
        <Skeleton className="h-16 w-full rounded-xl sm:col-span-2 lg:col-span-2" />
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
