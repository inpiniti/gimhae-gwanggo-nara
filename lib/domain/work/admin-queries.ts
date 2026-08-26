import "server-only";

import { createClient } from "@/lib/supabase/server";
import { workImageUrl } from "@/lib/supabase/storage";
import type { WorkInputType } from "./policies";

export type AdminWorkRow = {
  id: string;
  slug: string;
  shopName: string;
  addressDong: string | null;
  workedAt: string | null;
  isPublished: boolean;
  consent: boolean;
  updatedAt: string;
  categories: string[];
  coverUrl: string | null;
};

/** 관리자 목록 — 비공개 포함, 최근 수정순 (세션 클라이언트, RLS is_admin) */
export async function listAllWorks(): Promise<AdminWorkRow[]> {
  const supabase = await createClient();
  const { data: works, error } = await supabase
    .from("works")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  if (works.length === 0) return [];

  const ids = works.map((w) => w.id);
  const [{ data: cats }, { data: imgs }] = await Promise.all([
    supabase.from("work_categories").select("work_id, category_code").in("work_id", ids),
    supabase
      .from("work_images")
      .select("work_id, path, thumb_path, is_cover, sort_order")
      .in("work_id", ids)
      .order("is_cover", { ascending: false })
      .order("sort_order", { ascending: true }),
  ]);

  const covers = new Map<string, string>();
  for (const i of imgs ?? []) if (!covers.has(i.work_id)) covers.set(i.work_id, i.thumb_path ?? i.path);

  return works.map((w) => ({
    id: w.id,
    slug: w.slug,
    shopName: w.shop_name,
    addressDong: w.address_dong,
    workedAt: w.worked_at,
    isPublished: w.is_published,
    consent: w.consent,
    updatedAt: w.updated_at,
    categories: (cats ?? []).filter((c) => c.work_id === w.id).map((c) => c.category_code),
    coverUrl: covers.has(w.id) ? workImageUrl(covers.get(w.id)!) : null,
  }));
}

/** 수정 폼 초기값 */
export async function getWorkForEdit(id: string): Promise<(WorkInputType & { imageUrls: string[] }) | null> {
  const supabase = await createClient();
  const { data: w } = await supabase.from("works").select("*").eq("id", id).maybeSingle();
  if (!w) return null;

  const [{ data: cats }, { data: imgs }] = await Promise.all([
    supabase.from("work_categories").select("category_code").eq("work_id", id),
    supabase
      .from("work_images")
      .select("*")
      .eq("work_id", id)
      .order("is_cover", { ascending: false })
      .order("sort_order", { ascending: true }),
  ]);

  return {
    id: w.id,
    slug: w.slug,
    shopName: w.shop_name,
    phone: w.phone,
    address: w.address,
    addressDong: w.address_dong,
    lng: w.lng,
    lat: w.lat,
    summary: w.summary,
    description: w.description,
    workedAt: w.worked_at,
    isPublished: w.is_published,
    consent: w.consent,
    categories: (cats ?? []).map((c) => c.category_code),
    images: (imgs ?? []).map((i) => ({
      id: i.id,
      path: i.path,
      thumbPath: i.thumb_path,
      alt: i.alt,
      width: i.width,
      height: i.height,
    })),
    imageUrls: (imgs ?? []).map((i) => workImageUrl(i.thumb_path ?? i.path)),
  };
}
