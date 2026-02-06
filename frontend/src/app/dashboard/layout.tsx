'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, loading] = [useAuth().user, useAuth().loading];
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center font-sans">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl border-2 border-primary border-t-transparent animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                        </div>
                    </div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] animate-pulse">Initializing Interface</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex text-slate-200 selection:bg-primary/30 font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Background Patterns */}
                <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

                <div className="relative flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
}
