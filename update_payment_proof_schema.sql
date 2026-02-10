-- 1. Add payment_proof_url Column to Profiles Table
alter table public.profiles add column if not exists payment_proof_url text;

-- 2. Update Trigger Function to Include payment_proof_url
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
    -- Company Details
    company_name,
    company_gst,
    company_address,
    company_phone,
    company_email,
    -- Payment Proof
    payment_proof_url 
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    new.raw_user_meta_data->>'transaction_id',
    now(),
    -- Company Details Mapping
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'company_gst',
    new.raw_user_meta_data->>'company_address',
    new.raw_user_meta_data->>'company_phone',
    new.raw_user_meta_data->>'company_email',
    -- Payment Proof Mapping
    new.raw_user_meta_data->>'payment_proof_url'
  );
  return new;
end;
$$ language plpgsql security definer;
