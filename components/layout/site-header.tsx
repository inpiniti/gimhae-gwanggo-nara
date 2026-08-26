import Link from "next/link";
import { Phone } from "lucide-react";
import { business, telHref } from "@/lib/domain/business/business";
import { ko } from "@/lib/i18n/ko";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
      <Link href="/" className="shrink-0 text-[17px] font-bold tracking-tight">
        {business.name}
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>
      <a
        href={telHref(business.phone)}
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 text-sm font-semibold text-primary-foreground"
        aria-label={`${ko.nav.call} ${business.phone}`}
      >
        <Phone className="size-4" />
        <span className="hidden sm:inline">{business.phone}</span>
        <span className="sm:hidden">{ko.nav.call}</span>
      </a>
    </header>
  );
}
