'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, Trash2, Search, Plus, Filter, Database, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface Document {
    id: number;
    filename: string;
    upload_date: string;
    processed: number;
}

// Optimization: Move sub-components outside and fix dynamic class issues for Tailwind v4 compatibility
const STAT_COLORS: Record<string, string> = {
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    secondary: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
};

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    const colorClasses = STAT_COLORS[color] || STAT_COLORS.slate;
    return (
        <div className="glass p-8 rounded-[2.5rem] flex items-center gap-6 border-white/5 shadow-inner">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border shadow-xl ${colorClasses}`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

const STATUS_CONFIG: Record<number, { label: string, color: string, icon: React.ReactNode }> = {
    1: { label: 'Ready', color: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    0: { label: 'Analyzing', color: 'bg-amber-500/5 text-amber-400 border-amber-500/20', icon: <Clock className="w-3.5 h-3.5 animate-pulse" /> },
    [-1]: { label: 'Incomplete', color: 'bg-red-500/5 text-red-400 border-red-500/20', icon: <AlertCircle className="w-3.5 h-3.5" /> }
};

function StatusBadge({ status }: { status: number }) {
    const current = STATUS_CONFIG[status] || STATUS_CONFIG[0];
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors shadow-sm ${current.color}`}>
            {current.icon}
            {current.label}
        </div>
    );
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await api.get('/api/documents');
                setDocuments(response.data);
            } catch (err) {
                console.error('Error fetching documents', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
        const interval = setInterval(fetchDocs, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.endsWith('.pdf')) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post('/api/documents/upload', formData);
            const response = await api.get('/api/documents');
            setDocuments(response.data);
        } catch (err) {
            alert('Upload failed. Please ensure the file is a PDF.');
        } finally {
            setUploading(false);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-12 max-w-7xl mx-auto space-y-12 font-sans relative">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
                        <Database className="w-3 h-3" />
                        Knowledge Base
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">Internal Repository</h1>
                    <p className="text-lg text-slate-500 font-medium max-w-xl">
                        Securely manage your organization's sensitive documentation for real-time RAG analysis.
                    </p>
                </div>

                <label id="docs-upload-label" className="bg-white hover:bg-white/90 text-background px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-2xl hover:-translate-y-1 active:scale-95 flex-shrink-0">
                    {uploading ? <Clock className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    <span>Upload New PDF</span>
                    <input id="docs-upload-input" type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
                </label>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                <StatCard
                    label="Ingested Files"
                    value={documents.length}
                    icon={<FileText className="w-7 h-7" />}
                    color="primary"
                />
                <StatCard
                    label="Ready for Query"
                    value={documents.filter(d => d.processed === 1).length}
                    icon={<CheckCircle2 className="w-7 h-7" />}
                    color="secondary"
                />
                <StatCard
                    label="Pending Analysis"
                    value={documents.filter(d => d.processed === 0).length}
                    icon={<Clock className="w-7 h-7" />}
                    color="slate"
                />
            </div>

            {/* Modern Table Card */}
            <div className="glass rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl relative z-10">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/2">
                    <div className="relative flex-1 max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                            id="docs-search-input"
                            type="text"
                            placeholder="Search by filename..."
                            className="bg-black/20 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 w-full text-base outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-white placeholder:text-slate-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-white/5">
                                <th className="px-10 py-6">Document Name</th>
                                <th className="px-10 py-6">RAG Status</th>
                                <th className="px-10 py-6">Upload Timestamp</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-10 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5" />
                                                <div className="h-6 w-48 bg-white/5 rounded-lg" />
                                            </div>
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="h-8 w-24 bg-white/5 rounded-full" />
                                        </td>
                                        <td className="px-10 py-7">
                                            <div className="h-4 w-32 bg-white/5 rounded-lg" />
                                        </td>
                                        <td className="px-10 py-7 text-right">
                                            <div className="h-10 w-24 bg-white/5 rounded-xl ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredDocs.map((doc) => (
                                        <motion.tr
                                            key={doc.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.03] transition-all group"
                                        >
                                            <td className="px-10 py-7">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-bold text-lg text-white group-hover:translate-x-1 transition-transform">{doc.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-7">
                                                <StatusBadge status={doc.processed} />
                                            </td>
                                            <td className="px-10 py-7 text-sm text-slate-500 font-bold">
                                                {new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-10 py-7 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-3 text-slate-600 hover:text-white transition-all rounded-xl hover:bg-white/5">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-3 text-slate-600 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10 active:scale-90">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>

                    {filteredDocs.length === 0 && !loading && (
                        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-[2rem] bg-white/2 border border-white/5 flex items-center justify-center">
                                <Search className="w-10 h-10 text-slate-700" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-slate-300">No documents indexed</p>
                                <p className="text-sm text-slate-600 font-medium">Upload your first PDF to begin RAG analysis</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
