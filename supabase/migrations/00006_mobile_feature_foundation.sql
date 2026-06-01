-- ============================================================
-- PetPark Mobile feature foundation
-- Local/dev schema for mobile feature completion: bookings, chat,
-- passport, walk tracker, role dashboards, shop, notifications.
-- ============================================================

create extension if not exists pgcrypto;

-- Users: keep compatibility with older mobile code that expects name/avatar_url/email/phone.
alter table public.users add column if not exists name text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists email text;
alter table public.users add column if not exists phone text;
alter table public.users drop constraint if exists users_role_check;
alter table public.users alter column role set default 'owner';
update public.users set name = coalesce(name, nullif(full_name, ''), 'Korisnik') where name is null;
update public.users set avatar_url = coalesce(avatar_url, avatar) where avatar_url is null;

-- Sitter profiles: support both legacy id=user_id and newer dashboard user_id access.
alter table public.sitter_profiles add column if not exists user_id uuid references public.users(id) on delete cascade;
alter table public.sitter_profiles add column if not exists experience_years integer not null default 0;
alter table public.sitter_profiles add column if not exists prices jsonb not null default '{}'::jsonb;
alter table public.sitter_profiles add column if not exists rating_avg numeric(3,2) not null default 0;
alter table public.sitter_profiles add column if not exists city text;
alter table public.sitter_profiles add column if not exists instant_booking boolean not null default false;
update public.sitter_profiles set user_id = coalesce(user_id, id) where user_id is null;
create unique index if not exists sitter_profiles_user_id_key on public.sitter_profiles(user_id);

-- Pets / passport
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  species text not null default 'dog' check (species in ('dog','cat','other')),
  breed text,
  age numeric,
  weight numeric,
  special_needs text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_passports (
  pet_id uuid primary key references public.pets(id) on delete cascade,
  vaccinations jsonb not null default '[]'::jsonb,
  allergies jsonb not null default '[]'::jsonb,
  medications jsonb not null default '[]'::jsonb,
  vet_info jsonb not null default '{"name":"","phone":"","address":"","emergency":false}'::jsonb,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_appointments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  type text not null default 'checkup',
  title text not null,
  date date not null,
  time text not null default '09:00',
  vet_name text,
  notes text,
  status text not null default 'upcoming' check (status in ('upcoming','completed','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.pet_documents (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  name text not null,
  type text not null default 'other',
  url text not null,
  uploaded_at timestamptz not null default now()
);

-- Core booking / sitter dashboard
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  sitter_id uuid not null references public.users(id) on delete cascade,
  pet_id uuid references public.pets(id) on delete set null,
  service_type text not null default 'boarding',
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','completed','cancelled')),
  total_price numeric(10,2) not null default 0,
  platform_fee numeric(10,2) not null default 0,
  note text,
  address text,
  message text,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','failed','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  sitter_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  unique (sitter_id, date)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  owner_id uuid references public.users(id) on delete cascade,
  sitter_id uuid references public.users(id) on delete cascade,
  reviewer_id uuid references public.users(id) on delete cascade,
  reviewee_id uuid references public.users(id) on delete cascade,
  rating integer not null default 5 check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.pet_updates (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  sitter_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'text' check (type in ('photo','video','text')),
  emoji text not null default '🐾',
  caption text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);

-- Chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  content text,
  image_url text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.get_message_conversation_summaries(p_user_id uuid)
returns table (
  partner_id uuid,
  partner_name text,
  partner_avatar text,
  last_message_id uuid,
  last_message_sender_id uuid,
  last_message_receiver_id uuid,
  last_message_content text,
  last_message_image_url text,
  last_message_read boolean,
  last_message_created_at timestamptz,
  unread_count bigint
) language sql stable security definer as $$
  with scoped as (
    select m.*, case when m.sender_id = p_user_id then m.receiver_id else m.sender_id end as partner
    from public.messages m
    where m.sender_id = p_user_id or m.receiver_id = p_user_id
  ), ranked as (
    select *, row_number() over (partition by partner order by created_at desc) rn
    from scoped
  )
  select
    r.partner,
    coalesce(u.name, u.full_name, 'Korisnik'),
    coalesce(u.avatar_url, u.avatar),
    r.id,
    r.sender_id,
    r.receiver_id,
    r.content,
    r.image_url,
    r.read,
    r.created_at,
    (select count(*) from scoped s where s.partner = r.partner and s.receiver_id = p_user_id and s.read = false)
  from ranked r
  join public.users u on u.id = r.partner
  where r.rn = 1
  order by r.created_at desc;
$$;

-- Walk tracker
create table if not exists public.walks (
  id uuid primary key default gen_random_uuid(),
  sitter_id uuid not null references public.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  status text not null default 'u_tijeku' check (status in ('u_tijeku','zavrsena')),
  distance_km numeric(8,3) not null default 0,
  route jsonb not null default '[]'::jsonb,
  checkpoints jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Groomer dashboard
create table if not exists public.groomers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  name text not null,
  city text not null default 'Zagreb',
  services text[] not null default '{}',
  prices jsonb not null default '{}'::jsonb,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  bio text,
  verified boolean not null default false,
  specialization text not null default 'oba',
  phone text,
  email text,
  address text,
  working_hours jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groomer_bookings (
  id uuid primary key default gen_random_uuid(),
  groomer_id uuid not null references public.groomers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  service text not null default 'sisanje',
  date date not null,
  start_time text not null,
  end_time text not null,
  price numeric(10,2) not null default 0,
  status text not null default 'pending',
  pet_name text,
  pet_type text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groomer_availability (
  id uuid primary key default gen_random_uuid(),
  groomer_id uuid not null references public.groomers(id) on delete cascade,
  date date not null,
  start_time text not null,
  end_time text not null,
  slot_duration_minutes integer not null default 60,
  is_available boolean not null default true,
  unique (groomer_id, date, start_time)
);

create table if not exists public.groomer_portfolio (
  id uuid primary key default gen_random_uuid(),
  groomer_id uuid not null references public.groomers(id) on delete cascade,
  url text not null,
  caption text,
  is_before_after boolean not null default false,
  before_url text,
  after_url text,
  created_at timestamptz not null default now()
);

-- Trainer dashboard
create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  name text not null,
  city text not null default 'Zagreb',
  specializations text[] not null default '{}',
  price_per_hour numeric(10,2) not null default 0,
  certificates text[] not null default '{}',
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  bio text,
  certified boolean not null default false,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_programs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  type text not null default 'osnovna',
  duration_weeks integer not null default 4,
  sessions integer not null default 4,
  price numeric(10,2) not null default 0,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_bookings (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  program_id uuid references public.training_programs(id) on delete set null,
  date date not null,
  start_time text not null,
  end_time text not null,
  status text not null default 'pending',
  pet_name text,
  note text,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trainer_availability (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  date date not null,
  start_time text not null,
  end_time text not null,
  is_available boolean not null default true,
  unique (trainer_id, date, start_time)
);

-- Breeder / publisher dashboard
create table if not exists public.publisher_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'uzgajivač',
  display_name text not null,
  bio text,
  city text,
  phone text,
  avatar_url text,
  breeds text[] not null default '{}',
  species text[] not null default '{}',
  years_experience integer not null default 0,
  fci_registered boolean not null default false,
  certified boolean not null default false,
  verified boolean not null default false,
  verification_status text not null default 'pending',
  profile_completeness_pct integer not null default 60,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, type)
);

create table if not exists public.litters (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references public.publisher_profiles(id) on delete cascade,
  breed text not null,
  species text not null default 'dog',
  expected_date date,
  birth_date date,
  total_puppies integer not null default 0,
  available_count integer not null default 0,
  reserved_count integer not null default 0,
  sold_count integer not null default 0,
  price_from numeric(10,2) not null default 0,
  price_to numeric(10,2) not null default 0,
  status text not null default 'available',
  description text,
  fci_registered boolean not null default false,
  images text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.puppies (
  id uuid primary key default gen_random_uuid(),
  litter_id uuid not null references public.litters(id) on delete cascade,
  name text,
  gender text not null default 'female',
  color text not null default '',
  status text not null default 'available',
  price numeric(10,2) not null default 0,
  microchip text,
  notes text,
  reserved_by text,
  reserved_at timestamptz,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references public.publisher_profiles(id) on delete cascade,
  from_name text not null,
  from_email text not null,
  from_phone text,
  breed_interest text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.breeder_reviews (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references public.publisher_profiles(id) on delete cascade,
  reviewer_name text not null,
  rating integer not null default 5,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.breeder_documents (
  id uuid primary key default gen_random_uuid(),
  breeder_id uuid not null references public.publisher_profiles(id) on delete cascade,
  type text not null default 'other',
  title text not null,
  file_url text not null,
  uploaded_at timestamptz not null default now()
);

-- Rescue dashboard basics
create table if not exists public.rescue_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pet_name text not null,
  species text not null default 'dog',
  city text not null default 'Zagreb',
  status text not null default 'available',
  description text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rescue_appeals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shop
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  original_price numeric(10,2),
  description text not null default '',
  emoji text not null default '🐾',
  brand text,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  in_stock boolean not null default true,
  variants jsonb not null default '[]'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  author_name text not null,
  rating integer not null default 5,
  comment text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null default 1,
  selected_variant text,
  product_snapshot jsonb,
  created_at timestamptz not null default now()
);

-- In-app notifications for direct Supabase fallback/dev flows.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null default 'info',
  title text not null,
  body text not null default '',
  target_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array[
    'pets','bookings','walks','groomers','groomer_bookings','trainers','training_programs',
    'trainer_bookings','publisher_profiles','litters','puppies','applications','rescue_listings','rescue_appeals'
  ] loop
    execute format('drop trigger if exists %I on public.%I', t || '_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;

-- RLS
alter table public.pets enable row level security;
alter table public.pet_passports enable row level security;
alter table public.pet_appointments enable row level security;
alter table public.pet_documents enable row level security;
alter table public.bookings enable row level security;
alter table public.availability enable row level security;
alter table public.reviews enable row level security;
alter table public.pet_updates enable row level security;
alter table public.messages enable row level security;
alter table public.walks enable row level security;
alter table public.groomers enable row level security;
alter table public.groomer_bookings enable row level security;
alter table public.groomer_availability enable row level security;
alter table public.groomer_portfolio enable row level security;
alter table public.trainers enable row level security;
alter table public.training_programs enable row level security;
alter table public.trainer_bookings enable row level security;
alter table public.trainer_availability enable row level security;
alter table public.publisher_profiles enable row level security;
alter table public.litters enable row level security;
alter table public.puppies enable row level security;
alter table public.applications enable row level security;
alter table public.breeder_reviews enable row level security;
alter table public.breeder_documents enable row level security;
alter table public.rescue_listings enable row level security;
alter table public.rescue_appeals enable row level security;
alter table public.products enable row level security;
alter table public.product_reviews enable row level security;
alter table public.cart_items enable row level security;
alter table public.notifications enable row level security;

-- Drop/recreate policies to keep migration idempotent.
do $$
declare
  pol record;
begin
  for pol in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    if pol.policyname like 'Pets:%' or pol.policyname like 'Bookings:%' or pol.policyname like 'Availability:%'
      or pol.policyname like 'Messages:%' or pol.policyname like 'Walks:%' or pol.policyname like 'Products:%'
      or pol.policyname like 'Product reviews:%' or pol.policyname like 'Cart:%' or pol.policyname like 'Notifications:%'
      or pol.policyname like '%: read' or pol.policyname like '%: authed write' then
      execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
    end if;
  end loop;
end $$;

-- Public marketplace reads
create policy "Pets: owner read" on public.pets for select using (owner_id = auth.uid());
create policy "Pets: owner write" on public.pets for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Bookings: participants read" on public.bookings for select using (owner_id = auth.uid() or sitter_id = auth.uid());
create policy "Bookings: owner insert" on public.bookings for insert with check (owner_id = auth.uid());
create policy "Bookings: participants update" on public.bookings for update using (owner_id = auth.uid() or sitter_id = auth.uid()) with check (owner_id = auth.uid() or sitter_id = auth.uid());
create policy "Availability: public read" on public.availability for select using (true);
create policy "Availability: sitter write" on public.availability for all using (sitter_id = auth.uid()) with check (sitter_id = auth.uid());
create policy "Messages: participants" on public.messages for all using (sender_id = auth.uid() or receiver_id = auth.uid()) with check (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "Walks: related users" on public.walks for all using (sitter_id = auth.uid() or exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid())) with check (sitter_id = auth.uid());
create policy "Products: public read" on public.products for select using (true);
create policy "Product reviews: public read" on public.product_reviews for select using (true);
create policy "Cart: owner" on public.cart_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Notifications: owner" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Broad authenticated CRUD for role-owned dashboard tables (dev/mobile client paths).
do $$
declare t text;
begin
  foreach t in array array[
    'pet_passports','pet_appointments','pet_documents','reviews','pet_updates',
    'groomers','groomer_bookings','groomer_availability','groomer_portfolio',
    'trainers','training_programs','trainer_bookings','trainer_availability',
    'publisher_profiles','litters','puppies','applications','breeder_reviews','breeder_documents',
    'rescue_listings','rescue_appeals'
  ] loop
    execute format('create policy %I on public.%I for select using (true)', t || ': read', t);
    execute format('create policy %I on public.%I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t || ': authed write', t);
  end loop;
end $$;

-- Helpful indexes
create index if not exists idx_pets_owner on public.pets(owner_id);
create index if not exists idx_bookings_owner on public.bookings(owner_id);
create index if not exists idx_bookings_sitter on public.bookings(sitter_id);
create index if not exists idx_messages_sender_receiver on public.messages(sender_id, receiver_id, created_at desc);
create index if not exists idx_walks_sitter on public.walks(sitter_id, start_time desc);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- ─── Forum + Contact Discovery ───────────────────────────────────────

create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  emoji text default '💬',
  description text default '',
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete set null,
  author_id uuid references public.users(id) on delete set null,
  author_name text not null default 'PetPark korisnik',
  title text not null,
  preview text default '',
  reply_count integer default 0,
  last_activity_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references public.forum_topics(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  author_name text not null default 'PetPark korisnik',
  body text not null,
  is_expert boolean default false,
  created_at timestamptz default now()
);

create index if not exists forum_topics_category_idx on public.forum_topics(category_id);
create index if not exists forum_topics_activity_idx on public.forum_topics(last_activity_at desc);
create index if not exists forum_replies_topic_idx on public.forum_replies(topic_id, created_at);

drop trigger if exists forum_topics_updated_at on public.forum_topics;
create trigger forum_topics_updated_at
before update on public.forum_topics
for each row execute function public.set_updated_at();

alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;

drop policy if exists "Forum categories: public read" on public.forum_categories;
drop policy if exists "Forum topics: public read" on public.forum_topics;
drop policy if exists "Forum replies: public read" on public.forum_replies;
drop policy if exists "Forum topics: authenticated insert" on public.forum_topics;
drop policy if exists "Forum replies: authenticated insert" on public.forum_replies;
drop policy if exists "Forum topics: author update" on public.forum_topics;
drop policy if exists "Forum replies: author update" on public.forum_replies;

create policy "Forum categories: public read" on public.forum_categories for select using (true);
create policy "Forum topics: public read" on public.forum_topics for select using (true);
create policy "Forum replies: public read" on public.forum_replies for select using (true);
create policy "Forum topics: authenticated insert" on public.forum_topics for insert with check (auth.uid() is not null);
create policy "Forum replies: authenticated insert" on public.forum_replies for insert with check (auth.uid() is not null);
create policy "Forum topics: author update" on public.forum_topics for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Forum replies: author update" on public.forum_replies for update using (author_id = auth.uid()) with check (author_id = auth.uid());
