import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { WorkDetail } from "@/components/work/work-detail";
import { listCategories } from "@/lib/domain/category/queries";
import { toCategoryMap, primaryCategory } from "@/lib/domain/category/types";
import { business } from "@/lib/domain/business/business";
import { getPublishedWorkBySlug, listPublishedSlugs } from "@/lib/domain/work/queries";
import { ko } from "@/lib/i18n/ko";

/** SEO용 전체 페이지 — SSG + ISR (docs/03-seo.md). 새 slug 는 첫 요청 시 생성 (dynamicParams 기본 true) */
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

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader>
        <Link href="/" className="text-sm font-semibold text-muted-foreground">
          ← {ko.detail.backToList}
        </Link>
      </SiteHeader>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="rounded-3xl bg-card p-5 shadow-card sm:p-7">
          <WorkDetail work={work} variant="page" />
        </div>
      </main>
    </div>
  );
}
