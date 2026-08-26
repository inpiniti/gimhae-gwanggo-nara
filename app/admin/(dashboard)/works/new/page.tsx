import { WorkForm } from "@/components/admin/work-form";
import { listCategories } from "@/lib/domain/category/queries";

export default async function NewWorkPage() {
  const categories = await listCategories();
  return (
    <div className="mx-auto max-w-2xl">
      <WorkForm categories={categories} />
    </div>
  );
}
