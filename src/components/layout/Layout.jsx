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
                <div className="p-8">
                    <div className="flex items-center gap-3">
                        <img
                            src="./logo-techinnova.png"
                            alt="Tech Innova"
                            className="h-10 object-contain drop-shadow-sm"
                        />
                        <div>
                            <p className="text-sm font-black text-slate-800 tracking-tighter leading-none">Labora</p>
                            <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest mt-1">Gestión Laboral</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Slot */}
                <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                    {sidebar}
                </div>

                {/* Bottom User Area */}
                <div className="p-4 border-t border-slate-200/50">
                    <div className="bg-white/60 p-4 rounded-3xl border border-white/50 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg"
                                style={{ background: 'linear-gradient(135deg, #a8174a, #8b1a4a)' }}>
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
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header (Simplificado para Mobile/Search/Notify) */}
                <header className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-10 z-30 bg-white/20 backdrop-blur-sm lg:backdrop-blur-none border-b lg:border-none border-slate-200/50">
                    <div className="lg:hidden flex items-center gap-3">
                        <img src="./logo-techinnova.png" alt="Labora" className="h-8" />
                        <span className="text-sm font-black text-slate-800">Labora</span>
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
