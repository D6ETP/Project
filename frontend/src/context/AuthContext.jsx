import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                const isExpired = decoded.exp * 1000 < Date.now();
                if (isExpired) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                } else {
                    const stored = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    setUser({
                        username: stored.fullName || decoded.sub,
                        email: stored.email,
                        role: decoded.role || stored.role,
                        userId: stored.userId,
                        phone: stored.phone || ''
                    });
                }
            } catch (err) {
                console.error("Failed to decode token:", err);
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (authResponse) => {
        localStorage.setItem('token', authResponse.token);
        localStorage.setItem('userInfo', JSON.stringify(authResponse));
        setUser({
            username: authResponse.fullName,
            email: authResponse.email,
            role: authResponse.role,
            userId: authResponse.userId,
            phone: authResponse.phone || ''
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};