# CLAUDE.md — Harcama Analiz Uygulaması

> Bu dosya Claude Code için proje spesifikasyonudur. Kod yazmadan önce bu dosyayı
> referans al. Kapsam dışı bir şey isteniyorsa önce burayı güncelle, sonra kodla.

---

## 1. Proje Özeti

Kişisel finans takip uygulaması. Kullanıcı banka hesaplarını, kredi kartlarını ve
nakit hareketlerini tek yerden takip eder. Uygulama harcamaları otomatik
kategorilendirir ve aylık AI içgörüleri üretir.

- **İsim (çalışma adı):** Harcama Analiz — `harcama-analiz` (rebrand edilebilir)
- **Platform:** Web-first PWA (tek kod tabanı, telefona kurulabilir). Native app yok.
- **Dil:** Arayüz Türkçe. Para birimi `TRY` (₺). Tarih formatı `gg.AA.yyyy`.
- **Hedef kullanıcı:** Bireysel kullanıcı, kendi finansal verisini takip eder.

### Faz planı

| Faz | Kapsam |
|-----|--------|
| **Faz 1 (MVP)** | Auth, hesap/kategori yönetimi, manuel işlem CRUD, dashboard, AI kategori önerisi, AI aylık içgörü, PWA |
| **Faz 2** | AI ekstre import (PDF/CSV parse), kategori bazlı bütçe limitleri, doğal dil sorgu ("kahveye ne harcadım") |
| **Kapsam dışı** | Otomatik banka senkronizasyonu/open banking, çoklu para birimi, fatura hatırlatıcı, aile/paylaşımlı hesap, yatırım takibi, native mobil |

> **Not:** PDF/ekstre yükleme MVP'de **yok**. MVP'de tüm işlemler manuel girilir.
> AI; manuel girilen işlem açıklamasından kategori önerir ve aylık özet üretir.

---

## 2. Teknik Stack

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router, Server Actions) |
| Dil | TypeScript (strict) |
| Veritabanı / Auth | Supabase (Postgres + Auth + RLS) |
| Styling | Tailwind CSS v4 |
| UI bileşenleri | shadcn/ui |
| Tema | **Amber Minimal** (shadcn theme, bkz. Bölüm 4) |
| Client state | Zustand |
| Tablo | TanStack Table |
| Grafik | Recharts |
| Form | react-hook-form + zod |
| AI | Anthropic Claude API (server-side) |
| PWA | `next-pwa` veya `@serwist/next` |
| Deploy | Vercel |
| Paket yöneticisi | pnpm |

Kurallar:
- Tüm veri erişimi **Server Components + Server Actions** üzerinden. Client'ta
  doğrudan DB sorgusu yok.
- `ANTHROPIC_API_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` **asla** client'a düşmez.
- Finansal veri kritik → her tabloda RLS zorunlu.

---

## 3. Klasör Yapısı

```
harcama-analiz/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx            # auth guard + ana navigasyon
│   │   ├── page.tsx              # Dashboard
│   │   ├── islemler/page.tsx     # İşlem listesi
│   │   ├── hesaplar/page.tsx     # Hesap yönetimi
│   │   ├── kategoriler/page.tsx  # Kategori yönetimi
│   │   └── ayarlar/page.tsx
│   ├── api/
│   │   └── ai/
│   │       ├── categorize/route.ts   # işlem kategorilendirme
│   │       └── insights/route.ts     # aylık içgörü
│   ├── layout.tsx
│   ├── globals.css               # Amber Minimal tokenları burada
│   └── manifest.ts               # PWA manifest
├── components/
│   ├── ui/                       # shadcn bileşenleri
│   ├── dashboard/                # SummaryCards, CategoryPieChart, TrendChart, InsightCard
│   ├── transactions/             # TransactionTable, TransactionSheet, TransactionFilters
│   ├── accounts/                 # AccountCard, AccountSheet
│   └── shared/                   # AppNav, EmptyState, PageHeader, MoneyText
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # server client
│   │   ├── client.ts             # browser client
│   │   └── middleware.ts         # session refresh
│   ├── claude.ts                 # Anthropic client + prompt helper'ları
│   ├── format.ts                 # para/tarih formatlama (tr-TR)
│   └── utils.ts                  # cn() vb.
├── actions/
│   ├── transactions.ts
│   ├── accounts.ts
│   └── categories.ts
├── stores/
│   └── ui-store.ts               # sheet/modal açık-kapalı, seçili dönem
├── types/
│   └── database.ts               # Supabase generated types
├── middleware.ts
└── CLAUDE.md
```

---

## 4. Tasarım Sistemi — Amber Minimal

Tasarım 21st.dev üzerinden yürütülüyor. Seçilen tema: **Amber Minimal**
(`https://21st.dev/community/themes/amber-minimal`). Sıcak, sepya alt tonlu,
minimal bir tema — "afternoon sunlight" hissi. Finans uygulaması için klinik/soğuk
durmaması açısından bilinçli bir seçim.

### 4.1 Tema kurulumu

shadcn/ui kurulduktan sonra tema CLI ile eklenir:

```bash
pnpm dlx shadcn@latest add https://www.shadcn.io/r/amber-minimal.json
```

Alternatif: 21st.dev / tweakcn'den export edilen CSS değişkenleri doğrudan
`globals.css` içine yapıştırılır. **Kanonik değer kaynağı 21st.dev export'udur** —
aşağıdaki blok referans amaçlıdır, export ile birebir eşleşmezse export'u baz al.

### 4.2 Renk tokenları (`globals.css`)

OKLCH renk uzayı, Tailwind v4. `:root` = light, `.dark` = dark mode.

```css
:root {
  --background:            oklch(1 0 0);
  --foreground:            oklch(0.2686 0 0);
  --card:                  oklch(1 0 0);
  --card-foreground:       oklch(0.2686 0 0);
  --popover:               oklch(1 0 0);
  --popover-foreground:    oklch(0.2686 0 0);
  --primary:               oklch(0.7686 0.1647 70.0804);   /* amber */
  --primary-foreground:    oklch(0 0 0);
  --secondary:             oklch(0.967 0.0029 264.5419);
  --secondary-foreground:  oklch(0.4461 0.0263 256.8018);
  --muted:                 oklch(0.9846 0.0017 247.8389);
  --muted-foreground:      oklch(0.551 0.0234 264.3637);
  --accent:                oklch(0.9869 0.0214 95.2774);
  --accent-foreground:     oklch(0.4732 0.1247 46.2007);
  --destructive:           oklch(0.6368 0.2078 25.3313);
  --destructive-foreground:oklch(1 0 0);
  --border:                oklch(0.9276 0.0058 264.5313);
  --input:                 oklch(0.9276 0.0058 264.5313);
  --ring:                  oklch(0.7686 0.1647 70.0804);
  --chart-1:               oklch(0.7686 0.1647 70.0804);
  --chart-2:               oklch(0.6658 0.1574 58.3183);
  --chart-3:               oklch(0.5553 0.1455 48.9975);
  --chart-4:               oklch(0.4732 0.1247 46.2007);
  --chart-5:               oklch(0.4137 0.1054 45.9038);
  --radius:                0.375rem;
  --font-sans:             Inter, ui-sans-serif, system-ui, sans-serif;
  --font-serif:            "Source Serif 4", ui-serif, Georgia, serif;
  --font-mono:             "JetBrains Mono", ui-monospace, monospace;
}

.dark {
  --background:            oklch(0.2046 0 0);
  --foreground:            oklch(0.9219 0 0);
  --card:                  oklch(0.2686 0 0);
  --card-foreground:       oklch(0.9219 0 0);
  --popover:               oklch(0.2686 0 0);
  --popover-foreground:    oklch(0.9219 0 0);
  --primary:               oklch(0.7686 0.1647 70.0804);
  --primary-foreground:    oklch(0 0 0);
  --secondary:             oklch(0.2686 0 0);
  --secondary-foreground:  oklch(0.9219 0 0);
  --muted:                 oklch(0.2686 0 0);
  --muted-foreground:      oklch(0.7155 0 0);
  --accent:                oklch(0.4732 0.1247 46.2007);
  --accent-foreground:     oklch(0.9243 0.1151 95.7459);
  --destructive:           oklch(0.6368 0.2078 25.3313);
  --destructive-foreground:oklch(1 0 0);
  --border:                oklch(0.3715 0 0);
  --input:                 oklch(0.3715 0 0);
  --ring:                  oklch(0.7686 0.1647 70.0804);
}
```

**Ek token — `--success`:** Amber Minimal'da yeşil bir token yok. Finans
uygulamasında gelir (artı) ile gideri (eksi) ayırmak için bir success tonu ekle:

```css
:root { --success: oklch(0.65 0.16 150); --success-foreground: oklch(1 0 0); }
.dark { --success: oklch(0.70 0.15 150); --success-foreground: oklch(0.18 0 0); }
```

`@theme inline` bloğuna `--color-success` / `--color-success-foreground` map'le ki
`bg-success`, `text-success` Tailwind utility'leri çalışsın.

### 4.3 Tipografi

- **Gövde / UI:** Inter (`--font-sans`).
- **Başlıklar (sayfa başlıkları, kart başlıkları):** Source Serif 4 (`--font-serif`)
  — temanın sıcak/insancıl karakterini başlıklarda kullan, abartma.
- **Sayısal değerler (tutarlar, tablolar):** JetBrains Mono (`--font-mono`) ya da
  Inter `tabular-nums`. Para tutarları **mutlaka** tabular-nums ile hizalı.
- `next/font` ile yükle, `globals.css` değişkenlerine bağla.

### 4.4 Görsel dil ve kullanım kuralları

- **Radius:** `0.375rem` — yumuşak ama keskin değil. shadcn varsayılan radius
  scale'i kullan (`rounded-md`, `rounded-lg`).
- **Whitespace:** Cömert boşluk. Minimal tema → sıkışık layout yasak. Kartlar arası
  `gap-4`/`gap-6`, sayfa padding `p-6`.
- **Gölge:** Düşük yoğunluk. Kartlar için `border` öncelikli, gölge ikincil.
- **Primary (amber):** Sadece birincil aksiyonlar (CTA butonları, aktif nav,
  seçili durum) ve grafiklerde vurgu. Her yere amber serpme.
- **Renk semantiği (finans):**
  - Gider tutarı → `text-foreground` (nötr) veya negatif vurgu gerekiyorsa `text-destructive`.
  - Gelir tutarı → `text-success`.
  - Kategori dağılımı grafiği → `--chart-1..5` amber rampası.
  - Limit aşımı / uyarı → `text-destructive`.
- **Dark mode:** `next-themes` ile. Varsayılan light, kullanıcı seçimi `localStorage`.
- **İkonlar:** `lucide-react`. Boyut `size-4`/`size-5`, `stroke` ince.
- **Boş durumlar:** Her liste/dashboard için `EmptyState` (ikon + kısa metin + CTA).

### 4.5 Bileşen tercihleri (shadcn)

| İhtiyaç | Bileşen |
|---------|---------|
| İşlem ekleme/düzenleme | `Sheet` (mobilde alttan, masaüstünde sağdan) |
| Onay / silme | `AlertDialog` |
| İşlem tablosu | `Table` + TanStack Table |
| Filtreler | `Select`, `Popover` + `Calendar` (tarih aralığı) |
| Dashboard kartları | `Card` |
| Bildirim | `Sonner` (toast) |
| Navigasyon | Masaüstü: sol `Sidebar`; mobil: alt tab bar |
| Form alanları | `Input`, `Select`, `Label` + react-hook-form |

---

## 5. Veritabanı Şeması (Supabase / Postgres)

Tüm tablolarda `user_id uuid references auth.users` + RLS. Para alanları
`numeric(14,2)`. Zaman damgaları `timestamptz default now()`.

### 5.1 Tablolar

```sql
-- profiles: auth.users 1:1
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

-- accounts: hesaplar (nakit / banka / kredi kartı)
create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('cash','bank','credit_card')),
  opening_balance numeric(14,2) not null default 0,
  currency text not null default 'TRY',
  is_archived boolean not null default false,
  created_at timestamptz default now()
);

-- categories: gelir/gider kategorileri (alt kategori desteği)
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  parent_id uuid references categories on delete set null,
  color text,                       -- hex, grafik için
  icon text,                        -- lucide ikon adı
  is_default boolean not null default false,
  created_at timestamptz default now()
);

-- transactions: tüm işlemler
create table transactions (
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

-- ai_insights: aylık içgörü önbelleği
create table ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  period text not null,             -- 'YYYY-MM'
  content jsonb not null,           -- { summary, highlights[], generated_at }
  created_at timestamptz default now(),
  unique (user_id, period)
);
```

> **Faz 2 tabloları (şimdi oluşturma):** `import_batches` (ekstre dosyaları),
> `budgets` (kategori bazlı aylık limit).

### 5.2 Türetilmiş veri

```sql
-- Hesap bakiyesi = açılış + gelir - gider
create view account_balances as
select a.id as account_id, a.user_id,
       a.opening_balance
       + coalesce(sum(case when t.type='income' then t.amount else 0 end),0)
       - coalesce(sum(case when t.type='expense' then t.amount else 0 end),0)
       as balance
from accounts a
left join transactions t on t.account_id = a.id
group by a.id;
```

Aylık kategori dağılımı ve trend için ya benzer view'lar ya da Server
Action içinde tarih aralığıyla parametreli sorgu kullan.

### 5.3 RLS

Her tabloda aç ve dört policy (select/insert/update/delete) ekle:

```sql
alter table transactions enable row level security;
create policy "own rows" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

`accounts`, `categories`, `ai_insights`, `profiles` için aynı kalıbı uygula.
View'larda underlying tablo RLS'i geçerli olur.

### 5.4 Varsayılan kategoriler (seed)

Kullanıcı kaydolduğunda `is_default=true` ile tohumla:

- **Gider:** Market, Restoran & Kafe, Ulaşım, Faturalar, Kira, Sağlık, Giyim,
  Eğlence, Abonelikler, Eğitim, Diğer Gider
- **Gelir:** Maaş, Ek Gelir, Diğer Gelir

---

## 6. Özellikler (Faz 1 detayı)

### 6.1 Kimlik doğrulama
- Supabase Auth — e-posta + şifre. Magic link opsiyonel.
- `middleware.ts` ile session yenileme; `(app)` grubu auth guard'lı.
- İlk kayıtta: `profiles` satırı + varsayılan kategori seed.

### 6.2 Hesaplar
- Hesap ekle/düzenle/arşivle. Tip: nakit / banka / kredi kartı.
- Açılış bakiyesi girilebilir. Bakiye `account_balances` view'ından okunur.
- Hesap silme → bağlı işlemler cascade; silmeden önce `AlertDialog` uyarısı.

### 6.3 Kategoriler
- Varsayılanların üstüne kullanıcı kategori ekleyebilir, renk/ikon seçer.
- Alt kategori opsiyonel. Tip (gelir/gider) zorunlu.

### 6.4 İşlemler
- `Sheet` içinde ekleme/düzenleme: tutar, tip, hesap, kategori, tarih, açıklama, not.
- Liste: TanStack Table — tarih/hesap/kategori/tutar kolonları, sıralama.
- Filtreler: tarih aralığı, hesap, kategori, tip, metin arama.
- Sil → `AlertDialog`. **Kalıcı silme onaysız yapılmaz.**
- Açıklama girildiğinde AI kategori önerisi tetiklenir (bkz. 7.1).

### 6.5 Dashboard
- Üst: özet kartları — bu ay toplam gelir, toplam gider, net, hesap toplam bakiye.
- Kategori dağılımı: `chart-1..5` ile pasta/halka grafik (gider).
- Trend: son 6 ay gelir/gider bar/çizgi grafiği.
- AI içgörü kartı (bkz. 7.2).
- Dönem seçici (ay) — `ui-store` içinde tutulur.

### 6.6 PWA
- `manifest.ts` + ikonlar + servis worker (`next-pwa`/`@serwist/next`).
- "Ana ekrana ekle" desteği. Offline shell opsiyonel, MVP'de zorunlu değil.

---

## 7. AI Entegrasyonu (Claude API)

Tüm AI çağrıları **server-side** (`app/api/ai/*` veya Server Action). Anahtar
client'a düşmez. Çağrılar `lib/claude.ts` üzerinden.

### 7.1 İşlem kategorilendirme — `/api/ai/categorize`
- **Model:** `claude-haiku-4-5-20251001` (yüksek hacim, hızlı, ucuz).
- **Girdi:** işlem açıklaması + kullanıcının kategori listesi (id + ad).
- **Çıktı:** Sadece JSON — `{ "category_id": "...", "confidence": 0.0-1.0 }`.
  Preamble/markdown yok; `temperature: 0`.
- Düşük confidence (<0.6) → öneri "Diğer" veya boş; kullanıcı seçer.
- Kullanıcı öneriyi değiştirebilir; `ai_categorized` flag'i kaynağı işaretler.

### 7.2 Aylık içgörü — `/api/ai/insights`
- **Model:** `claude-sonnet-4-6` (analiz kalitesi).
- **Girdi:** ilgili ayın kategori bazlı toplamları + önceki ay toplamları
  (ham işlem listesi gönderme, sadece agregeler — token tasarrufu + gizlilik).
- **Çıktı:** JSON — `{ "summary": "...", "highlights": ["...", "...", "..."] }`.
  Türkçe, kısa, somut ("Market harcaman geçen aya göre %30 arttı" gibi).
- `ai_insights` tablosuna `(user_id, period)` ile önbellekle. Ay değişmediyse
  tekrar çağırma; "yeniden üret" butonu ile force refresh.

### 7.3 Genel kurallar
- Her AI yanıtı zod ile doğrulanır; parse hatası → AI olmadan akış devam eder
  (kullanıcı manuel kategori seçer). AI hiçbir akışı bloklamaz.
- `max_tokens` dar tut. Hata/timeout durumunda sessizce nötr davran, kullanıcıya
  teknik hata gösterme.

---

## 8. Kod Standartları

- TypeScript `strict`. `any` yasak — gerekirse `unknown` + daraltma.
- Veri yazma → Server Actions; sonrası `revalidatePath`.
- Form doğrulama → zod şeması; aynı şema client + server'da.
- Para: DB `numeric`, JS tarafında **tam sayı kuruş veya string** ile taşı,
  float aritmetiğinden kaçın. Gösterimde `Intl.NumberFormat('tr-TR', {style:'currency',currency:'TRY'})`.
- Tarih: `date-fns` + `tr` locale. DB'de `date` tipi (saat yok).
- Component'lerde sabit renk yok — yalnız tema tokenları (`bg-primary`,
  `text-muted-foreground`, `border-border` ...).
- Server/Client component ayrımı net; `'use client'` sadece gerekli yaprak
  bileşenlerde.
- Dosya adları `kebab-case`, component'ler `PascalCase`.

---

## 9. Ortam Değişkenleri

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # sadece server
ANTHROPIC_API_KEY=                # sadece server
```

`.env.example` ekle, `.env.local` git'e girmesin.

---

## 10. Build Planı (5 günlük sprint)

| Gün | İş |
|-----|----|
| 1 | Next.js 15 + Supabase kurulumu, şema + RLS + seed, Auth, Amber Minimal teması, layout/navigasyon, PWA iskeleti |
| 2 | Hesap CRUD, kategori CRUD, varsayılan kategori seed akışı |
| 3 | İşlem CRUD (Sheet), TanStack Table listesi, filtreler |
| 4 | Dashboard: özet kartları, Recharts grafikleri, `account_balances` view |
| 5 | AI kategori önerisi + AI aylık içgörü, dark mode, responsive geçiş, Vercel deploy |

---

## 11. Definition of Done

- Yeni kullanıcı kaydolur, varsayılan kategorileri görür, hesap ekler.
- Manuel işlem ekler; AI kategori önerir, kullanıcı değiştirebilir.
- Dashboard bu ayın gelir/gider/net + kategori dağılımı + trendini gösterir.
- AI aylık içgörü kartı görünür ve önbelleklenir.
- Tüm tablolarda RLS aktif; başka kullanıcının verisi görünmüyor.
- Light/dark mod çalışıyor, mobilde PWA olarak kurulabiliyor.
- Tema yalnızca Amber Minimal tokenları üzerinden — hardcoded renk yok.

---

## 12. Notlar

- PDF ekstre import Faz 2. MVP'de import butonu/ekranı **yok**.
- AI hiçbir zaman zorunlu yol değil — her zaman manuel fallback var.
- Faz 2'ye geçişte `import_batches` + `budgets` tabloları ve `/api/ai/parse-statement`
  route'u eklenecek; şema şimdiden buna uygun tasarlandı.
- 21st.dev'den gelecek ek tasarım datası (bileşen örnekleri, layout referansları)
  bu dosyanın Bölüm 4'üne işlenecek.