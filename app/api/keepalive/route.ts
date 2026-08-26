import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient, hasSupabaseEnv } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/**
 * 하루 1회 (vercel.json cron):
 * 1) Supabase Free 7일 비활성 일시정지 방지 헬스 핑 (docs/06-operations.md 4절)
 * 2) 30일 지난 댓글 IP 해시 삭제 (docs/domain/comment/db.md 개인정보 보존)
 * Vercel Cron 은 CRON_SECRET 이 설정돼 있으면 Authorization: Bearer 로 호출한다.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  if (!hasSupabaseEnv()) return NextResponse.json({ ok: false, error: "supabase env missing" }, { status: 500 });

  const { count, error } = await createPublicClient()
    .from("categories")
    .select("code", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { error: cleanupError } = await createAdminClient()
    .from("comments")
    .update({ ip_hash: null })
    .not("ip_hash", "is", null)
    .lt("created_at", cutoff);

  return NextResponse.json({ ok: true, categories: count, ipHashCleanup: cleanupError ? cleanupError.message : "done" });
}
