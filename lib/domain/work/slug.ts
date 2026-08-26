/**
 * SEO slug (docs/domain/work/overview.md 불변식 4)
 * 형식: {상호명}-{동}-{대표카테고리}. 한글 허용, 공백/기호는 '-'.
 */
export function makeSlug(parts: Array<string | null | undefined>): string {
  return parts
    .filter((p): p is string => !!p && p.trim().length > 0)
    .map((p) =>
      p
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("-")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

/** 중복이면 -2, -3 … 접미. exists 는 "이미 사용 중인가"를 답한다 */
export async function uniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  if (!(await exists(base))) return base;
  for (let n = 2; n < 100; n++) {
    const candidate = `${base}-${n}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${base}-${Date.now()}`;
}
