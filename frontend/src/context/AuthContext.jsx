import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('hr_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (err) {
            console.error('Failed to load user:', err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { user: userData, token: authToken } = await authService.login(email, password);
        localStorage.setItem('hr_token', authToken);
        setToken(authToken);
        setUser(userData);
        return userData;
    };

    const register = async (userData) => {
        const { user: newUser, token: authToken } = await authService.register(userData);
        localStorage.setItem('hr_token', authToken);
        setToken(authToken);
        setUser(newUser);
        return newUser;
    };

    const logout = () => {
        localStorage.removeItem('hr_token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
