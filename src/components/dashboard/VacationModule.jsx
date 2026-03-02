import React, { useState } from 'react';
import { useVacations } from '../../hooks/useVacations';
import { Palmtree, Calendar, Plus, Trash2 } from 'lucide-react';

const VacationModule = ({ userId }) => {
    // 1. Hooks siempre al inicio
    const { vacations, loading, addVacation, deleteVacation, getStats } = useVacations(userId);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'block', // 'block' or 'flexible'
        notes: ''
    });

    // 2. Cálculos derivados
    const currentYear = new Date().getFullYear();
    const stats = getStats(currentYear);

    const calculateDays = (start, end) => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);
        const diffTime = Math.abs(e - s);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    // 3. Early return para loading (después de hooks)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium">Cargando vacaciones...</p>
            </div>
        );
    }

    // Handlers
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Palmtree className="text-primary-600" />
                        Vacaciones {currentYear}
                    </h2>
                    <p className="text-slate-500 text-sm">Control de periodos según D.L. 1405</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Programar Descanso
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-[32px] border-b-4 border-b-primary-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Anual</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-slate-800">{stats.total}</p>
                        <p className="text-slate-400 font-bold text-sm uppercase">Días</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-[32px] border-b-4 border-b-emerald-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fraccionamiento Flexible (1-6 días)</p>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-3xl font-black text-emerald-600">{stats.flexibleRemaining} / 7</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Disponibles</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(stats.flexibleUsed / 7) * 100}%` }} />
                    </div>
                </div>
                <div className="glass-card p-6 rounded-[32px] border-b-4 border-b-blue-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Bloques Generales (min. 7 días)</p>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-3xl font-black text-blue-600">{stats.blocksRemaining} / 23</p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Disponibles</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${(stats.blocksUsed / 23) * 100}%` }} />
                    </div>
                </div>
            </div>

            {isAdding && (
                <div className="glass-panel p-8 rounded-[32px] border-2 border-primary-100 animate-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-primary-600" />
                                Nuevo Periodo Vacacional
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">Completa las fechas para programar tu descanso.</p>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Descanso</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-slate-700"
                                >
                                    <option value="block">Bloque (mín. 7 días)</option>
                                    <option value="flexible">Flexible (desde 1 día)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fecha Inicio</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fecha Fin</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Notas</label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Opcional..."
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500/20 transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 items-center">
                            <div className="mr-auto text-sm font-bold text-slate-400">
                                Total: <span className="text-primary-700 font-black">{calculateDays(formData.startDate, formData.endDate)} días</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-8 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-4 rounded-2xl bg-primary-700 text-white font-black shadow-xl shadow-primary-900/20 hover:bg-primary-800 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Confirmar Periodo
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Días</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {vacations.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <Palmtree className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">No has programado vacaciones aún.</p>
                                </td>
                            </tr>
                        ) : (
                            vacations.map(vac => (
                                <tr key={vac.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-slate-700">{new Date(vac.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(vac.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                    </td>
                                    <td className="px-8 py-5 font-black text-slate-800">{vac.days} d</td>
                                    <td className="px-8 py-5 text-sm">
                                        <span className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${vac.type === 'block' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {vac.type === 'block' ? 'Bloque' : 'Flexible'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-500 italic max-w-xs truncate">{vac.notes || '-'}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Eliminar este periodo de vacaciones?')) {
                                                    deleteVacation(vac.id);
                                                }
                                            }}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VacationModule;
