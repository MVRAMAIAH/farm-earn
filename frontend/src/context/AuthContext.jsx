import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        }
        return res.data;
    };

    const adminLogin = async (email, password) => {
        const res = await api.post('/auth/admin-login', { email, password });
        if (res.data) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        }
        return res.data;
    };

    // Register now directly logs the user in (no OTP)
    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        if (res.data && res.data.token) {
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        }
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, adminLogin, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
