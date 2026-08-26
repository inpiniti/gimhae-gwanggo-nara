"use client";

import { useEffect } from "react";
import { Map, MapControls, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import { primaryCategory, type CategoryMap } from "@/lib/domain/category/types";
import type { WorkListItem } from "@/lib/domain/work/types";
import { GIMHAE_DEFAULT_VIEWPORT, toLngLat } from "@/lib/domain/geo/types";
import { cn } from "@/lib/utils";
import { KoreanLabels } from "./korean-labels";

export type WorkMapProps = {
  works: WorkListItem[];
  categoryMap: CategoryMap;
  selectedSlug: string | null;
  hoveredSlug: string | null;
  onSelect: (slug: string) => void;
  onHover: (slug: string | null) => void;
};

const POINT = "#3182f6";

export function WorkMapInner({
  works,
  categoryMap,
  selectedSlug,
  hoveredSlug,
  onSelect,
  onHover,
}: WorkMapProps) {
  const selected = works.find((w) => w.slug === selectedSlug) ?? null;

  return (
    <Map
      center={toLngLat(GIMHAE_DEFAULT_VIEWPORT.center)}
      zoom={GIMHAE_DEFAULT_VIEWPORT.zoom}
      className="h-full w-full"
      attributionControl={{ compact: true }}
    >
      <KoreanLabels />
      <FlyTo target={selected} />
      {works.map((w) => {
        const color = primaryCategory(w.categories, categoryMap)?.color ?? POINT;
        const isSelected = w.slug === selectedSlug;
        const isHovered = w.slug === hoveredSlug;
        const active = isSelected || isHovered;
        return (
          <MapMarker
            key={w.id}
            longitude={w.location.lng}
            latitude={w.location.lat}
            anchor="bottom"
            onClick={() => onSelect(w.slug)}
            onMouseEnter={() => onHover(w.slug)}
            onMouseLeave={() => onHover(null)}
          >
            <MarkerContent className={cn(active && "z-10")}>
              <div className="flex flex-col items-center">
                {/* 상호명 · 전화번호 라벨 (항상 표시) */}
                <div
                  className={cn(
                    "mb-1 flex flex-col items-center rounded-lg border bg-card px-2 py-1 text-center leading-tight shadow-card transition-transform",
                    active ? "scale-105 border-primary" : "border-border",
                  )}
                >
                  <span className="max-w-40 truncate text-[12px] font-bold text-foreground">{w.shopName}</span>
                  {w.phone && (
                    <span className="text-[10px] text-secondary-foreground tabular-nums">{w.phone}</span>
                  )}
                </div>
                <Pin color={isSelected ? POINT : color} active={active} />
              </div>
            </MarkerContent>
          </MapMarker>
        );
      })}
      <MapControls position="bottom-right" showLocate={false} showFullscreen={false} />
    </Map>
  );
}

/** 물방울 핀. 끝점이 좌표 (anchor="bottom") */
function Pin({ color, active }: { color: string; active: boolean }) {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      className={cn("drop-shadow-md transition-transform", active && "scale-110")}
      aria-hidden
    >
      <path
        d="M14 35C14 35 26 21.5 26 13A12 12 0 0 0 2 13C2 21.5 14 35 14 35Z"
        fill={color}
        stroke="#fff"
        strokeWidth="2.5"
      />
      <circle cx="14" cy="13" r="4.5" fill="#fff" />
    </svg>
  );
}

/** 선택된 작업물로 부드럽게 이동 (600ms, docs/08-design.md) */
function FlyTo({ target }: { target: WorkListItem | null }) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded || !target) return;
    map.flyTo({
      center: toLngLat(target.location),
      zoom: Math.max(map.getZoom(), 15),
      duration: 600,
    });
  }, [map, isLoaded, target]);
  return null;
}
