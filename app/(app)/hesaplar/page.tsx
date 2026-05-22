import { createClient } from "@/lib/supabase/server";
import { AccountsClient } from "@/components/accounts/accounts-client";
import { PageHeader } from "@/components/shared/page-header";
import type { AccountWithBalance } from "@/types/database";

export default async function HesaplarPage() {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("is_archived", false)
    .order("created_at");

  const { data: balances } = await supabase
    .from("account_balances")
    .select("account_id, balance");

  const balanceMap = new Map(
    (balances as Array<{ account_id: string; balance: string }> | null)?.map(
      (b) => [b.account_id, b.balance],
    ) ?? [],
  );

  const accountsWithBalance: AccountWithBalance[] = (accounts as AccountWithBalance[] | null ?? []).map(
    (a) => ({ ...a, balance: balanceMap.get(a.id) ?? "0" }),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Hesaplar" description="Banka hesaplarını ve nakit varlıklarını yönetin" />
      <AccountsClient accounts={accountsWithBalance} />
    </div>
  );
}
