"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory } from "@/actions/categories";
import type { Category } from "@/types/database";
import { CategorySheet } from "./category-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const expenses = categories.filter((c) => c.type === "expense");
  const incomes = categories.filter((c) => c.type === "income");

  function openAdd() { setEditCat(null); setSheetOpen(true); }
  function openEdit(c: Category) { setEditCat(c); setSheetOpen(true); }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      toast.success("Kategori silindi");
      router.refresh();
    } catch {
      toast.error("Silme başarısız");
    }
    setDeleteId(null);
  }

  function CategoryRow({ cat }: { cat: Category }) {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
        <div className="flex items-center gap-2.5">
          <span
            className="size-3 rounded-full shrink-0"
            style={{ backgroundColor: cat.color ?? "#9CA3AF" }}
          />
          <span className="text-sm">{cat.name}</span>
          {cat.is_default && (
            <Badge variant="secondary" className="text-[10px] py-0 h-4">Varsayılan</Badge>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(cat)}>
            <Pencil className="size-3.5" />
          </Button>
          {!cat.is_default && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteId(cat.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="size-4" />
          Yeni Kategori
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Kategori yok"
          description="İlk kategoriyi oluşturun."
          action={{ label: "Kategori Ekle", onClick: openAdd }}
        />
      ) : (
        // Course req: Flexbox for 1D layout
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1">
            <CardContent className="pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Gider Kategorileri
              </h3>
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Yok</p>
              ) : (
                expenses.map((c) => <CategoryRow key={c.id} cat={c} />)
              )}
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Gelir Kategorileri
              </h3>
              {incomes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Yok</p>
              ) : (
                incomes.map((c) => <CategoryRow key={c.id} cat={c} />)
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <CategorySheet
        open={sheetOpen}
        onOpenChange={(open) => { setSheetOpen(open); if (!open) router.refresh(); }}
        editCategory={editCat}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kategori silinecek. Kategoriye bağlı işlemler kategorisiz kalacak.
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
