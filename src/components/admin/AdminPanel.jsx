import React, { useRef, useState } from 'react';
import { useUsers, LICENSE_TYPES, PLANS } from '../../hooks/useUsers';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Users, UserPlus, Shield, CheckCircle2, XCircle,
    RefreshCw, Mail, Key, ChevronDown, ChevronUp,
    Clock, Calendar, AlertTriangle, Search, CreditCard, Trash2, Upload, Download, FileJson,
    Palmtree, FileText, ToggleLeft, ToggleRight
} from 'lucide-react';
import UserForm from './UserForm';
import { exportData, importData } from '../../utils/backupUtils';

// ─── Badge de Plan ────────────────────────────────────────────────────────
const PlanBadge = ({ plan }) => {
    const config = PLANS[plan] || PLANS.basic;
    const colors = {
        slate: 'bg-slate-100 text-slate-700',
        primary: 'bg-primary-100 text-primary-700',
        emerald: 'bg-emerald-100 text-emerald-700'
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${colors[config.color]}`}>
            {config.label}
        </span>
    );
};

// ─── Badge de estado de licencia ─────────────────────────────────────────────
const LicenseBadge = ({ status }) => {
    if (status.active) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                Activa · {status.daysLeft === 9999 ? 'Admin' : `${status.daysLeft}d`}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Vencida
        </span>
    );
};

// ─── Fila de usuario expandible ───────────────────────────────────────────────
const UserRow = ({ user }) => {
    const { getLicenseStatus, resetPassword, updateEmail, renewLicense, deactivateUser, activateUser, updateUser, extendLicense } = useUsers();
    const [expanded, setExpanded] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [newEmail, setNewEmail] = useState(user.email);
    const [renewType, setRenewType] = useState('annual');
    const [emailError, setEmailError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const status = getLicenseStatus(user);
    const isSuperAdmin = user.id === 'superadmin';

    const handleEmailSave = async () => {
        setEmailError('');
        setIsProcessing(true);
        try {
            await updateEmail(user.id, newEmail);
            setEditEmail(false);
        } catch (e) {
            setEmailError(e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRenew = async () => {
        setIsProcessing(true);
        try {
            await renewLicense(user.id, renewType);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResetPassword = async () => {
        if (window.confirm(`¿Resetear contraseña de ${user.name}? Deberá crear una nueva en su próximo acceso.`)) {
            setIsProcessing(true);
            try {
                await resetPassword(user.id);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm(`¿Desactivar a ${user.name}?`)) {
            setIsProcessing(true);
            try {
                await deactivateUser(user.id);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleActivate = async () => {
        setIsProcessing(true);
        try {
            await activateUser(user.id);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-primary-600 animate-spin" />
                </div>
            )}
            {/* Fila principal */}
            <div
                className="flex flex-wrap items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${user.role === 'admin' ? 'bg-primary-100' : 'bg-slate-100'}`}>
                    {user.role === 'admin'
                        ? <Shield className="w-5 h-5 text-primary-600" />
                        : <span className="text-slate-600 font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    }
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <PlanBadge plan={user.plan} />
                    <LicenseBadge status={status} />
                    {user.status === 'inactive' && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            Inactivo
                        </span>
                    )}
                    {user.mustSetPassword && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Sin contraseña
                        </span>
                    )}
                </div>

                {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {/* Panel expandido */}
            {expanded && (
                <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                        {/* Email */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Correo Electrónico
                            </p>
                            {editEmail ? (
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                        className="input-field flex-1 text-sm"
                                        disabled={isProcessing}
                                    />
                                    <button onClick={handleEmailSave} disabled={isProcessing} className="btn-primary text-sm px-3">Guardar</button>
                                    <button onClick={() => { setEditEmail(false); setNewEmail(user.email); }} disabled={isProcessing} className="btn-secondary text-sm px-3">Cancelar</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-700 text-sm">{user.email}</span>
                                    {!isSuperAdmin && (
                                        <button onClick={() => setEditEmail(true)} className="text-xs text-primary-600 hover:underline">
                                            Cambiar
                                        </button>
                                    )}
                                </div>
                            )}
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                        </div>

                        {/* Contraseña */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Key className="w-3 h-3" /> Contraseña
                            </p>
                            <button
                                onClick={handleResetPassword}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Resetear contraseña
                            </button>
                        </div>
                    </div>

                    {user.role !== 'admin' && (
                        <div className="space-y-6 pt-4 border-t border-slate-100">
                            {/* Plan de Servicio */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Plan de Servicio (Habilita Módulos)
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(PLANS).map(([key, val]) => (
                                        <button
                                            key={key}
                                            onClick={() => updateUser(user.id, { plan: key, features: val.features })}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${user.plan === key
                                                ? `bg-${val.color === 'primary' ? 'primary-600' : val.color === 'emerald' ? 'emerald-600' : 'slate-600'} border-transparent text-white shadow-md`
                                                : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                        >
                                            <span className="text-xs font-bold uppercase">{val.label}</span>
                                            {user.plan === key && <CheckCircle2 className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Módulos Habilitados */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Módulos Habilitados (Plan Premium)
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => {
                                            const newFeatures = { ...user.features, vacations: !user.features?.vacations };
                                            updateUser(user.id, { features: newFeatures });
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${user.features?.vacations
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-primary-200'}`}
                                    >
                                        <Palmtree className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Vacaciones</span>
                                        {user.features?.vacations ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={() => {
                                            const newFeatures = { ...user.features, documents: !user.features?.documents };
                                            updateUser(user.id, { features: newFeatures });
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${user.features?.documents
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200'}`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase">Boletas</span>
                                        {user.features?.documents ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Acceso Rápido Licencia */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" /> Extensión Rápida de Acceso
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { l: '+30d', d: 30, t: 'days' },
                                        { l: '+60d', d: 60, t: 'days' },
                                        { l: '+90d', d: 90, t: 'days' },
                                        { l: '+1 año', d: 1, t: 'years' },
                                        { l: '+2 años', d: 2, t: 'years' },
                                        { l: '+3 años', d: 3, t: 'years' }
                                    ].map(btn => (
                                        <button
                                            key={btn.l}
                                            disabled={isProcessing}
                                            onClick={() => {
                                                if (window.confirm(`¿Extender acceso por ${btn.l}?`)) {
                                                    extendLicense(user.id, btn.t, btn.d);
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 transition-all"
                                        >
                                            {btn.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Historial de licencias */}
                            {user.licenseHistory?.length > 0 && (
                                <div>
                                    <p className="text-xs text-slate-400 mb-1.5 font-medium">Historial de suscripciones</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                                        {[...user.licenseHistory]
                                            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                                            .map((entry, i) => {
                                                const expired = new Date(entry.endDate) < new Date();
                                                return (
                                                    <div key={i} className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${expired ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        <span className="flex items-center gap-1 font-bold">
                                                            <Clock className="w-3 h-3" />
                                                            {LICENSE_TYPES[entry.type]?.label || entry.type}
                                                        </span>
                                                        <span>
                                                            {format(parseISO(entry.startDate), 'dd/MM/yy')} → {format(parseISO(entry.endDate), 'dd/MM/yy')}
                                                        </span>
                                                        <span className={`font-black ${expired ? 'text-slate-400' : 'text-emerald-600'}`}>
                                                            {expired ? 'Vencida' : 'Activa'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Periodo de Contrato */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Inicio Contrato
                            </p>
                            <input
                                type="date"
                                value={user.contractStart?.split('T')[0] || ''}
                                onChange={(e) => updateUser(user.id, { contractStart: new Date(e.target.value).toISOString() })}
                                className="input-field text-sm py-1.5"
                                disabled={isProcessing}
                            />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Fin Contrato
                            </p>
                            <input
                                type="date"
                                value={user.contractEnd?.split('T')[0] || ''}
                                onChange={(e) => updateUser(user.id, { contractEnd: new Date(e.target.value).toISOString() })}
                                className="input-field text-sm py-1.5"
                                disabled={isProcessing}
                            />
                        </div>
                    </div>

                    {/* Info adicional */}
                    <div className="text-xs text-slate-400 flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                        <span>Creado: {user.createdAt ? format(parseISO(user.createdAt), 'dd MMM yyyy', { locale: es }) : 'N/A'}</span>
                        {user.lastLoginAt && (
                            <span>Último acceso: {format(parseISO(user.lastLoginAt), 'dd MMM yyyy HH:mm', { locale: es })}</span>
                        )}
                        {!isSuperAdmin && (
                            <button onClick={user.status === 'active' ? handleDeactivate : handleActivate} className="text-red-500 hover:text-red-700 ml-auto font-bold uppercase tracking-tighter">
                                {user.status === 'active' ? 'Desactivar Usuario' : 'Activar Usuario'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Pestaña de Seguridad ───────────────────────────────────────────────────
const AdminSecurity = ({ adminId }) => {
    const { updateAdminSecurity } = useUsers();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [pin, setPin] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (password && password.length < 6) {
            setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        if (password !== confirm) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }

        if (pin && (pin.length !== 6 || isNaN(pin))) {
            setMessage({ type: 'error', text: 'El PIN debe ser de 6 dígitos numéricos.' });
            return;
        }

        if (!password && !pin) {
            setMessage({ type: 'error', text: 'Ingresa al menos un cambio (contraseña o PIN).' });
            return;
        }

        setIsProcessing(true);
        try {
            const result = await updateAdminSecurity(adminId, {
                newPassword: password || null,
                newPin: pin || null
            });

            if (result.success) {
                if (result.emailSent) {
                    setMessage({ type: 'success', text: 'Seguridad actualizada y correo de alerta enviado con éxito.' });
                } else {
                    setMessage({ type: 'error', text: `Seguridad actualizada pero NO se pudo enviar el correo: ${result.emailError}. Revisa tu configuración de EmailJS.` });
                }
                setPassword('');
                setConfirm('');
                setPin('');
            } else {
                setMessage({ type: 'error', text: result.error || 'Error al actualizar seguridad.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error crítico al procesar la seguridad.' });
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto border border-white/40 shadow-xl overflow-hidden relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            )}

            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Seguridad del Administrador</h3>
                    <p className="text-sm text-slate-500">Actualiza tus credenciales de acceso y PIN de protección.</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Contraseña</h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Nueva Contraseña</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="input-field pl-10 text-sm"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Confirmar Contraseña</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                className="input-field pl-10 text-sm"
                                placeholder="Repite la contraseña"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Protección 2FA (PIN)</h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">PIN de Seguridad (6 dígitos)</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                className="input-field pl-10 text-sm font-mono tracking-widest"
                                placeholder="••••••"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                            Este PIN se te solicitará para acciones críticas y como segundo paso opcional al iniciar sesión.
                        </p>
                    </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-between items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-700 leading-tight">
                            <strong>Nota:</strong> Cualquier cambio en esta sección enviará una alerta automática al correo tech.innova.reg@gmail.com por seguridad.
                        </p>
                    </div>
                    <button type="submit" disabled={isProcessing} className="btn-primary whitespace-nowrap px-8 py-3 shadow-lg shadow-primary-900/20">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

// ─── Panel principal de administración ───────────────────────────────────────
const AdminPanel = () => {
    const { users, loading } = useUsers();
    const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' or 'security'
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (window.confirm('⚠️ ADVERTENCIA: Esta acción sobrescribirá los datos actuales con los del archivo de respaldo. Se recomienda hacer una copia de seguridad actual antes de proceder. ¿Continuar?')) {
            try {
                await importData(file);
                alert('Datos restaurados correctamente. La página se recargará.');
                window.location.reload();
            } catch (error) {
                console.error(error);
                alert('Error al importar el archivo. Verifica que sea un JSON válido generado por esta aplicación.');
            }
        }
        e.target.value = null;
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = users.filter(u => u.status === 'active').length;
    const expiredCount = users.filter(u => {
        if (u.role === 'admin') return false;
        const h = u.licenseHistory || [];
        if (!h.length) return true;
        const latest = [...h].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
        return new Date(latest.endDate) < new Date();
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary-600" />
                        Panel de Administración
                    </h2>
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={() => setActiveSubTab('users')}
                            className={`text-sm font-bold pb-1 transition-all ${activeSubTab === 'users' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => setActiveSubTab('security')}
                            className={`text-sm font-bold pb-1 transition-all ${activeSubTab === 'security' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Seguridad
                        </button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleImport}
                        className="hidden"
                    />

                    <button
                        onClick={async () => await exportData()}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-200"
                        title="Descargar copia de seguridad"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Backup</span>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-slate-200"
                        title="Restaurar datos desde archivo"
                    >
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Restaurar</span>
                    </button>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary-900/20"
                    >
                        <Shield className="w-4 h-4" />
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            {activeSubTab === 'users' ? (
                <>
                    {/* Stats rápidas */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-card p-4 rounded-2xl text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Usuarios</p>
                            <p className="text-3xl font-bold text-primary-600">{users.length}</p>
                        </div>
                        <div className="glass-card p-4 rounded-2xl text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Activos</p>
                            <p className="text-3xl font-bold text-emerald-500">{activeCount}</p>
                        </div>
                        <div className="glass-card p-4 rounded-2xl text-center">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Vencidos</p>
                            <p className="text-3xl font-bold text-red-500">{expiredCount}</p>
                        </div>
                    </div>

                    {/* Buscador */}
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field"
                        placeholder="Buscar por nombre o correo..."
                    />

                    {/* Lista de usuarios */}
                    <div className="space-y-3">
                        {filtered.length === 0 ? (
                            <div className="glass-card p-8 rounded-2xl text-center text-slate-400">
                                No se encontraron usuarios.
                            </div>
                        ) : (
                            filtered.map(user => <UserRow key={user.id} user={user} />)
                        )}
                    </div>
                </>
            ) : (
                <AdminSecurity adminId="superadmin" />
            )}

            {/* Modal de creación */}
            {showForm && <UserForm onClose={() => setShowForm(false)} />}
        </div>
    );
};

export default AdminPanel;
