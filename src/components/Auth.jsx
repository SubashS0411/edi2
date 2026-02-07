import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Lock, User, Mail, Building, Phone, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth = () => {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    companyName: '',
    industryType: '',
    mobileNumber: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      const result = login(formData.email, formData.password);
      if (result.success) {
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } else {
      // Validate all fields are present for registration
      if (!formData.username || !formData.email || !formData.companyName || !formData.industryType || !formData.mobileNumber || !formData.password) {
        toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
        return;
      }

      const result = register(formData);
      if (result.success) {
        toast({ title: "Account Created", description: "Your account has been successfully created." });
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    }
  };

  const FEATURE_CARDS = [
    { title: "50+ Calculators", desc: "Automate complex engineering math.", icon: "🧮" },
    { title: "Instant Proposals", desc: "Generate docs in seconds.", icon: "⚡" },
    { title: "Secure Cloud", desc: "Access projects anywhere.", icon: "🔒" }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">

      {/* Left Panel: Branding & Value Prop */}
      <div className="lg:w-5/12 bg-slate-900 text-white flex flex-col justify-center p-12 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-20%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-slate-900 animate-spin-slow"></div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto lg:mx-0">
          <div className="mb-8">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Engineering Suite
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            Design. Calculate. <span className="text-emerald-500">Deliver.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            Join hundreds of environmental engineers streamlining their water treatment proposals and calculations with horizons.
          </p>

          {/* Feature Cards Loop */}
          <div className="space-y-4">
            {FEATURE_CARDS.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl mr-4">
                  {card.icon}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{card.title}</h4>
                  <p className="text-xs text-slate-400">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="lg:w-7/12 flex items-center justify-center p-6 md:p-12 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100" // Added Card Styling here
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start your 14-day free trial. No credit card required.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="jdoe"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Mobile</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+91..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white"
                        value={formData.mobileNumber}
                        onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Company Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Acme Enviro Solutions"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white"
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Industry</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Textile, Paper, Chemical"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white"
                      value={formData.industryType}
                      onChange={e => setFormData({ ...formData, industryType: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all focus:bg-white"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-bold shadow-lg hover:shadow-xl transition-all mt-6">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              {isLogin ? "New to Horizons? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 font-bold hover:underline transition-colors"
              >
                {isLogin ? 'Start Free Trial' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;