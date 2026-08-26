"use client";

import { Copy, ExternalLink, Phone, Share2 } from "lucide-react";
import { toast } from "sonner";
import { telHref } from "@/lib/domain/business/business";
import { kakaoMapUrl, naverMapUrl } from "@/lib/domain/geo/deeplink";
import type { Location } from "@/lib/domain/geo/types";
import { ko } from "@/lib/i18n/ko";
import { cn } from "@/lib/utils";

type Props = { shopName: string; phone: string | null; address: string; location: Location; slug: string };

const btn =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors";

/** 상세 액션: 전화 / 주소 복사 / 지도 앱 / 공유. 포인트 컬러는 전화 버튼 하나. */
export function WorkActions({ shopName, phone, address, location, slug }: Props) {
  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast(text);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <a href={telHref(phone)} className={cn(btn, "bg-primary text-primary-foreground")}>
          <Phone className="size-4" /> {ko.detail.call}
        </a>
      )}
      <button
        type="button"
        onClick={() => copy(address, ko.detail.copied)}
        className={cn(btn, "bg-secondary text-secondary-foreground")}
      >
        <Copy className="size-4" /> {ko.detail.copyAddress}
      </button>
      <a
        href={kakaoMapUrl(shopName, location)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(btn, "bg-secondary text-secondary-foreground")}
      >
        <ExternalLink className="size-4" /> {ko.detail.kakaoMap}
      </a>
      <a
        href={naverMapUrl(shopName, location)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(btn, "bg-secondary text-secondary-foreground")}
      >
        <ExternalLink className="size-4" /> {ko.detail.naverMap}
      </a>
      <button
        type="button"
        onClick={() => copy(`${window.location.origin}/works/${slug}`, ko.detail.shared)}
        className={cn(btn, "bg-secondary text-secondary-foreground")}
      >
        <Share2 className="size-4" /> {ko.detail.share}
      </button>
    </div>
  );
}
