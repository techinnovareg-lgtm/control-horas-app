import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// ─── Pantalla de creación de contraseña (primer acceso o reset) ───────────────
const SetPasswordScreen = ({ user, onComplete }) => {
    const { setUserPassword } = useUsers();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
        setUserPassword(user.id, password);
        onComplete(user);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #fdf8f0 0%, #ffffff 50%, #fce7ef 100%)' }}>
            <div className="shadow-2xl p-8 rounded-3xl max-w-md w-full"
                style={{ background: 'linear-gradient(135deg, #4e0d28 0%, #8b1a4a 60%, #a8174a 100%)' }}>
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src="./logo-techinnova.png" alt="Tech Innova" className="h-16 object-contain drop-shadow-lg" />
                </div>

                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Crea tu contraseña</h2>
                    <p className="text-white/70 text-sm mt-1">
                        Hola <strong className="text-white">{user.name}</strong>, define tu contraseña para continuar.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-white/70 uppercase mb-1">Nueva Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-white/50" />
                            <input type={show ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                                placeholder="Mínimo 6 caracteres" required />
                            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-white/50 hover:text-white">
                                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-white/70 uppercase mb-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-white/50" />
                            <input type={show ? 'text' : 'password'} value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                className="w-full pl-10 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                                placeholder="Repite la contraseña" required />
                        </div>
                    </div>
                    {error && (
                        <div className="p-3 bg-red-500/20 text-red-200 text-sm rounded-xl flex items-center gap-2 border border-red-400/30">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                        </div>
                    )}
                    <button type="submit"
                        className="w-full py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-cream-100 active:scale-95 transition-all shadow-lg mt-2">
                        Guardar y Continuar
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Pantalla de Login ────────────────────────────────────────────────────────
const Auth = () => {
    const { loginAs } = useAuth();
    const { authenticate } = useUsers();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [pendingUser, setPendingUser] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const result = authenticate(email, password);
        if (result.error) { setError(result.error); return; }
        if (result.mustSetPassword) { setPendingUser(result.user); return; }
        loginAs(result.user);
    };

    if (pendingUser) {
        return <SetPasswordScreen user={pendingUser} onComplete={(user) => { setPendingUser(null); loginAs(user); }} />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #fdf8f0 0%, #ffffff 50%, #fce7ef 100%)' }}>

            {/* Blobs decorativos suaves */}
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(168,23,74,0.15), transparent)' }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(249,240,224,0.8), transparent)' }} />

            {/* Card de login — mantiene el color corporativo */}
            <div className="relative shadow-2xl shadow-primary-900/20 p-8 rounded-3xl max-w-md w-full"
                style={{ background: 'linear-gradient(135deg, #4e0d28 0%, #8b1a4a 60%, #a8174a 100%)' }}>

                {/* Logo Tech Innova */}
                <div className="flex justify-center mb-8">
                    <img
                        src="./logo-techinnova.png"
                        alt="Tech Innova"
                        className="h-20 object-contain drop-shadow-xl"
                    />
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Control de Horas</h1>
                    <p className="text-white/60 text-sm mt-1">No Laboradas y Recuperadas</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-white/50" />
                            <input
                                type="email" value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                                placeholder="tu@correo.com"
                                required autoComplete="email"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/70 uppercase tracking-wider mb-1.5">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-white/50" />
                            <input
                                type={show ? 'text' : 'password'} value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                                placeholder="Tu contraseña"
                                required autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShow(!show)}
                                className="absolute right-3 top-3 text-white/50 hover:text-white transition-colors">
                                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/20 text-red-200 text-sm rounded-xl flex items-center gap-2 border border-red-400/30">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                        </div>
                    )}

                    <button type="submit"
                        className="w-full py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-cream-100 active:scale-95 transition-all shadow-lg mt-2">
                        Ingresar
                    </button>
                </form>

                <p className="text-center text-xs text-white/40 mt-6">
                    ¿Olvidaste tu contraseña? Contacta al administrador.
                </p>
            </div>

            {/* Footer */}
            <p className="mt-6 text-slate-400 text-xs">
                © {new Date().getFullYear()} <span className="text-primary-700 font-semibold">Tech Innova</span> · Innovación en cada solución
            </p>
        </div>
    );
};

export default Auth;
