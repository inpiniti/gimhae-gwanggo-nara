"use client";

import { parseAsArrayOf, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

/** 메인 화면 상태는 URL 파라미터가 단일 출처 (docs/domain/work/prd.md W-VIEW-1/2) */
export const explorerParsers = {
  view: parseAsStringLiteral(["map", "table"] as const).withDefault("map"),
  cat: parseAsArrayOf(parseAsString).withDefault([]),
  q: parseAsString.withDefault(""),
};

export function useExplorerParams() {
  return useQueryStates(explorerParsers, { history: "replace" });
}
