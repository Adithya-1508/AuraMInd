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
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-sm text-muted">
                    <span className="text-secondary">aura@kb:~$</span>{' '}
                    <span className="text-foreground">init session</span>
                    <span className="caret" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex text-foreground selection:bg-primary/30">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-[0.25] pointer-events-none" />
                <div className="relative flex-1 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
