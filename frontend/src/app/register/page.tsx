'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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
            setError('passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/auth/register', { email, password });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'registration failed. please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.35] pointer-events-none" />

            <Link href="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4" /> cd ~
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md panel-2 box-glow relative z-10"
            >
                <div className="flex items-center gap-2 px-4 h-10 border-b border-line bg-surface">
                    <span className="tui-dot bg-danger" />
                    <span className="tui-dot bg-secondary" />
                    <span className="tui-dot bg-primary" />
                    <span className="ml-2 text-xs text-muted">secure-shell — provision</span>
                </div>

                <div className="p-7 sm:p-8">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="ok"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-10 flex flex-col items-center text-center gap-5"
                            >
                                <CheckCircle2 className="w-14 h-14 text-primary glow" />
                                <div>
                                    <h3 className="text-xl font-bold text-foreground mb-1">account provisioned.</h3>
                                    <p className="text-sm text-muted">redirecting to ./login<span className="caret" /></p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="form" exit={{ opacity: 0, scale: 0.98 }}>
                                <p className="text-xs text-muted mb-1.5">auramind · register</p>
                                <h1 className="text-2xl font-bold text-primary glow-soft mb-1.5">
                                    create operator<span className="caret" />
                                </h1>
                                <p className="text-sm text-muted mb-7">
                                    <span className="text-secondary">note:</span> first account is provisioned as admin.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="register-email-input" className="block text-xs text-muted mb-1.5">
                                            <span className="text-secondary">&gt;</span> email
                                        </label>
                                        <input
                                            id="register-email-input"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@org.com"
                                            className="w-full bg-surface-2 border border-line focus:border-primary caret-primary text-foreground px-3.5 py-2.5 outline-none transition-colors placeholder:text-muted/50"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="register-password-input" className="block text-xs text-muted mb-1.5">
                                            <span className="text-secondary">&gt;</span> password
                                        </label>
                                        <input
                                            id="register-password-input"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-surface-2 border border-line focus:border-primary caret-primary text-foreground px-3.5 py-2.5 outline-none transition-colors placeholder:text-muted/50"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="register-confirm-password-input" className="block text-xs text-muted mb-1.5">
                                            <span className="text-secondary">&gt;</span> confirm
                                        </label>
                                        <input
                                            id="register-confirm-password-input"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full bg-surface-2 border border-line focus:border-primary caret-primary text-foreground px-3.5 py-2.5 outline-none transition-colors placeholder:text-muted/50"
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-danger text-sm border border-danger/30 bg-danger/5 px-3 py-2"
                                        >
                                            <span className="font-bold">!</span> {error}
                                        </motion.p>
                                    )}

                                    <button
                                        id="register-submit-btn"
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-background font-bold py-3 hover:bg-primary-dark transition-colors box-glow flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {loading
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> provisioning...</>
                                            : <>[ create account ] <ArrowRight className="w-4 h-4" /></>}
                                    </button>
                                </form>

                                <p className="text-sm text-muted mt-6 text-center">
                                    already registered?{' '}
                                    <Link href="/login" className="text-primary hover:underline underline-offset-4">./login</Link>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
