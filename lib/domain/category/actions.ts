"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/domain/admin/guard";
import type { ActionResult } from "@/lib/domain/work/policies";
import { createClient } from "@/lib/supabase/server";

const CategoryInput = z.object({
  code: z.string().regex(/^[a-z][a-z0-9_]{1,29}$/, "코드는 영문 소문자로 시작, 2~30자 (a-z, 0-9, _)"),
  name: z.string().trim().min(1, "이름을 입력해 주세요").max(20),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "색상은 #RRGGBB 형식이에요"),
});

export async function addCategory(raw: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = CategoryInput.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data: last } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase
    .from("categories")
    .insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 10 });
  if (error) return { ok: false, error: error.code === "23505" ? "이미 있는 코드나 이름이에요" : error.message };
  revalidatePath("/");
  return { ok: true, data: undefined };
}

export async function updateCategory(
  code: string,
  patch: { name?: string; color?: string; isActive?: boolean; sortOrder?: number },
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.color !== undefined ? { color: patch.color } : {}),
      ...(patch.isActive !== undefined ? { is_active: patch.isActive } : {}),
      ...(patch.sortOrder !== undefined ? { sort_order: patch.sortOrder } : {}),
    })
    .eq("code", code);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  return { ok: true, data: undefined };
}
