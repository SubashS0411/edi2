import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield, Calendar, Key, LogOut, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/customSupabaseClient';

const ClientProfile = () => {
    const { user, logout, resetPassword } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/signup?mode=client-login');
            return;
        }
        fetchProfile();
    }, [user, navigate]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast({
                title: 'Error',
                description: 'Failed to load profile data.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;

        toast({
            title: "Sending Reset Link...",
            description: "Please wait.",
        });

        const res = await resetPassword(user.email);
        if (res.success) {
            toast({
                title: "Email Sent",
                description: "Check your inbox for the password reset link.",
                className: "bg-emerald-500 text-white border-none",
            });
        } else {
            toast({
                title: "Error",
                description: res.error,
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
                    >
                        {/* Header */}
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                                            <User className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <h1 className="text-2xl font-bold">Client Profile</h1>
                                    </div>
                                    <p className="text-slate-400">{user.email}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => { logout(); navigate('/'); }}
                                    className="bg-white/10 hover:bg-white/20 text-white border-white/10"
                                >
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </Button>
                            </div>
                        </div>

                        {/* Status Section */}
                        <div className="p-8 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-600" /> Subscription Status
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Status</p>
                                    <div className="flex items-center gap-2">
                                        {profile?.subscription_status === 'active' ? (
                                            <>
                                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                                                <span className="text-xl font-black text-emerald-600 capitalize">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                                                <span className="text-xl font-black text-amber-600 capitalize">{profile?.subscription_status || 'Pending'}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activation Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <span className="text-lg font-semibold text-slate-700">
                                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valid Until</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <span className="text-lg font-semibold text-slate-700">
                                            {/* Placeholder for real subscription end logic if available, else standard 1 year or manual */}
                                            {profile?.subscription_end ? new Date(profile.subscription_end).toLocaleDateString() : 'See Plan Details'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="p-8 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Key className="w-5 h-5 text-emerald-600" /> Account Security
                            </h2>

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Reset Password</h3>
                                    <p className="text-sm text-slate-500">Receive a link via email to update your secure access key.</p>
                                </div>
                                <Button onClick={handlePasswordReset} variant="outline" className="border-slate-300 hover:bg-slate-50">
                                    Send Reset Link
                                </Button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ClientProfile;
