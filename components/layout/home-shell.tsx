import { SiteHeader } from "@/components/layout/site-header";

/**
 * 메인/상세 공용 껍데기: 헤더 + 좌(지도/표) + 우(상세 패널).
 * (home)/layout.tsx 와 /works/[slug] 직접 진입 페이지가 함께 쓴다.
 */
export function HomeShell({ left, panel }: { left: React.ReactNode; panel: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">
        <section className="min-h-0 overflow-hidden bg-card">{left}</section>
        {/* 모바일에선 aside 가 숨겨지지만 DetailPanel 의 바텀시트는 포털이라 정상 표시 */}
        <aside className="hidden min-h-0 border-l border-border bg-card lg:block">{panel}</aside>
      </div>
    </div>
  );
}
