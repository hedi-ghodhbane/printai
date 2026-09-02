-- Matbaa: designs, orders, print files.
-- Run with `supabase db push` or paste into the SQL editor.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- designs
create table if not exists public.designs (
  id text primary key,
  owner_id uuid references auth.users (id) on delete cascade,
  guest_id text,
  product_slug text not null,
  title text not null default 'Untitled',
  document jsonb not null,
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint designs_owner_or_guest check (owner_id is not null or guest_id is not null)
);
create index if not exists designs_owner_idx on public.designs (owner_id, updated_at desc);

alter table public.designs enable row level security;

create policy "designs: owners read" on public.designs
  for select using (auth.uid() = owner_id);
create policy "designs: owners insert" on public.designs
  for insert with check (auth.uid() = owner_id);
create policy "designs: owners update" on public.designs
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "designs: owners delete" on public.designs
  for delete using (auth.uid() = owner_id);

-- ----------------------------------------------------------------- orders
do $$ begin
  create type public.order_status as enum ('received','sent_to_printer','printing','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id text primary key,
  design_id text not null,
  design_title text,
  owner_id uuid references auth.users (id) on delete set null,
  guest_id text,
  product_slug text not null,
  size_id text not null,
  quantity integer not null check (quantity > 0),
  options jsonb not null default '{}'::jsonb,
  unit_price numeric(10,3) not null,
  total numeric(10,3) not null,
  currency text not null default 'TND',
  shipping jsonb not null,
  status public.order_status not null default 'received',
  print_file_urls text[] not null default '{}',
  printer_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_owner_idx on public.orders (owner_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

alter table public.orders enable row level security;

-- Orders are written by the server (service role) so guests can order too.
-- Signed-in customers can read their own; guests read theirs through the
-- local copy the app keeps (and by email later).
create policy "orders: owners read" on public.orders
  for select using (auth.uid() = owner_id);

-- ------------------------------------------------------------- print files
insert into storage.buckets (id, name, public)
values ('print-files', 'print-files', false)
on conflict (id) do nothing;

-- Only the service role touches print files (uploads on order, printer handoff).
create policy "print-files: service only" on storage.objects
  for all using (bucket_id = 'print-files' and auth.role() = 'service_role')
  with check (bucket_id = 'print-files' and auth.role() = 'service_role');

-- ------------------------------------------------------------- updated_at
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists designs_touch on public.designs;
create trigger designs_touch before update on public.designs for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();
