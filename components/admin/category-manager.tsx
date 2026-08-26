"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CategoryBadge } from "@/components/category/category-badge";
import { Input } from "@/components/ui/input";
import { addCategory, updateCategory } from "@/lib/domain/category/actions";
import type { Category } from "@/lib/domain/category/types";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

const t = ko.admin.categories;

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ code: "", name: "", color: "#3182f6" });

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(okMsg);
        after?.();
        router.refresh();
      } else toast.error(res.error ?? "실패했어요");
    });

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {categories.map((c) => (
          <li key={c.code} className={cn("flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card", !c.isActive && "opacity-60")}>
            <CategoryBadge category={c} />
            <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
            <input
              type="color"
              defaultValue={c.color}
              onBlur={(e) => e.target.value !== c.color && run(() => updateCategory(c.code, { color: e.target.value }), ko.admin.works.saved)}
              className="size-8 cursor-pointer rounded-md border border-border bg-transparent"
              aria-label={t.color}
            />
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => updateCategory(c.code, { isActive: !c.isActive }), ko.admin.works.saved)}
              className="ml-auto rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold"
            >
              {c.isActive ? t.active : t.inactive}
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addCategory(form), ko.admin.works.saved, () => setForm({ code: "", name: "", color: "#3182f6" }));
        }}
        className="flex flex-wrap items-end gap-2 rounded-2xl bg-card p-4 shadow-card"
      >
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
          {t.code}
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="acrylic" className="h-10 w-36 rounded-xl font-mono" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
          {t.name}
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="아크릴 명판" className="h-10 w-40 rounded-xl" />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
          {t.color}
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="size-10 rounded-xl border border-border bg-transparent" />
        </label>
        <button type="submit" disabled={pending} className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {t.add}
        </button>
      </form>
    </div>
  );
}
