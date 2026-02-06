'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: number;
    email: string;
    role: 'admin' | 'user';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Decode JWT or fetch user details (simplifying here)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: 0, // Placeholder
                    email: payload.sub,
                    role: payload.role
                });
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
            id: 0,
            email: payload.sub,
            role: payload.role
        });
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
