import React, { useState } from 'react';
import { useUsers, LICENSE_TYPES, PLANS } from '../../hooks/useUsers';
import { X, UserPlus, Mail, User, Calendar, Palmtree, FileText, CheckCircle2 } from 'lucide-react';

const UserForm = ({ onClose }) => {
    const { createUser } = useUsers();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [licenseType, setLicenseType] = useState('annual');
    const [plan, setPlan] = useState('basic');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await createUser({ name: name.trim(), email: email.trim(), licenseType, plan });
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary-600" />
                        Nuevo Usuario
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="text-center py-6">
                        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserPlus className="w-7 h-7 text-emerald-600" />
                        </div>
                        <p className="font-semibold text-slate-800">¡Usuario creado!</p>
                        <p className="text-slate-500 text-sm mt-1">
                            El usuario deberá crear su contraseña en el primer acceso.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Nombre del usuario"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="correo@empresa.com"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Este será el usuario de acceso al sistema.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Período de Licencia</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <select
                                    value={licenseType}
                                    onChange={e => setLicenseType(e.target.value)}
                                    className="input-field pl-10"
                                >
                                    {Object.entries(LICENSE_TYPES).map(([key, val]) => (
                                        <option key={key} value={key}>
                                            {val.label} ({val.days} días)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Plan de Servicio</label>
                            <div className="grid grid-cols-1 gap-3">
                                {Object.entries(PLANS).map(([key, val]) => (
                                    <label
                                        key={key}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${plan === key ? `border-${val.color}-500 bg-${val.color}-50 text-${val.color}-700` : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black uppercase">{val.label}</span>
                                            <span className="text-[10px] opacity-70">
                                                {key === 'basic' && 'Solo Horas'}
                                                {key === 'essential' && 'Horas + Vacaciones'}
                                                {key === 'pro' && 'Horas + Vacaciones + Boletas'}
                                            </span>
                                        </div>
                                        <input
                                            type="radio"
                                            name="plan"
                                            checked={plan === key}
                                            onChange={() => setPlan(key)}
                                            className="hidden"
                                        />
                                        {plan === key && <CheckCircle2 className="w-5 h-5" />}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                            <strong>Nota:</strong> El usuario recibirá acceso con su correo y deberá crear su propia contraseña en el primer inicio de sesión.
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
                                Cancelar
                            </button>
                            <button type="submit" className="flex-1 btn-primary">
                                Crear Usuario
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserForm;
