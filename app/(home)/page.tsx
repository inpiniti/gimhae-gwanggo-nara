import { Suspense } from "react";
import { WorkExplorer } from "@/components/work/work-explorer";
import { Skeleton } from "@/components/ui/skeleton";
import { listCategories } from "@/lib/domain/category/queries";
import { listPublishedWorks } from "@/lib/domain/work/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [works, categories] = await Promise.all([listPublishedWorks(), listCategories()]);
  return (
    // nuqs(useSearchParams) 는 정적 프리렌더 시 Suspense 경계가 필요
    <Suspense fallback={<Skeleton className="h-full w-full rounded-none" />}>
      <WorkExplorer works={works} categories={categories} />
    </Suspense>
  );
}
