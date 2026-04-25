import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://faswclxplhagqauljpon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhc3djbHhwbGhhZ3FhdWxqcG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MTkwOTAsImV4cCI6MjA4MTk5NTA5MH0.JRdkikCr9KeVTmsuHk6AFKBy_5hdko4oQqDMr-jvEvw';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
