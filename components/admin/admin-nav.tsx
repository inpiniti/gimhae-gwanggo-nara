"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { signOut } from "@/lib/domain/admin/actions";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin", label: ko.admin.nav.works, exact: false },
  { href: "/admin/categories", label: ko.admin.nav.categories, exact: true },
  { href: "/admin/comments", label: ko.admin.nav.comments, exact: true },
];

export function AdminNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const isActive = (t: (typeof tabs)[number]) =>
    t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith("/admin/works");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link href="/admin" className="shrink-0 text-[17px] font-bold">
          {ko.admin.title}
        </Link>
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold",
                isActive(t) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="hidden text-muted-foreground sm:inline">{displayName}</span>
          <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-muted-foreground">
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">{ko.admin.nav.site}</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="rounded-lg px-2 py-1 font-semibold text-muted-foreground hover:bg-secondary">
              {ko.admin.nav.logout}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
