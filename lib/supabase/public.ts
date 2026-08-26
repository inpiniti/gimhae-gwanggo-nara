import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

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
