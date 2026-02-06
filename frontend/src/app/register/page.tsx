'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserPlus, Mail, Lock, Loader2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Metadata } from 'next';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/auth/register', {
                email,
                password,
            });
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background relative font-sans overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <Link href="/" className="absolute top-12 left-12 flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all">
                    <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <span className="font-black text-xl tracking-tighter text-white">SOCGuard</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="glass-dark p-12 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-white/5 space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white tracking-tighter">Join Us.</h1>
                        <p className="text-lg text-slate-500 font-medium">
                            Create your secure identifier to access local AI.
                            <br /><span className="text-slate-400">First user registered will be the System Admin.</span>
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white">Account Created.</h3>
                                    <p className="text-slate-400">Redirecting you to the login gateway...</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                className="space-y-6"
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="space-y-2.5">
                                    <label htmlFor="register-email-input" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Corporate Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            id="register-email-input"
                                            type="email"
                                            required
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-base font-medium text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-700"
                                            placeholder="name@organization.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label htmlFor="register-password-input" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Secure Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            id="register-password-input"
                                            type="password"
                                            required
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-base font-medium text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-700 shadow-inner"
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label htmlFor="register-confirm-password-input" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            id="register-confirm-password-input"
                                            type="password"
                                            required
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-base font-medium text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-700 shadow-inner"
                                            placeholder="••••••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="pt-4 space-y-6">
                                    <button
                                        id="register-submit-btn"
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-white hover:bg-white/90 text-background font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-white/5 shadow-2xl active:scale-95 disabled:opacity-20 hover:-translate-y-1"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Register Account <ArrowRight className="w-5 h-5" /></>}
                                    </button>

                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-500">
                                            Already have an account?{' '}
                                            <Link href="/login" className="text-white hover:text-primary transition-colors font-bold underline underline-offset-4">
                                                Sign In here
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                        Protected by internal encryption • SOC-2 Compliant Storage
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
