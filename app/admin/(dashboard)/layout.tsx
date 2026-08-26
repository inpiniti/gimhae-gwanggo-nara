import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/domain/admin/guard";
import { ko } from "@/lib/i18n/ko";

export const metadata: Metadata = {
  title: { default: ko.admin.title, template: `%s | ${ko.admin.title}` },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-dvh">
      <AdminNav displayName={admin.displayName} />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
