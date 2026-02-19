import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize System State
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Auth Functions ---

  const login = useCallback(async (email, password) => {
    // 1. Try Signing In
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    // 2. Fallback: If Admin and "Invalid login credentials", try Creating the Account automatically
    // This helps if the user skipped the registration step.
    if (error && (email === 'md@edienviro.com' || email === 'admin@demo.com') && error.message.includes('Invalid login credentials')) {
      console.log("Admin account not found (or wrong pass). Attempting auto-registration for Admin...");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'admin', full_name: 'Master Admin' } }
      });

      if (!signUpError && signUpData.user) {
        // Auto-registration successful.
        // Profile creation is now handled by the DB Trigger 'on_auth_user_created'.

        // If Supabase allows sign-in immediately (confirm email off), we are good.
        // If it requires confirmation, we must warn user.
        if (signUpData.session) {
          return { success: true, user: signUpData.user };
        } else {
          return { success: false, error: "Admin Account Created! Please check your email to confirm registration." };
        }
      }
    }

    if (error) return { success: false, error: error.message };
    return { success: true, user: data.user };
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
          role: (requestData.email === 'md@edienviro.com' || requestData.email === 'admin@demo.com') ? 'admin' : 'client',
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
        }
      }
    });

    if (authError) return { success: false, error: authError.message };

    return { success: true, user: authData.user };
  }, []);

  // --- Admin Functions ---

  const updateAdminCredentials = useCallback(async ({ newEmail, newPassword }) => {
    const updates = {};
    if (newEmail) updates.email = newEmail;
    if (newPassword) updates.password = newPassword;

    if (Object.keys(updates).length === 0) {
      return { success: false, error: 'No changes provided.' };
    }

    // 1. Update Supabase Auth (auth.users table)
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) return { success: false, error: error.message };

    // 2. If email changed, also sync the profiles table so both stay consistent.
    //    (auth.users has no built-in UPDATE trigger to profiles.email)
    if (newEmail && data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', data.user.id);

      if (profileError) {
        console.warn('Auth email updated but profiles.email sync failed:', profileError.message);
        // Return success because auth is updated; warn about the partial sync
        return { success: true, user: data.user, warning: profileError.message };
      }
    }

    return { success: true, user: data.user };
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


  // --- Password Reset / Update ---

  const resetPassword = useCallback(async (email) => {
    const redirectUrl = `${window.location.origin}/update-password`;
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
    login,
    logout,
    // Auth Helpers
    getQRCode,
    submitSignupRequest,
    updateQRCode,
    getRequests,
    handleRequest,
    resendVerification,
    updateAdminCredentials,
    resetPassword,
    updatePassword,
  }), [user, loading, login, logout, getQRCode, submitSignupRequest, updateQRCode, getRequests, handleRequest, updateAdminCredentials, resetPassword, updatePassword]);

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