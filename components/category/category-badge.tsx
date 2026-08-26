import type { Category } from "@/lib/domain/category/types";
import { cn } from "@/lib/utils";

/** 토스 태그 스타일: 연한 배경 + 진한 글자 (docs/08-design.md) */
export function CategoryBadge({
  category,
  className,
}: {
  category: Pick<Category, "name" | "color">;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-semibold whitespace-nowrap",
        className,
      )}
      style={{ backgroundColor: `${category.color}1f`, color: category.color }}
    >
      {category.name}
    </span>
  );
}
