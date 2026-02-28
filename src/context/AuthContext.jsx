import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { saveAdminEmail, saveAdminPassword } from '@/lib/settingsService';

// Dynamic admin credentials — controlled via .env (VITE_ADMIN_EMAIL / VITE_ADMIN_DEFAULT_PASSWORD)
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'md@edienv.com';
const APP_URL = import.meta.env.VITE_APP_URL || 'https://edienviro.com';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Becomes true when Supabase fires the PASSWORD_RECOVERY event.
  // Auth.jsx watches this flag to auto-switch to the update-password form.
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Initialize System State
  useEffect(() => {
    // Check active session — if the stored token is stale/expired, sign out
    // to clear localStorage before returning, preventing the 400
    // refresh_token_not_found loop on every page load.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Stale or revoked session — wipe it silently so the user sees the
        // login screen instead of an infinite 400/refresh_token_not_found loop.
        console.warn('Session restore failed, clearing stale session:', error.message);
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // PASSWORD_RECOVERY fires when the user clicks a valid password-reset
      // email link and Supabase successfully exchanges the token.
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      // Clear the recovery flag once the user updates their password (USER_UPDATED)
      // or signs out mid-flow.
      if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Auth Functions ---

  const login = useCallback(async (email, password) => {
    // 1. Try signing in normally
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { success: false, error: error.message };

    // 3. Determine role from profiles table — this is the AUTHORITATIVE source.
    //    user_metadata.role is only set when the account is created via signUp();
    //    accounts created manually in the Supabase dashboard have no metadata role.
    let role = data.user?.user_metadata?.role || null;
    if (data.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profile?.role) role = profile.role;
    }

    return { success: true, user: data.user, role };
  }, []);

  const logout = useCallback(async () => {
    // Attempt sign out, but always clear local user state to ensure UI updates
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // --- Client Request Functions ---

  const updateQRCode = useCallback(async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `payment-qr-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      // 3. Save URL to a centralized config? 
      // For simplicity, we are simulating a persistent config. 
      // Ideally, we'd have a 'system_config' table. 
      // For this demo, let's just return the URL and let the dashboard use it (it won't persist across reloads unless we save it).
      // Let's create a quick 'system_config' table entry or just use a known path if we overwrite?
      // Better: We overwrite 'current-qr.png' so the URL is stable!

      // REVISED STRATEGY: Overwrite a specific file for persistence without a DB table
      const fixedPath = 'current-qr-code';

      await supabase.storage.from('assets').remove([fixedPath]); // Remove old

      const { error: overwriteError } = await supabase.storage
        .from('assets')
        .upload(fixedPath, file, { upsert: true });

      if (overwriteError) throw overwriteError;

      const { data: { publicUrl: fixedUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(fixedPath);

      // Hack to bust cache
      return { success: true, url: fixedUrl + '?t=' + Date.now() };

    } catch (error) {
      console.error("QR Upload Error:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const getQRCode = useCallback(() => {
    // Return the stable URL
    const { data } = supabase.storage.from('assets').getPublicUrl('current-qr-code');
    return data.publicUrl;
  }, []);

  const submitSignupRequest = useCallback(async (requestData) => {
    // requestData: { name, email, password, paymentProof (File or ID), transactionId }
    let paymentProofUrl = null;

    try {
      // 1. Upload Payment Proof (if File object provided)
      if (requestData.paymentProof && typeof requestData.paymentProof === 'object') {
        const file = requestData.paymentProof;
        const fileExt = file.name.split('.').pop();
        const fileName = `proofs/${Date.now()}_${requestData.email.replace(/[^a-z0-9]/gi, '_').substring(0, 10)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(fileName, file);

        if (uploadError) {
          console.warn("Proof upload failed:", uploadError);
          // Continue without proof? Or fail? Let's just log it for now.
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('assets')
            .getPublicUrl(fileName);
          paymentProofUrl = publicUrl;
        }
      }
    } catch (err) {
      console.error("Upload Logic Error:", err);
    }

    // 2. Sign Up User in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: requestData.email,
      password: requestData.password,
      options: {
        data: {
          full_name: requestData.name,
          transaction_id: requestData.transactionId,
          role: requestData.email === ADMIN_EMAIL ? 'admin' : 'client',
          payment_proof_id: requestData.paymentProofId || 'uploaded', // Legacy or fallback
          payment_proof_url: paymentProofUrl, // New URL field
          subscription_status: 'pending',
          /* Company / Billing Details Map */
          // Stores consolidated address and company info
          company_name: requestData.accountType === 'company' ? (requestData.companyName || '') : '',
          company_gst: requestData.accountType === 'company' ? (requestData.companyGst || '') : '',
          // Construct full address string
          company_address: `${requestData.address || ''}, ${requestData.city || ''}, ${requestData.state || ''} - ${requestData.zip || ''}`,
          company_phone: requestData.phone || '',
          // Use main email as contact email (can be distinct if needed, but simplified here)
          company_email: requestData.companyEmail || requestData.email
        },
        emailRedirectTo: `${APP_URL}/signup`
      }
    });

    if (authError) return { success: false, error: authError.message };

    return { success: true, user: authData.user };
  }, []);

  // --- Admin Functions ---

  const updateAdminCredentials = useCallback(async ({ newEmail, newPassword, newDisplayName, targetUserId }) => {
    // Determine whose credentials to update:
    //   - If targetUserId is provided → update that specific user (admin managing others)
    //   - Otherwise → update the currently logged-in admin
    const userId = targetUserId || user?.id;
    if (!userId) return { success: false, error: 'No authenticated user.' };

    if (!newEmail && !newPassword && !newDisplayName) {
      return { success: false, error: 'No changes provided.' };
    }

    // 1. Call Edge Function (uses service-role key server-side)
    //    This bypasses the browser autofill / same_password issues entirely.
    const payload = { userId };
    if (newEmail) payload.email = newEmail;
    if (newPassword) payload.password = newPassword;
    if (newDisplayName) payload.user_metadata = { full_name: newDisplayName };

    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      'update-user-credentials',
      { body: payload }
    );

    // supabase.functions.invoke returns { data, error }
    // data is the parsed JSON body from our Edge Function
    if (fnError) {
      return { success: false, error: fnError.message || 'Edge Function call failed.' };
    }

    // The Edge Function returns { success, error?, user? }
    if (!fnData?.success) {
      return { success: false, error: fnData?.error || 'Unknown Edge Function error.' };
    }

    // 2. Sync profiles table for display name
    if (newDisplayName) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: newDisplayName })
        .eq('id', userId);

      if (profileError) {
        console.warn('Auth updated but profiles sync failed:', profileError.message);
      }
    }

    // 3. Sync email in profiles if changed (admin API changes it instantly, no confirmation)
    if (newEmail) {
      const { error: emailSyncError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', userId);

      if (emailSyncError) {
        console.warn('Auth email updated but profiles.email sync failed:', emailSyncError.message);
      }
    }

    // 4. Persist new credentials to app_settings
    const settingsSaves = [];
    if (newEmail) settingsSaves.push(saveAdminEmail(newEmail));
    if (newPassword) settingsSaves.push(saveAdminPassword(newPassword));

    if (settingsSaves.length > 0) {
      const results = await Promise.all(settingsSaves);
      const failed = results.find(r => !r.success);
      if (failed) {
        console.warn('Auth updated but app_settings sync failed:', failed.error);
        return {
          success: true,
          user: fnData.user,
          warning: `Credentials changed but could not persist to settings table: ${failed.error}`,
        };
      }
    }

    return {
      success: true,
      user: fnData.user,
      // Admin API changes email instantly — no confirmation email needed
      emailPending: false,
    };
  }, [user]);

  // --- Fetch Admin Profile from DB (for verification) ---
  const getAdminProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .eq('id', currentUser.id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, profile: data, authEmail: currentUser.email };
  }, []);

  const getRequests = useCallback(async () => {
    // Fetch from profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
    return data;
  }, []);

  const handleRequest = useCallback(async (userId, action, durationMonths = 12) => { // action: 'approve' | 'reject' | 'enable' | 'disable'
    // Update profile status
    let updates = {};
    let emailTrigger = null;

    if (action === 'approve' || action === 'enable') {
      const now = new Date();
      const expirationDate = new Date();
      expirationDate.setMonth(now.getMonth() + parseInt(durationMonths));

      // Generate Random Token (e.g., EDI-AB12CD)
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newToken = `EDI-${randomString}`;

      updates = {
        subscription_status: 'active',
        subscription_start: now.toISOString(),
        subscription_end: expirationDate.toISOString(),
        // Only set token if it doesn't exist? Or always refresh?
        // Let's set it if we are approving (so enable keeps old one if we want, but simpler to just set updates)
        // If action is distinct 'approve', generate new. If 'enable', maybe keep?
        // The prompt says "generate a token... once approved".
        // Let's generate it on 'approve'.
      };

      if (action === 'approve') {
        updates.access_token = newToken;

        // Prepare Email Trigger (Fetch user details first)
        emailTrigger = {
          type: 'verify',
          token: newToken,
          expiry: expirationDate.toISOString()
        };
      }
    } else if (action === 'disable') {
      updates = {
        subscription_status: 'disabled'
      };
    } else {
      updates = {
        subscription_status: 'rejected'
      };

      // Prepare Email Trigger for Rejection
      emailTrigger = {
        type: 'reject'
      };
    }

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select() // Select back to get email and name
      .single();

    if (error) return { success: false, error: error.message };

    // --- TRIGGER EMAIL ---
    if (emailTrigger && updatedUser) {
      try {
        const { sendVerificationEmail, sendRejectionEmail } = await import('@/lib/emailService');

        if (emailTrigger.type === 'verify') {
          await sendVerificationEmail(updatedUser.email, updatedUser.full_name, emailTrigger.token, emailTrigger.expiry);
          console.log("Verification Email Sent to", updatedUser.email);
        } else if (emailTrigger.type === 'reject') {
          await sendRejectionEmail(updatedUser.email, updatedUser.full_name);
          console.log("Rejection Email Sent to", updatedUser.email);
        }
      } catch (err) {
        console.error("Failed to send email", err);
      }
    }

    return { success: true };
  }, []);


  // --- Delete / Remove User ---

  const deleteUser = useCallback(async (userId) => {
    // 1. Delete from profiles table — chain .select('id') so we can detect
    //    when RLS silently blocks the delete (returns 0 rows, no error).
    const { data: deleted, error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .select('id');

    if (profileError) return { success: false, error: profileError.message };

    if (!deleted || deleted.length === 0) {
      return {
        success: false,
        error: 'Delete was blocked by database permissions. Please run add_admin_delete_policy.sql in your Supabase SQL Editor and try again.',
      };
    }

    // 2. Remove auth record via Edge Function (uses service-role key)
    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      'update-user-credentials',
      { body: { userId, action: 'delete' } }
    );

    if (fnError) {
      console.warn('Profile deleted but auth cleanup via Edge Function failed:', fnError.message);
      // Not fatal — profile is already deleted, user can't access anything
    } else if (fnData && !fnData.success) {
      console.warn('Profile deleted but auth cleanup returned error:', fnData.error);
    }

    return { success: true };
  }, []);

  // --- Password Reset / Update ---

  const resetPassword = useCallback(async (email) => {
    // Redirect to /update-password so Auth.jsx's Trigger B detects
    // the path and automatically shows the "Set New Password" form.
    const redirectUrl = `${APP_URL}/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isPasswordRecovery,
    login,
    logout,
    // Auth Helpers
    getQRCode,
    submitSignupRequest,
    updateQRCode,
    getRequests,
    handleRequest,
    deleteUser,
    resendVerification,
    updateAdminCredentials,
    getAdminProfile,
    resetPassword,
    updatePassword,
  }), [user, loading, isPasswordRecovery, login, logout, getQRCode, submitSignupRequest, updateQRCode, getRequests, handleRequest, deleteUser, updateAdminCredentials, getAdminProfile, resetPassword, updatePassword]);

  // New Helper: Resend Verification
  async function resendVerification(email) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);