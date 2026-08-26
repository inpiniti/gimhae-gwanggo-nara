"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { geocodeAddress } from "@/lib/domain/geo/actions";
import type { GeocodeResult } from "@/lib/domain/geo/types";
import { ko } from "@/lib/i18n/ko";

type Props = { onSelect: (r: GeocodeResult) => void };

/** 주소 입력 → Kakao 검색 → 후보 선택 (docs/domain/geo/prd.md G-1) */
export function AddressSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const search = () => {
    if (query.trim().length < 2) return;
    start(async () => {
      const res = await geocodeAddress(query);
      if (res.ok) {
        setResults(res.results);
        setError(null);
      } else {
        setResults(null);
        setError(res.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              search();
            }
          }}
          placeholder={ko.admin.form.addressPlaceholder}
          className="h-11 rounded-xl"
        />
        <button
          type="button"
          onClick={search}
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-secondary px-3 text-sm font-semibold text-secondary-foreground disabled:opacity-60"
        >
          <Search className="size-4" /> {ko.admin.form.addressSearch}
        </button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {results && results.length === 0 && (
        <p className="text-sm text-muted-foreground">{ko.admin.form.addressNoResult}</p>
      )}
      {results && results.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-border">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r);
                  setResults(null);
                }}
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-secondary"
              >
                <span className="text-[15px] font-semibold">{r.roadAddress}</span>
                {r.jibunAddress && <span className="text-xs text-muted-foreground">{r.jibunAddress}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
