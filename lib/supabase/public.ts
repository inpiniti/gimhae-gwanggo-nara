import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/** Supabase 공개 env 가 채워져 있는가. 없으면 빌드 시 빈 데이터로 렌더하고 런타임에 ISR 로 회복한다. */
export function hasSupabaseEnv(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
}

let warned = false;
export function warnMissingSupabaseEnv(where: string) {
  if (warned) return;
  warned = true;
  console.warn(
    `[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 비어 있어요 (${where}). ` +
      "Vercel → Settings → Environment Variables 에 Production 용으로 추가한 뒤 재배포하세요.",
  );
}

/**
 * 공개 읽기 전용 anon 클라이언트 — 쿠키를 읽지 않아 페이지가 정적(ISR)으로 유지된다.
 * RLS 로 is_published 만 보임. 세션이 필요한 곳(관리자)은 server.ts 사용.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
