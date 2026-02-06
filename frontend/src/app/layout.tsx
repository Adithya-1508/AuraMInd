import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ClientWrapper from '@/components/ClientWrapper';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans',
});

export const metadata: Metadata = {
    title: 'AuraMind | Local AI Knowledge Assistant',
    description: 'Secure, private, and local RAG application powered by Ollama.',
    keywords: ['AI', 'RAG', 'Security', 'Ollama', 'Local LLM'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <title>AuraMind | Local AI Knowledge Assistant</title>
                <meta name="description" content="Secure, private, and local RAG application powered by Ollama." />
                <meta property="og:title" content="AuraMind | Local AI Knowledge Assistant" />
                <meta property="og:description" content="Secure, private, and local RAG application powered by Ollama." />
                <meta property="og:type" content="website" />
            </head>
            <body>
                <ClientWrapper>
                    {children}
                </ClientWrapper>
            </body>
        </html>
    );
}
