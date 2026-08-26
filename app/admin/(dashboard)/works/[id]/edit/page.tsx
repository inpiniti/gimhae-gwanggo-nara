import { notFound } from "next/navigation";
import { WorkForm } from "@/components/admin/work-form";
import { listCategories } from "@/lib/domain/category/queries";
import { getWorkForEdit } from "@/lib/domain/work/admin-queries";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [work, categories] = await Promise.all([getWorkForEdit(id), listCategories()]);
  if (!work) notFound();
  return (
    <div className="mx-auto max-w-2xl">
      <WorkForm categories={categories} initial={work} />
    </div>
  );
}
