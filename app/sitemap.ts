import type { MetadataRoute } from "next";
import { business } from "@/lib/domain/business/business";
import { listPublishedSlugs } from "@/lib/domain/work/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = business.siteUrl;
  let works: Awaited<ReturnType<typeof listPublishedSlugs>> = [];
  try {
    works = await listPublishedSlugs();
  } catch {
    works = [];
  }
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    ...works.map((w) => ({
      url: `${base}/works/${encodeURIComponent(w.slug)}`,
      lastModified: new Date(w.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
