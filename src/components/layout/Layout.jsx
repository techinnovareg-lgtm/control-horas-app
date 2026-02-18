import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Blobs decorativos de fondo */}
            <div className="fixed top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full blur-3xl -z-10 opacity-30"
                style={{ background: 'radial-gradient(circle, #f4a3c2, transparent)' }} />
            <div className="fixed bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full blur-3xl -z-10 opacity-20"
                style={{ background: 'radial-gradient(circle, #f9f0e0, transparent)' }} />

            {/* Navbar */}
            <nav className="glass-panel border-x-0 border-t-0 sticky top-0 z-50"
                style={{ borderBottom: '1px solid rgba(168,23,74,0.12)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Logo Tech Innova */}
                        <div className="flex items-center gap-3">
                            <img
                                src="./logo-techinnova.png"
                                alt="Tech Innova"
                                className="h-10 object-contain"
                            />
                            <div className="hidden sm:block border-l border-slate-200 pl-3">
                                <p className="text-sm font-bold text-slate-700 leading-tight">Control de Horas</p>
                                <p className="text-xs text-slate-400 leading-tight">No Laboradas y Recuperadas</p>
                            </div>
                        </div>

                        {/* Usuario + Logout */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                                style={{ background: 'rgba(168,23,74,0.08)', border: '1px solid rgba(168,23,74,0.15)' }}>
                                {user?.role === 'admin'
                                    ? <Shield className="w-4 h-4 text-primary-700" />
                                    : <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                        style={{ background: '#8b1a4a' }}>
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                }
                                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                                {user?.role === 'admin' && (
                                    <span className="text-xs font-semibold text-primary-700">Admin</span>
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-slate-500 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer Tech Innova */}
            <footer className="mt-auto" style={{ borderTop: '1px solid rgba(168,23,74,0.12)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <img src="./logo-techinnova.png" alt="Tech Innova" className="h-7 object-contain opacity-80" />
                        <span className="text-sm text-slate-500">
                            Creado por <span className="font-semibold text-primary-700">Tech Innova</span>
                            <span className="text-slate-400 ml-1">· Innovación en cada solución</span>
                        </span>
                    </div>
                    <span className="text-xs text-slate-400">
                        © {new Date().getFullYear()} Control de Horas
                    </span>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
