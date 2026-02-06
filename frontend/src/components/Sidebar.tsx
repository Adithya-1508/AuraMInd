'use client';

import { useAuth } from '@/context/AuthContext';
import {
    MessageSquare,
    FileText,
    Settings,
    LogOut,
    Sparkles,
    ChevronRight,
    Database,
    BarChart3,
    Search,
    Plus,
    History,
    Loader2
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentConvId = searchParams.get('convId');
    const [conversations, setConversations] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setLoadingHistory(true);
            try {
                const res = await api.get('/api/history/conversations');
                setConversations(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoadingHistory(false);
            }
        };
        fetchHistory();
    }, [user]);

    const createNewChat = async () => {
        try {
            const res = await api.post('/api/history/conversations', null, { params: { title: 'New Conversation' } });
            setConversations([res.data, ...conversations]);
            router.push(`/dashboard?convId=${res.data.id}`);
        } catch (err) {
            console.error("Failed to create chat", err);
        }
    };

    return (
        <aside className="w-80 glass-dark border-r border-white/5 flex flex-col h-screen sticky top-0 font-sans z-50">
            <div className="p-10">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 group overflow-hidden relative border border-white/10">
                        <Sparkles className="text-white w-7 h-7 relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <span className="font-black text-2xl tracking-tighter text-white block leading-none">AuraMind</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Local Intelligence</span>
                    </div>
                </div>

                <nav className="space-y-3">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4 mb-4">Core Fleet</p>
                    <button
                        onClick={createNewChat}
                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all mb-6 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        <span className="font-bold text-sm tracking-tight text-white">New Conversation</span>
                    </button>

                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4 mb-4 mt-8 flex items-center gap-2">
                        <History className="w-3 h-3" /> Recent History
                    </p>
                    <div className="space-y-1 max-h-[40vh] overflow-y-auto custom-scrollbar px-2">
                        {loadingHistory ? (
                            <div className="space-y-2 p-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-[10px] text-slate-600 font-bold uppercase p-4 text-center">No history yet</p>
                        ) : (
                            conversations.map((conv) => {
                                const isActive = pathname === '/dashboard' && currentConvId === conv.id.toString();
                                return (
                                    <button
                                        key={conv.id}
                                        onClick={() => router.push(`/dashboard?convId=${conv.id}`)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all group flex items-center gap-3 ${isActive
                                            ? "bg-white/10 text-white"
                                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4 opacity-50 flex-shrink-0" />
                                        <span className="truncate text-sm font-medium">{conv.title}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    <div className="h-px bg-white/5 my-8" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4 mb-4">Library</p>
                    <button
                        onClick={() => router.push('/dashboard/documents')}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${pathname === '/dashboard/documents'
                            ? "bg-white text-background shadow-xl"
                            : "text-slate-500 hover:text-slate-200"
                            }`}
                    >
                        <Database className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-tight">Knowledge Base</span>
                    </button>
                </nav>
            </div>

            <div className="mt-auto p-10 space-y-8">
                {user?.role === 'admin' && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4 mb-4">Master Control</p>
                        <button
                            onClick={() => router.push('/dashboard/admin')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-secondary hover:bg-secondary/10 transition-all border border-transparent ${pathname === '/dashboard/admin' ? "bg-secondary/10 border-secondary/20" : ""
                                }`}
                        >
                            <Settings className="w-5 h-5 flex-shrink-0" />
                            <span className="font-bold text-sm tracking-tight">System Admin</span>
                        </button>
                    </div>
                )}

                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-4 bg-white/2 p-4 rounded-3xl border border-white/5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-lg font-black text-slate-400 border border-white/10 shadow-xl">
                            {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-white truncate text-sm">{user?.email?.split('@')[0] || 'User'}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{user?.role || 'user'}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
