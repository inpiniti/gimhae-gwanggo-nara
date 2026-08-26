import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { PublicComment } from "./types";

/** 공개 댓글 (comments_public 뷰 — 해시 컬럼 없음), 오래된 순 */
export async function listComments(workId: string): Promise<PublicComment[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("comments_public")
    .select("*")
    .eq("work_id", workId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map((c) => ({
    id: c.id,
    workId: c.work_id,
    nickname: c.nickname,
    body: c.body,
    isOwner: c.is_owner,
    createdAt: c.created_at,
  }));
}
