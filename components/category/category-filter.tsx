"use client";

import type { Category } from "@/lib/domain/category/types";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  selected: string[];
  onChange: (next: string[]) => void;
};

/** 다중 선택 칩. 선택 상태만 포인트 블루. 가로 스크롤(모바일). */
export function CategoryFilter({ categories, selected, onChange }: Props) {
  const toggle = (code: string) =>
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);

  const chip = (label: string, active: boolean, onClick: () => void, key: string) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-secondary-foreground hover:bg-secondary",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none]">
      {chip(ko.nav.allCategories, selected.length === 0, () => onChange([]), "all")}
      {categories
        .filter((c) => c.isActive)
        .map((c) => chip(c.name, selected.includes(c.code), () => toggle(c.code), c.code))}
    </div>
  );
}
