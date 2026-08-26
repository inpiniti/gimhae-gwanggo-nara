import { HomeShell } from "@/components/layout/home-shell";

/**
 * 메인 레이아웃. @panel 은 /works/[slug] 를 인터셉트해 우측에 상세를 띄운다 (docs/02-architecture.md 4절).
 */
export default function HomeLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  return <HomeShell left={children} panel={panel} />;
}
