"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, CreditCard, Building2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { deleteAccount } from "@/actions/accounts";
import type { AccountWithBalance } from "@/types/database";
import { AccountSheet } from "./account-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";

const ACCOUNT_ICONS = { cash: Wallet, bank: Building2, credit_card: CreditCard } as const;
const ACCOUNT_TYPE_LABELS = { cash: "Nakit", bank: "Banka", credit_card: "Kredi Kartı" } as const;

export function AccountsClient({ accounts }: { accounts: AccountWithBalance[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountWithBalance | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() { setEditAccount(null); setSheetOpen(true); }
  function openEdit(a: AccountWithBalance) { setEditAccount(a); setSheetOpen(true); }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteAccount(deleteId);
      toast.success("Hesap silindi");
      router.refresh();
    } catch {
      toast.error("Silme başarısız");
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          Yeni Hesap
        </Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Henüz hesap yok"
          description="İlk hesabınızı ekleyerek başlayın."
          action={{ label: "Hesap Ekle", onClick: openAdd }}
        />
      ) : (
        // Course req §3.2 — CSS Grid for 2D layout
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const Icon = ACCOUNT_ICONS[account.type] ?? Wallet;
            const balance = parseFloat(account.balance);
            return (
              <Card key={account.id} className="group">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium leading-none">{account.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {ACCOUNT_TYPE_LABELS[account.type]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(account)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(account.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={cn("text-xl font-mono font-semibold tabular-nums", balance >= 0 ? "text-foreground" : "text-destructive")}>
                    {formatMoney(balance)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AccountSheet
        open={sheetOpen}
        onOpenChange={(open) => { setSheetOpen(open); if (!open) router.refresh(); }}
        editAccount={editAccount}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu hesap ve bağlı tüm işlemler kalıcı olarak silinecek. Emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
