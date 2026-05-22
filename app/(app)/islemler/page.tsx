import { createClient } from "@/lib/supabase/server";
import { TransactionsClient } from "@/components/transactions/transactions-client";
import { PageHeader } from "@/components/shared/page-header";
import type { Account, Category } from "@/types/database";

export default async function IslemlerPage() {
  const supabase = await createClient();

  // Fetch last 200 transactions with joined account + category names
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, categories(id, name, color, icon), accounts(id, name)")
    .order("occurred_on", { ascending: false })
    .limit(200);

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_archived", false)
    .order("name");

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("type")
    .order("name");

  return (
    <div className="space-y-6">
      <PageHeader title="İşlemler" description="Tüm gelir ve gider işlemleriniz" />
      <TransactionsClient
        transactions={(transactions as Parameters<typeof TransactionsClient>[0]["transactions"]) ?? []}
        accounts={(accounts as Account[] | null) ?? []}
        categories={(categories as Category[] | null) ?? []}
      />
    </div>
  );
}
