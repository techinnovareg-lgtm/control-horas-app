import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// ─── Pantalla de Verificación de PIN (2FA Simple) ───────────────────────────
const PinVerification = ({ user, onComplete, onCancel }) => {
    const { validateAdminPin } = useUsers();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pin.length !== 6) return;

        setIsSubmitting(true);
        setError('');
        try {
            const isValid = await validateAdminPin(user.id, pin);
            if (isValid) {
                onComplete(user);
            } else {
                setError('PIN incorrecto. Reintenta.');
                setPin('');
            }
        } catch (err) {
            setError('Error de validación.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #e0e7ff 100%)' }}>
            <div className="shadow-2xl p-8 rounded-3xl max-w-md w-full text-center"
                style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 60%, #4f46e5 100%)' }}>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Verificación de PIN</h2>
                <p className="text-white/70 text-sm mb-8">
                    Ingresa tu código de seguridad de 6 dígitos para continuar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 rounded-2xl bg-white/15 border border-white/25 text-white focus:outline-none focus:ring-2 focus:ring-white/40 transition-all font-mono"
                        placeholder="••••••"
                        autoFocus
                    />

                    {error && (
                        <div className="p-3 bg-red-500/20 text-red-200 text-sm rounded-xl flex items-center justify-center gap-2 border border-red-400/30">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <button type="submit" disabled={isSubmitting || pin.length !== 6}
                            className="w-full py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-cream-100 active:scale-95 transition-all shadow-lg disabled:opacity-50">
                            {isSubmitting ? 'Verificando...' : 'Confirmar Identidad'}
                        </button>
                        <button type="button" onClick={onCancel} className="text-white/50 text-xs hover:text-white transition-colors">
                            Cancelar y volver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Pantalla de creación de contraseña (primer acceso o reset) ───────────────
const SetPasswordScreen = ({ user, onComplete }) => {
    const { setUserPassword } = useUsers();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
        if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }

        setIsSubmitting(true);
        try {
            await setUserPassword(user.id, password);
            onComplete(user);
        } catch (err) {
            setError('Error al guardar la contraseña. Reintenta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #e0e7ff 100%)' }}>
            <div className="shadow-2xl p-8 rounded-3xl max-w-md w-full"
                style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 60%, #4f46e5 100%)' }}>
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src="./labora_logo.png" alt="Labora" className="h-20 object-contain drop-shadow-lg" />
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
                    <button type="submit" disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-cream-100 active:scale-95 transition-all shadow-lg mt-2 disabled:opacity-50">
                        {isSubmitting ? 'Guardando...' : 'Guardar y Continuar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ─── Pantalla de Login ────────────────────────────────────────────────────────
const Auth = () => {
    const { loginAs } = useAuth();
    const { authenticate, loading } = useUsers();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [pendingUser, setPendingUser] = useState(null);
    const [showPin, setShowPin] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsAuthenticating(true);

        try {
            const result = await authenticate(email, password);
            if (result.error) {
                setError(result.error);
                setIsAuthenticating(false);
                return;
            }

            // Si es admin y tiene PIN configurado -> Ir a verificación de PIN
            if (result.user.role === 'admin' && result.user.securityPinHash) {
                setPendingUser(result.user);
                setShowPin(true);
            } else if (result.mustSetPassword) {
                setPendingUser(result.user);
            } else {
                loginAs(result.user);
            }
        } catch (err) {
            setError('Error de conexión con el servidor. Reintenta.');
            console.error(err);
        } finally {
            setIsAuthenticating(false);
        }
    };

    if (showPin) {
        return (
            <PinVerification
                user={pendingUser}
                onComplete={(user) => { setShowPin(false); loginAs(user); }}
                onCancel={() => { setShowPin(false); setPendingUser(null); }}
            />
        );
    }

    if (pendingUser) {
        return <SetPasswordScreen user={pendingUser} onComplete={(user) => { setPendingUser(null); loginAs(user); }} />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #e0e7ff 100%)' }}>

            {/* Blobs decorativos suaves */}
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15), transparent)' }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(224,231,255,0.8), transparent)' }} />

            {/* Card de login — mantiene el color corporativo */}
            <div className="relative shadow-2xl shadow-primary-900/20 p-8 rounded-3xl max-w-md w-full"
                style={{ background: 'linear-gradient(135deg, #312e81 0%, #4338ca 60%, #4f46e5 100%)' }}>

                {/* Logo Main */}
                <div className="flex justify-center mb-8 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
                    <img
                        src="./labora_logo.png"
                        alt="Labora"
                        className="h-24 object-contain drop-shadow-xl"
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

                    <button type="submit" disabled={isAuthenticating}
                        className="w-full py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-cream-100 active:scale-95 transition-all shadow-lg mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                        {isAuthenticating && <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />}
                        {isAuthenticating ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>

                {loading && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-white/40 text-[10px] bg-black/10 py-1 rounded-full uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Conectando con la base de datos central...
                    </div>
                )}

                <div className="flex flex-col items-center gap-2 mt-6">
                    <p className="text-center text-xs text-white/40">
                        ¿Olvidaste tu contraseña? Contacta al administrador:
                    </p>
                    <div className="flex items-center gap-3">
                        <a href="mailto:tech.innova.reg@gmail.com" className="text-xs text-white/60 hover:text-white underline transition-colors">
                            tech.innova.reg@gmail.com
                        </a>
                        <span className="w-1 h-1 bg-white/20 rounded-full" />
                        <a
                            href="https://wa.me/51947515529"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all border border-emerald-500/30 group"
                        >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <span className="text-[10px] font-bold group-hover:underline">WhatsApp</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-slate-400 text-xs">
                © {new Date().getFullYear()} <span className="text-primary-700 font-semibold">Tech Innova</span> · Innovación en cada solución
            </p>
        </div>
    );
};

export default Auth;
