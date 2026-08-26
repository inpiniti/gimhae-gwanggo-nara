/** Supabase Storage `works` 버킷 공개 URL (docs/domain/work/db.md Storage 절) */
export function workImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/works/${path}`;
}
