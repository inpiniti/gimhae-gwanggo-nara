"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";

/**
 * CARTO 기본 스타일은 지명을 영문(name_en/라틴)으로 그린다.
 * 타일(OpenMapTiles 스키마)에 name:ko 가 있으므로 심볼 레이어의 text-field 를
 * "name:ko → name" 순으로 바꿔 한글 라벨을 우선 표시한다 (05-open-questions #3).
 */
export function KoreanLabels() {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;
    const apply = () => {
      const style = map.getStyle();
      if (!style?.layers) return;
      for (const layer of style.layers) {
        if (layer.type !== "symbol") continue;
        const tf = map.getLayoutProperty(layer.id, "text-field");
        if (tf === undefined || tf === null) continue;
        map.setLayoutProperty(layer.id, "text-field", [
          "coalesce",
          ["get", "name:ko"],
          ["get", "name"],
          ["get", "name_en"],
        ]);
      }
    };
    apply();
    // 테마 전환 등으로 스타일이 다시 로드되면 재적용
    map.on("style.load", apply);
    return () => {
      map.off("style.load", apply);
    };
  }, [map, isLoaded]);

  return null;
}
