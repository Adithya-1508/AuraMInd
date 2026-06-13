'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Terminal, Database, Zap, ShieldCheck, FileText, Cpu,
    ArrowRight, ChevronRight, GitBranch, Lock
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* typewriter — types a string char-by-char, respects reduced motion  */
/* ------------------------------------------------------------------ */
function useTypewriter(text: string, speed = 18, startDelay = 700) {
    const [out, setOut] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setOut(text); setDone(true); return; }

        let i = 0;
        let tick: ReturnType<typeof setTimeout>;
        const begin = setTimeout(function step() {
            i++;
            setOut(text.slice(0, i));
            if (i < text.length) tick = setTimeout(step, speed);
            else setDone(true);
        }, startDelay);

        return () => { clearTimeout(begin); clearTimeout(tick); };
    }, [text, speed, startDelay]);

    return { out, done };
}

const BOOT_LINES = [
    'mount /knowledge ............ ok',
    'load embeddings · MiniLM-L6 . ok',
    'vector store · chroma ....... ok',
    'engine · minimax-m2.7@nim ... ok',
];

const MODULES = [
    { idx: '01', icon: Database, label: 'retrieval', body: 'Local SentenceTransformers index. Sub-second semantic search over your private corpus — no document text leaves for embedding.' },
    { idx: '02', icon: Zap, label: 'streaming', body: 'Answers stream token-by-token over Server-Sent Events. First words land instantly; the cursor never stalls.' },
    { idx: '03', icon: Cpu, label: 'engine', body: 'NVIDIA NIM · MiniMax M2.7 by default. Swap to Kimi K2.6 with one env var — the provider is just config.' },
    { idx: '04', icon: ShieldCheck, label: 'access', body: 'JWT-secured sessions, bcrypt-hashed credentials, role-based admin. First user provisioned as operator.' },
    { idx: '05', icon: FileText, label: 'citations', body: 'Every answer is grounded. Source filename and page travel with each chunk and surface as footnotes.' },
    { idx: '06', icon: GitBranch, label: 'memory', body: 'Full conversation history persisted to SQLite. Resume any thread; nothing is forgotten between sessions.' },
];

const PIPELINE = ['pdf', 'chunk', 'embed·MiniLM', 'chroma', 'retrieve', 'minimax-m2.7', 'stream'];

const SPECS: [string, string][] = [
    ['frontend', 'next.js 16 · tailwind v4 · motion'],
    ['backend', 'fastapi · sqlalchemy · pydantic'],
    ['vector', 'chromadb · all-MiniLM-L6-v2 (384d)'],
    ['engine', 'nvidia nim · minimax-m2.7 (swappable)'],
    ['security', 'jwt · bcrypt · role-based access'],
    ['privacy', 'local embeddings · hosted generation'],
];

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const answer = useTypewriter(
        'Employees may work remotely up to 3 days/week with manager approval. Hardware stipends are covered under section 4.2 of the handbook.',
        16,
        1900
    );

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.4] pointer-events-none" />

            {/* ---------------------------------------------------------- nav */}
            <nav className="sticky top-0 z-50 glass-dark border-b border-line">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-primary glow animate-pulse" />
                        <span className="text-primary font-bold tracking-tight glow-soft">auramind</span>
                        <span className="text-muted hidden sm:inline">@local</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Link href="/login" className="px-3 py-1.5 text-muted hover:text-foreground border border-transparent hover:border-line transition-colors">
                            ./login
                        </Link>
                        <Link href="/register" className="px-3 py-1.5 text-primary border border-line hover:border-primary/60 hover:box-glow transition-all">
                            ./register
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-6xl mx-auto px-6">

                {/* ------------------------------------------------------ hero */}
                <section className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 pt-16 lg:pt-24 pb-20 items-center">
                    {/* left */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                        <div className="inline-flex items-center gap-2 text-xs text-muted border border-line px-3 py-1.5 mb-8">
                            <Terminal className="w-3.5 h-3.5 text-primary" />
                            <span>local-first retrieval-augmented generation</span>
                        </div>

                        <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-extrabold leading-[0.92] tracking-tighter text-primary glow mb-6">
                            AURA<span className="text-foreground">MIND</span>
                        </h1>

                        <p className="text-lg text-foreground/80 mb-2 min-h-[3.5rem]">
                            <span className="text-secondary glow-amber">&gt;</span>{' '}
                            <span className={mounted ? 'caret' : ''}>
                                ask your documents. get grounded, cited answers.
                            </span>
                        </p>
                        <p className="text-sm text-muted leading-relaxed max-w-md mb-10">
                            A private knowledge terminal. Embeddings run on your machine; generation
                            streams from NVIDIA NIM. No black box — every answer cites its source.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/register"
                                className="group inline-flex items-center gap-2.5 bg-primary text-background font-bold px-6 py-3.5 hover:bg-primary-dark transition-colors box-glow"
                            >
                                <span className="text-background/60">$</span> ./initialize
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2.5 border border-line text-foreground px-6 py-3.5 hover:border-primary/50 hover:text-primary transition-all"
                            >
                                <Lock className="w-4 h-4" /> sign in
                            </Link>
                        </div>
                    </motion.div>

                    {/* right — live terminal */}
                    <motion.div
                        initial={{ opacity: 0, y: 18, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
                        className="panel-2 box-glow"
                    >
                        {/* window chrome */}
                        <div className="flex items-center gap-2 px-4 h-10 border-b border-line bg-surface">
                            <span className="tui-dot bg-danger" />
                            <span className="tui-dot bg-secondary" />
                            <span className="tui-dot bg-primary" />
                            <span className="ml-2 text-xs text-muted">aura@kb — query</span>
                        </div>

                        <div className="p-5 text-[13px] leading-relaxed min-h-[19rem]">
                            {/* boot log */}
                            <div className="space-y-0.5 mb-4 text-muted font-crt text-base">
                                {BOOT_LINES.map((line, i) => (
                                    <motion.div
                                        key={line}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.18 }}
                                    >
                                        <span className="text-primary">✓</span> {line}
                                    </motion.div>
                                ))}
                            </div>

                            {/* query */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="mb-3"
                            >
                                <span className="text-secondary">aura@kb:~$</span>{' '}
                                <span className="text-foreground">ask</span>{' '}
                                <span className="text-primary">&quot;what&apos;s our remote-work policy?&quot;</span>
                            </motion.p>

                            {/* streamed answer */}
                            <p className="text-foreground/90 mb-4">
                                <span className={!answer.done ? 'caret' : ''}>{answer.out}</span>
                            </p>

                            {/* citations */}
                            {answer.done && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-wrap gap-2"
                                >
                                    {['people_handbook.pdf · p.12', 'remote_policy.pdf · p.3'].map((c, i) => (
                                        <span key={c} className="inline-flex items-center gap-1.5 text-[11px] text-primary border border-primary/25 bg-primary/5 px-2.5 py-1">
                                            <span className="text-secondary">[{i + 1}]</span> {c}
                                        </span>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </section>

                {/* -------------------------------------------------- pipeline */}
                <section className="border-y border-line py-6 -mx-6 px-6 mb-20">
                    <div className="flex items-center gap-2 flex-wrap justify-center text-xs sm:text-sm">
                        <span className="text-muted mr-1">pipeline:</span>
                        {PIPELINE.map((node, i) => (
                            <span key={node} className="flex items-center gap-2">
                                <span className={`px-2.5 py-1 border ${i === PIPELINE.length - 1 ? 'border-primary/50 text-primary' : 'border-line text-foreground/80'}`}>
                                    {node}
                                </span>
                                {i < PIPELINE.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-muted" />}
                            </span>
                        ))}
                    </div>
                </section>

                {/* --------------------------------------------------- modules */}
                <section className="mb-24">
                    <div className="flex items-baseline gap-3 mb-8">
                        <span className="text-secondary text-sm glow-amber">//</span>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">modules</h2>
                        <span className="text-muted text-sm">— what ships in the box</span>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
                        {MODULES.map((m, i) => (
                            <motion.div
                                key={m.idx}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                                className="group bg-background hover:bg-surface p-6 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-4 text-xs">
                                    <span className="text-muted">// {m.idx} · {m.label}</span>
                                    <span className="text-primary/70 group-hover:text-primary transition-colors">[ ok ]</span>
                                </div>
                                <m.icon className="w-6 h-6 text-primary mb-4 group-hover:glow transition-all" />
                                <p className="text-sm text-foreground/75 leading-relaxed">{m.body}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ----------------------------------------------------- specs */}
                <section className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.5 }}
                        className="panel"
                    >
                        <div className="flex items-center gap-2 px-5 h-10 border-b border-line bg-surface text-xs">
                            <span className="text-secondary">aura@kb:~$</span>
                            <span className="text-foreground">cat</span>
                            <span className="text-primary">stack.conf</span>
                        </div>
                        <div className="p-5 sm:p-7 grid sm:grid-cols-2 gap-x-10 gap-y-3 text-sm">
                            {SPECS.map(([k, v]) => (
                                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-2">
                                    <span className="text-muted shrink-0">{k}</span>
                                    <span className="text-foreground/85 text-right">{v}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* ------------------------------------------------------- cta */}
                <section className="text-center pb-24">
                    <p className="text-muted text-sm mb-3">
                        <span className="text-secondary">&gt;</span> spin up your private knowledge base
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-foreground mb-8">
                        deploy in <span className="text-primary glow">two commands.</span>
                    </h2>
                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-2.5 bg-primary text-background font-bold px-8 py-4 hover:bg-primary-dark transition-colors box-glow"
                    >
                        <span className="text-background/60">$</span> ./initialize
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </section>
            </main>

            {/* ----------------------------------------------------- statusbar */}
            <footer className="sticky bottom-0 z-50 glass-dark border-t border-line">
                <div className="max-w-6xl mx-auto px-6 h-9 flex items-center justify-between text-[11px] text-muted">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-primary">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> online
                        </span>
                        <span className="hidden sm:inline">nvidia-nim · minimax-m2.7</span>
                        <span className="hidden md:inline">256k ctx</span>
                    </div>
                    <span suppressHydrationWarning>
                        {mounted ? 'local embeddings · v0.1.0' : ''}
                    </span>
                </div>
            </footer>
        </div>
    );
}
