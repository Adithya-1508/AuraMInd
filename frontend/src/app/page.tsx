'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Zap, Lock, ChevronRight, Github, Database, Search, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export default function LandingPage() {
    return (
        <div aria-label="Secure Landing Page" className="min-h-screen bg-background text-foreground overflow-hidden relative font-sans">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-dot-pattern pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass-dark border-b border-white/5 px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <ShieldCheck className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">AuraMind</span>
                </div>
                <div className="flex items-center gap-8">
                    <Link id="navbar-signin-link" href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Sign In</Link>
                    <Link id="navbar-get-started-btn" href="/register" className="bg-white text-background text-sm font-bold px-6 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl">
                        Get Started
                    </Link>
                </div>
            </nav>

            <main className="relative pt-32 pb-20">
                {/* Hero */}
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                            <Sparkles className="w-3.5 h-3.5" />
                            Intelligence Reimagined
                        </div>

                        <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                            Smarter <br />
                            <span className="text-gradient">Knowledge.</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
                            Transform your static PDF documents into a dynamic, local knowledge base. Secure, private, and powered by AI.
                        </p>

                        <div className="flex items-center gap-5 pt-4">
                            <Link id="hero-get-started-btn" href="/register" className="bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all shadow-2xl shadow-primary/40 hover:-translate-y-1 active:scale-95">
                                Get Started <ChevronRight className="w-6 h-6" />
                            </Link>
                            <button id="hero-github-btn" className="glass px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 hover:bg-white/5 transition-all text-white active:scale-95">
                                <Github className="w-6 h-6" /> Open Source
                            </button>
                        </div>

                        <div className="flex items-center gap-8 pt-8 border-t border-white/5">
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-white">Ollama</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Local ML Engine</p>
                            </div>
                            <div className="w-px h-10 bg-white/5" />
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-white">ChromaDB</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vector Storage</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1, type: "spring" }}
                        className="relative hidden lg:block"
                    >
                        {/* Visual Terminal/Dashboard Mockup */}
                        <div className="glass-dark rounded-[2.5rem] p-4 shadow-2xl relative z-10 border-white/10 overflow-hidden group">
                            <div className="bg-slate-950 rounded-[2rem] p-8 border border-white/5 aspect-square flex flex-col gap-6 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-500 font-mono">localhost:3000</div>
                                </div>

                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="h-8 w-1/2 bg-white/5 rounded-lg animate-pulse" />
                                    <div className="h-32 w-full bg-primary/5 rounded-2xl border border-primary/20 flex items-center justify-center">
                                        <Database className="w-12 h-12 text-primary opacity-20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                                        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                                    </div>
                                    <div className="mt-auto flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse" />
                                        <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4 }}
                                    className="absolute top-20 -right-10 glass p-4 rounded-2xl shadow-2xl border-primary/30 w-48"
                                >
                                    <p className="text-[10px] font-bold text-primary uppercase mb-2">Analysis Complete</p>
                                    <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-primary" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ repeat: Infinity, duration: 5 }}
                                    className="absolute bottom-20 -left-10 glass p-4 rounded-2xl shadow-2xl border-secondary/30 w-48"
                                >
                                    <p className="text-[10px] font-bold text-secondary uppercase mb-2">Vector Search</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-4 w-4 bg-secondary/20 rounded-sm" />)}
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                    </motion.div>
                </div>

                {/* Feature Grid */}
                <div className="max-w-7xl mx-auto px-8 mt-48 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FeatureCard
                        icon={<Search className="w-6 h-6" />}
                        title="Semantic Search"
                        description="Find answers based on meaning, not just keywords. Powered by ChromaDB embeddings."
                        color="primary"
                    />
                    <FeatureCard
                        icon={<Lock className="w-6 h-6" />}
                        title="Fully Private"
                        description="No data sent to the cloud. Process all your sensitive enterprise data locally on your machine."
                        color="secondary"
                    />
                    <FeatureCard
                        icon={<MessageSquare className="w-6 h-6" />}
                        title="Chat-to-Doc"
                        description="Interactive conversation with your PDFs. Get instant summaries and cited answers."
                        color="primary"
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 text-center text-slate-500 text-sm">
                <p>© 2025 AuraMind - Built for Privacy & Speed</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, color }: { icon: any, title: string, description: string, color: 'primary' | 'secondary' }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass p-10 rounded-[2.5rem] space-y-6 hover:bg-white/5 transition-all border-white/5 group"
        >
            <div className={`w-14 h-14 rounded-2xl bg-${color}/10 flex items-center justify-center text-${color} group-hover:scale-110 transition-all shadow-inner`}>
                {icon}
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
            </div>
        </motion.div>
    );
}
