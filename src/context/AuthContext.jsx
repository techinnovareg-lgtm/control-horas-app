import React, { useEffect } from 'react';
import { AuthContext } from './Context';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUsers } from '../hooks/useUsers';



export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useLocalStorage('tracker_current_user', null);
    const { initSuperAdmin } = useUsers();

    // Inicializar superadmin en Firestore al arrancar
    useEffect(() => {
        initSuperAdmin();
    }, [initSuperAdmin]);

    const loginAs = (user) => {
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


