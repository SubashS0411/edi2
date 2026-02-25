-- ============================================================
-- FIX: Add DELETE policy so admins can remove users from the
--      profiles table via the dashboard.
-- Run this once in your Supabase SQL Editor.
-- ============================================================

drop policy if exists "Admins can delete profiles" on public.profiles;

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or
    auth.jwt() ->> 'email' = 'md@edienv.com'
    or
    auth.jwt() ->> 'email' = 'subashs2573@gmail.com'
  );
