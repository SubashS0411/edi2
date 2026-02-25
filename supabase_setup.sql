-- 1. Create Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text default 'client',
  transaction_id text,
  payment_proof_id text,
  payment_proof_url text,
  subscription_status text default 'pending',
  subscription_start timestamp with time zone,
  subscription_end timestamp with time zone,
  access_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENSURE COLUMNS EXIST (Fix for "Could not find column" error)
alter table public.profiles add column if not exists subscription_start timestamp with time zone;
alter table public.profiles add column if not exists subscription_end timestamp with time zone;
alter table public.profiles add column if not exists access_token text;
alter table public.profiles add column if not exists payment_proof_url text;

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create Trigger Function (auto-create profile on signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, transaction_id, payment_proof_url, created_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'transaction_id',
    new.raw_user_meta_data->>'payment_proof_url',
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Create Trigger (INSERT: auto-create profile on signup)
-- Drop first to allow replacement
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4b. Trigger Function: keep profiles.email in sync when auth.users.email is updated
create or replace function public.handle_user_updated()
returns trigger as $$
begin
  -- Only update profiles if the email actually changed
  if new.email is distinct from old.email then
    update public.profiles
    set email = new.email
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 4c. Attach the UPDATE trigger to auth.users
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_updated();

-- 5. Create Policies (Permissions)

-- Drop existing policies to avoid conflicts and RECURSION
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Enable insert for authenticated users only" on public.profiles;

-- Allow users to view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Allow Admins to view all profiles (NON-RECURSIVE)
-- We check email or metadata from the JWT, NEVER querying public.profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using ( 
    auth.jwt() ->> 'email' = 'md@edienviro.com' 
    or 
    auth.jwt() ->> 'email' = 'admin@demo.com' 
    or 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow Admin Updates (NON-RECURSIVE)
create policy "Admins can update all profiles"
  on public.profiles for update
  using ( 
    auth.jwt() ->> 'email' = 'md@edienviro.com' 
    or 
    auth.jwt() ->> 'email' = 'admin@demo.com' 
    or 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Allow manual insert if needed (fallback)
create policy "Enable insert for authenticated users only"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- HELPER: Manually Confirm Email (Fix "Email not confirmed" error)
-- Confirm ALL admin-related emails so login works immediately
update auth.users
set email_confirmed_at = now()
where email in ('md@edienv.com', 'admin@demo.com', 'md@edienviro.com')
  and email_confirmed_at is null;

-- 6. Storage Setup (for QR Code)
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

-- Fix Storage Policies (Drop old ones to be safe)
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Admins can upload assets" on storage.objects;
drop policy if exists "Admins Manage Assets" on storage.objects;

-- Allow public access to assets
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'assets' );

-- Allow Admins full control (Insert, Update, Delete)
create policy "Admins Manage Assets"
  on storage.objects for all
  using ( 
    bucket_id = 'assets' 
    and (
      auth.jwt() ->> 'email' = 'md@edienviro.com' 
      or 
      auth.jwt() ->> 'email' = 'admin@demo.com' 
      or
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  )
  with check ( 
    bucket_id = 'assets' 
    and (
      auth.jwt() ->> 'email' = 'md@edienviro.com' 
      or 
      auth.jwt() ->> 'email' = 'admin@demo.com' 
      or
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    )
  );
