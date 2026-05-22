"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { transactionSchema, type TransactionInput } from "@/lib/schemas";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import { useDebounce } from "@/hooks/use-debounce";
import type { Account, Category, Transaction } from "@/types/database";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface TransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTransaction?: Transaction | null;
  accounts: Account[];
  categories: Category[];
}

type AiSuggestion = { category_id: string; category_name: string; confidence: number };

export function TransactionSheet({
  open,
  onOpenChange,
  editTransaction,
  accounts,
  categories,
}: TransactionSheetProps) {
  const isEdit = !!editTransaction;
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      occurred_on: format(new Date(), "yyyy-MM-dd"),
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? {
              account_id: editTransaction!.account_id,
              category_id: editTransaction!.category_id ?? undefined,
              type: editTransaction!.type,
              amount: parseFloat(editTransaction!.amount),
              occurred_on: editTransaction!.occurred_on,
              description: editTransaction!.description,
              note: editTransaction!.note ?? undefined,
            }
          : {
              type: "expense",
              occurred_on: format(new Date(), "yyyy-MM-dd"),
            },
      );
      setAiSuggestion(null);
    }
  }, [open, editTransaction, isEdit, reset]);

  const watchedType = watch("type");
  const watchedDescription = watch("description");
  const debouncedDescription = useDebounce(watchedDescription, 800);
  const filteredCategories = categories.filter((c) => c.type === watchedType);

  // AI kategori önerisi — Course req: fetch + async/await
  useEffect(() => {
    if (!debouncedDescription || debouncedDescription.length < 4) {
      setAiSuggestion(null);
      return;
    }
    let cancelled = false;
    setAiLoading(true);
    fetch("/api/ai/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: debouncedDescription,
        categories: filteredCategories.map((c) => ({ id: c.id, name: c.name, type: c.type })),
      }),
    })
      .then((r) => r.json())
      .then((data: { category_id?: string; confidence?: number }) => {
        if (cancelled) return;
        if (data.category_id && (data.confidence ?? 0) >= 0.6) {
          const cat = categories.find((c) => c.id === data.category_id);
          if (cat) setAiSuggestion({ category_id: data.category_id!, category_name: cat.name, confidence: data.confidence! });
        } else {
          setAiSuggestion(null);
        }
      })
      .catch(() => {/* silently ignore */})
      .finally(() => { if (!cancelled) setAiLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedDescription, watchedType]);

  async function onSubmit(data: TransactionInput) {
    try {
      const aiCategorized = !!aiSuggestion && aiSuggestion.category_id === data.category_id;
      if (isEdit) {
        await updateTransaction(editTransaction!.id, {
          ...data,
          category_id: data.category_id ?? null,
          note: data.note ?? null,
        });
        toast.success("İşlem güncellendi");
      } else {
        await createTransaction({ ...data, ai_categorized: aiCategorized });
        toast.success("İşlem eklendi");
      }
      onOpenChange(false);
    } catch {
      toast.error("Bir hata oluştu");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "İşlemi Düzenle" : "Yeni İşlem"}</SheetTitle>
          <SheetDescription>İşlem bilgilerini girin</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 px-4">
          {/* Type */}
          <div className="space-y-1.5">
            <Label>İşlem Tipi</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tip seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Gider</SelectItem>
                    <SelectItem value="income">Gelir</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Account */}
          <div className="space-y-1.5">
            <Label>Hesap</Label>
            <Controller
              name="account_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Hesap seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.account_id && <p className="text-xs text-destructive">{errors.account_id.message}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-amount">Tutar (₺)</Label>
            <Input id="tx-amount" type="number" step="0.01" min="0.01" {...register("amount", { valueAsNumber: true })} placeholder="0.00" />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-date">Tarih</Label>
            <Input id="tx-date" type="date" {...register("occurred_on")} />
            {errors.occurred_on && <p className="text-xs text-destructive">{errors.occurred_on.message}</p>}
          </div>

          {/* Description + AI */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-desc">Açıklama</Label>
            <div className="relative">
              <Input id="tx-desc" {...register("description")} placeholder="ör. A101 Market alışverişi" />
              {aiLoading && (
                <Loader2 className="absolute right-2.5 top-2 size-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {aiSuggestion && (
              <div className="flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                <span className="text-xs text-muted-foreground">AI önerisi:</span>
                <Badge
                  variant="outline"
                  className="cursor-pointer text-xs border-primary/40 text-primary hover:bg-primary/10"
                  onClick={() => { setValue("category_id", aiSuggestion.category_id); setAiSuggestion(null); }}
                >
                  {aiSuggestion.category_name} — Uygula
                </Badge>
              </div>
            )}
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Kategori (opsiyonel)</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-note">Not (opsiyonel)</Label>
            <Textarea id="tx-note" {...register("note")} placeholder="Ek not..." rows={2} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Güncelle" : "Ekle"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
