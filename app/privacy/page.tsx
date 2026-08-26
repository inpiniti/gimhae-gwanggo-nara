import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { business } from "@/lib/domain/business/business";
import { ko } from "@/lib/i18n/ko";

export const metadata: Metadata = {
  title: ko.footer.privacy,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
};

/** docs/07-policy.md 1절 — 댓글 수집 항목 기준 최소 방침 */
export default function PrivacyPage() {
  const sections: { h: string; body: React.ReactNode }[] = [
    {
      h: "1. 수집하는 항목과 목적",
      body: (
        <ul className="list-disc pl-5">
          <li>
            <b>댓글 작성 시</b>: 닉네임, 비밀번호(암호화하여 저장), 댓글 내용, 접속 IP(해시 처리) — 댓글 작성·삭제 본인
            확인과 스팸 방지 목적
          </li>
          <li>회원가입은 없으며, 위 항목 외 개인정보는 수집하지 않아요.</li>
        </ul>
      ),
    },
    {
      h: "2. 보관 기간",
      body: (
        <ul className="list-disc pl-5">
          <li>댓글(닉네임·내용·비밀번호): 작성자가 삭제하거나 운영자가 삭제할 때까지</li>
          <li>접속 IP 해시: 30일 후 자동 삭제</li>
        </ul>
      ),
    },
    {
      h: "3. 처리 위탁",
      body: (
        <ul className="list-disc pl-5">
          <li>Supabase Inc. — 데이터베이스·파일 저장</li>
          <li>Vercel Inc. — 웹사이트 호스팅</li>
        </ul>
      ),
    },
    {
      h: "4. 제3자 제공",
      body: <p>법령에 따른 요청이 있는 경우를 제외하고 제3자에게 제공하지 않아요.</p>,
    },
    {
      h: "5. 이용자의 권리",
      body: (
        <p>
          댓글은 작성 시 정한 비밀번호로 직접 삭제할 수 있어요. 비밀번호를 잊었거나 다른 요청이 있으면 아래 연락처로
          알려 주시면 확인 후 처리해 드려요.
        </p>
      ),
    },
    {
      h: "6. 시공 사례 게시",
      body: (
        <p>
          이 홈페이지에 소개된 가게의 상호·주소·시공 사진은 해당 가게 사장님의 동의를 받아 게시해요. 게시 중단을 원하시면
          연락 주세요. 당일 내려 드려요.
        </p>
      ),
    },
    {
      h: "7. 개인정보 보호책임자",
      body: (
        <p>
          {business.legalName} · {business.phone} · {business.address.full}
        </p>
      ),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <article className="flex flex-col gap-5 rounded-3xl bg-card p-5 text-[15px] leading-relaxed shadow-card sm:p-7">
          <h1 className="text-[24px] font-bold">{ko.footer.privacy}</h1>
          <p className="text-secondary-foreground">
            {business.name}(이하 &quot;광고나라&quot;)는 방문자의 개인정보를 소중히 다루며, 아래와 같이 처리해요.
          </p>
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="mb-1 text-[16px] font-bold">{s.h}</h2>
              {s.body}
            </section>
          ))}
          <p className="text-[13px] text-muted-foreground">시행일: 2026-09-01</p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
