import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Shield } from 'lucide-react';

const Layout = ({ children, sidebar }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex relative overflow-hidden bg-slate-50">
            {/* Fondo limpio original */}

            {/* Sidebar Lateral */}
            <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-white/40 backdrop-blur-xl border-r border-slate-200/50 z-40">
                {/* Logo Area */}
                <div className="p-8 flex items-center justify-center">
                    <img
                        src="./labora_logo.png"
                        alt="Labora"
                        className="w-full max-w-[180px] h-auto object-contain drop-shadow-md"
                    />
                </div>

                {/* Navigation Slot */}
                <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                    {sidebar}
                </div>

                {/* Bottom User Area */}
                <div className="p-4 border-t border-slate-200/50 flex flex-col gap-4">
                    <div className="bg-white/60 p-4 rounded-3xl border border-white/50 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #4f46e5, #312e81)' }}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase truncate">{user?.role === 'admin' ? 'Administrador' : 'Empleado'}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold transition-all border border-transparent hover:border-red-100"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </div>

                    <div className="mt-4 pt-4 flex items-center justify-start w-full px-2 border-t border-slate-200/50">
                        <img src="./logo-techinnova.png" alt="TechInnova" className="w-12 h-12 object-cover rounded-2xl shadow-sm drop-shadow-sm brightness-95 hover:brightness-100 transition-all duration-300" />
                        <div className="ml-3 flex flex-col items-start overflow-hidden">
                            <span className="text-sm font-bold text-slate-800 tracking-tight truncate w-full">Tech Innova</span>
                            <span className="text-[10px] text-slate-500 font-medium truncate w-full mb-0.5">v1.1.0 · {new Date().getFullYear()}</span>
                            <a href="#" className="flex items-center gap-1 text-[10px] text-primary-600 hover:text-primary-800 font-bold transition-colors">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Buscar actualizaciones
                            </a>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header (Simplificado para Mobile/Search/Notify) */}
                <header className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-10 z-30 bg-white/20 backdrop-blur-sm lg:backdrop-blur-none border-b lg:border-none border-slate-200/50">
                    <div className="lg:hidden flex items-center justify-center">
                        <img src="./labora_logo.png" alt="Labora" className="h-14 drop-shadow-sm" />
                    </div>

                    <div className="hidden lg:block">
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Bienvenido de nuevo, {user?.name?.split(' ')[0]}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {user?.role === 'admin' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-full">
                                <Shield className="w-3.5 h-3.5 text-primary-700" />
                                <span className="text-[10px] font-black text-primary-700 uppercase tracking-tight">Admin Mode</span>
                            </div>
                        )}
                        <button className="lg:hidden p-2 text-slate-600 bg-white rounded-xl shadow-sm">
                            <LogOut className="w-5 h-5" onClick={logout} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Portable Footer */}
                <footer className="px-10 py-4 text-center lg:text-left">
                    <p className="text-[10px] text-slate-400 font-medium">© {new Date().getFullYear()} Labora · Impulsado por <span className="text-primary-700 font-bold">Tech Innova</span></p>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
