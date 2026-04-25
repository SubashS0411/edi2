import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobalPassword } from '@/context/GlobalPasswordContext';
import { useToast } from '@/components/ui/use-toast';

const PasswordProtectionScreen = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { authenticate } = useGlobalPassword();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    try {
      const success = await authenticate(password);
      if (!success) {
        setError('Incorrect password. Please try again.');
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "The password you entered is incorrect.",
        });
      } else {
        toast({
          title: "Access Granted",
          description: "Welcome to EDI Enviro & Engineering.",
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 transform -skew-y-6 scale-150 origin-top-left"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-emerald-400/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
            <p className="text-emerald-100 text-sm">
              Please enter the access password to view the EDI Enviro & Engineering platform.
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 block">
                Access Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 placeholder-slate-400 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500'}`}
                  placeholder="Enter password..."
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center text-sm text-red-500 mt-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  {error}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              disabled={!password || isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Access Platform
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center text-slate-400 text-sm gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-slate-500">Secure Engineering Environment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtectionScreen;