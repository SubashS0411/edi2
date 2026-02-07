import React from 'react';
import App from '@/App';
import PasswordProtectionScreen from '@/components/PasswordProtectionScreen';
import { useGlobalPassword } from '@/context/GlobalPasswordContext';
import { Loader2 } from 'lucide-react';

const ProtectedApp = () => {
  const { isAuthenticated, isLoading } = useGlobalPassword();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading security context...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <App /> : <PasswordProtectionScreen />;
};

export default ProtectedApp;