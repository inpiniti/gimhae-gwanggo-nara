"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useIsDesktop } from "@/lib/hooks/use-media-query";
import { ko } from "@/lib/i18n/ko";

type Props = {
  title: string;
  children: React.ReactNode;
  /** 지정하면 닫기 시 뒤로가기 대신 이 경로로 이동 (직접 진입한 상세 페이지용) */
  closeHref?: string;
};

/**
 * 상세를 감싸는 껍데기.
 * 데스크탑: 우측 aside 안에 인라인. 모바일: 바텀시트. 닫기 = 뒤로가기 (W-DET-9).
 */
export function DetailPanel({ title, children, closeHref }: Props) {
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const close = () => {
    if (closeHref) router.push(closeHref);
    else if (window.history.length > 1) router.back();
    else router.push("/");
  };

  if (isDesktop) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-end px-2 pt-2">
          <button
            type="button"
            onClick={close}
            aria-label={ko.detail.close}
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">{children}</div>
      </div>
    );
  }

  return (
    <Sheet open onOpenChange={(o) => !o && close()}>
      <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl p-0">
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <SheetDescription className="sr-only">{title}</SheetDescription>
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
        <div className="h-full overflow-y-auto px-5 pt-3 pb-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
