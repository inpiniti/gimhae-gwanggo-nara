"use client";

import { useEffect } from "react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerLabel, useMap } from "@/components/ui/map";
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
        return (
          <MapMarker
            key={w.id}
            longitude={w.location.lng}
            latitude={w.location.lat}
            onClick={() => onSelect(w.slug)}
            onMouseEnter={() => onHover(w.slug)}
            onMouseLeave={() => onHover(null)}
          >
            <MarkerContent>
              <div
                className={cn(
                  "size-3.5 rounded-full border-2 border-white shadow-md transition-transform",
                  (isSelected || isHovered) && "scale-125",
                  isSelected && "ring-[3px] ring-primary/40",
                )}
                style={{ backgroundColor: isSelected ? POINT : color }}
              />
            </MarkerContent>
            {(isSelected || isHovered) && (
              <MarkerLabel className="rounded-md bg-card px-1.5 py-0.5 text-[11px] font-semibold shadow-card">
                {w.shopName}
              </MarkerLabel>
            )}
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
