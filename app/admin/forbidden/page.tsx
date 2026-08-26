import type { Metadata } from "next";
import { signOut } from "@/lib/domain/admin/actions";
import { ko } from "@/lib/i18n/ko";

export const metadata: Metadata = { title: "권한 없음", robots: { index: false, follow: false } };

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-card p-7 text-center shadow-card">
        <span className="text-3xl">🔒</span>
        <h1 className="mt-3 text-[20px] font-bold">{ko.admin.login.forbidden}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{ko.admin.login.forbiddenHint}</p>
        <form action={signOut} className="mt-6">
          <button type="submit" className="h-12 w-full rounded-xl bg-secondary text-[15px] font-semibold">
            {ko.admin.nav.logout}
          </button>
        </form>
      </div>
    </main>
  );
}
