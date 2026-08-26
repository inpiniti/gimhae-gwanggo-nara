import Image from "next/image";
import Link from "next/link";
import { listPublishedWorks } from "@/lib/domain/work/queries";
import { business } from "@/lib/domain/business/business";
import { ko } from "@/lib/i18n/ko";

/** 아무것도 선택되지 않았을 때의 우측 패널 — 업체 소개 + 최근 작업 (B-7) */
export default async function PanelDefault() {
  const recent = (await listPublishedWorks()).slice(0, 4);
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
      <div>
        <h2 className="text-[20px] leading-snug font-bold">{ko.panelDefault.title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-secondary-foreground">{business.description}</p>
        <p className="mt-3 text-[13px] text-muted-foreground">{ko.panelDefault.hint}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[14px]">
        <dt className="text-muted-foreground">전화</dt>
        <dd className="tabular-nums">{business.phone}</dd>
        <dt className="text-muted-foreground">휴대폰</dt>
        <dd className="tabular-nums">{business.mobile}</dd>
        <dt className="text-muted-foreground">주소</dt>
        <dd>{business.address.full}</dd>
      </dl>
      <div className="flex gap-3 text-[13px] font-semibold">
        <Link href="/about" className="text-primary">
          {ko.footer.about}
        </Link>
        <Link href="/privacy" className="text-muted-foreground">
          {ko.footer.privacy}
        </Link>
      </div>
      {recent.length > 0 && (
        <section>
          <h3 className="mb-2 text-[15px] font-bold">{ko.panelDefault.recent}</h3>
          <ul className="grid grid-cols-2 gap-2">
            {recent.map((w) => (
              <li key={w.id}>
                <Link href={`/works/${w.slug}`} className="block overflow-hidden rounded-xl bg-secondary">
                  <div className="relative aspect-[4/3] bg-muted">
                    {w.coverUrl && (
                      <Image src={w.coverUrl} alt={w.shopName} fill sizes="240px" className="object-cover" />
                    )}
                  </div>
                  <div className="p-2">
                    <div className="truncate text-[14px] font-semibold">{w.shopName}</div>
                    <div className="truncate text-xs text-muted-foreground">{w.summary ?? w.addressDong}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
