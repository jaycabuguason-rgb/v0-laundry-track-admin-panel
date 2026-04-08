-- LaundryTrack: Create all tables with RLS

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone_number text,
  username text,
  avatar_url text,
  role text not null default 'admin',
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'Admin'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── loyalty_members ──────────────────────────────────────────────────────────
create table if not exists public.loyalty_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone_number text not null,
  stamp_count integer not null default 0,
  rewards_redeemed integer not null default 0,
  date_joined timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table public.loyalty_members enable row level security;
create policy "loyalty_members_all" on public.loyalty_members for all using (auth.uid() is not null);

-- ── transactions ─────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  customer_name text not null,
  phone_number text,
  member_id uuid references public.loyalty_members(id) on delete set null,
  wash_type text not null,
  weight_kg numeric,
  addons text[] default '{}',
  special_instructions text,
  fee numeric not null,
  status text not null default 'Received',
  void_reason text,
  eta timestamp with time zone,
  arrival_time timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table public.transactions enable row level security;
create policy "transactions_all" on public.transactions for all using (auth.uid() is not null);

-- ── stamp_history ─────────────────────────────────────────────────────────────
create table if not exists public.stamp_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.loyalty_members(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  stamps_added integer not null default 1,
  created_at timestamp with time zone default now()
);

alter table public.stamp_history enable row level security;
create policy "stamp_history_all" on public.stamp_history for all using (auth.uid() is not null);

-- ── reward_history ────────────────────────────────────────────────────────────
create table if not exists public.reward_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.loyalty_members(id) on delete cascade,
  reward_type text not null,
  redeemed_at timestamp with time zone default now(),
  transaction_id uuid references public.transactions(id) on delete set null
);

alter table public.reward_history enable row level security;
create policy "reward_history_all" on public.reward_history for all using (auth.uid() is not null);

-- ── audit_logs ────────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id text not null,
  action text not null,
  staff_name text not null,
  notes text,
  created_at timestamp with time zone default now()
);

alter table public.audit_logs enable row level security;
create policy "audit_logs_all" on public.audit_logs for all using (auth.uid() is not null);

-- ── notifications ─────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  type text not null,
  is_dismissed boolean not null default false,
  related_ticket_id text,
  created_at timestamp with time zone default now()
);

alter table public.notifications enable row level security;
create policy "notifications_all" on public.notifications for all using (auth.uid() is not null);

-- ── settings ──────────────────────────────────────────────────────────────────
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}',
  updated_at timestamp with time zone default now()
);

alter table public.settings enable row level security;
create policy "settings_all" on public.settings for all using (auth.uid() is not null);

-- ── service_types ─────────────────────────────────────────────────────────────
create table if not exists public.service_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null,
  pricing_type text not null default 'per_kg',
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

alter table public.service_types enable row level security;
create policy "service_types_all" on public.service_types for all using (auth.uid() is not null);

-- ── Seed default service types ────────────────────────────────────────────────
insert into public.service_types (name, description, price, pricing_type, is_active) values
  ('Regular',           'Standard wash & dry',              30,  'per_kg',    true),
  ('Delicate',          'Gentle cycle for delicate fabrics', 40,  'per_kg',    true),
  ('Express',           'Same-day turnaround',               50,  'per_kg',    true),
  ('Bulk / Commercial', 'For 10kg and above',                250, 'per_load',  false)
on conflict do nothing;

-- ── Seed default settings ─────────────────────────────────────────────────────
insert into public.settings (key, value) values
  ('pricing',          '{"pricePerKg": 30, "minWeight": null, "pricingMode": "per-kg"}'),
  ('loyalty',          '{"milestone": 7, "customMilestone": 10, "customReward": ""}'),
  ('business_profile', '{"shopName": "LaundryTrack", "address": "123 Magsaysay Ave, Manila", "contactNumber": "", "email": ""}')
on conflict (key) do nothing;

-- ── Seed sample loyalty members ───────────────────────────────────────────────
insert into public.loyalty_members (id, full_name, phone_number, stamp_count, rewards_redeemed, date_joined) values
  ('11111111-1111-1111-1111-111111111111', 'Maria Santos',   '09171234567', 12, 1, '2025-10-15'),
  ('22222222-2222-2222-2222-222222222222', 'Jose Reyes',     '09281234567', 7,  0, '2025-11-02'),
  ('33333333-3333-3333-3333-333333333333', 'Rosa Dela Cruz', '09571234567', 21, 3, '2025-08-20'),
  ('44444444-4444-4444-4444-444444444444', 'Carlos Garcia',  '09681234567', 4,  0, '2026-01-10'),
  ('55555555-5555-5555-5555-555555555555', 'Eduardo Lim',    '09041234567', 9,  1, '2025-12-05')
on conflict (id) do nothing;

-- ── Seed sample transactions ──────────────────────────────────────────────────
insert into public.transactions (ticket_id, customer_name, phone_number, member_id, wash_type, weight_kg, addons, special_instructions, fee, status, arrival_time) values
  ('TKT-0001', 'Maria Santos',   '09171234567', '11111111-1111-1111-1111-111111111111', 'Regular',  5.2, ARRAY['Fabcon'],             'Cold water only', 156, 'Ready',    '2026-04-05 08:14:00+08'),
  ('TKT-0002', 'Jose Reyes',     '09281234567', '22222222-2222-2222-2222-222222222222', 'Express',  3.8, ARRAY['Fabcon','Bleach'],    null,              228, 'Washing',  '2026-04-05 09:02:00+08'),
  ('TKT-0003', 'Ana Cruz',       '09351234567', null,                                   'Delicate', 2.1, ARRAY[]::text[],             null,              105, 'Drying',   '2026-04-05 09:45:00+08'),
  ('TKT-0004', 'Pedro Bautista', '09461234567', null,                                   'Regular',  7.5, ARRAY['Fabcon'],             null,              225, 'Claimed',  '2026-04-04 10:30:00+08'),
  ('TKT-0005', 'Rosa Dela Cruz', '09571234567', '33333333-3333-3333-3333-333333333333', 'Express',  4.0, ARRAY['Bleach'],             null,              240, 'Ready',    '2026-04-04 11:55:00+08'),
  ('TKT-0006', 'Carlos Garcia',  '09681234567', '44444444-4444-4444-4444-444444444444', 'Regular',  6.3, ARRAY[]::text[],             null,              189, 'Received', '2026-04-04 14:10:00+08'),
  ('TKT-0007', 'Lita Mendoza',   '09791234567', null,                                   'Delicate', 1.8, ARRAY['Fabcon'],             null,              90,  'Claimed',  '2026-04-03 07:50:00+08'),
  ('TKT-0008', 'Ramon Torres',   '09821234567', null,                                   'Regular',  8.1, ARRAY[]::text[],             null,              243, 'Ready',    '2026-04-03 08:35:00+08'),
  ('TKT-0009', 'Gloria Aquino',  '09931234567', null,                                   'Express',  3.5, ARRAY['Fabcon','Starch'],    null,              210, 'Washing',  '2026-04-05 10:20:00+08'),
  ('TKT-0010', 'Eduardo Lim',    '09041234567', '55555555-5555-5555-5555-555555555555', 'Regular',  5.9, ARRAY[]::text[],             null,              177, 'Received', '2026-04-05 11:05:00+08')
on conflict (ticket_id) do nothing;

-- ── Seed sample audit logs ────────────────────────────────────────────────────
insert into public.audit_logs (ticket_id, action, staff_name, notes) values
  ('TKT-0004', 'Claimed',  'Admin',   'Normal claim'),
  ('TKT-0007', 'Scanned',  'Staff01', ''),
  ('TKT-0003', 'Denied',   'Staff01', 'Wrong person'),
  ('TKT-0002', 'Override', 'Admin',   'Customer lost ticket, ID verified'),
  ('TKT-0001', 'Scanned',  'Staff02', '')
on conflict do nothing;

-- ── Seed sample notifications ─────────────────────────────────────────────────
insert into public.notifications (title, description, type, related_ticket_id) values
  ('Ready for Pickup', 'TKT-0001 is ready for pickup',          'ready',     'TKT-0001'),
  ('Ready for Pickup', 'TKT-0005 is ready for pickup',          'ready',     'TKT-0005'),
  ('Unclaimed Item',   'TKT-0008 has been waiting for 2+ days', 'unclaimed', 'TKT-0008')
on conflict do nothing;
