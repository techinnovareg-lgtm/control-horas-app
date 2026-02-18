import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useLocalStorage('tracker_current_user', null);

    const loginAs = (user) => {
        // Guardamos solo los datos esenciales del usuario en sesión
        setCurrentUser({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            loggedInAt: new Date().toISOString(),
        });
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ user: currentUser, loginAs, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
