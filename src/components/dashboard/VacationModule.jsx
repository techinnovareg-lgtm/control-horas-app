import React, { useState } from 'react';
import { useVacations } from '../../hooks/useVacations';
import { Palmtree, Calendar, Plus, Trash2 } from 'lucide-react';

const VacationModule = ({ userId }) => {
    const { vacations, loading, addVacation, deleteVacation, getStats } = useVacations(userId);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'block', // 'block' or 'flexible'
        notes: ''
    });

    const currentYear = new Date().getFullYear();
    const stats = getStats(currentYear);

    const calculateDays = (start, end) => {
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e - s);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        const days = calculateDays(formData.startDate, formData.endDate);

        if (formData.type === 'block' && days < 7) {
            alert('Los periodos de bloque deben ser de al menos 7 días.');
            return;
        }

        if (formData.type === 'flexible' && days > stats.flexibleRemaining) {
            alert(`Solo te quedan ${stats.flexibleRemaining} días de fraccionamiento flexible.`);
            return;
        }

        if (formData.type === 'block' && days > stats.blocksRemaining) {
            alert(`Solo te quedan ${stats.blocksRemaining} días en bloques generales.`);
            return;
        }

        try {
            await addVacation({ ...formData, days });
            setIsAdding(false);
            setFormData({ startDate: '', endDate: '', type: 'block', notes: '' });
        } catch (error) {
            alert('Error al guardar las vacaciones');
        }
    };

    if (loading) return <div className="text-center py-10">Cargando vacaciones...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Palmtree className="text-primary-600" />
                        Gestión de Vacaciones {currentYear}
                    </h2>
                    <p className="text-slate-500 text-sm">Control de periodos según D.L. 1405</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Programar Vacaciones
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-3xl border-l-4 border-l-primary-500">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Anual</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-slate-800">{stats.total}</p>
                        <p className="text-slate-400 font-bold">Días</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border-l-4 border-l-emerald-500">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Fraccionamiento Flexible (1-6 días)</p>
                    <div className="flex justify-between items-center">
                        <p className="text-3xl font-black text-emerald-600">{stats.flexibleRemaining} / 7</p>
                        <span className="text-xs text-slate-400">Días libres</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(stats.flexibleUsed / 7) * 100}%` }} />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-3xl border-l-4 border-l-blue-500">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Bloques Generales (min. 7 días)</p>
                    <div className="flex justify-between items-center">
                        <p className="text-3xl font-black text-blue-600">{stats.blocksRemaining} / 23</p>
                        <span className="text-xs text-slate-400">Días en bloque</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${(stats.blocksUsed / 23) * 100}%` }} />
                    </div>
                </div>
            </div>

            {isAdding && (
                <div className="glass-panel p-8 rounded-3xl border-2 border-primary-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-600" />
                        Nuevo Periodo Vacacional
                    </h3>
                    <form onSubmit={handleAdd} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Descanso</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 bg-white"
                                >
                                    <option value="block">Bloque (mín. 7 días)</option>
                                    <option value="flexible">Flexible (desde 1 día)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha Inicio</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fecha Fin</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200"
                                />
                            </div>
                            <div className="flex items-end">
                                <button type="submit" className="btn-primary w-full py-3">Guardar Registro</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <h3 className="font-bold text-slate-800">Historial de Vacaciones</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Periodo</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Días</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Estado / Tipo</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {vacations.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400">No hay periodos registrados</td>
                                </tr>
                            ) : (
                                vacations.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700">
                                                {new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-primary-700">{v.days} días</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.type === 'flexible' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {v.type === 'flexible' ? 'Flexible' : 'Bloque'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteVacation(v.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VacationModule;
