import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowLeft, Loader2, Upload, QrCode, ChevronRight, CheckCircle, ShieldCheck, Home, Copy, Check, Building2, CreditCard, Calendar, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getRegistrationFee } from '@/lib/settingsService';

// Subscription Plans Data
const SUBSCRIPTION_PLANS = [
    {
        id: 'monthly',
        name: 'Monthly',
        price: 125000,
        duration: '1 Month',
        features: ['Full Platform Access', 'Email Support', 'Monthly Reports'],
        icon: Calendar,
        color: 'from-blue-500 to-cyan-500',
        borderColor: 'border-blue-500/50',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'quarterly',
        name: 'Quarterly',
        price: 300000,
        duration: '3 Months',
        features: ['Priority Support', 'Advanced Analytics', 'API Access'],
        icon: Building2,
        color: 'from-purple-500 to-pink-500',
        borderColor: 'border-purple-500/50',
        bgColor: 'bg-purple-500/10',
        savings: '20% Savings'
    },
    {
        id: 'half_yearly',
        name: 'Half Yearly',
        price: 500000,
        duration: '6 Months',
        features: ['Dedicated Manager', 'Custom Reports', 'Training Sessions'],
        icon: CreditCard,
        color: 'from-amber-500 to-orange-500',
        borderColor: 'border-amber-500/50',
        bgColor: 'bg-amber-500/10',
        savings: '33% Savings'
    },
    {
        id: 'yearly',
        name: 'Yearly',
        price: 900000,
        duration: '1 Year',
        features: ['White Glove Service', 'Unlimited Access', 'Priority Everything'],
        icon: Crown,
        color: 'from-emerald-500 to-teal-500',
        borderColor: 'border-emerald-500/50',
        bgColor: 'bg-emerald-500/10',
        badge: 'Best Value',
        savings: '40% Savings'
    }
];

// Bank Account Details
const BANK_DETAILS = {
    accountName: 'EDI ENVIRO AND ENGINEERING',
    accountNumber: '272539751871025',
    branch: 'KALLAKURICHI',
    accountType: 'Current Account',
    ifscCode: 'TMBL0000272',
    micrCode: '606060102'
};

const Auth = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, submitSignupRequest, getQRCode, resendVerification, resetPassword, updatePassword } = useAuth();
    const { toast } = useToast();

    // Initialize mode based on URL param 'mode' or default to 'welcome'
    // url?mode=login -> 'client-login'
    // url?mode=admin -> 'admin-login'
    const initialModeParam = searchParams.get('mode');
    const getInitialMode = () => {
        if (initialModeParam === 'login') return 'client-login';
        if (initialModeParam === 'admin') return 'admin-login';
        return 'welcome';
    };

    const [mode, setMode] = useState(getInitialMode()); // 'welcome' | 'signup-step-1' | 'plan-selection' | 'billing-summary' | 'signup-step-2' | 'signup-success' | 'admin-login' | 'client-login'
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [fee, setFee] = useState('69');
    const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[3]); // Default to Yearly
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        getRegistrationFee().then(setFee);
    }, []);

    // Form Data
    const [data, setData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        transactionId: '', paymentProof: null,
        // Billing / Company Details
        accountType: 'individual', // 'individual' | 'company'
        companyName: '', companyGst: '',
        address: '', city: '', state: '', zip: '', phone: ''
    });

    // Remove showCompanyDetails state as we use accountType now
    // const [showCompanyDetails, setShowCompanyDetails] = useState(false);

    useEffect(() => {
        setQrCodeUrl(getQRCode());
    }, [getQRCode]);

    // Check for password recovery mode
    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
            setMode('update-password');
        }
        if (window.location.pathname === '/update-password') {
            setMode('update-password');
        }
    }, []);

    const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setData({ ...data, paymentProof: e.target.files[0] });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(data.email, data.password);
        if (result.success) {
            toast({ title: "Authenticated", description: "Accessing secure environment..." });
            // Check if user is admin explicitly via metadata or fallback email check
            const isRoleAdmin = result.user?.user_metadata?.role === 'admin';
            const isEmailAdmin = data.email.includes('admin') || data.email.includes('edienviro');

            if (isRoleAdmin || isEmailAdmin) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            console.error("Login Error:", result.error);
            if (result.error && (result.error.includes('email_not_confirmed') || result.error.includes('Email not confirmed'))) {
                toast({
                    title: "Email Verification Required",
                    description: "Account exists but is not verified.",
                    variant: "destructive",
                    action: (
                        <div className="flex flex-col gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    const res = await resendVerification(data.email);
                                    if (res.success) {
                                        toast({ title: "Email Sent", description: "Check your inbox for the verification link." });
                                    } else {
                                        toast({ title: "Error", description: res.error, variant: "destructive" });
                                    }
                                }}
                                className="bg-white text-black hover:bg-slate-200"
                            >
                                Resend Verification Email
                            </Button>
                        </div>
                    ),
                    duration: 10000,
                });
            } else {
                toast({ title: "Access Denied", description: result.error, variant: "destructive" });
            }
        }
        setIsLoading(false);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const res = await resetPassword(data.email);
        if (res.success) {
            toast({
                title: "Recovery Email Sent",
                description: "Check your inbox for the password reset link.",
                className: "bg-emerald-500 text-white border-none"
            });
            setMode('check-email');
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (data.password !== data.confirmPassword) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const res = await updatePassword(data.password);
        if (res.success) {
            toast({
                title: "Password Updated",
                description: "You can now login with your new password.",
                className: "bg-emerald-500 text-white border-none"
            });
            setMode('client-login');
            navigate('/signup'); // clear url params
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" });
        }
        setIsLoading(false);
    };

    const handleInitialSignup = async (e) => {
        e.preventDefault();
        if (data.password !== data.confirmPassword) {
            toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
            return;
        }
        if (data.password.length < 6) {
            toast({ title: "Weak Password", description: "Must be at least 6 characters.", variant: "destructive" });
            return;
        }
        setMode('plan-selection');
    };

    // Copy to clipboard function
    const copyToClipboard = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast({ title: "Copied!", description: `${field} copied to clipboard.` });
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            toast({ title: "Copy Failed", description: "Please copy manually.", variant: "destructive" });
        }
    };

    const handleFinalSignup = async (e) => {
        e.preventDefault();

        if (!data.transactionId) {
            toast({ title: "Payment Required", description: "Please enter the Transaction ID.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        // Simulate upload delay
        await new Promise(r => setTimeout(r, 1000));

        // Aggressive sanitization: Remove anything that is NOT a valid email character
        const cleanEmail = data.email.replace(/[^a-zA-Z0-9@._-]/g, '').trim().toLowerCase();

        const result = await submitSignupRequest({
            name: data.name,
            email: cleanEmail,
            password: data.password,
            transactionId: data.transactionId,
            paymentProof: data.paymentProof, // Pass the File object directly
            // Consolidated Data
            accountType: data.accountType,
            companyName: data.accountType === 'company' ? data.companyName : '',
            companyGst: data.accountType === 'company' ? data.companyGst : '',
            // Address is used for both (Billing or Company)
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            phone: data.phone
        });

        if (result.success) {
            setMode('signup-success');
        } else {
            toast({ title: "Registration Failed", description: result.error, variant: "destructive" });
        }
        setIsLoading(false);
    };


    // Animations
    const backdropVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-black text-white font-sans overflow-hidden relative selection:bg-emerald-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                {/* Image Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614195975309-a3baf592274f?q=80&w=2000&auto=format&fit=crop')" }}
                />
                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />

                {/* Subtle Gradient Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-transparent to-blue-900/40 opacity-60" />
            </div>

            {/* Back to Home Button */}
            <button
                onClick={() => navigate('/')}
                className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/70 hover:bg-black/40 hover:text-white transition-all duration-300 group hover:border-white/20"
            >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Back to Home</span>
            </button>

            {/* Main Container */}
            <div className={`relative z-10 w-full px-6 transition-all duration-500 ease-in-out ${(mode === 'billing-summary' || mode === 'plan-selection' || mode === 'signup-step-2') ? 'w-full px-8 md:px-12 pt-20' : 'max-w-md'}`}>
                <AnimatePresence mode="wait">

                    {/* MODE: WELCOME */}
                    {mode === 'welcome' && (
                        <motion.div
                            key="welcome"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                            <div className="relative z-10 text-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mx-auto w-20 h-20 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-8 border border-white/10"
                                >
                                    <ShieldCheck className="text-white w-10 h-10" />
                                </motion.div>

                                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3 tracking-tight">
                                    Secure Portal
                                </h1>
                                <p className="text-slate-400 text-base font-light mb-10">
                                    Select your access pathway.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => setMode('signup-step-1')}
                                        className="w-full group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-emerald-900/20 border border-white/10"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Client Registration</span>
                                            <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setMode('client-login')}
                                        className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-4 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] mb-4"
                                    >
                                        Client Access
                                    </button>

                                    <button
                                        onClick={() => setMode('admin-login')}
                                        className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white font-medium py-4 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                                    >
                                        Admin Authentication
                                    </button>
                                </div>

                                <div className="mt-10 flex items-center justify-center space-x-2 opacity-50">
                                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500">EDI Enviro System v2.0</p>
                                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* MODE: CLIENT LOGIN */}
                    {mode === 'client-login' && (
                        <motion.div
                            key="client-login"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <button onClick={() => setMode('welcome')} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="text-center mt-8 mb-8">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Client Access</h2>
                                <p className="text-slate-400 text-sm mt-1">Log in to view your proposals.</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Email Address</label>
                                    <div className="relative group">
                                        <input name="email" type="email" value={data.email} onChange={handleChange} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
                                            placeholder="client@company.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Password</label>
                                    <input name="password" type="password" value={data.password} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="text-right">
                                    <button type="button" onClick={() => setMode('forgot-password')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                                        Forgot Password?
                                    </button>
                                </div>
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-6 text-lg font-bold shadow-lg shadow-emerald-900/20 mt-4 border border-white/10" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* MODE: ADMIN LOGIN */}
                    {mode === 'admin-login' && (
                        <motion.div
                            key="admin"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <button onClick={() => setMode('welcome')} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="text-center mt-8 mb-8">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Admin Access</h2>
                                <p className="text-slate-400 text-sm mt-1">Authorized personnel only.</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Email Identity</label>
                                    <div className="relative group">
                                        <input name="email" type="email" value={data.email} onChange={handleChange} required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
                                            placeholder="admin@edi.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Secure Key</label>
                                    <input name="password" type="password" value={data.password} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 py-6 text-lg font-bold shadow-lg shadow-emerald-900/20 mt-4 border border-white/10" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Authenticate Session"}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* MODE: SIGNUP STEP 1 */}
                    {mode === 'signup-step-1' && (
                        <motion.div
                            key="step1"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={() => setMode('welcome')} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20 tracking-wider">STEP 1 / 4</span>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">Create Identity</h2>
                                <p className="text-slate-400 text-sm">Initialize your client profile.</p>
                            </div>

                            <form onSubmit={handleInitialSignup} className="space-y-4">
                                <input name="name" placeholder="Full Organization / User Name" value={data.name} onChange={handleChange} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                />
                                <input name="email" type="email" placeholder="Official Email Address" value={data.email} onChange={handleChange} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="password" type="password" placeholder="Password" value={data.password} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                    />
                                    <input name="confirmPassword" type="password" placeholder="Confirm" value={data.confirmPassword} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>
                                <Button className="w-full bg-white text-black hover:bg-slate-200 py-6 text-base font-bold mt-6 shadow-lg shadow-white/10 transition-transform active:scale-[0.98]">
                                    Select Your Plan <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* MODE: PLAN SELECTION (Step 2) */}
                    {mode === 'plan-selection' && (
                        <motion.div
                            key="plan-selection"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="w-full"
                        >
                            {/* Header Section */}
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-6">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setMode('signup-step-1')} className="text-slate-500 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-xl border border-white/10">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Choose Your Plan</h2>
                                            <span className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-full border border-cyan-500/30 tracking-wider">STEP 2 / 4</span>
                                        </div>
                                        <p className="text-slate-400 text-base">Select the subscription that fits your business scale and goals.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Plans - Full Width 4-Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12 pt-4">
                                {SUBSCRIPTION_PLANS.map((plan, index) => (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.4 }}
                                        whileHover={{ scale: 1.03, y: -8, transition: { duration: 0.25 } }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`relative rounded-3xl cursor-pointer transition-all duration-500 flex flex-col group ${selectedPlan.id === plan.id
                                            ? 'ring-2 ring-offset-2 ring-offset-slate-900'
                                            : 'hover:shadow-2xl'
                                            }`}
                                        style={{
                                            background: selectedPlan.id === plan.id
                                                ? `linear-gradient(135deg, ${plan.color.includes('blue') ? 'rgba(59,130,246,0.25)' : plan.color.includes('purple') ? 'rgba(168,85,247,0.25)' : plan.color.includes('amber') ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)'}, rgba(0,0,0,0.4))`
                                                : 'rgba(255,255,255,0.03)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            borderColor: selectedPlan.id === plan.id
                                                ? (plan.color.includes('blue') ? 'rgba(59,130,246,0.5)' : plan.color.includes('purple') ? 'rgba(168,85,247,0.5)' : plan.color.includes('amber') ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)')
                                                : 'rgba(255,255,255,0.08)',
                                            boxShadow: selectedPlan.id === plan.id
                                                ? `0 25px 60px -15px ${plan.color.includes('blue') ? 'rgba(59,130,246,0.35)' : plan.color.includes('purple') ? 'rgba(168,85,247,0.35)' : plan.color.includes('amber') ? 'rgba(245,158,11,0.35)' : 'rgba(16,185,129,0.35)'}`
                                                : 'none'
                                        }}
                                    >
                                        {/* Best Value Badge */}
                                        {plan.badge && (
                                            <div className="absolute top-0 left-0 right-0 flex justify-center z-20 -translate-y-1/2">
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.3, type: 'spring' }}
                                                    className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black text-[11px] font-black px-5 py-1.5 rounded-full shadow-xl shadow-amber-500/30 tracking-wide uppercase flex items-center gap-1.5"
                                                >
                                                    <Crown className="w-3.5 h-3.5" />
                                                    {plan.badge}
                                                </motion.span>
                                            </div>
                                        )}

                                        {/* Card Content */}
                                        <div className="p-7 lg:p-8 flex flex-col h-full pt-8">
                                            {/* Top Row - Icon & Selection */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`p-4 rounded-2xl transition-all duration-300 ${selectedPlan.id === plan.id ? 'bg-white/20 shadow-lg' : plan.bgColor + ' group-hover:bg-white/10'}`}>
                                                    <plan.icon className={`w-7 h-7 lg:w-8 lg:h-8 transition-colors duration-300 ${selectedPlan.id === plan.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                                                </div>
                                                {selectedPlan.id === plan.id ? (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                        className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40"
                                                    >
                                                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                                    </motion.div>
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full border-2 border-white/10 group-hover:border-white/30 transition-colors" />
                                                )}
                                            </div>

                                            {/* Plan Name & Duration */}
                                            <h4 className={`font-black text-2xl lg:text-3xl mb-1 transition-colors duration-300 ${selectedPlan.id === plan.id ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                                                {plan.name}
                                            </h4>
                                            <p className={`text-sm mb-6 transition-colors duration-300 ${selectedPlan.id === plan.id ? 'text-white/70' : 'text-slate-400'}`}>
                                                {plan.duration} subscription
                                            </p>

                                            {/* Price Section */}
                                            <div className="mb-6">
                                                <span className="text-lg text-slate-400 font-medium">₹</span>
                                                <span className={`text-4xl font-black tracking-tight transition-colors duration-300 ${selectedPlan.id === plan.id ? 'text-white' : 'text-white/90'}`}>
                                                    {(plan.price / 1000).toFixed(0)},000
                                                </span>
                                                {plan.savings && (
                                                    <motion.span
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                        className={`inline-flex items-center mt-3 text-xs font-bold px-3 py-1 rounded-lg ${selectedPlan.id === plan.id ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'
                                                            }`}
                                                    >
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        {plan.savings}
                                                    </motion.span>
                                                )}
                                            </div>

                                            {/* Divider */}
                                            <div className={`h-px mb-6 transition-colors ${selectedPlan.id === plan.id ? 'bg-white/20' : 'bg-white/5'}`} />

                                            {/* Features */}
                                            <div className="space-y-3 flex-grow">
                                                {plan.features.map((feature, idx) => (
                                                    <div key={idx} className={`flex items-start text-sm leading-relaxed transition-colors duration-300 ${selectedPlan.id === plan.id ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                                        <CheckCircle className={`w-4 h-4 mr-3 flex-shrink-0 mt-0.5 ${selectedPlan.id === plan.id ? 'text-emerald-300' : 'text-slate-600 group-hover:text-emerald-400/60'}`} />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Select Button */}
                                            <button className={`mt-8 w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 ${selectedPlan.id === plan.id
                                                ? 'bg-white text-black shadow-xl'
                                                : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                                                }`}>
                                                {selectedPlan.id === plan.id ? '✓ Selected' : 'Select Plan'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Bank Account Details - Full Width Premium Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 mb-8 overflow-hidden relative"
                            >
                                {/* Decorative Elements */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl">
                                            <Building2 className="w-7 h-7 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-xl lg:text-2xl">Bank Transfer Details</h3>
                                            <p className="text-slate-400 text-sm mt-1">Transfer the amount to proceed with registration</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {['NEFT', 'RTGS', 'IMPS'].map((method) => (
                                            <span key={method} className="bg-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-300 border border-slate-700">{method}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 relative z-10">
                                    {[
                                        { label: 'Account Name', value: BANK_DETAILS.accountName, field: 'accountName', span: 'lg:col-span-2' },
                                        { label: 'Account Number', value: BANK_DETAILS.accountNumber, field: 'accountNumber', span: 'lg:col-span-2' },
                                        { label: 'IFSC Code', value: BANK_DETAILS.ifscCode, field: 'ifscCode', span: 'lg:col-span-2' },
                                        { label: 'Branch', value: BANK_DETAILS.branch, field: 'branch', span: 'lg:col-span-2' },
                                        { label: 'Account Type', value: BANK_DETAILS.accountType, field: 'accountType', span: 'lg:col-span-2' },
                                        { label: 'MICR Code', value: BANK_DETAILS.micrCode, field: 'micrCode', span: 'lg:col-span-2' }
                                    ].map((item) => (
                                        <div key={item.field} className={`bg-black/30 border border-white/5 rounded-2xl p-5 group hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 ${item.span}`}>
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">{item.label}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-white font-mono text-base lg:text-lg font-semibold truncate mr-3 ${item.field === 'accountNumber' ? 'tracking-wider' : ''}`}>{item.value}</span>
                                                <button
                                                    onClick={() => copyToClipboard(item.value, item.label)}
                                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 transition-all duration-300 flex-shrink-0 active:scale-90 border border-transparent hover:border-emerald-500/30"
                                                    title="Copy to clipboard"
                                                >
                                                    {copiedField === item.label ? (
                                                        <Check className="w-4 h-4 text-emerald-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Continue Button - Fixed Footer */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-4"
                            >
                                <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedPlan.color} shadow-lg`}>
                                            <selectedPlan.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Selected Plan</p>
                                            <div className="flex items-baseline gap-3">
                                                <p className="text-white font-black text-2xl">{selectedPlan.name}</p>
                                                <span className="text-emerald-400 font-mono font-bold text-xl">₹{selectedPlan.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setMode('billing-summary')}
                                        className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-6 px-12 text-lg font-bold shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 rounded-xl border border-white/10"
                                    >
                                        Continue to Billing <ChevronRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* MODE: BILLING SUMMARY (Step 3) */}
                    {mode === 'billing-summary' && (
                        <motion.div
                            key="billing"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative w-full"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={() => setMode('plan-selection')} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/20 tracking-wider">STEP 3 / 4</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Left Side: Billing Details Form (8 cols) */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="border-b border-white/10 pb-6 mb-6">
                                        <h2 className="text-3xl font-bold text-white mb-2">Registration Details</h2>
                                        <p className="text-slate-400">Please provide your contact information.</p>
                                    </div>

                                    {/* Account Type Toggle */}
                                    <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/10">
                                        <button
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.accountType === 'individual' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                            onClick={() => setData({ ...data, accountType: 'individual' })}
                                        >
                                            Individual
                                        </button>
                                        <button
                                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.accountType === 'company' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                            onClick={() => setData({ ...data, accountType: 'company' })}
                                        >
                                            Company / Business
                                        </button>
                                    </div>

                                    {/* Company Specific Fields */}
                                    <div className={`space-y-6 overflow-hidden transition-all duration-500 ease-in-out ${data.accountType === 'company' ? 'max-h-[200px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs text-purple-400 uppercase font-bold tracking-wider">Company Name</label>
                                                <input
                                                    name="companyName"
                                                    value={data.companyName}
                                                    onChange={handleChange}
                                                    placeholder="Business Name"
                                                    required={data.accountType === 'company'}
                                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-5 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs text-purple-400 uppercase font-bold tracking-wider">GSTIN</label>
                                                <input
                                                    name="companyGst"
                                                    value={data.companyGst}
                                                    onChange={handleChange}
                                                    placeholder="GST Number"
                                                    required={data.accountType === 'company'}
                                                    className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-5 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Common Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Contact Phone</label>
                                            <input
                                                name="phone"
                                                type="number"
                                                value={data.phone}
                                                onChange={handleChange}
                                                placeholder="Mobile Number"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Country</label>
                                            <input placeholder="Country" className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all" defaultValue="India" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">{data.accountType === 'company' ? 'Company Address' : 'Billing Address'}</label>
                                        <input
                                            name="address"
                                            value={data.address}
                                            onChange={handleChange}
                                            placeholder="Street Address"
                                            required
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">City</label>
                                            <input
                                                name="city"
                                                value={data.city}
                                                onChange={handleChange}
                                                placeholder="City"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">State</label>
                                            <input
                                                name="state"
                                                value={data.state}
                                                onChange={handleChange}
                                                placeholder="State"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">ZIP</label>
                                            <input
                                                name="zip"
                                                value={data.zip}
                                                onChange={handleChange}
                                                placeholder="ZIP Code"
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>


                                {/* Right Side: Summary Card (4 cols) */}
                                < div className="lg:col-span-4 space-y-6" >
                                    <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden h-fit sticky top-6">
                                        {/* Decorative Circles */}
                                        <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-purple-200 rounded-full blur-2xl opacity-60" />
                                        <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-emerald-200 rounded-full blur-2xl opacity-60" />

                                        <h3 className="font-bold text-2xl mb-6 relative z-10 tracking-tight">Order Summary</h3>

                                        <div className="space-y-4 mb-8 relative z-10">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-slate-600">Selected Plan</span>
                                                <span className="font-bold bg-gradient-to-r from-emerald-100 to-teal-100 px-3 py-1 rounded-lg text-emerald-800">{selectedPlan.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Duration</span>
                                                <span className="font-medium text-slate-700">{selectedPlan.duration}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">Subscription Fee</span>
                                                <span className="font-bold font-mono text-base">₹{selectedPlan.price.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500">GST (18%)</span>
                                                <span className="text-slate-400 italic">Included</span>
                                            </div>
                                            <div className="h-px bg-slate-200 my-2" />
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-xl">Total</span>
                                                <span className="font-extrabold text-3xl font-mono text-purple-600">₹{selectedPlan.price.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 text-emerald-800 text-sm font-semibold py-3 px-4 rounded-xl flex items-center justify-center mb-8 border border-emerald-100 gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>SSL Secure Payment</span>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                const requiredFields = ['phone', 'address', 'city', 'state', 'zip'];
                                                if (data.accountType === 'company') {
                                                    requiredFields.push('companyName', 'companyGst');
                                                }

                                                const emptyFields = requiredFields.filter(field => !data[field]?.trim());

                                                if (emptyFields.length > 0) {
                                                    alert('Please fill in all required fields.');
                                                    return;
                                                }

                                                setMode('signup-step-2');
                                            }}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 text-lg rounded-xl shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            Continue to Payment
                                        </Button>

                                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>30-day money-back guarantee</span>
                                        </div>
                                    </div>
                                </div >
                            </div >
                        </motion.div >
                    )}

                    {/* MODE: SIGNUP STEP 2 (Payment) */}
                    {
                        mode === 'signup-step-2' && (
                            <motion.div
                                key="step2"
                                variants={backdropVariants}
                                initial="hidden" animate="visible" exit="exit"
                                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 lg:p-10 shadow-2xl relative w-full h-full flex flex-col"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <button onClick={() => setMode('billing-summary')} className="text-slate-500 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-xl border border-white/10">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-4 py-1.5 rounded-full border border-emerald-500/20 tracking-wider">STEP 4 / 4</span>
                                </div>

                                <div className="text-center mb-8">
                                    <h2 className="text-3xl lg:text-4xl font-black text-white mb-2 tracking-tight">Complete Your Payment</h2>
                                    <p className="text-slate-400 text-base">Upload your payment proof to finish registration.</p>
                                </div>

                                {/* Amount Display at Top */}
                                <div className="text-center mb-10 bg-slate-900/40 p-6 rounded-2xl border border-white/5 max-w-2xl mx-auto w-full">
                                    <p className="text-slate-400 text-sm uppercase tracking-wider mb-1 font-bold">Total Amount to Pay</p>
                                    <p className="text-5xl font-black text-white font-mono my-2">₹{selectedPlan.price.toLocaleString()}</p>
                                    <p className="text-emerald-400 text-sm font-medium">{selectedPlan.name} Plan • {selectedPlan.duration}</p>
                                </div>

                                {/* Payment Form - Centered */}
                                <div className="flex flex-col justify-center max-w-2xl mx-auto w-full">
                                    <form onSubmit={handleFinalSignup} className="space-y-8">
                                        {/* Instructions */}
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-2">
                                            <h4 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                                                <CreditCard className="w-5 h-5" />
                                                Bank Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                                                <div>
                                                    <p className="text-slate-500 text-xs uppercase font-bold">Account Name</p>
                                                    <p className="font-mono text-white select-all">{BANK_DETAILS.accountName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs uppercase font-bold">Account Number</p>
                                                    <p className="font-mono text-white select-all">{BANK_DETAILS.accountNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs uppercase font-bold">IFSC Code</p>
                                                    <p className="font-mono text-white select-all">{BANK_DETAILS.ifscCode}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs uppercase font-bold">Branch</p>
                                                    <p className="font-mono text-white select-all">{BANK_DETAILS.branch}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transaction ID Input */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Transaction Ref / UTR Number</label>
                                            <input
                                                name="transactionId"
                                                placeholder="e.g. UPI-1234567890 or Bank Ref No."
                                                value={data.transactionId}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-emerald-400 font-mono text-lg tracking-wide focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all placeholder:text-slate-600"
                                            />
                                        </div>

                                        {/* File Upload */}
                                        <div className="relative group">
                                            <input type="file" id="file_upload" className="hidden" onChange={handleFileChange} accept="image/*" />
                                            <label htmlFor="file_upload" className="flex flex-col items-center justify-center w-full px-6 py-8 border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl cursor-pointer bg-black/20 hover:bg-emerald-500/5 transition-all duration-300 text-center">
                                                <Upload className="w-8 h-8 mb-3 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                                {data.paymentProof ? (
                                                    <span className="text-emerald-400 flex items-center bg-emerald-500/10 px-4 py-2 rounded-full text-sm border border-emerald-500/20 font-medium">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        {data.paymentProof.name.substring(0, 25)}...
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="text-slate-400 group-hover:text-emerald-400 font-medium transition-colors">Upload Payment Screenshot</span>
                                                        <span className="text-slate-600 text-sm mt-1">PNG, JPG up to 5MB</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-6 text-lg font-bold shadow-xl shadow-emerald-900/30 border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                                        </Button>

                                        {/* Security Badge */}
                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                            <span>Your payment is secure and encrypted</span>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )
                    }

                    {/* MODE: SIGNUP SUCCESS */}
                    {
                        mode === 'signup-success' && (
                            <motion.div
                                key="success"
                                variants={backdropVariants}
                                initial="hidden" animate="visible" exit="exit"
                                className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-cyan-500" />

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/40"
                                >
                                    <CheckCircle className="text-white w-12 h-12" />
                                </motion.div>

                                <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Access Requested</h2>
                                <p className="text-slate-300 text-lg mb-8 leading-relaxed font-light">
                                    Your profile is actively <span className="text-emerald-400 font-semibold border-b border-emerald-500/30 pb-0.5">pending validation</span>.
                                    <br /><span className="text-sm text-slate-500 mt-2 block">We will notify you upon administrative approval.</span>
                                </p>

                                <Button
                                    onClick={() => navigate('/')}
                                    className="w-full bg-white text-slate-900 hover:bg-slate-200 py-6 text-base font-bold shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Return to Homepage
                                </Button>
                            </motion.div>
                        )
                    }


                    {/* MODE: FORGOT PASSWORD */}
                    {mode === 'forgot-password' && (
                        <motion.div
                            key="forgot-password"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <button onClick={() => setMode('client-login')} className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="text-center mt-8 mb-8">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
                                <p className="text-slate-400 text-sm mt-1">Enter your email to receive recovery instructions.</p>
                            </div>
                            <form onSubmit={handleForgotPassword} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Email Address</label>
                                    <input name="email" type="email" value={data.email} onChange={handleChange} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
                                        placeholder="client@company.com"
                                    />
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 text-lg font-bold shadow-lg mt-4 border border-white/10" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Send Recovery Link"}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                    {/* MODE: CHECK EMAIL */}
                    {mode === 'check-email' && (
                        <motion.div
                            key="check-email"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                            <div className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                <CheckCircle className="text-emerald-400 w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Check Your Inbox</h2>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">We've sent a password recovery link to <br /><span className="text-white font-medium">{data.email}</span>.</p>
                            <Button onClick={() => setMode('client-login')} className="w-full bg-slate-800 hover:bg-slate-700 py-6 text-base font-bold shadow-xl border border-white/5">
                                Back to Login
                            </Button>
                        </motion.div>
                    )}

                    {/* MODE: UPDATE PASSWORD */}
                    {mode === 'update-password' && (
                        <motion.div
                            key="update-password"
                            variants={backdropVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative"
                        >
                            <div className="text-center mt-8 mb-8">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Set New Password</h2>
                                <p className="text-slate-400 text-sm mt-1">Please enter your new password below.</p>
                            </div>
                            <form onSubmit={handleUpdatePassword} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">New Password</label>
                                    <input name="password" type="password" value={data.password} onChange={handleChange} required minLength={6}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <input name="confirmPassword" type="password" value={data.confirmPassword} onChange={handleChange} required minLength={6}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-700 font-medium tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 text-lg font-bold shadow-lg mt-4 border border-white/10" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                </AnimatePresence >
            </div >
        </div >
    );
};

export default Auth;
