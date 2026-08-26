import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type { Category } from "./types";

/** 전체 카테고리 (비활성 포함). 필터 칩은 isActive 로 걸러 쓴다. */
export async function listCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data.map((r) => ({
    code: r.code,
    name: r.name,
    color: r.color,
    sortOrder: r.sort_order,
    isActive: r.is_active,
  }));
}
