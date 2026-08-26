"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { ko } from "@/lib/i18n/ko";
import type { WorkMapProps } from "./work-map-inner";

/** MapLibre 는 window 필요 → 클라이언트 전용 dynamic import (G-10) */
export const WorkMap = dynamic<WorkMapProps>(
  () => import("./work-map-inner").then((m) => m.WorkMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-full w-full">
        <Skeleton className="h-full w-full rounded-none" />
        <span className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {ko.list.mapLoading}
        </span>
      </div>
    ),
  },
);
