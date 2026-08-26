import Link from "next/link";
import { business } from "@/lib/domain/business/business";
import { ko } from "@/lib/i18n/ko";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card px-4 py-6 text-[13px] text-muted-foreground">
      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/about" className="font-semibold text-secondary-foreground">
            {ko.footer.about}
          </Link>
          <Link href="/privacy" className="font-semibold text-secondary-foreground">
            {ko.footer.privacy}
          </Link>
          <Link href="/admin" className="ml-auto">
            {ko.footer.admin}
          </Link>
        </div>
        <p>
          {business.legalName} · {business.address.full} · {business.phone}
          {business.businessNumber && ` · ${ko.footer.bizNo} ${business.businessNumber}`}
        </p>
        <p>{ko.footer.copyright(new Date().getFullYear())}</p>
      </div>
    </footer>
  );
}
