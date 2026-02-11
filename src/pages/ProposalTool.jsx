import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import ProposalGenerator from '@/components/ProposalGenerator';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProposalTool = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [accessStatus, setAccessStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Check Profile Status
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('subscription_status, role')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (profile.role === 'admin' || profile.subscription_status === 'active') {
                    setAccessStatus('allowed');
                } else {
                    setAccessStatus('denied');
                }
            } catch (error) {
                console.error('Access Check Error:', error);
                setAccessStatus('denied'); // Default to deny on error for safety
            }
        };

        if (!loading && !user) {
            // Redirect to login with a 'redirect' param so getting back is automatic
            navigate('/login?mode=login&redirect=/proposal-tool');
        } else if (user) {
            checkAccess();
        }
    }, [user, loading, navigate]);

    if (loading || accessStatus === 'checking') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (accessStatus === 'denied') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
                        <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert className="w-8 h-8 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">Access Restricted</h2>
                        <p className="text-slate-500 mb-8">
                            Your account is currently pending validation or inactive.
                            The Proposal Generator tool is available only to active subscribers.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => navigate('/client-profile')} variant="outline" className="w-full">
                                Check Subscription Status
                            </Button>
                            <Button onClick={() => navigate('/')} variant="ghost" className="w-full text-slate-400">
                                Return Home
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <ProposalGenerator />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProposalTool;
