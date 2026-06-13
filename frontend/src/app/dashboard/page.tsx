'use client';

import { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, Cpu, Quote, Loader2, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';

interface Message {
    role: 'user' | 'bot';
    content: string;
    citations?: any[];
}

export default function ChatPage() {
    const searchParams = useSearchParams();
    const convId = searchParams.get('convId');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingMessages, setFetchingMessages] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!convId) {
                setMessages([{ role: 'bot', content: "AuraMind online. Select a session from the sidebar or start a new one, then ask anything about your knowledge base." }]);
                return;
            }
            setFetchingMessages(true);
            try {
                const res = await api.get(`/api/history/conversations/${convId}/messages`);
                const formatted = res.data.map((m: any) => ({
                    role: m.role as 'user' | 'bot',
                    content: m.content,
                    citations: m.citations ? JSON.parse(m.citations) : undefined,
                }));
                setMessages(formatted);
            } catch (err) {
                console.error('Failed to fetch messages', err);
                setMessages([{ role: 'bot', content: 'Error loading session. Try again or start a new chat.' }]);
            } finally {
                setFetchingMessages(false);
            }
        };
        fetchMessages();
    }, [convId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !convId) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ query: userMessage.content, conversation_id: parseInt(convId) }),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            const botMessage: Message = { role: 'bot', content: '' };
            setMessages((prev) => [...prev, botMessage]);

            // Buffer across reads — an SSE line can be split between chunks.
            let buffer = '';
            let streaming = true;
            while (streaming) {
                const { done, value } = await reader!.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? ''; // keep the incomplete trailing line

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const dataStr = line.slice(6).trim();
                    if (dataStr === '[DONE]') { streaming = false; break; }
                    if (!dataStr) continue;

                    try {
                        const data = JSON.parse(dataStr);
                        if (data.type === 'citations') botMessage.citations = data.citations;
                        else if (data.type === 'chunk') botMessage.content += data.text;
                        else if (data.error) botMessage.content = data.error;

                        setMessages((prev) => {
                            const next = [...prev];
                            next[next.length - 1] = { ...botMessage };
                            return next;
                        });
                    } catch (err) {
                        console.error('Error parsing stream chunk', err);
                    }
                }
            }
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'bot', content: 'Connection error. Ensure the backend and NVIDIA engine are reachable.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* header */}
            <header className="h-14 border-b border-line flex items-center justify-between px-6 glass-dark relative z-10 shrink-0">
                <div className="flex items-center gap-2.5 text-sm">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-secondary">aura@kb</span>
                    <span className="text-muted">—</span>
                    <span className="text-foreground">{convId ? `session:${convId}` : 'no session'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> nvidia-nim
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5 text-muted border border-line px-2.5 py-1">
                        <Cpu className="w-3 h-3" /> minimax-m2.7
                    </span>
                </div>
            </header>

            {/* transcript */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-7 relative z-10">
                {fetchingMessages ? (
                    <div className="space-y-4 animate-pulse max-w-3xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 w-full bg-surface border border-line" />
                        ))}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto space-y-7">
                        <AnimatePresence initial={false}>
                            {messages.map((msg, idx) => {
                                const isLast = idx === messages.length - 1;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[15px] leading-relaxed"
                                    >
                                        {msg.role === 'user' ? (
                                            <div className="flex gap-2.5">
                                                <span className="text-secondary shrink-0 glow-amber">you@kb:~$</span>
                                                <span className="text-foreground whitespace-pre-wrap break-words">{msg.content}</span>
                                            </div>
                                        ) : (
                                            <div className="pl-1 border-l-2 border-primary/30 ml-1">
                                                <div className="flex items-center gap-2 text-[11px] text-muted mb-2 pl-3">
                                                    <span className="text-primary">◆</span> auramind
                                                </div>
                                                <p className="pl-3 text-foreground/90 whitespace-pre-wrap break-words">
                                                    {msg.content}
                                                    {loading && isLast && <span className="caret" />}
                                                </p>

                                                {msg.citations && msg.citations.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3.5 pl-3">
                                                        {msg.citations.map((cite, cIdx) => (
                                                            <span
                                                                key={cIdx}
                                                                title={cite.content}
                                                                className="inline-flex items-center gap-1.5 text-[11px] text-primary border border-primary/25 bg-primary/5 px-2.5 py-1 hover:bg-primary/10 transition-colors cursor-help"
                                                            >
                                                                <Quote className="w-3 h-3 text-secondary" />
                                                                <span className="text-secondary">[{cIdx + 1}]</span>
                                                                <span className="truncate max-w-[180px]">{cite.document_name} · p.{cite.pages}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {loading && messages[messages.length - 1]?.content === '' && (
                            <div className="flex items-center gap-2 text-xs text-muted pl-4">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> retrieving context...
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* prompt input */}
            <div className="px-6 pb-6 pt-2 relative z-10 shrink-0">
                <form
                    onSubmit={handleSend}
                    className={`max-w-3xl mx-auto panel-2 flex items-center gap-3 px-4 py-2.5 transition-all focus-within:border-primary/60 focus-within:box-glow ${!convId ? 'opacity-40 pointer-events-none' : ''}`}
                >
                    <span className="text-secondary shrink-0 text-sm">$</span>
                    <label htmlFor="chat-query-input" className="sr-only">Query input</label>
                    <input
                        id="chat-query-input"
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!convId || loading}
                        placeholder={convId ? 'ask your knowledge base...' : 'select or start a session to begin'}
                        className="flex-1 bg-transparent border-none outline-none text-foreground caret-primary placeholder:text-muted/60 text-[15px]"
                    />
                    <button
                        id="chat-submit-btn"
                        type="submit"
                        disabled={!input.trim() || loading || !convId}
                        aria-label="Send query"
                        className="flex items-center gap-2 text-sm text-primary border border-line px-3 py-1.5 hover:border-primary/60 hover:box-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>run <CornerDownLeft className="w-3.5 h-3.5" /></>}
                    </button>
                </form>
                <p className="max-w-3xl mx-auto text-center text-[11px] text-muted mt-3">
                    answers are grounded in your private library · local embeddings · hosted generation
                </p>
            </div>
        </div>
    );
}
