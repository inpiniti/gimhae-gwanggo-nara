import Link from "next/link";
import { Plus } from "lucide-react";
import { WorkList } from "@/components/admin/work-list";
import { listCategories } from "@/lib/domain/category/queries";
import { toCategoryMap } from "@/lib/domain/category/types";
import { listAllWorks } from "@/lib/domain/work/admin-queries";
import { ko } from "@/lib/i18n/ko";

export default async function AdminWorksPage() {
  const [works, categories] = await Promise.all([listAllWorks(), listCategories()]);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-bold">
          {ko.admin.nav.works} <span className="text-muted-foreground tabular-nums">{works.length}</span>
        </h1>
        <Link
          href="/admin/works/new"
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> {ko.admin.works.new}
        </Link>
      </div>
      <WorkList works={works} categoryMap={toCategoryMap(categories)} />
    </div>
  );
}
