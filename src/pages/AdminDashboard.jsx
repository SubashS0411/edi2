import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, ArrowLeft, Loader2, Upload, QrCode, Check, AlertTriangle, X, User, FileText, Image, Maximize2, Shield, Calendar, CreditCard, ChevronDown, LogOut, KeyRound, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import StatsOverview from '@/components/admin/StatsOverview';
import { getRegistrationFee, updateRegistrationFee } from '@/lib/settingsService';
import { checkAndSendReminders } from '@/lib/emailService';

const AdminDashboard = () => {
    const { user, handleRequest, getQRCode, updateQRCode, logout, updateAdminCredentials } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [allRequests, setAllRequests] = useState([]);
    const [qrUrl, setQrUrl] = useState('');
    const [isUpdatingQr, setIsUpdatingQr] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null); // New state for client detail view
    const [loadingData, setLoadingData] = useState(true);
    const [approvalDuration, setApprovalDuration] = useState(12);
    const [isSendingReminders, setIsSendingReminders] = useState(false);

    const [currentFee, setCurrentFee] = useState('69.00');

    // --- Change Credentials State ---
    const [credEmail, setCredEmail] = useState('');
    const [credPassword, setCredPassword] = useState('');
    const [credConfirm, setCredConfirm] = useState('');
    const [showCredPassword, setShowCredPassword] = useState(false);
    const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

    useEffect(() => {
        const loadFee = async () => {
            const fee = await getRegistrationFee();
            setCurrentFee(fee);
        }
        loadFee();
    }, []);

    const fetchData = async () => {
        setLoadingData(true);
        const { data, error } = await supabase.from('profiles').select('*');

        if (error) {
            console.error("Dashboard Fetch Error:", error);
            setAllRequests([]);
        } else {
            const sorted = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAllRequests(sorted);
        }
        setLoadingData(false);
    };

    useEffect(() => {
        if (!user) {
            navigate('/signup');
            return;
        }
        const role = user.user_metadata?.role;
        if (role !== 'admin' && user.email !== 'md@edienviro.com') {
            toast({ title: "Unauthorized", description: "Admin access required.", variant: "destructive" });
            navigate('/');
            return;
        }

        fetchData();
        setQrUrl(getQRCode() || '');
    }, [user, navigate, getQRCode]);

    const onHandleRequest = async (id, action, duration) => {
        const result = await handleRequest(id, action, duration);
        if (result.success) {
            toast({
                title: "Success",
                description: `Request ${action}d successfully.`,
                className: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            });
            fetchData();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive"
            });
        }
    };

    const handleSendReminders = async () => {
        setIsSendingReminders(true);
        try {
            const { totalSent } = await checkAndSendReminders(allRequests);
            toast({
                title: "Reminders Sent",
                description: `Successfully sent expiry warnings to ${totalSent} users.`,
            });
        } catch (error) {
            toast({
                title: "Error Sending Reminders",
                description: "Could not complete the batch process.",
                variant: "destructive"
            });
        } finally {
            setIsSendingReminders(false);
        }
    };

    const handleUpdateCredentials = async (e) => {
        e.preventDefault();
        if (credPassword && credPassword !== credConfirm) {
            toast({ title: 'Password Mismatch', description: 'New password and confirmation do not match.', variant: 'destructive' });
            return;
        }
        if (!credEmail && !credPassword) {
            toast({ title: 'Nothing to Update', description: 'Please enter a new email or password.', variant: 'destructive' });
            return;
        }
        setIsUpdatingCreds(true);
        const result = await updateAdminCredentials({
            newEmail: credEmail || undefined,
            newPassword: credPassword || undefined,
        });
        setIsUpdatingCreds(false);
        if (result.success) {
            toast({
                title: 'Credentials Updated',
                description: credEmail
                    ? 'Email updated — check your inbox to confirm the change.'
                    : 'Password changed successfully.',
                className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
            });
            setCredEmail('');
            setCredPassword('');
            setCredConfirm('');
        } else {
            toast({ title: 'Update Failed', description: result.error, variant: 'destructive' });
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-white p-6 sm:p-10 font-sans selection:bg-purple-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <div className="max-w-[1400px] mx-auto space-y-12 relative z-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white">Admin Command</h1>
                        </div>
                        <p className="text-slate-400 text-lg font-light">
                            Overview and management of system resources
                        </p>
                    </div>

                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-slate-300">{user.email}</span>
                            </div>

                            <Button
                                variant="outline"
                                className="border-amber-500/20 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all rounded-full"
                                onClick={handleSendReminders}
                                disabled={isSendingReminders}
                            >
                                {isSendingReminders ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                                Expiry Check
                            </Button>

                            <Button
                                variant="ghost"
                                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full flex items-center gap-2"
                                onClick={async () => {
                                    if (window.confirm("End Session?")) {
                                        await logout();
                                        navigate('/');
                                    }
                                }}
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    )}
                </header>

                {/* KPI Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group rounded-3xl p-[1px] bg-gradient-to-r from-white/10 to-white/5"
                >
                    <div className="relative bg-[#0A0A17]/80 backdrop-blur-xl rounded-3xl p-1 border border-white/5 overflow-hidden">
                        <StatsOverview requests={allRequests} />
                    </div>
                </motion.div>

                {/* Change Credentials Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0f1121]/60 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <KeyRound className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Change Credentials</h2>
                            <p className="text-slate-400 text-xs">Update your admin email or password</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateCredentials} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* New Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> New Email
                                </label>
                                <input
                                    type="email"
                                    value={credEmail}
                                    onChange={e => setCredEmail(e.target.value)}
                                    placeholder={user?.email || 'current@email.com'}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                />
                                <p className="text-xs text-slate-500">Leave blank to keep current email</p>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" /> New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCredPassword ? 'text' : 'password'}
                                        value={credPassword}
                                        onChange={e => setCredPassword(e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCredPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showCredPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500">Leave blank to keep current password</p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" /> Confirm Password
                                </label>
                                <input
                                    type={showCredPassword ? 'text' : 'password'}
                                    value={credConfirm}
                                    onChange={e => setCredConfirm(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
                                />
                                {credPassword && credConfirm && credPassword !== credConfirm && (
                                    <p className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> Passwords do not match</p>
                                )}
                                {credPassword && credConfirm && credPassword === credConfirm && (
                                    <p className="text-xs text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isUpdatingCreds}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                            >
                                {isUpdatingCreds ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating...</>
                                ) : (
                                    <><KeyRound className="w-4 h-4 mr-2" /> Update Credentials</>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Right Panel: User Management (12 cols - Full Width) */}
                    <div className="lg:col-span-12 bg-[#0f1121]/60 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[600px]">

                        {/* Toolbar */}
                        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <User className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">User Database</h2>
                                    <p className="text-slate-400 text-xs">{allRequests.length} registered accounts</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-lg border border-white/5">
                                <Calendar className="w-4 h-4 text-slate-500 ml-2" />
                                <select
                                    value={approvalDuration}
                                    onChange={(e) => setApprovalDuration(e.target.value)}
                                    className="bg-transparent text-sm font-medium text-slate-300 outline-none cursor-pointer py-1 px-2"
                                >
                                    {[1, 2, 3, 6, 12, 24].map(m => (
                                        <option key={m} value={m} className="bg-slate-900">{m} Months Access</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {loadingData ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p>Syncing Database...</p>
                                </div>
                            ) : allRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                                    <User className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No records found.</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {allRequests.map((req, idx) => (
                                        <motion.div
                                            key={req.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group bg-slate-900/40 hover:bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 rounded-2xl p-4 transition-all duration-200"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                {/* User Identity */}
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                                                        ${req.subscription_status === 'active' ? 'bg-gradient-to-tr from-emerald-500 to-green-400 text-black' :
                                                            req.subscription_status === 'disabled' ? 'bg-gradient-to-tr from-red-500 to-rose-400 text-white' :
                                                                'bg-slate-800 text-slate-400 border border-white/10'}`}>
                                                        {req.full_name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                                {req.full_name || 'Anonymous'}
                                                            </h4>
                                                            <div className={`w-2 h-2 rounded-full ${req.subscription_status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                                req.subscription_status === 'disabled' ? 'bg-red-500' : 'bg-amber-500'
                                                                }`} />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                                            <span>{req.email}</span>
                                                            {req.transaction_id && (
                                                                <span className="font-mono bg-white/5 px-1.5 rounded border border-white/5 text-slate-500">
                                                                    #{req.transaction_id.substring(0, 6)}
                                                                </span>
                                                            )}
                                                            {req.payment_proof_url && (
                                                                <button
                                                                    onClick={() => setSelectedProof(req.payment_proof_url)}
                                                                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                                                                >
                                                                    <Image className="w-3 h-3" /> View Proof
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons for Pending Users */}
                                                {req.subscription_status === 'pending' && (
                                                    <div className="flex items-center gap-3 mt-4 md:mt-0">
                                                        <Button
                                                            onClick={() => onHandleRequest(req.id, 'approve', approvalDuration)}
                                                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                                            size="sm"
                                                        >
                                                            <Check className="w-4 h-4 mr-2" /> Accept
                                                        </Button>
                                                        <Button
                                                            onClick={() => onHandleRequest(req.id, 'reject')}
                                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                                                            size="sm"
                                                        >
                                                            <X className="w-4 h-4 mr-2" /> Deny
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500">
                                                <button
                                                    onClick={() => setSelectedClient(req)}
                                                    className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 flex items-center gap-1"
                                                >
                                                    <FileText className="w-3 h-3" /> View Full Details
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Proof Modal */}
            <AnimatePresence>
                {selectedProof && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setSelectedProof(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-5xl max-h-[95vh] rounded-3xl overflow-hidden shadow-2xl bg-[#1a1b2e] border border-white/10 flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-start pointer-events-none">
                                <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10 pointer-events-auto">
                                    Payment Proof Preview
                                </span>
                                <button
                                    onClick={() => setSelectedProof(null)}
                                    className="bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-md transition-all border border-white/10 pointer-events-auto"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-auto flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[#0f1121]">
                                <img
                                    src={selectedProof}
                                    alt="Proof"
                                    className="max-w-full max-h-[85vh] object-contain shadow-2xl"
                                />
                            </div>

                            <div className="p-4 bg-[#1a1b2e] border-t border-white/10 flex justify-center gap-4">
                                <a
                                    href={selectedProof}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/5"
                                >
                                    <Maximize2 className="w-4 h-4" /> Open Full Resolution
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Client Details Modal */}
            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedClient(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0f1121] border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1">Client Profile</h2>
                                    <p className="text-slate-400 text-sm">Full registration details</p>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs uppercase font-bold text-indigo-400 mb-1">Account Type</p>
                                        <p className="text-white capitalize font-medium">{selectedClient.company_gst ? 'Company' : 'Individual'}</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-xs uppercase font-bold text-indigo-400 mb-1">Status</p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedClient.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            {selectedClient.subscription_status?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {selectedClient.company_name && (
                                    <div className="space-y-4 border-t border-white/10 pt-4">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Company Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Company Name</p>
                                                <p className="text-white font-medium">{selectedClient.company_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">GSTIN</p>
                                                <p className="text-white font-mono">{selectedClient.company_gst || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4 border-t border-white/10 pt-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact & Address</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Email</p>
                                            <p className="text-white">{selectedClient.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">Phone</p>
                                            <p className="text-white font-mono">{selectedClient.company_phone || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-slate-500 mb-1">Address</p>
                                            <p className="text-white leading-relaxed">{selectedClient.company_address || 'No address provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Proof Section */}
                                {selectedClient.payment_proof_url && (
                                    <div className="space-y-4 border-t border-white/10 pt-4">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Proof</h3>
                                        <div className="bg-black/40 rounded-xl overflow-hidden border border-white/10 p-2">
                                            <img
                                                src={selectedClient.payment_proof_url}
                                                alt="Payment Proof"
                                                className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
