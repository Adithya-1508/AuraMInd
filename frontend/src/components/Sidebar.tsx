'use client';

import { useAuth } from '@/context/AuthContext';
import { Plus, Database, LogOut, Settings, MessageSquare, History, Terminal } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
                console.error('Failed to fetch history', err);
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
            console.error('Failed to create chat', err);
        }
    };

    return (
        <aside className="w-72 glass-dark border-r border-line flex flex-col h-screen sticky top-0 z-40">
            {/* header */}
            <div className="px-5 h-14 flex items-center gap-2.5 border-b border-line shrink-0">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="font-bold text-primary tracking-tight glow-soft">auramind</span>
                <span className="text-[11px] text-muted ml-auto">v0.1.0</span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
                <button
                    onClick={createNewChat}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-primary border border-line hover:border-primary/60 hover:box-glow transition-all text-sm mb-5"
                >
                    <Plus className="w-4 h-4" /> new session
                </button>

                <p className="text-[11px] text-muted px-1 mb-2 flex items-center gap-1.5">
                    <History className="w-3 h-3" /> ~/sessions
                </p>

                <div className="space-y-0.5">
                    {loadingHistory ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-8 w-full bg-surface animate-pulse" />
                        ))
                    ) : conversations.length === 0 ? (
                        <p className="text-[11px] text-muted px-2 py-3">// empty — no sessions yet</p>
                    ) : (
                        conversations.map((conv) => {
                            const isActive = pathname === '/dashboard' && currentConvId === conv.id.toString();
                            return (
                                <button
                                    key={conv.id}
                                    onClick={() => router.push(`/dashboard?convId=${conv.id}`)}
                                    className={`w-full text-left px-2.5 py-2 flex items-center gap-2 text-sm transition-colors group ${isActive
                                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                                        : 'text-muted hover:text-foreground hover:bg-surface border-l-2 border-transparent'
                                        }`}
                                >
                                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                                    <span className="truncate">{conv.title}</span>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="h-px bg-line my-5" />

                <p className="text-[11px] text-muted px-1 mb-2">/mnt</p>
                <button
                    onClick={() => router.push('/dashboard/documents')}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-sm transition-colors border-l-2 ${pathname === '/dashboard/documents'
                        ? 'bg-primary/10 text-primary border-primary'
                        : 'text-muted hover:text-foreground hover:bg-surface border-transparent'
                        }`}
                >
                    <Database className="w-4 h-4" /> knowledge-base
                </button>

                {user?.role === 'admin' && (
                    <button
                        onClick={() => router.push('/dashboard/admin')}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-sm transition-colors border-l-2 ${pathname === '/dashboard/admin'
                            ? 'bg-secondary/10 text-secondary border-secondary'
                            : 'text-muted hover:text-foreground hover:bg-surface border-transparent'
                            }`}
                    >
                        <Settings className="w-4 h-4" /> sudo · admin
                    </button>
                )}
            </div>

            {/* user footer */}
            <div className="border-t border-line p-3 shrink-0">
                <div className="flex items-center gap-2.5 px-1">
                    <div className="w-8 h-8 bg-surface-2 border border-line flex items-center justify-center text-sm text-primary shrink-0">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{user?.email?.split('@')[0] || 'user'}</p>
                        <p className="text-[11px] text-muted">
                            <span className="text-secondary">{user?.role === 'admin' ? 'root' : 'user'}</span>@local
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        aria-label="Log out"
                        className="p-2 text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
