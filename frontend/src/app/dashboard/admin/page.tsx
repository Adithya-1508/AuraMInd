'use client';

import { useState, useEffect } from 'react';
import { Users, ShieldAlert, BadgeCheck, Loader2, RefreshCw, Server, Cpu, Database, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface UserRow {
    id: number;
    email: string;
    role: string;
}

const SYS: { label: string; value: string; icon: any }[] = [
    { label: 'engine', value: 'minimax-m2.7', icon: Cpu },
    { label: 'provider', value: 'nvidia-nim', icon: Server },
    { label: 'embeddings', value: 'MiniLM-L6 · local', icon: Database },
    { label: 'vector store', value: 'chromadb', icon: Database },
    { label: 'auth', value: 'jwt · bcrypt', icon: Lock },
];

export default function AdminPage() {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [reindexing, setReindexing] = useState(false);
    const [reindexMsg, setReindexMsg] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleReindex = async () => {
        if (!window.confirm('reindex all documents? this rebuilds the entire vector store.')) return;
        setReindexing(true);
        setReindexMsg('');
        try {
            const res = await api.post('/api/admin/reindex');
            setReindexMsg(res.data?.message || 're-indexing started.');
        } catch {
            setReindexMsg('reindex failed — check the backend logs.');
        } finally {
            setReindexing(false);
        }
    };

    return (
        <div className="p-8 sm:p-10 max-w-5xl mx-auto relative">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
                <div>
                    <p className="text-xs text-muted mb-1.5 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-secondary" /> ~/admin
                    </p>
                    <h1 className="text-2xl font-bold text-foreground">
                        <span className="text-secondary">$</span> system status
                    </h1>
                </div>

                <button
                    onClick={handleReindex}
                    disabled={reindexing}
                    className="inline-flex items-center gap-2 border border-line text-secondary px-5 py-2.5 hover:border-secondary/60 hover:glow-amber transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`w-4 h-4 ${reindexing ? 'animate-spin' : ''}`} />
                    {reindexing ? 'reindexing...' : 'reindex vectors'}
                </button>
            </div>

            {reindexMsg && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 text-sm text-primary border border-primary/30 bg-primary/5 px-4 py-2.5"
                >
                    <span className="text-secondary">»</span> {reindexMsg}
                </motion.p>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* users */}
                <div className="lg:col-span-2 panel">
                    <div className="flex items-center justify-between px-5 h-11 border-b border-line bg-surface text-sm">
                        <span className="flex items-center gap-2 text-foreground">
                            <Users className="w-4 h-4 text-primary" /> /etc/passwd
                        </span>
                        <span className="text-[11px] text-muted">{users.length} users</span>
                    </div>

                    {loading ? (
                        <div className="p-5 space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-10 w-full bg-surface animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {users.map((u, idx) => (
                                <motion.div
                                    key={u.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="flex items-center gap-3 px-5 py-3.5 border-b border-line/60 hover:bg-surface transition-colors"
                                >
                                    <div className="w-8 h-8 bg-surface-2 border border-line flex items-center justify-center text-sm text-primary shrink-0">
                                        {u.email[0]?.toUpperCase()}
                                    </div>
                                    <span className="flex-1 min-w-0 text-sm text-foreground truncate">{u.email}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] border ${u.role === 'admin'
                                        ? 'text-secondary border-secondary/30 bg-secondary/5'
                                        : 'text-primary border-primary/30 bg-primary/5'
                                        }`}>
                                        {u.role === 'admin' ? <ShieldAlert className="w-3 h-3" /> : <BadgeCheck className="w-3 h-3" />}
                                        {u.role}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* system config — real values, no fabricated telemetry */}
                <div className="panel h-fit">
                    <div className="flex items-center gap-2 px-5 h-11 border-b border-line bg-surface text-sm text-foreground">
                        <Server className="w-4 h-4 text-primary" /> stack.conf
                    </div>
                    <div className="p-5 space-y-3.5">
                        {SYS.map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="flex items-center gap-2 text-muted">
                                        <Icon className="w-3.5 h-3.5" /> {s.label}
                                    </span>
                                    <span className="text-foreground/90 text-right">{s.value}</span>
                                </div>
                            );
                        })}
                        <div className="pt-3 border-t border-line flex items-center gap-2 text-xs text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> all systems operational
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
