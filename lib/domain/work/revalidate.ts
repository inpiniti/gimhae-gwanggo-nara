import "server-only";

import { revalidatePath } from "next/cache";

/** WorkPublished / WorkUpdated / WorkDeleted 이벤트 소비자 (docs/domain/work/overview.md) */
export function revalidateWork(slugs: Array<string | null | undefined>) {
  revalidatePath("/");
  for (const s of slugs) if (s) revalidatePath(`/works/${s}`);
  revalidatePath("/sitemap.xml");
}
