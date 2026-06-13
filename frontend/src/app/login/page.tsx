'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Loader2, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/api/auth/login', formData);
            login(response.data.access_token);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'invalid email or password');
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
                    <span className="ml-2 text-xs text-muted">secure-shell — auth</span>
                </div>

                <div className="p-7 sm:p-8">
                    <p className="text-xs text-muted mb-1.5">auramind · login</p>
                    <h1 className="text-2xl font-bold text-primary glow-soft mb-1.5">
                        authenticate<span className="caret" />
                    </h1>
                    <p className="text-sm text-muted mb-7">access your private knowledge base.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="login-email-input" className="block text-xs text-muted mb-1.5">
                                <span className="text-secondary">&gt;</span> email
                            </label>
                            <input
                                id="login-email-input"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@org.com"
                                className="w-full bg-surface-2 border border-line focus:border-primary caret-primary text-foreground px-3.5 py-2.5 outline-none transition-colors placeholder:text-muted/50"
                            />
                        </div>

                        <div>
                            <label htmlFor="login-password-input" className="block text-xs text-muted mb-1.5">
                                <span className="text-secondary">&gt;</span> password
                            </label>
                            <input
                                id="login-password-input"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            id="login-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-background font-bold py-3 hover:bg-primary-dark transition-colors box-glow flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> authenticating...</>
                                : <>[ authenticate ] <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    </form>

                    <p className="text-sm text-muted mt-6 text-center">
                        no account?{' '}
                        <Link href="/register" className="text-primary hover:underline underline-offset-4">./register</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
