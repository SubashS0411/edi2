import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, Loader2, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Payment = () => {
  const { user, activateSubscription } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');

  // UPI Link with pre-filled amount for mobile users
  const upiUrl = "upi://pay?pa=9751871025@pz&pn=EdiEnviro&am=100&cu=INR";

  const handlePaymentVerification = () => {
    // 1. Validate Reference Number Input
    if (!paymentRef || paymentRef.trim().length < 8) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Payment Reference Number (Transaction ID) from your UPI app.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    // 2. Simulate Verification Process
    setTimeout(() => {
      // In a real app, this would call an API to verify the Transaction ID
      
      activateSubscription(paymentRef);
      setIsVerifying(false);
      
      // Simulate Email Sending
      console.log(`
        [SIMULATED EMAIL SERVICE]
        To: md@edienviro.com
        Subject: New Subscription Payment - ${user.username}
        Body: 
        User Details:
        - Name: ${user.username}
        - Email: ${user.email}
        - Company: ${user.companyName}
        - Mobile: ${user.mobileNumber}
        
        Payment Details:
        - Amount: INR 100
        - Reference ID: ${paymentRef}
        - Status: Verified & Active
        - Date: ${new Date().toLocaleString()}
      `);

      toast({
        title: "Payment Verified!",
        description: "Subscription activated successfully. Welcome aboard!",
      });
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col md:flex-row"
    >
      <div className="md:w-1/2 bg-slate-50 p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-200">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Scan to Pay ₹100</h3>
          <p className="text-slate-500 text-sm">Scan QR or use the button below</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-4">
           {/* Static QR Code Image */}
          <img 
            src="https://horizons-cdn.hostinger.com/ccb2ae35-b51d-45a2-9783-c118721165d3/38c5cc2b1be9b5c6cef5766d93372e07.jpg" 
            alt="UPI Payment QR Code" 
            className="w-64 h-auto rounded-lg"
          />
        </div>

        <div className="text-center w-full max-w-xs space-y-3">
           <a 
            href={upiUrl}
            className="flex items-center justify-center w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium transition-colors"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Open UPI App (Auto-fill ₹100)
          </a>
          
          <div>
            <p className="font-mono bg-slate-100 px-3 py-1 rounded text-xs text-slate-500 select-all border border-slate-200">
              9751871025@pz
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Mani</p>
          </div>
        </div>
      </div>

      <div className="md:w-1/2 p-8 flex flex-col justify-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Subscription</h2>
          <p className="text-slate-600 text-sm">
            Complete the payment of <span className="font-bold text-slate-900">₹100</span> and enter the transaction reference number below to activate your account instantly.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="font-medium text-emerald-900">1 Year Access</span>
            <span className="font-bold text-emerald-700">₹100.00</span>
          </div>
          <div className="text-sm text-slate-500">
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                Unlimited Calculator Access
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                Instant Activation
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Payment Reference / Transaction ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Enter Transaction ID (e.g. 3289...)"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Found in your UPI app payment history.</p>
          </div>

          <Button 
            onClick={handlePaymentVerification} 
            disabled={isVerifying}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying Transaction...
              </>
            ) : (
              <>
                Verify & Activate
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Payment;