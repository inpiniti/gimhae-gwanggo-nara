"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { WorkImage } from "@/lib/domain/work/types";
import { ko } from "@/lib/i18n/ko";

/** 썸네일 그리드 → 라이트박스 (좌우/ESC/스와이프) */
export function WorkGallery({ images }: { images: WorkImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const count = images.length;

  const prev = useCallback(() => setIndex((i) => (i === null ? i : (i - 1 + count) % count)), [count]);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % count)), [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (count === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
        📷 {ko.detail.noPhotos}
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-3 gap-1.5">
        {images.map((img, i) => (
          <li key={img.id} className={i === 0 ? "col-span-3" : ""}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={`relative block w-full overflow-hidden rounded-xl bg-muted ${i === 0 ? "aspect-[4/3]" : "aspect-square"}`}
              aria-label={img.alt}
            >
              <Image
                src={i === 0 ? img.url : img.thumbUrl}
                alt={img.alt}
                fill
                sizes={i === 0 ? "(min-width:1024px) 480px, 100vw" : "160px"}
                className="object-cover"
                priority={i === 0}
              />
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[min(96vw,1200px)] border-0 bg-black/95 p-0 text-white sm:rounded-2xl"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - (touchX.current ?? e.changedTouches[0].clientX);
            if (dx > 50) prev();
            if (dx < -50) next();
          }}
        >
          <DialogTitle className="sr-only">{ko.detail.photos}</DialogTitle>
          {index !== null && (
            <div className="relative flex h-[85vh] items-center justify-center">
              <Image
                src={images[index].url}
                alt={images[index].alt}
                fill
                sizes="96vw"
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setIndex(null)}
                className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/15"
                aria-label={ko.detail.close}
              >
                <X className="size-5" />
              </button>
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15"
                    aria-label="이전 사진"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15"
                    aria-label="다음 사진"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm tabular-nums">
                {ko.detail.photoCounter(index + 1, count)}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
