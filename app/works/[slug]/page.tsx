import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeShell } from "@/components/layout/home-shell";
import { DetailPanel } from "@/components/work/detail-panel";
import { ExplorerSection } from "@/components/work/explorer-section";
import { WorkDetail } from "@/components/work/work-detail";
import { listCategories } from "@/lib/domain/category/queries";
import { toCategoryMap, primaryCategory } from "@/lib/domain/category/types";
import { business } from "@/lib/domain/business/business";
import { getPublishedWorkBySlug, listPublishedSlugs } from "@/lib/domain/work/queries";
import { ko } from "@/lib/i18n/ko";
import { serializeJsonLd, workJsonLd } from "@/lib/seo/jsonld";

/**
 * SEO용 상세 URL — 직접 진입(검색/공유/새로고침) 시에도 메인과 같은 "지도(좌) + 상세(우)" 화면.
 * 메인에서 클릭하면 (home)/@panel/(.)works/[slug] 가 인터셉트해 지도는 그대로 두고 패널만 바뀐다.
 * SSG + ISR. 새 slug 는 첫 요청 시 생성 (dynamicParams 기본 true).
 */
export const revalidate = 3600;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    return (await listPublishedSlugs()).map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const work = await getPublishedWorkBySlug(decoded);
  if (!work) return { title: ko.detail.notFound, robots: { index: false } };

  const categoryMap = toCategoryMap(await listCategories());
  const catName = primaryCategory(work.categories, categoryMap)?.name ?? "광고";
  const title = `${work.shopName} ${catName} 시공 사례`;
  const description =
    work.summary ??
    `${work.address} ${work.shopName}의 ${catName} 작업. 김해 간판·현수막·시트지 전문 ${business.name} ${business.phone}`;
  const cover = work.images.find((i) => i.isCover) ?? work.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/works/${encodeURIComponent(work.slug)}` },
    keywords: ["김해", catName, work.addressDong ?? "", work.shopName, business.name].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "article",
      url: `/works/${encodeURIComponent(work.slug)}`,
      images: cover ? [{ url: cover.url, alt: cover.alt }] : undefined,
    },
  };
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const work = await getPublishedWorkBySlug(decodeURIComponent(slug));
  if (!work) notFound();
  const categoryMap = toCategoryMap(await listCategories());
  const categoryNames = work.categories.map((c) => categoryMap[c]?.name).filter((n): n is string => !!n);

  return (
    <>
      <HomeShell
        left={<ExplorerSection />}
        panel={
          <DetailPanel title={work.shopName} closeHref="/">
            <WorkDetail work={work} variant="page" />
          </DetailPanel>
        }
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(workJsonLd(work, categoryNames)) }}
      />
    </>
  );
}
