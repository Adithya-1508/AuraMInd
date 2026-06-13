'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, CircleCheck, Clock, CircleAlert, Trash2, Search, Database, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface DocItem {
    id: number;
    filename: string;
    upload_date: string;
    processed: number;
}

const STATUS: Record<number, { label: string; cls: string; icon: any }> = {
    1: { label: 'ready', cls: 'text-primary border-primary/30 bg-primary/5', icon: CircleCheck },
    0: { label: 'indexing', cls: 'text-secondary border-secondary/30 bg-secondary/5', icon: Clock },
    [-1]: { label: 'failed', cls: 'text-danger border-danger/30 bg-danger/5', icon: CircleAlert },
};

function StatusBadge({ status }: { status: number }) {
    const cfg = STATUS[status] || STATUS[0];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] border ${cfg.cls}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
}

export default function DocumentsPage() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    useEffect(() => {
        fetchDocs();
        const interval = setInterval(fetchDocs, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.name.toLowerCase().endsWith('.pdf')) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post('/api/documents/upload', formData);
            await fetchDocs();
        } catch (err) {
            alert('Upload failed. Ensure the file is a PDF.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`rm ${name} — remove from the knowledge base and vector store?`)) return;
        try {
            await api.delete(`/api/admin/documents/${id}`);
            setDocuments((docs) => docs.filter((d) => d.id !== id));
        } catch (err) {
            alert('Delete failed (admin only).');
        }
    };

    const filteredDocs = documents.filter((doc) =>
        doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const ready = documents.filter((d) => d.processed === 1).length;
    const pending = documents.filter((d) => d.processed === 0).length;
    const isAdmin = user?.role === 'admin';

    return (
        <div className="p-8 sm:p-10 max-w-5xl mx-auto relative">
            {/* header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
                <div>
                    <p className="text-xs text-muted mb-1.5 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-primary" /> ~/knowledge
                    </p>
                    <h1 className="text-2xl font-bold text-foreground">
                        <span className="text-secondary">$</span> ls <span className="text-muted">-la</span>
                    </h1>
                </div>

                <label
                    id="docs-upload-label"
                    className="inline-flex items-center gap-2 bg-primary text-background font-bold px-5 py-2.5 cursor-pointer hover:bg-primary-dark transition-colors box-glow"
                >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{uploading ? 'uploading...' : '[ + upload .pdf ]'}</span>
                    <input id="docs-upload-input" type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploading} />
                </label>
            </div>

            {/* counts */}
            <div className="flex flex-wrap gap-3 mb-6 text-xs">
                <span className="border border-line px-3 py-1.5 text-muted">total <span className="text-foreground">{documents.length}</span></span>
                <span className="border border-line px-3 py-1.5 text-muted">ready <span className="text-primary">{ready}</span></span>
                <span className="border border-line px-3 py-1.5 text-muted">indexing <span className="text-secondary">{pending}</span></span>
            </div>

            {/* search */}
            <div className="relative mb-4 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                    id="docs-search-input"
                    type="text"
                    placeholder="grep filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-2 border border-line focus:border-primary caret-primary text-foreground pl-9 pr-3 py-2.5 outline-none transition-colors text-sm placeholder:text-muted/60"
                />
            </div>

            {/* listing */}
            <div className="panel">
                <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_120px_60px] gap-4 px-5 py-3 border-b border-line text-[11px] text-muted">
                    <span>name</span>
                    <span>status</span>
                    <span className="hidden sm:block">uploaded</span>
                    <span className="text-right">ops</span>
                </div>

                {loading ? (
                    <div className="p-5 space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-10 w-full bg-surface animate-pulse" />
                        ))}
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted">
                        <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        // no documents indexed — upload a PDF to begin
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredDocs.map((doc) => (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_120px_60px] gap-4 px-5 py-3.5 border-b border-line/60 items-center hover:bg-surface transition-colors group"
                            >
                                <span className="flex items-center gap-2.5 min-w-0">
                                    <FileText className="w-4 h-4 text-muted group-hover:text-primary transition-colors shrink-0" />
                                    <span className="text-foreground text-sm truncate">{doc.filename}</span>
                                </span>
                                <StatusBadge status={doc.processed} />
                                <span className="hidden sm:block text-[11px] text-muted">
                                    {new Date(doc.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                </span>
                                <span className="text-right">
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(doc.id, doc.filename)}
                                            aria-label={`Delete ${doc.filename}`}
                                            className="p-2 text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
