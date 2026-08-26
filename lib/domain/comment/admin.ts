"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/domain/admin/guard";
import type { ActionResult } from "@/lib/domain/work/policies";
import { createClient } from "@/lib/supabase/server";

export type AdminComment = {
  id: string;
  workId: string;
  workSlug: string;
  shopName: string;
  nickname: string;
  body: string;
  isOwner: boolean;
  isHidden: boolean;
  createdAt: string;
};

/** 전체 댓글 (숨김 포함), 최신순 */
export async function listAllComments(): Promise<AdminComment[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, work_id, nickname, body, is_owner, is_hidden, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  if (comments.length === 0) return [];

  const workIds = [...new Set(comments.map((c) => c.work_id))];
  const { data: works } = await supabase.from("works").select("id, slug, shop_name").in("id", workIds);
  const byId = new Map((works ?? []).map((w) => [w.id, w]));

  return comments.map((c) => ({
    id: c.id,
    workId: c.work_id,
    workSlug: byId.get(c.work_id)?.slug ?? "",
    shopName: byId.get(c.work_id)?.shop_name ?? "(삭제된 작업물)",
    nickname: c.nickname,
    body: c.body,
    isOwner: c.is_owner,
    isHidden: c.is_hidden,
    createdAt: c.created_at,
  }));
}

async function revalidateComment(supabase: Awaited<ReturnType<typeof createClient>>, workId: string) {
  const { data } = await supabase.from("works").select("slug").eq("id", workId).maybeSingle();
  if (data) revalidatePath(`/works/${data.slug}`);
}

export async function setCommentHidden(id: string, isHidden: boolean): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .update({ is_hidden: isHidden })
    .eq("id", id)
    .select("work_id")
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message ?? "댓글을 찾을 수 없어요" };
  await revalidateComment(supabase, data.work_id);
  return { ok: true, data: undefined };
}

export async function deleteComment(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("comments").select("work_id").eq("id", id).maybeSingle();
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (data) await revalidateComment(supabase, data.work_id);
  return { ok: true, data: undefined };
}

const ReplyInput = z.object({ workId: z.uuid(), body: z.string().trim().min(1).max(500) });

/** 사장님 답글 — is_owner = true, 비밀번호 없음 (docs/domain/comment/overview.md 불변식 1) */
export async function replyAsOwner(raw: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = ReplyInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "답글 내용을 1~500자로 입력해 주세요" };
  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    work_id: parsed.data.workId,
    nickname: admin.displayName,
    password_hash: null,
    body: parsed.data.body,
    is_owner: true,
  });
  if (error) return { ok: false, error: error.message };
  await revalidateComment(supabase, parsed.data.workId);
  return { ok: true, data: undefined };
}
