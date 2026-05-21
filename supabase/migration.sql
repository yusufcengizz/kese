-- ============================================================
-- Harcama Analiz — Tam migrasyon
-- Supabase Dashboard > SQL Editor'da çalıştır
-- ============================================================

-- 1. TABLOLAR
-- ------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('cash','bank','credit_card')),
  opening_balance numeric(14,2) not null default 0,
  currency text not null default 'TRY',
  is_archived boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  parent_id uuid references categories on delete set null,
  color text,
  icon text,
  is_default boolean not null default false,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  account_id uuid not null references accounts on delete cascade,
  category_id uuid references categories on delete set null,
  type text not null check (type in ('income','expense')),
  amount numeric(14,2) not null check (amount > 0),
  occurred_on date not null,
  description text not null,
  note text,
  source text not null default 'manual' check (source in ('manual','import')),
  ai_categorized boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  period text not null,
  content jsonb not null,
  created_at timestamptz default now(),
  unique (user_id, period)
);

-- 2. VIEW — hesap bakiyesi
-- ------------------------------------------------------------

create or replace view account_balances as
select
  a.id as account_id,
  a.user_id,
  a.opening_balance
    + coalesce(sum(case when t.type = 'income'  then t.amount else 0 end), 0)
    - coalesce(sum(case when t.type = 'expense' then t.amount else 0 end), 0)
  as balance
from accounts a
left join transactions t on t.account_id = a.id
group by a.id, a.user_id, a.opening_balance;

-- 3. RLS
-- ------------------------------------------------------------

alter table profiles    enable row level security;
alter table accounts    enable row level security;
alter table categories  enable row level security;
alter table transactions enable row level security;
alter table ai_insights enable row level security;

-- Mevcut policy varsa sil, sonra yeniden oluştur
do $$ begin
  drop policy if exists "own rows" on profiles;
  drop policy if exists "own rows" on accounts;
  drop policy if exists "own rows" on categories;
  drop policy if exists "own rows" on transactions;
  drop policy if exists "own rows" on ai_insights;
end $$;

create policy "own rows" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "own rows" on accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own rows" on ai_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. VARSAYILAN KATEGORİ SEED FUNCTION + TRIGGER
-- ------------------------------------------------------------

create or replace function seed_default_categories(uid uuid)
returns void language plpgsql security definer as $$
begin
  insert into categories (user_id, name, type, icon, color, is_default) values
    -- Gider kategorileri
    (uid, 'Market',          'expense', 'shopping-cart',  '#F59E0B', true),
    (uid, 'Restoran & Kafe', 'expense', 'utensils',       '#EF4444', true),
    (uid, 'Ulaşım',          'expense', 'car',            '#3B82F6', true),
    (uid, 'Faturalar',       'expense', 'zap',            '#8B5CF6', true),
    (uid, 'Kira',            'expense', 'home',           '#EC4899', true),
    (uid, 'Sağlık',          'expense', 'heart-pulse',    '#10B981', true),
    (uid, 'Giyim',           'expense', 'shirt',          '#F97316', true),
    (uid, 'Eğlence',         'expense', 'tv',             '#06B6D4', true),
    (uid, 'Abonelikler',     'expense', 'repeat',         '#6366F1', true),
    (uid, 'Eğitim',          'expense', 'graduation-cap', '#84CC16', true),
    (uid, 'Diğer Gider',     'expense', 'more-horizontal','#9CA3AF', true),
    -- Gelir kategorileri
    (uid, 'Maaş',            'income',  'briefcase',      '#10B981', true),
    (uid, 'Ek Gelir',        'income',  'plus-circle',    '#34D399', true),
    (uid, 'Diğer Gelir',     'income',  'wallet',         '#6EE7B7', true);
end;
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  perform seed_default_categories(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
