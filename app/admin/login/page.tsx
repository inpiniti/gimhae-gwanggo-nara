import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getAdmin } from "@/lib/domain/admin/guard";
import { business } from "@/lib/domain/business/business";
import { ko } from "@/lib/i18n/ko";

export const metadata: Metadata = { title: ko.admin.login.title, robots: { index: false, follow: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getAdmin()) redirect(next?.startsWith("/admin") ? next : "/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-7 shadow-card">
        <p className="text-sm font-semibold text-primary">{business.name}</p>
        <h1 className="mt-1 mb-6 text-[22px] font-bold">{ko.admin.login.title}</h1>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
