"use server";

import { requireAdmin } from "@/lib/domain/admin/guard";
import { createClient } from "@/lib/supabase/server";
import { WorkInput, type ActionResult } from "./policies";
import { revalidateWork } from "./revalidate";
import { uniqueSlug } from "./slug";

/**
 * 작업물 생성/수정 (docs/10-conventions.md 서버 액션 6단계)
 * 사진 파일은 클라이언트가 Storage 에 직접 올리고, 여기서는 메타데이터만 저장한다.
 */
export async function saveWork(raw: unknown): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();
  const parsed = WorkInput.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: String(issue.path[0] ?? "") };
  }
  const input = parsed.data;
  const supabase = await createClient();

  // 기존 상태 (수정 시)
  const { data: existing } = await supabase
    .from("works")
    .select("slug")
    .eq("id", input.id)
    .maybeSingle();
  const { data: existingImages } = await supabase
    .from("work_images")
    .select("id, path, thumb_path")
    .eq("work_id", input.id);

  // slug 유일성 (자기 자신 제외)
  const slug = await uniqueSlug(input.slug, async (s) => {
    const { data } = await supabase.from("works").select("id").eq("slug", s).neq("id", input.id).maybeSingle();
    return !!data;
  });

  const { error: upsertError } = await supabase.from("works").upsert({
    id: input.id,
    slug,
    shop_name: input.shopName,
    phone: input.phone || null,
    address: input.address,
    address_dong: input.addressDong || null,
    lng: input.lng,
    lat: input.lat,
    summary: input.summary || null,
    description: input.description || null,
    worked_at: input.workedAt,
    is_published: input.isPublished,
    consent: input.consent,
  });
  if (upsertError) return { ok: false, error: `저장하지 못했어요 (${upsertError.message})` };

  // 카테고리: 전체 교체
  await supabase.from("work_categories").delete().eq("work_id", input.id);
  const { error: catError } = await supabase
    .from("work_categories")
    .insert(input.categories.map((code) => ({ work_id: input.id, category_code: code })));
  if (catError) return { ok: false, error: `작업 종류를 저장하지 못했어요 (${catError.message})` };

  // 사진: 제거된 것 삭제(DB + Storage), 나머지 upsert. 첫 장이 커버.
  const keepIds = new Set(input.images.map((i) => i.id).filter(Boolean));
  const removed = (existingImages ?? []).filter((i) => !keepIds.has(i.id));
  if (removed.length) {
    await supabase.from("work_images").delete().in("id", removed.map((i) => i.id));
    const paths = removed.flatMap((i) => [i.path, i.thumb_path].filter((p): p is string => !!p));
    if (paths.length) await supabase.storage.from("works").remove(paths);
  }
  // 커버 유일 인덱스 충돌 방지: 먼저 전부 false
  await supabase.from("work_images").update({ is_cover: false }).eq("work_id", input.id);
  if (input.images.length) {
    const { error: imgError } = await supabase.from("work_images").upsert(
      input.images.map((img, idx) => ({
        ...(img.id ? { id: img.id } : {}),
        work_id: input.id,
        path: img.path,
        thumb_path: img.thumbPath,
        alt: img.alt || null,
        width: img.width,
        height: img.height,
        sort_order: idx,
        is_cover: idx === 0,
      })),
    );
    if (imgError) return { ok: false, error: `사진 정보를 저장하지 못했어요 (${imgError.message})` };
  }

  revalidateWork([existing?.slug, slug]);
  return { ok: true, data: { slug } };
}

export async function setWorkPublished(id: string, isPublished: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: w } = await supabase.from("works").select("slug, consent").eq("id", id).maybeSingle();
  if (!w) return { ok: false, error: "작업물을 찾을 수 없어요" };
  if (isPublished && !w.consent) return { ok: false, error: "가게 사장님의 게시 동의가 있어야 공개할 수 있어요" };

  const { error } = await supabase.from("works").update({ is_published: isPublished }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateWork([w.slug]);
  return { ok: true, data: undefined };
}

export async function deleteWork(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: w } = await supabase.from("works").select("slug").eq("id", id).maybeSingle();
  if (!w) return { ok: false, error: "작업물을 찾을 수 없어요" };

  // Storage 정리 (prefix = work id)
  const { data: objects } = await supabase.storage.from("works").list(id, { limit: 200 });
  if (objects?.length) {
    await supabase.storage.from("works").remove(objects.map((o) => `${id}/${o.name}`));
  }
  const { error } = await supabase.from("works").delete().eq("id", id); // 댓글/사진/카테고리 cascade
  if (error) return { ok: false, error: error.message };

  revalidateWork([w.slug]);
  return { ok: true, data: undefined };
}
