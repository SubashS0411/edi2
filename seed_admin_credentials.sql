-- ==========================================================================
-- seed_admin_credentials.sql
--
-- Seeds the default admin credentials into app_settings so the dashboard
-- "Current Active Credentials" panel works immediately after deployment.
--
-- Test Credentials (override via dashboard Change Credentials form anytime)
--   email    : subashs2573@gmail.com
--   password : 12345
--
-- Run this in your Supabase project's SQL Editor.
-- After the admin changes email/password via the dashboard, those rows are
-- overwritten automatically — no need to re-run this script.
-- ==========================================================================

-- Ensure the app_settings table exists (idempotent)
CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Admin email
INSERT INTO app_settings (key, value)
VALUES ('admin_email', 'subashs2573@gmail.com')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Admin password (testing: 12345)
-- Change this via the dashboard "Change Credentials" form — it will update
-- this row automatically without needing to re-run SQL.
INSERT INTO app_settings (key, value)
VALUES ('admin_password', '12345')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- ==========================================================================
-- Optional: RLS policy so only the admin can read/write these rows.
-- Skip if app_settings already has RLS configured.
-- ==========================================================================

-- Enable Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all settings
-- (needed for getRegistrationFee etc. used on the public signup page)
DROP POLICY IF EXISTS "Allow authenticated reads" ON app_settings;
CREATE POLICY "Allow authenticated reads"
    ON app_settings FOR SELECT
    TO authenticated
    USING (true);

-- Allow only the admin role to write settings
DROP POLICY IF EXISTS "Admin can write settings" ON app_settings;
CREATE POLICY "Admin can write settings"
    ON app_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
