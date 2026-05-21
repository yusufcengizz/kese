import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
});

export function formatMoney(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return currencyFormatter.format(value);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd.MM.yyyy", { locale: tr });
}

export function formatMonthYear(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMMM yyyy", { locale: tr });
}

export function currentPeriod(): string {
  return format(new Date(), "yyyy-MM");
}
