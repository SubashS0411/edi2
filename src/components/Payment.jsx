import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, Loader2, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 125000,
    duration: '1 Month',
    features: ['Basic Support', 'Standard Access', 'Monthly Reports'],
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
    icon: ShieldCheck
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    price: 300000,
    duration: '3 Months',
    features: ['Priority Support', 'Full Access', 'Advanced Analytics'],
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    btnColor: 'bg-purple-600 hover:bg-purple-700',
    icon: Smartphone
  },
  {
    id: 'half_yearly',
    name: 'Half Yearly',
    price: 500000,
    duration: '6 Months',
    features: ['Premium Support', 'Dedicated Manager', 'Custom Reports'],
    color: 'bg-amber-50 border-amber-200 text-amber-900',
    btnColor: 'bg-amber-600 hover:bg-amber-700',
    icon: CheckCircle2
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 900000,
    duration: '1 Year',
    features: ['White Glove Service', 'Unlimited Access', 'API Integration'],
    badge: 'Best Value',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    icon: ShieldCheck
  }
];

const Payment = () => {
  const { user, activateSubscription } = useAuth();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[3]); // Default to Yearly

  // Dynamic UPI Link
  const upiUrl = `upi://pay?pa=9751871025@pz&pn=EdiEnviro&am=${selectedPlan.price}&cu=INR`;

  const handlePaymentVerification = () => {
    if (!paymentRef || paymentRef.trim().length < 8) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Payment Reference Number (Transaction ID).",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      activateSubscription(paymentRef, selectedPlan.id); // Pass plan ID if backend supports it
      setIsVerifying(false);

      toast({
        title: "Payment Verified!",
        description: `${selectedPlan.name} activated successfully!`,
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row animate-in fade-in duration-500">

      {/* Left Panel: QR Code (Sticky on Desktop) */}
      <div className="lg:w-5/12 bg-slate-900 text-white flex flex-col justify-center items-center p-8 lg:p-12 relative lg:sticky lg:top-0 lg:h-screen overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/50 via-slate-900 to-slate-900 animate-spin-slow"></div>
        </div>

        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-8">
          <div className="space-y-2">
            <h3 className="text-emerald-400 font-bold tracking-widest uppercase text-sm">Scan to Activate</h3>
            <h2 className="text-3xl md:text-5xl font-black text-white">
              ₹ {selectedPlan.price.toLocaleString()}
            </h2>
            <p className="text-slate-400 font-medium">{selectedPlan.name}</p>
          </div>

          {/* QR Code Card */}
          <motion.div
            key={selectedPlan.id} // Animate when plan changes
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-emerald-500/20 w-full aspect-square flex items-center justify-center relative group"
          >
            <div className="absolute inset-0 border-[3px] border-dashed border-slate-200 rounded-2xl m-3 pointer-events-none group-hover:border-emerald-500/30 transition-colors"></div>
            <img
              src="https://horizons-cdn.hostinger.com/ccb2ae35-b51d-45a2-9783-c118721165d3/38c5cc2b1be9b5c6cef5766d93372e07.jpg"
              alt="UPI Payment QR Code"
              className="w-full h-full object-contain rounded-lg mix-blend-multiply"
            />
          </motion.div>

          <div className="space-y-4 w-full">
            <a
              href={upiUrl}
              className="flex items-center justify-center w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-1"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Open UPI App
            </a>
            <p className="text-slate-500 text-xs">
              Scan using PhonePe, Google Pay, Paytm or any UPI App
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Plans & Verification (Scrollable) */}
      <div className="lg:w-7/12 p-6 md:p-12 lg:overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Subscription Plan</h1>
            <p className="text-slate-500">Choose the plan that suits your business needs.</p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPlan(plan)}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan.id === plan.id
                    ? `border-emerald-500 bg-emerald-50/30 shadow-md ${plan.color}`
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                {plan.badge && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${plan.id === selectedPlan.id ? 'bg-white' : 'bg-slate-100'}`}>
                    <plan.icon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400">Price</p>
                    <p className="font-bold text-lg">₹{(plan.price / 1000).toFixed(0)}k</p>
                  </div>
                </div>
                <h4 className="font-bold text-base mb-1">{plan.name}</h4>
                <p className="text-xs font-medium opacity-80 mb-4">{plan.duration}</p>

                <div className="space-y-1 border-t border-slate-200/50 pt-3">
                  {plan.features.slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-center text-xs opacity-70">
                      <CheckCircle2 className="w-3 h-3 mr-1.5" /> {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Verification Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
                Verify Payment
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Enter Transaction ID for your <strong className="text-slate-900">{selectedPlan.name}</strong> payment of <strong className="text-slate-900">₹{selectedPlan.price.toLocaleString()}</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Transaction Ref No (UTR)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. 32890472..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono text-slate-900 outline-none"
                />
              </div>

              <Button
                onClick={handlePaymentVerification}
                disabled={isVerifying}
                className={`w-full h-14 text-base font-bold shadow-lg transition-all rounded-xl ${selectedPlan.btnColor}`}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>Verify & Activate Subscription <ArrowRight className="ml-2 w-5 h-5" /></>
                )}
              </Button>
            </div>
          </div>

          {/* Support Footer */}
          <div className="text-center pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400">Need help? Contact support at support@edienviro.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;