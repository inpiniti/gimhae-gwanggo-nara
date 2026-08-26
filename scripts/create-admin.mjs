/**
 * 관리자 계정 생성/비밀번호 재설정 + admins 등록 (docs/domain/admin/db.md)
 *
 *   node scripts/create-admin.mjs <email> <password> [표시이름]
 *
 * .env.local 의 SUPABASE_SERVICE_ROLE_KEY 를 사용한다. 로컬에서만 실행할 것.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const [email, password, displayName = "광고나라"] = process.argv.slice(2);
if (!email || !password) {
  console.error("사용법: node scripts/create-admin.mjs <email> <password> [표시이름]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("비밀번호는 8자 이상이어야 해요");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: list, error: listError } = await sb.auth.admin.listUsers();
if (listError) throw listError;
let user = list.users.find((u) => u.email === email);

if (user) {
  const { error } = await sb.auth.admin.updateUserById(user.id, { password });
  if (error) throw error;
  console.log(`기존 계정 비밀번호를 재설정했어요: ${email}`);
} else {
  const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  user = data.user;
  console.log(`계정을 만들었어요: ${email}`);
}

const { error: adminError } = await sb.from("admins").upsert({ user_id: user.id, display_name: displayName });
if (adminError) throw adminError;
console.log(`admins 에 등록했어요 (user_id=${user.id}, display_name=${displayName})`);
