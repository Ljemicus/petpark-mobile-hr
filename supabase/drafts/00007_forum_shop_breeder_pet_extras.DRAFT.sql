-- DRAFT ONLY — do not apply to remote without explicit approval.
-- Minimal additive schema sketch for forum/shop/breeder-rescue/pet-extras.
-- See supabase/drafts/additive-plan-2026-06-01.md for RLS policy intent and review notes.

-- Forum
create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete set null,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  preview text,
  body text not null,
  reply_count integer not null default 0,
  last_activity_at timestamptz not null default now(),
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  is_expert boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shop
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_cents integer not null,
  currency text not null default 'EUR',
  image_url text,
  category text,
  status text not null default 'draft',
  stock_quantity integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_profile_id, product_id)
);

-- Breeder/rescue
create table if not exists public.publisher_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  publisher_type text not null check (publisher_type in ('breeder','rescue')),
  display_name text not null,
  city text,
  bio text,
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.litters (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publisher_profiles(id) on delete cascade,
  title text not null,
  breed text,
  birth_date date,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.puppies (
  id uuid primary key default gen_random_uuid(),
  litter_id uuid not null references public.litters(id) on delete cascade,
  name text,
  sex text,
  status text not null default 'available',
  price_cents integer,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publisher_profiles(id) on delete cascade,
  puppy_id uuid references public.puppies(id) on delete set null,
  applicant_profile_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.breeder_reviews (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publisher_profiles(id) on delete cascade,
  reviewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists public.breeder_documents (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publisher_profiles(id) on delete cascade,
  storage_path text not null,
  document_type text,
  status text not null default 'pending',
  uploaded_at timestamptz not null default now()
);

create table if not exists public.rescue_listings (
  id uuid primary key default gen_random_uuid(),
  publisher_id uuid not null references public.publisher_profiles(id) on delete cascade,
  pet_name text not null,
  species text not null,
  city text,
  description text,
  status text not null default 'published',
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rescue_appeals (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.rescue_listings(id) on delete cascade,
  applicant_profile_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  status text not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pet extras
create table if not exists public.pet_appointments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  title text not null,
  date date not null,
  time text,
  provider_name text,
  notes text,
  status text not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_documents (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  title text not null,
  document_type text,
  storage_path text not null,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.pet_updates (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete cascade,
  update_type text not null,
  emoji text,
  caption text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- RLS intentionally not written as executable policy SQL yet; review policy matrix in markdown first.
