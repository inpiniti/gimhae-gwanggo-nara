import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { listCategories } from "@/lib/domain/category/queries";
import { listPublishedWorks } from "@/lib/domain/work/queries";
import { WorkExplorer } from "./work-explorer";

/** 좌측 지도/표 영역 (서버 데이터 fetch 포함). 메인과 상세 직접 진입이 공용 */
export async function ExplorerSection() {
  const [works, categories] = await Promise.all([listPublishedWorks(), listCategories()]);
  return (
    // nuqs(useSearchParams) 는 정적 프리렌더 시 Suspense 경계가 필요
    <Suspense fallback={<Skeleton className="h-full w-full rounded-none" />}>
      <WorkExplorer works={works} categories={categories} />
    </Suspense>
  );
}
