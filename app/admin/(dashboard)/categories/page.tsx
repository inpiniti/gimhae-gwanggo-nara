import { CategoryManager } from "@/components/admin/category-manager";
import { listCategories } from "@/lib/domain/category/queries";
import { ko } from "@/lib/i18n/ko";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] font-bold">{ko.admin.nav.categories}</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
