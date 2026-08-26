"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { List, MapIcon, Search } from "lucide-react";
import { CategoryFilter } from "@/components/category/category-filter";
import { Input } from "@/components/ui/input";
import { toCategoryMap, type Category } from "@/lib/domain/category/types";
import type { WorkListItem } from "@/lib/domain/work/types";
import { useExplorerParams } from "@/lib/hooks/use-explorer-params";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";
import { WorkMap } from "./work-map";
import { WorkTable } from "./work-table";

type Props = { works: WorkListItem[]; categories: Category[] };

/** 메인 좌측: 지도 ↔ 표 토글, 카테고리 필터, 검색. 상태는 URL (nuqs). */
export function WorkExplorer({ works, categories }: Props) {
  const [{ view, cat, q }, setParams] = useExplorerParams();
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const selectedSlug = useMemo(() => {
    const m = pathname.match(/^\/works\/([^/]+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  }, [pathname]);

  const categoryMap = useMemo(() => toCategoryMap(categories), [categories]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return works.filter((w) => {
      if (cat.length && !w.categories.some((c) => cat.includes(c))) return false;
      if (!needle) return true;
      return [w.shopName, w.address, w.addressDong ?? "", w.summary ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [works, cat, q]);

  const select = useCallback((slug: string) => router.push(`/works/${slug}`), [router]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={(v) => setParams({ view: v })} />
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setParams({ q: e.target.value || null })}
              placeholder={ko.nav.search}
              className="h-10 rounded-xl pl-9"
              aria-label={ko.nav.search}
            />
          </label>
          <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
            {ko.list.count(filtered.length)}
          </span>
        </div>
        <CategoryFilter
          categories={categories}
          selected={cat}
          onChange={(next) => setParams({ cat: next.length ? next : null })}
        />
      </div>

      <div className="relative min-h-0 flex-1">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : view === "map" ? (
          <WorkMap
            works={filtered}
            categoryMap={categoryMap}
            selectedSlug={selectedSlug}
            hoveredSlug={hoveredSlug}
            onSelect={select}
            onHover={setHoveredSlug}
          />
        ) : (
          <WorkTable
            works={filtered}
            categoryMap={categoryMap}
            selectedSlug={selectedSlug}
            hoveredSlug={hoveredSlug}
            onHover={setHoveredSlug}
          />
        )}
        {/* 크롤러용: 지도 뷰일 때도 모든 작업물 링크를 HTML 에 포함 (W-TBL-5, 03-seo) */}
        {view === "map" && (
          <ul className="sr-only">
            {works.map((w) => (
              <li key={w.id}>
                <a href={`/works/${w.slug}`}>{w.shopName}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: "map" | "table"; onChange: (v: "map" | "table") => void }) {
  const item = (v: "map" | "table", label: string, Icon: typeof MapIcon) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      aria-pressed={view === v}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold transition-colors",
        view === v ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
  return (
    <div className="flex shrink-0 rounded-xl bg-secondary p-1">
      {item("map", ko.nav.map, MapIcon)}
      {item("table", ko.nav.table, List)}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-8 text-center">
      <span className="text-3xl">🔎</span>
      <p className="mt-2 font-semibold">{ko.list.empty}</p>
      <p className="text-sm text-muted-foreground">{ko.list.emptyHint}</p>
    </div>
  );
}
