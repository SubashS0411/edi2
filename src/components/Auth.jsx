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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100"
    >
      <div className="bg-emerald-600 p-6 text-center">
        <h3 className="text-2xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
        <p className="text-emerald-100 mt-2 text-sm">Access professional engineering tools</p>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.companyName}
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                />
              </div>

              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Industry Type"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.industryType}
                  onChange={e => setFormData({...formData, industryType: e.target.value})}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.mobileNumber}
                  onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-6">
            {isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Auth;