import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { CategoryBadge } from "@/components/category/category-badge";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WorkActions } from "@/components/work/work-actions";
import { listCategories } from "@/lib/domain/category/queries";
import { business, telHref } from "@/lib/domain/business/business";
import { ko } from "@/lib/i18n/ko";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: ko.about.title,
  description: business.description,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const categories = (await listCategories()).filter((c) => c.isActive);
  const t = ko.about;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex flex-col gap-6 rounded-3xl bg-card p-5 shadow-card sm:p-7">
          <header>
            <p className="text-sm font-semibold text-primary">{business.name}</p>
            <h1 className="mt-1 text-[24px] leading-tight font-bold">{business.slogan}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-secondary-foreground">{t.intro}</p>
          </header>

          <section>
            <h2 className="mb-2 text-[15px] font-bold">{t.services}</h2>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <CategoryBadge key={c.code} category={c} className="h-8 px-3 text-sm" />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-bold">{t.contact}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[15px]">
              <dt className="text-muted-foreground">전화</dt>
              <dd className="tabular-nums">
                <a href={telHref(business.phone)} className="font-semibold text-primary">
                  {business.phone}
                </a>
              </dd>
              <dt className="text-muted-foreground">휴대폰</dt>
              <dd className="tabular-nums">
                <a href={telHref(business.mobile)} className="font-semibold text-primary">
                  {business.mobile}
                </a>
              </dd>
              <dt className="text-muted-foreground">주소</dt>
              <dd>{business.address.full}</dd>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={telHref(business.phone)}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                <Phone className="size-4" /> {ko.nav.call}
              </a>
              {business.kakaoChannelUrl && (
                <a
                  href={business.kakaoChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#FEE500] px-4 text-sm font-semibold text-[#191f28]"
                >
                  <MessageCircle className="size-4" /> {t.kakao}
                </a>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-bold">{t.hours}</h2>
            <ul className="text-[15px]">
              {business.hours.map((h) => (
                <li key={h.days} className="flex gap-3">
                  <span className="w-12 text-muted-foreground">{h.days}</span>
                  <span className="tabular-nums">
                    {h.open} – {h.close}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-[15px] font-bold">{t.directions}</h2>
            <WorkActions
              shopName={business.name}
              phone={null}
              address={business.address.full}
              location={business.location}
              slug=""
            />
          </section>

          <Link href="/" className="text-center text-sm font-semibold text-primary">
            {t.seeWorks} →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
