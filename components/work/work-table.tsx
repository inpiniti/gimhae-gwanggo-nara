"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { CategoryBadge } from "@/components/category/category-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CategoryMap } from "@/lib/domain/category/types";
import { formatWorkedAt, type WorkListItem } from "@/lib/domain/work/types";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

type SortKey = "workedAt" | "shopName";
type SortState = { key: SortKey; dir: "asc" | "desc" };

function SortIcon({ k, sort }: { k: SortKey; sort: SortState }) {
  if (sort.key !== k) return <ArrowUpDown className="size-3.5 opacity-50" />;
  return sort.dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />;
}

type Props = {
  works: WorkListItem[];
  categoryMap: CategoryMap;
  selectedSlug: string | null;
  hoveredSlug: string | null;
  onHover: (slug: string | null) => void;
};

/**
 * 목록 표. 모든 행이 <a> 로 서버 HTML 에 포함되어 크롤러가 링크를 발견한다 (W-TBL-5).
 * 정렬은 클라이언트에서. 100건 넘으면 TanStack/ReUI Data Grid 로 교체 (docs/02-architecture.md).
 */
export function WorkTable({ works, categoryMap, selectedSlug, hoveredSlug, onHover }: Props) {
  const [sort, setSort] = useState<SortState>({
    key: "workedAt",
    dir: "desc",
  });

  const sorted = useMemo(() => {
    const arr = [...works];
    arr.sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const r = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.dir === "asc" ? r : -r;
    });
    return arr;
  }, [works, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  return (
    <div className="h-full overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="hidden w-16 sm:table-cell" />
            <TableHead>
              <button type="button" onClick={() => toggleSort("shopName")} className="inline-flex items-center gap-1">
                {ko.list.columns.shop} <SortIcon k="shopName" sort={sort} />
              </button>
            </TableHead>
            <TableHead>{ko.list.columns.category}</TableHead>
            <TableHead className="hidden sm:table-cell">{ko.list.columns.dong}</TableHead>
            <TableHead className="text-right">
              <button type="button" onClick={() => toggleSort("workedAt")} className="inline-flex items-center gap-1">
                {ko.list.columns.date} <SortIcon k="workedAt" sort={sort} />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((w) => {
            const active = w.slug === selectedSlug;
            const hovered = w.slug === hoveredSlug;
            return (
              <TableRow
                key={w.id}
                data-state={active ? "selected" : undefined}
                onMouseEnter={() => onHover(w.slug)}
                onMouseLeave={() => onHover(null)}
                className={cn("relative cursor-pointer", (active || hovered) && "bg-accent/60")}
              >
                <TableCell className="hidden py-2 sm:table-cell">
                  <div className="relative size-12 overflow-hidden rounded-lg bg-muted">
                    {w.coverUrl && (
                      <Image src={w.coverUrl} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {/* 행 전체 클릭 영역 — 링크가 서버 HTML 에 포함됨 */}
                  <Link href={`/works/${w.slug}`} className="after:absolute after:inset-0" prefetch>
                    {w.shopName}
                  </Link>
                  {w.summary && (
                    <div className="mt-0.5 line-clamp-1 text-xs font-normal text-muted-foreground">
                      {w.summary}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {w.categories.map(
                      (c) => categoryMap[c] && <CategoryBadge key={c} category={categoryMap[c]} />,
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden text-secondary-foreground sm:table-cell">
                  {w.addressDong ?? ""}
                </TableCell>
                <TableCell className="text-right text-[13px] whitespace-nowrap text-secondary-foreground tabular-nums">
                  {formatWorkedAt(w.workedAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
