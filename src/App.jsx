import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import AdminDashboard from '@/pages/AdminDashboard';
import ClientProfile from '@/pages/ClientProfile';
import ProposalTool from '@/pages/ProposalTool';

function App() {
  return (
    <Router>
      <AuthProvider>
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