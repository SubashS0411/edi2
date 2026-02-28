import { supabase } from './customSupabaseClient';

const SETTINGS_KEY = 'registration_fee';
const DEFAULT_FEE = '69.00';

export const getRegistrationFee = async () => {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', SETTINGS_KEY)
            .maybeSingle();

        if (error) {
            console.warn("Error fetching registration fee:", error);
            return DEFAULT_FEE;
        }

        if (!data) {
            return DEFAULT_FEE;
        }
        return data.value;
    } catch (err) {
        console.error("Error in getRegistrationFee:", err);
        return DEFAULT_FEE;
    }
};

export const updateRegistrationFee = async (newFee) => {
    try {
        // Try to update first
        const { data, error } = await supabase
            .from('app_settings')
            .upsert({ key: SETTINGS_KEY, value: newFee })
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error("Error updating fee:", err);
        return { success: false, error: err.message };
    }
};

// ============================================================
// Admin Credentials — Dynamic (stored in app_settings table)
// Fallback hierarchy: DB row → build-time .env → hardcoded CSV default
// This makes password/email changes survive page reloads without
// touching the .env file.
// ============================================================

const ADMIN_EMAIL_KEY = 'admin_email';
const ADMIN_PASSWORD_KEY = 'admin_password';

// Build-time fallbacks (used only if DB row has never been seeded)
const ENV_ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'md@edienv.com';
const ENV_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD || 'Admin@123';

/**
 * Reads the live admin email from app_settings.
 * Falls back to the VITE_ADMIN_EMAIL env var (CSV default: md@edienv.com).
 */
export const getAdminEmail = async () => {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', ADMIN_EMAIL_KEY)
            .maybeSingle();
        if (error || !data) return ENV_ADMIN_EMAIL;
        return data.value || ENV_ADMIN_EMAIL;
    } catch {
        return ENV_ADMIN_EMAIL;
    }
};

/**
 * Reads the live admin password from app_settings.
 * Falls back to the VITE_ADMIN_DEFAULT_PASSWORD env var.
 * NOTE: Only accessible to authenticated admin sessions (protected by RLS).
 */
export const getAdminPassword = async () => {
    try {
        const { data, error } = await supabase
            .from('app_settings')
            .select('value')
            .eq('key', ADMIN_PASSWORD_KEY)
            .maybeSingle();
        if (error || !data) return ENV_ADMIN_PASSWORD;
        return data.value || ENV_ADMIN_PASSWORD;
    } catch {
        return ENV_ADMIN_PASSWORD;
    }
};

/**
 * Persists a new admin email to app_settings.
 * Called atomically inside updateAdminCredentials after Supabase Auth update.
 */
export const saveAdminEmail = async (email) => {
    try {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key: ADMIN_EMAIL_KEY, value: email });
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('Error saving admin email to settings:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Persists a new admin password to app_settings.
 * Called atomically inside updateAdminCredentials after Supabase Auth update.
 */
export const saveAdminPassword = async (password) => {
    try {
        const { error } = await supabase
            .from('app_settings')
            .upsert({ key: ADMIN_PASSWORD_KEY, value: password });
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error('Error saving admin password to settings:', err);
        return { success: false, error: err.message };
    }
};
