"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { CategoryBadge } from "@/components/category/category-badge";
import type { CategoryMap } from "@/lib/domain/category/types";
import { deleteWork, setWorkPublished } from "@/lib/domain/work/actions";
import type { AdminWorkRow } from "@/lib/domain/work/admin-queries";
import { formatWorkedAt } from "@/lib/domain/work/types";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

const t = ko.admin.works;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export function WorkList({ works, categoryMap }: { works: AdminWorkRow[]; categoryMap: CategoryMap }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(okMsg);
        router.refresh();
      } else toast.error(res.error ?? "실패했어요");
    });

  if (works.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-12 text-center shadow-card">
        <span className="text-3xl">🪧</span>
        <p className="font-semibold">{t.empty}</p>
        <p className="text-sm text-muted-foreground">{t.emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {works.map((w) => (
        <li key={w.id} className={cn("flex gap-3 rounded-2xl bg-card p-3 shadow-card", pending && "opacity-70")}>
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
            {w.coverUrl && <Image src={w.coverUrl} alt="" fill sizes="64px" className="object-cover" />}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                  w.isPublished ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
                )}
              >
                {w.isPublished ? t.published : t.unpublished}
              </span>
              <Link href={`/admin/works/${w.id}/edit`} className="truncate text-[15px] font-bold">
                {w.shopName}
              </Link>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatWorkedAt(w.workedAt)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {w.categories.map((c) => categoryMap[c] && <CategoryBadge key={c} category={categoryMap[c]} />)}
              {w.addressDong && <span className="text-xs text-muted-foreground">· {w.addressDong}</span>}
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5 text-xs font-semibold">
              <Link href={`/admin/works/${w.id}/edit`} className="rounded-lg bg-secondary px-2.5 py-1.5">
                {t.edit}
              </Link>
              <button
                type="button"
                disabled={pending || (!w.isPublished && !w.consent)}
                title={!w.isPublished && !w.consent ? t.needConsent : undefined}
                onClick={() => run(() => setWorkPublished(w.id, !w.isPublished), t.saved)}
                className="rounded-lg bg-secondary px-2.5 py-1.5 disabled:opacity-50"
              >
                {w.isPublished ? t.unpublish : t.publish}
              </button>
              {w.isPublished && (
                <>
                  <Link href={`/works/${w.slug}`} target="_blank" className="rounded-lg bg-secondary px-2.5 py-1.5">
                    보기 ↗
                  </Link>
                  {/* W-ADM-10: Search Console URL 검사 → 색인 요청 바로가기 */}
                  <a
                    href={`https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(siteUrl + "/")}&id=${encodeURIComponent(`${siteUrl}/works/${encodeURIComponent(w.slug)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-secondary px-2.5 py-1.5"
                  >
                    구글 색인 요청 ↗
                  </a>
                </>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (window.confirm(t.deleteConfirm(w.shopName))) run(() => deleteWork(w.id), t.deleted);
                }}
                className="ml-auto rounded-lg px-2.5 py-1.5 text-destructive"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
