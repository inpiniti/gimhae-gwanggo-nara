import { business } from "@/lib/domain/business/business";
import type { WorkDetail } from "@/lib/domain/work/types";

/** JSON-LD 빌더 (docs/03-seo.md 4절) */

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${business.siteUrl}/#business`,
    name: business.name,
    alternateName: business.legalName,
    description: business.description,
    telephone: `+82-${business.phone.replace(/^0/, "").replace(/-/g, "-")}`,
    url: business.siteUrl,
    image: `${business.siteUrl}/opengraph-image`,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KR",
      addressRegion: business.address.region,
      addressLocality: business.address.locality,
      streetAddress: business.address.street,
      ...(business.address.postalCode ? { postalCode: business.address.postalCode } : {}),
    },
    geo: { "@type": "GeoCoordinates", latitude: business.location.lat, longitude: business.location.lng },
    priceRange: "₩₩",
    openingHoursSpecification: business.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayOfWeek(h.days),
      opens: h.open,
      closes: h.close,
    })),
  };
}

function dayOfWeek(days: string): string[] {
  const map: Record<string, string> = {
    월: "Monday",
    화: "Tuesday",
    수: "Wednesday",
    목: "Thursday",
    금: "Friday",
    토: "Saturday",
    일: "Sunday",
  };
  const order = ["월", "화", "수", "목", "금", "토", "일"];
  const m = days.match(/^(.)[–-](.)$/);
  if (m) {
    const [a, b] = [order.indexOf(m[1]), order.indexOf(m[2])];
    return order.slice(a, b + 1).map((d) => map[d]);
  }
  return days.split(/[,\s]+/).map((d) => map[d]).filter(Boolean);
}

export function workJsonLd(work: WorkDetail, categoryNames: string[]) {
  const url = `${business.siteUrl}/works/${encodeURIComponent(work.slug)}`;
  const title = `${work.shopName} ${categoryNames[0] ?? "광고"} 시공 사례`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#work`,
        name: title,
        headline: title,
        description: work.summary ?? undefined,
        url,
        keywords: ["김해", ...categoryNames, work.addressDong, work.shopName].filter(Boolean).join(", "),
        dateCreated: work.workedAt ?? undefined,
        dateModified: work.updatedAt,
        creator: { "@id": `${business.siteUrl}/#business` },
        publisher: { "@id": `${business.siteUrl}/#business` },
        locationCreated: {
          "@type": "Place",
          name: work.shopName,
          address: work.address,
          geo: { "@type": "GeoCoordinates", latitude: work.location.lat, longitude: work.location.lng },
        },
        image: work.images.map((i) => ({
          "@type": "ImageObject",
          contentUrl: i.url,
          caption: i.alt,
          ...(i.width && i.height ? { width: i.width, height: i.height } : {}),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: business.siteUrl },
          ...(categoryNames[0]
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: categoryNames[0],
                  item: `${business.siteUrl}/?cat=${encodeURIComponent(work.categories[0])}`,
                },
              ]
            : []),
          { "@type": "ListItem", position: categoryNames[0] ? 3 : 2, name: work.shopName, item: url },
        ],
      },
    ],
  };
}

/** <script type="application/ld+json"> 용 — </script> 인젝션 방지 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
