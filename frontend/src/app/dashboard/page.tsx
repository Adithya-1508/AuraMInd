'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, FileText, Sparkles, User, Bot, Loader2, Quote, Paperclip, MessageSquare } from 'lucide-react';
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
                setMessages([{ role: 'bot', content: "Hello! I'm your AuraMind Assistant. Select a previous conversation from the sidebar or start a new one to begin." }]);
                return;
            };
            setFetchingMessages(true);
            try {
                const res = await api.get(`/api/history/conversations/${convId}/messages`);
                const formatted = res.data.map((m: any) => ({
                    role: m.role as 'user' | 'bot',
                    content: m.content,
                    citations: m.citations ? JSON.parse(m.citations) : undefined
                }));
                setMessages(formatted);
            } catch (err) {
                console.error("Failed to fetch messages", err);
                setMessages([{ role: 'bot', content: "Error loading conversation. Please try again or create a new chat." }]);
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
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/chat/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: input,
                    conversation_id: parseInt(convId)
                })
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let botMessage: Message = { role: 'bot', content: '' };

            setMessages(prev => [...prev, botMessage]);

            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') break;

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.type === 'citations') {
                                botMessage.citations = data.citations;
                            } else if (data.type === 'chunk') {
                                botMessage.content += data.text;
                            }

                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1] = { ...botMessage };
                                return newMessages;
                            });
                        } catch (err) {
                            console.error("Error parsing stream chunk", err);
                        }
                    }
                }
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please ensure the backend and Ollama are running.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative font-sans">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />

            {/* Header */}
            <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 relative z-10 glass-dark">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-primary/5 shadow-xl">
                        <Sparkles className="text-primary w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">AI Knowledge Assistant</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Ollama Connected</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        llama3:8b
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-10 py-10 space-y-8 relative z-10 scroll-smooth custom-scrollbar"
            >
                {fetchingMessages ? (
                    <div className="space-y-8 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`flex items-start gap-6 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10" />
                                <div className={`h-16 w-1/2 rounded-[2rem] bg-white/5 border border-white/10 ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${msg.role === 'user'
                                    ? 'bg-primary/20 border-primary/30 text-primary shadow-lg shadow-primary/10'
                                    : 'bg-white/5 border-white/10 text-white shadow-xl'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                </div>

                                <div className={`flex flex-col gap-4 max-w-[75%]`}>
                                    <div className={`px-6 py-4 rounded-[2rem] text-base leading-relaxed font-medium shadow-2xl ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'glass rounded-tl-none text-slate-200 border-white/10'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>

                                    {msg.citations && msg.citations.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-wrap gap-2.5 px-2"
                                        >
                                            {msg.citations.map((cite, cIdx) => (
                                                <div
                                                    key={cIdx}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-help group shadow-sm"
                                                    title={cite.content}
                                                >
                                                    <Quote className="w-3 h-3 text-primary opacity-60" />
                                                    <span className="truncate max-w-[150px]">{cite.document_name} • Page {cite.pages}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3 text-slate-500 font-medium text-sm animate-pulse ml-16"
                    >
                        <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                        </div>
                        AuraMind is thinking...
                    </motion.div>
                )}
            </div>

            {/* Input Section */}
            <div className="p-10 pt-0 relative z-10 w-full max-w-5xl mx-auto">
                <form
                    onSubmit={handleSend}
                    className={`glass-dark border border-white/10 rounded-[2.5rem] p-3 flex items-center gap-3 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transition-all focus-within:border-primary/50 group ${!convId ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <div className="flex items-center gap-3 flex-1 px-5">
                        <label htmlFor="chat-query-input" className="sr-only">Query Input</label>
                        <Paperclip className="w-5 h-5 text-slate-500 hover:text-white transition-colors cursor-pointer" />
                        <input
                            id="chat-query-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={!convId}
                            placeholder={convId ? "Ask a question about your knowledge base..." : "Select or start a new conversation to chat"}
                            className="bg-transparent border-none outline-none w-full text-white placeholder:text-slate-500 py-4 text-base font-medium"
                        />
                    </div>
                    <button
                        id="chat-submit-btn"
                        type="submit"
                        disabled={!input.trim() || loading || !convId}
                        className="w-14 h-14 bg-white hover:bg-white/90 text-background rounded-[1.75rem] flex items-center justify-center transition-all disabled:opacity-20 disabled:grayscale active:scale-90 shadow-2xl"
                    >
                        <Send className="w-6 h-6 fill-current" />
                    </button>
                </form>
                <p className="text-center text-[10px] text-slate-600 mt-6 font-bold uppercase tracking-widest">
                    AuraMind Local intelligence • Answers are grounded in your private library
                </p>
            </div>
        </div>
    );
}
