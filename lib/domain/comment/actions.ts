"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import type { ActionResult } from "@/lib/domain/work/policies";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashIp, hashPassword, verifyPassword } from "./password";

const OWNER_NAME = /광고\s*나라/;

const CreateInput = z.object({
  workId: z.uuid(),
  nickname: z.string().trim().min(1, "닉네임을 입력해 주세요").max(20, "닉네임은 20자까지 쓸 수 있어요"),
  password: z.string().min(4, "비밀번호는 4자 이상이에요").max(20),
  body: z.string().trim().min(1, "내용을 입력해 주세요").max(500, "내용은 500자까지 쓸 수 있어요"),
  website: z.string().optional(), // honeypot
});

async function clientIpHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
  return hashIp(ip);
}

/**
 * 방문자 댓글 작성 (docs/domain/comment/overview.md 유스케이스)
 * honeypot → rate limit → 공개 Work 확인 → bcrypt → insert → revalidate
 */
export async function createComment(raw: unknown): Promise<ActionResult> {
  const parsed = CreateInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const input = parsed.data;

  // 봇: 조용히 성공 처리
  if (input.website) return { ok: true, data: undefined };

  const supabase = createAdminClient();
  const ipHash = await clientIpHash();

  if (ipHash) {
    const { data: allowed } = await supabase.rpc("comment_rate_ok", { p_ip_hash: ipHash });
    if (allowed === false) return { ok: false, error: "잠시 후 다시 시도해 주세요" };
  }

  const { data: work } = await supabase
    .from("works")
    .select("slug, is_published")
    .eq("id", input.workId)
    .maybeSingle();
  if (!work?.is_published) return { ok: false, error: "댓글을 남길 수 없는 작업물이에요" };

  // 사장님 사칭 방지
  const nickname = OWNER_NAME.test(input.nickname) ? `${input.nickname}(방문자)` : input.nickname;

  const { error } = await supabase.from("comments").insert({
    work_id: input.workId,
    nickname,
    password_hash: await hashPassword(input.password),
    body: input.body,
    is_owner: false,
    ip_hash: ipHash,
  });
  if (error) return { ok: false, error: "잠시 연결이 어려워요. 조금 뒤에 다시 시도해 주세요" };

  revalidatePath(`/works/${work.slug}`);
  return { ok: true, data: undefined };
}

const DeleteInput = z.object({ id: z.uuid(), password: z.string().min(1) });

/** 본인 비밀번호로 삭제 */
export async function deleteOwnComment(raw: unknown): Promise<ActionResult> {
  const parsed = DeleteInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "비밀번호를 입력해 주세요" };

  const supabase = createAdminClient();
  const { data: c } = await supabase
    .from("comments")
    .select("id, work_id, password_hash, is_owner")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!c || c.is_owner || !c.password_hash) return { ok: false, error: "삭제할 수 없는 댓글이에요" };
  if (!(await verifyPassword(parsed.data.password, c.password_hash))) {
    return { ok: false, error: "비밀번호가 맞지 않아요" };
  }

  const { error } = await supabase.from("comments").delete().eq("id", c.id);
  if (error) return { ok: false, error: "잠시 연결이 어려워요. 조금 뒤에 다시 시도해 주세요" };

  const { data: work } = await supabase.from("works").select("slug").eq("id", c.work_id).maybeSingle();
  if (work) revalidatePath(`/works/${work.slug}`);
  return { ok: true, data: undefined };
}
