"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney, formatDate } from "@/lib/format";
import { deleteTransaction } from "@/actions/transactions";
import type { Account, Category, Transaction } from "@/types/database";
import { TransactionSheet } from "./transaction-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/empty-state";

type TxRow = Transaction & {
  categories: Pick<Category, "id" | "name" | "color" | "icon"> | null;
  accounts: Pick<Account, "id" | "name">;
};

interface TransactionsClientProps {
  transactions: TxRow[];
  accounts: Account[];
  categories: Category[];
}

export function TransactionsClient({ transactions, accounts, categories }: TransactionsClientProps) {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "occurred_on", desc: true }]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [transactions, typeFilter, search]);

  const columns = useMemo<ColumnDef<TxRow>[]>(
    () => [
      {
        accessorKey: "occurred_on",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tarih <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">{formatDate(row.getValue("occurred_on"))}</span>
        ),
      },
      {
        accessorKey: "description",
        header: () => <span className="text-xs font-medium text-muted-foreground">Açıklama</span>,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.getValue("description")}</p>
            {row.original.note && (
              <p className="text-xs text-muted-foreground truncate max-w-40">{row.original.note}</p>
            )}
          </div>
        ),
      },
      {
        id: "category",
        header: () => <span className="text-xs font-medium text-muted-foreground">Kategori</span>,
        cell: ({ row }) => {
          const cat = row.original.categories;
          return cat ? (
            <Badge
              variant="secondary"
              className="text-xs font-normal"
              style={{ backgroundColor: cat.color ? `${cat.color}20` : undefined }}
            >
              {cat.name}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          );
        },
      },
      {
        id: "account",
        header: () => <span className="text-xs font-medium text-muted-foreground">Hesap</span>,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.accounts?.name}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground ml-auto"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tutar <ArrowUpDown className="size-3" />
          </button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount") as string);
          const isIncome = row.original.type === "income";
          return (
            <span
              className={cn(
                "block text-right font-mono text-sm font-medium tabular-nums",
                isIncome ? "text-success" : "text-foreground",
              )}
            >
              {isIncome ? "+" : "-"}{formatMoney(amount)}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => { setEditTx(row.original); setSheetOpen(true); }}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteTransaction(deleteId);
      toast.success("İşlem silindi");
    } catch {
      toast.error("Silme başarısız");
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2 size-4 text-muted-foreground" />
            <Input
              placeholder="Açıklama ara..."
              className="pl-8 h-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="income">Gelir</SelectItem>
              <SelectItem value="expense">Gider</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={() => { setEditTx(null); setSheetOpen(true); }}
        >
          <Plus className="size-4" />
          Yeni İşlem
        </Button>
      </div>

      {/* Table — Course req: TanStack Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ArrowUpDown}
          title="İşlem bulunamadı"
          description="Yeni bir işlem ekleyin veya filtreleri değiştirin."
          action={{ label: "İşlem Ekle", onClick: () => setSheetOpen(true) }}
        />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/50">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="py-2 h-auto">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TransactionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editTransaction={editTx}
        accounts={accounts}
        categories={categories}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İşlemi sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem kalıcı olarak silinecek. Emin misiniz?
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
