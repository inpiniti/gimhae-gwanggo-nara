import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { business } from "@/lib/domain/business/business";

export const OG_SIZE = { width: 1200, height: 630 };

async function fonts() {
  const dir = join(process.cwd(), "assets", "fonts");
  const [bold, regular] = await Promise.all([
    readFile(join(dir, "Pretendard-Bold.otf")),
    readFile(join(dir, "Pretendard-Regular.otf")),
  ]);
  return [
    { name: "Pretendard", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Pretendard", data: regular, weight: 400 as const, style: "normal" as const },
  ];
}

type Props = {
  title: string;
  subtitle?: string;
  tags?: string[];
  /** 배경 사진 (data URL 또는 절대 URL) */
  backgroundImage?: string;
};

/** OG 이미지 공통 렌더 (docs/08-design.md 7절): 사진 위 그라데이션 + 상호명 + 카테고리 + 브랜드 */
export async function renderOg({ title, subtitle, tags = [], backgroundImage }: Props) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          fontFamily: "Pretendard",
          background: backgroundImage ? "#191f28" : "linear-gradient(135deg, #3182f6 0%, #1b64da 100%)",
          color: "#fff",
          position: "relative",
        }}
      >
        {backgroundImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundImage}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: backgroundImage
              ? "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 100%)"
              : "transparent",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 18, padding: 64, position: "relative" }}>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 10 }}>
              {tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  style={{
                    display: "flex",
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.22)",
                    fontSize: 26,
                    fontWeight: 700,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ display: "flex", fontSize: 32, fontWeight: 400, opacity: 0.9 }}>{subtitle}</div>
          )}
          <div style={{ display: "flex", marginTop: 12, fontSize: 28, fontWeight: 700, opacity: 0.95 }}>
            {business.name} · {business.phone}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
