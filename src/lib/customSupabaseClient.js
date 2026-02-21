import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Persist the session in localStorage so users stay logged in across
        // page reloads, and auto-refresh before the access token expires.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // When a refresh_token_not_found (400) occurs, Supabase JS will fire a
        // SIGNED_OUT event so our onAuthStateChange in AuthContext clears the
        // stale session rather than looping on failed refreshes.
        storageKey: 'edienviro-auth-token',
    }
});

export default customSupabaseClient;

export {
    customSupabaseClient,
    customSupabaseClient as supabase,
};
