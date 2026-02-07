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
