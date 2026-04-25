import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProposalGeneratorAuth } from '@/context/ProposalGeneratorContext';
import { useToast } from '@/components/ui/use-toast';

const ProposalGeneratorAuth = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useProposalGeneratorAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a brief network delay for better UX
    setTimeout(() => {
      const success = login(password);
      
      if (success) {
        toast({
          title: "Access Granted",
          description: "Welcome to the Proposal Generator.",
          variant: "success", // Ensure your toast component supports this or uses default style with an icon
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        });
        // State update in context will trigger re-render of parent, unmounting this component
      } else {
        setError('Incorrect password. Please try again.');
        toast({
          title: "Access Denied",
          description: "The password you entered is incorrect.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6 bg-slate-50/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 border border-slate-100"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Lock className="w-8 h-8 text-emerald-600" />
          </motion.div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Restricted Access</h3>
          <p className="text-slate-500">This tool is protected. Please enter the authorized password to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter Password"
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
            >
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Access Generator <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProposalGeneratorAuth;