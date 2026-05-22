import { z } from "zod";

// Auth
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalı").max(100),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Şifreler eşleşmiyor",
    path: ["confirm_password"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

// Account
export const accountSchema = z.object({
  name: z.string().min(1, "Hesap adı zorunlu").max(100),
  type: z.enum(["cash", "bank", "credit_card"], { message: "Hesap tipi seçin" }),
  opening_balance: z
    .number({ message: "Geçerli bir tutar girin" })
    .min(0, "Açılış bakiyesi negatif olamaz"),
});
export type AccountInput = z.infer<typeof accountSchema>;

// Category
export const categorySchema = z.object({
  name: z.string().min(1, "Kategori adı zorunlu").max(100),
  type: z.enum(["income", "expense"], { message: "Tip seçin" }),
  color: z.string().optional(),
  icon: z.string().optional(),
  parent_id: z.string().uuid().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

// Transaction
export const transactionSchema = z.object({
  account_id: z.string().uuid("Hesap seçin"),
  category_id: z.string().uuid().optional(),
  type: z.enum(["income", "expense"], { message: "İşlem tipi seçin" }),
  amount: z
    .number({ message: "Geçerli bir tutar girin" })
    .positive("Tutar sıfırdan büyük olmalı"),
  occurred_on: z.string().min(1, "Tarih seçin"),
  description: z.string().min(1, "Açıklama zorunlu").max(255),
  note: z.string().max(1000).optional(),
});
export type TransactionInput = z.infer<typeof transactionSchema>;
