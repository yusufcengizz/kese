export type AccountType = "cash" | "bank" | "credit_card";
export type TransactionType = "income" | "expense";
export type TransactionSource = "manual" | "import";

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  opening_balance: string;
  currency: string;
  is_archived: boolean;
  created_at: string;
}

export interface AccountWithBalance extends Account {
  balance: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  parent_id: string | null;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: string;
  occurred_on: string;
  description: string;
  note: string | null;
  source: TransactionSource;
  ai_categorized: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithRelations extends Transaction {
  account: Pick<Account, "id" | "name">;
  category: Pick<Category, "id" | "name" | "color" | "icon"> | null;
}

export interface AiInsight {
  id: string;
  user_id: string;
  period: string;
  content: {
    summary: string;
    highlights: string[];
    generated_at: string;
  };
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id">;
        Update: Partial<Profile>;
      };
      accounts: {
        Row: Account;
        Insert: Omit<Account, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Account, "id" | "user_id">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Category, "id" | "user_id">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Transaction, "id" | "user_id">>;
      };
      ai_insights: {
        Row: AiInsight;
        Insert: Omit<AiInsight, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<AiInsight, "id" | "user_id">>;
      };
    };
    Views: {
      account_balances: {
        Row: { account_id: string; user_id: string; balance: string };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
