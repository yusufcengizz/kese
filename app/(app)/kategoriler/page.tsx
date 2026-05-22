import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "@/components/categories/categories-client";
import { PageHeader } from "@/components/shared/page-header";
import type { Category } from "@/types/database";

export default async function KategorilerPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("type")
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader title="Kategoriler" description="Gelir ve gider kategorilerini yönetin" />
      <CategoriesClient categories={(categories as Category[] | null) ?? []} />
    </div>
  );
}
