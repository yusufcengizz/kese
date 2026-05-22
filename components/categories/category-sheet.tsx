"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { categorySchema, type CategoryInput } from "@/lib/schemas";
import { createCategory, updateCategory } from "@/actions/categories";
import type { Category } from "@/types/database";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: Category | null;
}

const PRESET_COLORS = [
  "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#EC4899",
  "#10B981", "#F97316", "#06B6D4", "#6366F1", "#84CC16",
];

export function CategorySheet({ open, onOpenChange, editCategory }: CategorySheetProps) {
  const isEdit = !!editCategory;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { color: "#F59E0B" },
  });

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? {
              name: editCategory!.name,
              type: editCategory!.type,
              color: editCategory!.color ?? "#F59E0B",
              icon: editCategory!.icon ?? undefined,
            }
          : { name: "", color: "#F59E0B" },
      );
    }
  }, [open, editCategory, isEdit, reset]);

  const watchedColor = watch("color");

  async function onSubmit(data: CategoryInput) {
    try {
      if (isEdit) {
        await updateCategory(editCategory!.id, data);
        toast.success("Kategori güncellendi");
      } else {
        await createCategory(data);
        toast.success("Kategori oluşturuldu");
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
          <SheetTitle>{isEdit ? "Kategoriyi Düzenle" : "Yeni Kategori"}</SheetTitle>
          <SheetDescription>Kategori bilgilerini girin</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6 px-4">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">Kategori Adı</Label>
            <Input id="cat-name" {...register("name")} placeholder="ör. Yemek" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Tip</Label>
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
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Renk</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="size-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: watchedColor === color ? "#000" : "transparent",
                  }}
                  onClick={() => reset({ ...watch(), color })}
                />
              ))}
            </div>
            <input type="hidden" {...register("color")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || (isEdit && editCategory?.is_default)}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Güncelle" : "Oluştur"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
