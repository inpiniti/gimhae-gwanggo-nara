import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Admin = { userId: string; displayName: string; email: string | null };

/** 현재 세션이 관리자면 Admin, 아니면 null (로그인 안 됨 / admins 미등록 모두 null) */
export async function getAdmin(): Promise<Admin | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("admins")
    .select("user_id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return { userId: data.user_id, displayName: data.display_name, email: user.email ?? null };
}

/**
 * 관리자 페이지/서버 액션 진입 가드 (docs/domain/admin/overview.md).
 * 미로그인 → /admin/login, 로그인했지만 admins 미등록 → /admin/forbidden
 */
export async function requireAdmin(): Promise<Admin> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const admin = await getAdmin();
  if (!admin) redirect("/admin/forbidden");
  return admin;
}
