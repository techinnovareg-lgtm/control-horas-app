import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUsers, PLANS } from '../../hooks/useUsers';
import {
    MessageCircle, Mail, Shield, Clock, Calendar,
    CreditCard, Key, RefreshCw, CheckCircle2, ChevronRight
} from 'lucide-react';

const SupportModule = () => {
    const { user } = useAuth();
    const { getLicenseStatus, setUserPassword } = useUsers();
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const status = getLicenseStatus(user);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPass.length < 6) return setMessage({ type: 'error', text: 'Mínimo 6 caracteres' });
        if (newPass !== confirmPass) return setMessage({ type: 'error', text: 'No coinciden' });

        try {
            await setUserPassword(user.id, newPass);
            setMessage({ type: 'success', text: 'Contraseña actualizada' });
            setIsChangingPass(false);
            setNewPass('');
            setConfirmPass('');
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al cambiar' });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera / Intro */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600">
                        <Shield className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800">Soporte y Mi Plan</h2>
                        <p className="text-slate-500 font-medium">Gestiona tu suscripción y obtén ayuda personalizada.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <a
                        href="https://wa.me/51930262100"
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary flex items-center gap-2 px-6 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
                    >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                    </a>
                    <a
                        href="mailto:tech.innova.reg@gmail.com"
                        className="btn-secondary flex items-center gap-2 px-6"
                    >
                        <Mail className="w-5 h-5" />
                        Email
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Plan y Vigencia */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-[40px] border-2 border-primary-50">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-primary-600" />
                            Estado de mi Suscripción
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-3xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Producto</p>
                                <p className="text-2xl font-black text-primary-700">Labora {PLANS[user.plan]?.label || 'Premium'}</p>
                                <p className="text-sm text-slate-500 mt-1">Gestión Laboral Completa</p>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Estado del Plan</p>
                                <div className="flex items-center gap-2 text-2xl font-black text-emerald-600">
                                    <CheckCircle2 className="w-6 h-6" />
                                    {status.active ? 'Activo' : 'Vencido'}
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                    Vence el: {status.endDate ? new Date(status.endDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Días Restantes</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-slate-800">{status.daysLeft === 9999 ? '∞' : status.daysLeft}</p>
                                    <p className="text-sm font-bold text-slate-400">días de servicio</p>
                                </div>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Fecha de Contrato</p>
                                <div className="flex items-center gap-2 text-xl font-black text-slate-700">
                                    <Calendar className="w-5 h-5 text-primary-400" />
                                    {user.contractStart ? new Date(user.contractStart).toLocaleDateString() : 'Ver con Admin'}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Vigencia inicial: {user.contractEnd ? new Date(user.contractEnd).toLocaleDateString() : '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-primary-600" />
                            Preguntas Frecuentes
                        </h3>
                        <div className="space-y-4">
                            {[
                                { q: '¿Cómo recupero mis horas?', a: 'Ingresa a "Control de Horas", selecciona tu periodo y usa el botón "Registrar Entrada/Salida".' },
                                { q: '¿Cómo solicito vacaciones?', a: 'En el panel "Vacaciones", haz clic en "Nueva Solicitud" y elige tus fechas.' },
                                { q: '¿Dónde veo mis boletas?', a: 'Todas tus boletas cargadas están disponibles en el panel "Boletas".' },
                                { q: '¿Se vence mi acceso?', a: 'Sí, revisa tu fecha de fin de contrato arriba. Contacta a un admin para renovar.' }
                            ].map((item, i) => (
                                <details key={i} className="group border-b border-slate-50 pb-3 last:border-0 cursor-pointer">
                                    <summary className="flex justify-between items-center font-bold text-sm text-slate-700 list-none">
                                        {item.q}
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-open:rotate-90 transition-all" />
                                    </summary>
                                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                        {item.a}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>

                    {!isAdmin && status.daysLeft < 365 && (
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 mt-[-1rem]">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso de Licencia Anual</p>
                                <p className="text-[10px] font-black text-primary-600 uppercase">{Math.round((status.daysLeft / 365) * 100)}% de vigencia</p>
                            </div>
                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                <div
                                    className="h-full bg-primary-500 transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (status.daysLeft / 365) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Mi Cuenta */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Key className="w-6 h-6 text-primary-600" />
                            Mi Cuenta
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Usuario de Acceso</label>
                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-700 text-sm font-medium border border-slate-100">
                                    {user.email}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsChangingPass(!isChangingPass)}
                                className="w-full py-4 rounded-3xl border-2 border-slate-100 text-slate-700 font-bold hover:bg-slate-50 hover:border-primary-100 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isChangingPass ? 'animate-spin' : ''}`} />
                                {isChangingPass ? 'Cancelar Cambio' : 'Cambiar Contraseña'}
                            </button>

                            {isChangingPass && (
                                <form onSubmit={handlePasswordChange} className="space-y-4 pt-4 animate-in slide-in-from-top-4">
                                    <input
                                        type="password"
                                        placeholder="Nueva contraseña"
                                        value={newPass}
                                        onChange={e => setNewPass(e.target.value)}
                                        className="input-field"
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirmar contraseña"
                                        value={confirmPass}
                                        onChange={e => setConfirmPass(e.target.value)}
                                        className="input-field"
                                        required
                                    />
                                    <button type="submit" className="btn-primary w-full py-3">Actualizar Clave</button>
                                </form>
                            )}

                            {message.text && (
                                <p className={`text-center text-sm font-bold p-3 rounded-2xl ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {message.text}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-primary-600 text-white shadow-xl shadow-primary-900/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-lg font-bold mb-2">¿Necesitas algo más?</h4>
                            <p className="text-primary-100 text-sm leading-relaxed mb-4">Estamos aquí para resolver cualquier duda técnica o administrativa.</p>
                            <button className="flex items-center gap-2 text-white font-black group-hover:gap-4 transition-all">
                                Ayuda Central <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-white/10 rounded-full blur-[80px]" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportModule;
