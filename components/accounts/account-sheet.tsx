"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { accountSchema, type AccountInput } from "@/lib/schemas";
import { createAccount, updateAccount } from "@/actions/accounts";
import type { AccountWithBalance } from "@/types/database";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface AccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editAccount?: AccountWithBalance | null;
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  cash: "Nakit",
  bank: "Banka",
  credit_card: "Kredi Kartı",
};

export function AccountSheet({ open, onOpenChange, editAccount }: AccountSheetProps) {
  const isEdit = !!editAccount;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: { opening_balance: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? {
              name: editAccount!.name,
              type: editAccount!.type,
              opening_balance: parseFloat(editAccount!.opening_balance),
            }
          : { name: "", opening_balance: 0 },
      );
    }
  }, [open, editAccount, isEdit, reset]);

  async function onSubmit(data: AccountInput) {
    try {
      if (isEdit) {
        await updateAccount(editAccount!.id, data);
        toast.success("Hesap güncellendi");
      } else {
        await createAccount(data);
        toast.success("Hesap oluşturuldu");
      }
      onOpenChange(false);
    } catch {
      toast.error("Bir hata oluştu");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Hesabı Düzenle" : "Yeni Hesap"}</SheetTitle>
          <SheetDescription>Hesap bilgilerini girin</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 px-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Hesap Adı</Label>
            <Input id="name" {...register("name")} placeholder="ör. İş Bankası" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Hesap Tipi</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tip seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="opening_balance">Açılış Bakiyesi (₺)</Label>
            <Input
              id="opening_balance"
              type="number"
              step="0.01"
              {...register("opening_balance", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.opening_balance && (
              <p className="text-xs text-destructive">{errors.opening_balance.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Güncelle" : "Oluştur"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
