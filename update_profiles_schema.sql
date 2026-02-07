-- 1. Add Company Details Columns to Profiles Table
alter table public.profiles add column if not exists company_name text;
alter table public.profiles add column if not exists company_gst text;
alter table public.profiles add column if not exists company_address text;
alter table public.profiles add column if not exists company_phone text;
alter table public.profiles add column if not exists company_email text;

-- 2. Update Trigger Function to Include Company Details
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    transaction_id, 
    created_at,
    -- New Fields
    company_name,
    company_gst,
    company_address,
    company_phone,
    company_email
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'transaction_id',
    now(),
    -- New Mappings
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'company_gst',
    new.raw_user_meta_data->>'company_address',
    new.raw_user_meta_data->>'company_phone',
    new.raw_user_meta_data->>'company_email'
  );
  return new;
end;
$$ language plpgsql security definer;
