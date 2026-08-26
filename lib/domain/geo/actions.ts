"use server";

import { requireAdmin } from "@/lib/domain/admin/guard";
import { kakaoGeocoder } from "./kakao";
import type { GeocodeResult } from "./types";

/** 관리자 주소 검색 (Kakao Local). 결과 좌표는 폼 → saveWork 로 DB 에 저장된다. */
export async function geocodeAddress(query: string): Promise<{ ok: true; results: GeocodeResult[] } | { ok: false; error: string }> {
  await requireAdmin();
  const q = query.trim();
  if (q.length < 2) return { ok: true, results: [] };
  try {
    return { ok: true, results: await kakaoGeocoder.geocode(q) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "주소를 찾지 못했어요" };
  }
}
