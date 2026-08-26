import Link from "next/link";
import { DetailPanel } from "@/components/work/detail-panel";
import { WorkDetail } from "@/components/work/work-detail";
import { getPublishedWorkBySlug } from "@/lib/domain/work/queries";
import { ko } from "@/lib/i18n/ko";

/** 메인에서 클릭 시 인터셉트 → 우측 패널/바텀시트 */
export default async function InterceptedWorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getPublishedWorkBySlug(decodeURIComponent(slug));

  if (!work) {
    return (
      <DetailPanel title={ko.detail.notFound}>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-3xl">🙈</span>
          <p className="font-semibold">{ko.detail.notFound}</p>
          <Link href="/" className="text-sm font-semibold text-primary">
            {ko.detail.backToList}
          </Link>
        </div>
      </DetailPanel>
    );
  }

  return (
    <DetailPanel title={work.shopName}>
      <WorkDetail work={work} variant="panel" />
    </DetailPanel>
  );
}
