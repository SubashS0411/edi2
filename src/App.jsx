import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import AdminDashboard from '@/pages/AdminDashboard';
import ClientProfile from '@/pages/ClientProfile';
import ProposalTool from '@/pages/ProposalTool';

/**
 * GlobalAuthHashHandler
 * Supabase password-reset (and other auth) emails redirect back to the app
 * with a hash fragment — either a success token or an error code.
 * The "Site URL" in Supabase defaults to the root (/), so the hash often
 * lands on the Home page instead of /signup.
 * This component runs on every route change and silently forwards those
 * hashes to /signup so the Auth component can render the correct UI.
 */
const GlobalAuthHashHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const hasError   = hashParams.has('error_code');
    const hasToken   = hashParams.has('access_token');
    const type       = hashParams.get('type');
    const isAuthHash = hasError || hasToken || type === 'recovery' || type === 'signup';

    // Only redirect if we're NOT already on an auth-related page
    const authPaths = ['/signup', '/login', '/update-password', '/reset-password', '/auth/callback'];
    const onAuthPage = authPaths.some(p => location.pathname.startsWith(p));

    if (isAuthHash && !onAuthPage) {
      // Forward the full hash to /signup so Auth.jsx can parse it
      navigate('/signup' + hash, { replace: true });
    }
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalAuthHashHandler />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/update-password" element={<Auth />} />
          <Route path="/reset-password" element={<Auth />} />
          <Route path="/auth/callback" element={<Auth />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/client-profile" element={<ClientProfile />} />
          <Route path="/proposal-tool" element={<ProposalTool />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;