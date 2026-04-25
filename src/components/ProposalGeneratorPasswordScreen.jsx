import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProposalAuth } from '@/context/ProposalGeneratorPasswordContext';
import { useToast } from '@/components/ui/use-toast';

const ProposalGeneratorPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { authenticate } = useProposalAuth();
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
          description: "Incorrect password for Proposal Generator.",
        });
      } else {
        toast({
          title: "Access Granted",
          description: "Proposal Generator unlocked.",
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-8 bg-slate-50 min-h-[400px] rounded-2xl border border-slate-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-emerald-600 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 transform -skew-y-6 scale-150 origin-top-left"></div>
          <div className="relative z-10">
            <div className="mx-auto w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-inner ring-4 ring-emerald-400/30">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Restricted Tool</h3>
            <p className="text-emerald-100 text-xs">
              Enter password to access Proposal Generator
            </p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="proposal-password" className="text-xs font-semibold text-slate-700 block uppercase tracking-wide">
                Tool Password
              </label>
              <div className="relative">
                <input
                  id="proposal-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className={`w-full px-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900 placeholder-slate-400 text-sm ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500'}`}
                  placeholder="Enter password..."
                  autoFocus
                />
              </div>
              {error && (
                <div className="flex items-center text-xs text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70"
              disabled={!password || isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Unlock Generator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center text-slate-400 text-xs gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="font-medium text-slate-500">Authorized Personnel Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalGeneratorPasswordScreen;