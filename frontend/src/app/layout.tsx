import type { Metadata } from 'next';
import { JetBrains_Mono, VT323 } from 'next/font/google';
import ClientWrapper from '@/components/ClientWrapper';
import './globals.css';

const jetbrains = JetBrains_Mono({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400', '500', '700', '800'],
    variable: '--font-jetbrains',
});

const vt323 = VT323({
    subsets: ['latin'],
    display: 'swap',
    weight: '400',
    variable: '--font-vt323',
});

export const metadata: Metadata = {
    title: 'AuraMind // local knowledge terminal',
    description: 'A secure RAG terminal for your private documents — local embeddings, streamed answers.',
    keywords: ['AI', 'RAG', 'Ollama', 'NVIDIA NIM', 'local LLM', 'knowledge base'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${jetbrains.variable} ${vt323.variable}`}>
            <body>
                {/* CRT atmosphere — sits above everything, ignores pointer events */}
                <div className="crt-fx" aria-hidden="true">
                    <div className="crt-scanlines" />
                    <div className="crt-beam" />
                    <div className="crt-vignette" />
                </div>
                <ClientWrapper>
                    {children}
                </ClientWrapper>
            </body>
        </html>
    );
}
