"use client";

import { useEffect } from "react";
import { Map, MapControls, MapMarker, MarkerContent, useMap } from "@/components/ui/map";
import { KoreanLabels } from "@/components/work/korean-labels";
import { GIMHAE_DEFAULT_VIEWPORT, toLngLat, type Location } from "@/lib/domain/geo/types";

export type LocationPickerProps = {
  value: Location | null;
  onChange: (loc: Location) => void;
};

/** 핀 드래그로 좌표 보정 (docs/domain/geo/prd.md G-2) */
export function LocationPickerInner({ value, onChange }: LocationPickerProps) {
  const center = value ?? GIMHAE_DEFAULT_VIEWPORT.center;
  return (
    <div className="h-64 w-full overflow-hidden rounded-xl border border-border">
      <Map center={toLngLat(center)} zoom={value ? 16 : GIMHAE_DEFAULT_VIEWPORT.zoom} className="h-full w-full">
        <KoreanLabels />
        <Recenter target={value} />
        {value && (
          <MapMarker longitude={value.lng} latitude={value.lat} draggable onDragEnd={(ll) => onChange(ll)}>
            <MarkerContent>
              <div className="size-5 cursor-grab rounded-full border-[3px] border-white bg-primary shadow-md ring-4 ring-primary/30" />
            </MarkerContent>
          </MapMarker>
        )}
        <MapControls position="bottom-right" showLocate={false} showFullscreen={false} showCompass={false} />
      </Map>
    </div>
  );
}

function Recenter({ target }: { target: Location | null }) {
  const { map, isLoaded } = useMap();
  useEffect(() => {
    if (!map || !isLoaded || !target) return;
    map.flyTo({ center: toLngLat(target), zoom: 16, duration: 500 });
    // 주소 선택으로 바뀐 경우만 이동 (드래그 중엔 target 이 마커 위치와 같아 시각적 변화 없음)
  }, [map, isLoaded, target]);
  return null;
}
