'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, Trash2, UserPlus, Mail, ShieldAlert, BadgeCheck, Loader2, BarChart3, Activity, Server, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface User {
    id: number;
    email: string;
    role: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="p-12 max-w-7xl mx-auto space-y-12 font-sans relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-bold uppercase tracking-widest">
                        <Shield className="w-3.5 h-3.5" />
                        System Governance
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter">Master Control</h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl">
                        Real-time infrastructure monitoring and enterprise user access management.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button id="admin-audit-logs-btn" className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-white/5 active:scale-95 shadow-xl">
                        <Activity className="w-5 h-5 text-secondary" />
                        <span>Audit Logs</span>
                    </button>
                    <button id="admin-provision-user-btn" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-primary/20 shadow-2xl active:scale-95 hover:-translate-y-1">
                        <UserPlus className="w-5 h-5" />
                        <span>Provision User</span>
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                {/* User Table (Span 2) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
                        <div className="p-8 border-b border-white/5 bg-white/2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="text-primary w-6 h-6" />
                                <h2 className="text-2xl font-black text-white tracking-tight">Access Directory</h2>
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                                {users.length} Active Sessions
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                        <th className="px-10 py-6">Identity</th>
                                        <th className="px-10 py-6">Entitlement</th>
                                        <th className="px-10 py-6 text-right">Safety Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/2">
                                    <AnimatePresence>
                                        {users.map((u, idx) => (
                                            <motion.tr
                                                key={u.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-white/[0.03] transition-colors group"
                                            >
                                                <td className="px-10 py-7">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-lg text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-all border border-white/5">
                                                            {u.email[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-lg text-white group-hover:translate-x-1 transition-transform">{u.email}</p>
                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Last seen: Recently</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${u.role === 'admin'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        }`}>
                                                        {u.role === 'admin' ? <ShieldAlert className="w-3.5 h-3.5" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                                                        {u.role}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-7 text-right">
                                                    <button className="p-3 text-slate-600 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10 active:scale-95">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            {loading && (
                                <div className="py-32 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Compiling Records...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Health (Span 1) */}
                <div className="space-y-8 flex flex-col">
                    <HealthCard
                        title="Model Infrastructure"
                        icon={<Server className="w-6 h-6" />}
                        metrics={[
                            { label: 'Ollama Engine', value: 'Active', status: 'emerald' },
                            { label: 'Llama3 (8B)', value: 'Loaded', status: 'emerald' },
                            { label: 'VRAM Usage', value: '4.2 GB', status: 'primary' }
                        ]}
                    />

                    <HealthCard
                        title="Security Mesh"
                        icon={<Zap className="w-6 h-6" />}
                        metrics={[
                            { label: 'JWT Protocol', value: 'HS256', status: 'emerald' },
                            { label: 'Threat Guard', value: 'Bypassed', status: 'primary' },
                            { label: 'Vector Store', value: 'Isolated', status: 'emerald' }
                        ]}
                    />

                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-primary/10 to-transparent flex flex-col items-center text-center gap-4 mt-auto">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white flex items-center justify-center shadow-2xl">
                            <BarChart3 className="text-background w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-white tracking-tight">System Report</p>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"Infrastructure is operating at 99.9% retrieval accuracy."</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HealthCard({ title, icon, metrics }: any) {
    return (
        <div className="glass p-8 rounded-[2.5rem] space-y-8 border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5 shadow-inner">
                    {icon}
                </div>
                <h3 className="text-lg font-black text-white tracking-tight leading-tight">{title}</h3>
            </div>
            <div className="space-y-5">
                {metrics.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between items-center group">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors uppercase">{m.label}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-${m.status}-500/5 text-${m.status}-400 border-${m.status}-500/20`}>
                            {m.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
