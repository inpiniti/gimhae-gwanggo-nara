import { SiteHeader } from "@/components/layout/site-header";

/**
 * 메인 레이아웃: 좌(지도/표) + 우(@panel 슬롯).
 * @panel 은 /works/[slug] 를 인터셉트해 우측에 상세를 띄운다 (docs/02-architecture.md 4절).
 */
export default function HomeLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">
        <section className="min-h-0 overflow-hidden bg-card">{children}</section>
        {/* 모바일에선 aside 가 숨겨지지만 DetailPanel 의 바텀시트는 포털이라 정상 표시 */}
        <aside className="hidden min-h-0 border-l border-border bg-card lg:block">{panel}</aside>
      </div>
    </div>
  );
}
