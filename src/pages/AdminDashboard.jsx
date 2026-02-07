import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, ArrowLeft, Loader2, Upload, QrCode, Check, AlertTriangle, X, User, FileText, Image, Maximize2, Shield, Calendar, CreditCard, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import StatsOverview from '@/components/admin/StatsOverview';
import { getRegistrationFee, updateRegistrationFee } from '@/lib/settingsService';
import { checkAndSendReminders } from '@/lib/emailService';

const AdminDashboard = () => {
    const { user, handleRequest, getQRCode, updateQRCode, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [allRequests, setAllRequests] = useState([]);
    const [qrUrl, setQrUrl] = useState('');
    const [isUpdatingQr, setIsUpdatingQr] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const [loadingData, setLoadingData] = useState(true);
    const [approvalDuration, setApprovalDuration] = useState(12);
    const [isSendingReminders, setIsSendingReminders] = useState(false);

    const [currentFee, setCurrentFee] = useState('69.00');

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

    const onUpdateQr = (file) => {
        setIsUpdatingQr(true);
        updateQRCode(file).then((result) => {
            if (result.success) {
                toast({ title: "QR Code Updated", description: "New payment QR code is now live." });
                setQrUrl(result.url);
            } else {
                toast({ title: "Update Failed", description: result.error, variant: "destructive" });
            }
            setIsUpdatingQr(false);
        });
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

    return (
        <div className="min-h-screen bg-[#050510] text-white p-6 sm:p-10 font-sans selection:bg-purple-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 opacity-[0.03] mix-blend-overlay"></div>
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
                                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full"
                                onClick={async () => {
                                    if (window.confirm("End Session?")) {
                                        await logout();
                                        navigate('/');
                                    }
                                }}
                            >
                                <X className="w-5 h-5" />
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

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Panel: Configuration (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Payment QR Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-[#0f1121]/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-indigo-400" /> Payment Gate
                                </h3>
                                <div className="w-2 h-2 rounded-full bg-indigo-500 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-shadow"></div>
                            </div>

                            <div className="relative aspect-square bg-gradient-to-br from-white/5 to-transparent rounded-2xl flex items-center justify-center border border-white/5 p-4 mb-4 overflow-hidden">
                                {qrUrl ? (
                                    <img src={qrUrl} alt="QR" className="w-full h-full object-contain drop-shadow-2xl" />
                                ) : (
                                    <div className="text-center text-slate-500 text-sm">No QR Configured</div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                    <p className="text-white font-medium">Payment QR</p>
                                </div>
                            </div>

                            <label className="block">
                                <span className="sr-only">Upload QR</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && onUpdateQr(e.target.files[0])}
                                    className="block w-full text-sm text-slate-400
                                    file:mr-4 file:py-2.5 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-indigo-600 file:text-white
                                    hover:file:bg-indigo-500
                                    cursor-pointer ring-1 ring-white/10 rounded-full bg-black/20"
                                />
                            </label>
                        </motion.div>

                        {/* Settings Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-[#0f1121]/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-purple-400" />
                                <h3 className="text-xl font-bold">Billing Config</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Registration Fee (₹)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                            <input
                                                type="number"
                                                value={currentFee}
                                                onChange={(e) => setCurrentFee(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white font-mono focus:border-purple-500/50 outline-none transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <Button
                                            onClick={async () => {
                                                const res = await updateRegistrationFee(currentFee);
                                                if (res.success) toast({ title: "Updated", description: "Fee updated in database." });
                                                else toast({ title: "Error", description: "Update failed.", variant: "destructive" });
                                            }}
                                            className="bg-purple-600 hover:bg-purple-500 px-6 rounded-xl"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Panel: User Management (8 cols) */}
                    <div className="lg:col-span-8 bg-[#0f1121]/60 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-[600px]">

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

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                                                    {req.subscription_status === 'pending' ? (
                                                        <>
                                                            <Button size="sm" variant="ghost" className="h-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => onHandleRequest(req.id, 'reject')}>
                                                                Dismiss
                                                            </Button>
                                                            <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20" onClick={() => onHandleRequest(req.id, 'approve', approvalDuration)}>
                                                                <Check className="w-3.5 h-3.5 mr-1.5" /> Approve
                                                            </Button>
                                                        </>
                                                    ) : req.subscription_status === 'active' ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right hidden sm:block">
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-500">Expires</p>
                                                                <p className="text-xs font-medium text-emerald-400">
                                                                    {new Date(req.subscription_end).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <Button size="sm" variant="outline" className="h-8 border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-black" onClick={() => onHandleRequest(req.id, 'disable')}>
                                                                Suspend
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="h-8 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-black" onClick={() => onHandleRequest(req.id, 'enable', approvalDuration)}>
                                                            Re-Enable
                                                        </Button>
                                                    )}
                                                </div>
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
        </div>
    );
};

export default AdminDashboard;
