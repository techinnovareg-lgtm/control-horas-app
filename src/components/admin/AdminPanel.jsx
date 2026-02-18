import React, { useRef, useState } from 'react';
import { useUsers, LICENSE_TYPES } from '../../hooks/useUsers';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Users, UserPlus, Shield, CheckCircle2, XCircle,
    RefreshCw, Mail, Key, ChevronDown, ChevronUp,
    Clock, Calendar, AlertTriangle, Search, CreditCard, Trash2, Upload, Download, FileJson
} from 'lucide-react';
import UserForm from './UserForm';
import { exportData, importData } from '../../utils/backupUtils';

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
    const { getLicenseStatus, resetPassword, updateEmail, renewLicense, deactivateUser, activateUser } = useUsers();
    const [expanded, setExpanded] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [newEmail, setNewEmail] = useState(user.email);
    const [renewType, setRenewType] = useState('annual');
    const [emailError, setEmailError] = useState('');

    const status = getLicenseStatus(user);
    const isSuperAdmin = user.id === 'superadmin';

    const handleEmailSave = () => {
        setEmailError('');
        try {
            updateEmail(user.id, newEmail);
            setEditEmail(false);
        } catch (e) {
            setEmailError(e.message);
        }
    };

    const handleRenew = () => {
        renewLicense(user.id, renewType);
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
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
                                />
                                <button onClick={handleEmailSave} className="btn-primary text-sm px-3">Guardar</button>
                                <button onClick={() => { setEditEmail(false); setNewEmail(user.email); }} className="btn-secondary text-sm px-3">Cancelar</button>
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
                            onClick={() => { if (window.confirm(`¿Resetear contraseña de ${user.name}? Deberá crear una nueva en su próximo acceso.`)) resetPassword(user.id); }}
                            className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Resetear contraseña
                        </button>
                    </div>

                    {/* Licencia */}
                    {user.role !== 'admin' && (
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Licencia
                            </p>
                            <div className="flex flex-wrap gap-2 items-center">
                                <select
                                    value={renewType}
                                    onChange={e => setRenewType(e.target.value)}
                                    className="input-field text-sm py-1.5 w-auto"
                                >
                                    {Object.entries(LICENSE_TYPES).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                                <button onClick={handleRenew} className="btn-primary text-sm px-4 py-1.5 flex items-center gap-1.5">
                                    <RefreshCw className="w-4 h-4" />
                                    Renovar
                                </button>
                                {user.status === 'active'
                                    ? <button onClick={() => { if (window.confirm(`¿Desactivar a ${user.name}?`)) deactivateUser(user.id); }} className="text-sm text-red-500 hover:text-red-700 font-medium">Desactivar</button>
                                    : <button onClick={() => activateUser(user.id)} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">Reactivar</button>
                                }
                            </div>

                            {/* Historial de licencias */}
                            {user.licenseHistory?.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs text-slate-400 mb-1.5 font-medium">Historial de suscripciones</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {[...user.licenseHistory]
                                            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                                            .map((entry, i) => {
                                                const expired = new Date(entry.endDate) < new Date();
                                                return (
                                                    <div key={i} className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${expired ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {LICENSE_TYPES[entry.type]?.label || entry.type}
                                                        </span>
                                                        <span>
                                                            {format(parseISO(entry.startDate), 'dd/MM/yy')} → {format(parseISO(entry.endDate), 'dd/MM/yy')}
                                                        </span>
                                                        <span className={`font-medium ${expired ? 'text-slate-400' : 'text-emerald-600'}`}>
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

                    {/* Info adicional */}
                    <div className="text-xs text-slate-400 flex flex-wrap gap-4 pt-1 border-t border-slate-100">
                        <span>Creado: {format(parseISO(user.createdAt), 'dd MMM yyyy', { locale: es })}</span>
                        {user.lastLoginAt && (
                            <span>Último acceso: {format(parseISO(user.lastLoginAt), 'dd MMM yyyy HH:mm', { locale: es })}</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Panel principal de administración ───────────────────────────────────────
const AdminPanel = () => {
    const { users } = useUsers();
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

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
                    <p className="text-slate-500 text-sm mt-1">Gestión de usuarios y licencias</p>
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
                        onClick={() => exportData()}
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

            {/* Modal de creación */}
            {showForm && <UserForm onClose={() => setShowForm(false)} />}
        </div>
    );
};

export default AdminPanel;
