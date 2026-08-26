import "server-only";

import { createPublicClient, hasSupabaseEnv, warnMissingSupabaseEnv } from "@/lib/supabase/public";
import { workImageUrl } from "@/lib/supabase/storage";
import type { WorkDetail, WorkImage, WorkListItem } from "./types";

/** 공개 작업물 목록 — 지도/표 공용. 좌표+요약+커버만. */
export async function listPublishedWorks(): Promise<WorkListItem[]> {
  if (!hasSupabaseEnv()) {
    warnMissingSupabaseEnv("listPublishedWorks");
    return [];
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("works_public_list")
    .select("*")
    .order("worked_at", { ascending: false, nullsFirst: false });
  if (error) throw error;

  return data.map((r) => ({
    id: r.id,
    slug: r.slug,
    shopName: r.shop_name,
    phone: r.phone ?? null,
    address: r.address,
    addressDong: r.address_dong,
    location: { lng: r.lng, lat: r.lat },
    summary: r.summary,
    workedAt: r.worked_at,
    coverUrl: r.cover_path ? workImageUrl(r.cover_path) : null,
    categories: r.categories ?? [],
  }));
}

/** 공개 작업물 상세. 없거나 비공개면 null. */
export async function getPublishedWorkBySlug(slug: string): Promise<WorkDetail | null> {
  if (!hasSupabaseEnv()) {
    warnMissingSupabaseEnv("getPublishedWorkBySlug");
    return null;
  }
  const supabase = createPublicClient();
  const { data: w, error } = await supabase
    .from("works")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  if (!w) return null;

  const [{ data: images }, { data: cats }] = await Promise.all([
    supabase
      .from("work_images")
      .select("*")
      .eq("work_id", w.id)
      .order("is_cover", { ascending: false })
      .order("sort_order", { ascending: true }),
    supabase.from("work_categories").select("category_code").eq("work_id", w.id),
  ]);

  const mappedImages: WorkImage[] = (images ?? []).map((i, idx) => ({
    id: i.id,
    url: workImageUrl(i.path),
    thumbUrl: workImageUrl(i.thumb_path ?? i.path),
    alt: i.alt ?? `${w.shop_name} 작업 사진 ${idx + 1}`,
    width: i.width,
    height: i.height,
    blurhash: i.blurhash,
    isCover: i.is_cover,
  }));

  return {
    id: w.id,
    slug: w.slug,
    shopName: w.shop_name,
    phone: w.phone,
    address: w.address,
    addressDong: w.address_dong,
    location: { lng: w.lng, lat: w.lat },
    summary: w.summary,
    description: w.description,
    workedAt: w.worked_at,
    updatedAt: w.updated_at,
    categories: (cats ?? []).map((c) => c.category_code),
    images: mappedImages,
  };
}

/** generateStaticParams / sitemap 용 */
export async function listPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("works")
    .select("slug, updated_at")
    .eq("is_published", true);
  if (error) throw error;
  return data.map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
}
