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
            anchor="bottom-left"
            onClick={() => onSelect(w.slug)}
            onMouseEnter={() => onHover(w.slug)}
            onMouseLeave={() => onHover(null)}
          >
            <MarkerContent className={cn(active && "z-10")}>
              {/* 카드 자체가 마커: 카테고리 색 배경 + 흰 글씨, 좌측 정렬. 좌하단 모서리가 좌표 */}
              <div
                className={cn(
                  "flex flex-col items-start rounded-md px-2 py-1 text-left leading-tight text-white shadow-md transition-transform",
                  active && "scale-105 ring-2 ring-white",
                )}
                style={{ backgroundColor: isSelected ? POINT : color }}
              >
                <span className="max-w-44 truncate text-[12px] font-bold">{w.shopName}</span>
                {w.phone && <span className="text-[10px] opacity-90 tabular-nums">{w.phone}</span>}
              </div>
            </MarkerContent>
          </MapMarker>
        );
      })}
      <MapControls position="bottom-right" showLocate={false} showFullscreen={false} />
    </Map>
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
