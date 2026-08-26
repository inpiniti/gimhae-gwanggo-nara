import { listCategories } from "@/lib/domain/category/queries";
import { toCategoryMap } from "@/lib/domain/category/types";
import { business } from "@/lib/domain/business/business";
import { getPublishedWorkBySlug } from "@/lib/domain/work/queries";
import { OG_SIZE, renderOg } from "@/lib/seo/og";

export const alt = `${business.name} 시공 사례`;
export const size = OG_SIZE;
export const contentType = "image/png";

/** Next 16: params 는 Promise */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getPublishedWorkBySlug(decodeURIComponent(slug));
  if (!work) return renderOg({ title: business.slogan });

  const categoryMap = toCategoryMap(await listCategories());
  const tags = work.categories.map((c) => categoryMap[c]?.name).filter((n): n is string => !!n);
  const cover = work.images.find((i) => i.isCover) ?? work.images[0];

  let backgroundImage: string | undefined;
  if (cover) {
    try {
      const res = await fetch(cover.url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        backgroundImage = `data:${res.headers.get("content-type") ?? "image/webp"};base64,${buf.toString("base64")}`;
      }
    } catch {
      backgroundImage = undefined;
    }
  }

  return renderOg({
    title: work.shopName,
    subtitle: work.summary ?? `${work.addressDong ?? "김해"} · ${tags.join(", ")}`,
    tags,
    backgroundImage,
  });
}
