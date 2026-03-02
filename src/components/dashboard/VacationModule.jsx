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
    const userRole = vacations[0]?.userRole; // Mocking role detection if not passed
    // We should ideally have the full user object. Let's assume we can get it from vacations or props
    // For now, let's add a route selector state
    const [calcRoute, setCalcRoute] = useState('30'); // '30' calendarios o '22' hábiles
    const stats = getStats(currentYear, calcRoute, 'administrativo'); // Mocking staffType for testing logic

    const isBusinessDay = (date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6; // 0: Sunday, 6: Saturday
    };

    const calculateDays = (start, end, route = '30') => {
        if (!start || !end) return 0;
        const s = new Date(start);
        const e = new Date(end);

        if (route === '22') {
            let count = 0;
            let current = new Date(s);
            while (current <= e) {
                if (isBusinessDay(current)) count++;
                current.setDate(current.getDate() + 1);
            }
            return count;
        } else {
            const diffTime = Math.abs(e - s);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }
    };

    // 3. Early return para loading (después de hooks)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium tracking-wide">Cargando vacaciones...</p>
            </div>
        );
    }

    // Handlers
    const handleAdd = async (e) => {
        e.preventDefault();
        const days = calculateDays(formData.startDate, formData.endDate, calcRoute);

        if (days > stats.remaining) {
            alert(`Solo te quedan ${stats.remaining} días disponibles.`);
            return;
        }

        try {
            await addVacation({ ...formData, days, route: calcRoute });
            setIsAdding(false);
            setFormData({ startDate: '', endDate: '', type: 'flexible', notes: '' });
        } catch (error) {
            alert('Error al guardar las vacaciones');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Palmtree className="text-primary-600 animate-bounce-subtle" />
                        Vacaciones {currentYear}
                    </h2>
                    <p className="text-slate-500 text-sm">Flexibilidad total según tus necesidades</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn-primary flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Programar Descanso
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-[32px] border-b-4 border-b-primary-500 transition-all hover:-translate-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resumen Anual</p>
                    <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-black text-slate-800">{stats.remaining}</p>
                            <p className="text-slate-400 font-bold text-sm uppercase">Días Libres</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Total: {stats.total}</p>
                            <p className="text-xs font-bold text-emerald-500 uppercase">Usados: {stats.used}</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-[32px] border-b-4 border-b-emerald-500 transition-all hover:-translate-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Configuración de Cálculo</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCalcRoute('30')}
                            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${calcRoute === '30' ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Ruta 30 (Calendario)
                        </button>
                        <button
                            onClick={() => setCalcRoute('22')}
                            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${calcRoute === '22' ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Ruta 22 (Hábiles)
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 italic">
                        {calcRoute === '30' ? '* Incluye sábados y domingos en el conteo.' : '* Solo cuenta de Lunes a Viernes (Ideal para administrativos).'}
                    </p>
                </div>
            </div>

            {isAdding && (
                <div className="glass-panel p-8 rounded-[32px] border-2 border-primary-100 animate-in zoom-in-95 duration-300 shadow-2xl">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-primary-600" />
                                Solicitar Periodo
                            </h3>
                            <p className="text-slate-500 text-sm mt-1">Selecciona tus fechas. No hay restricciones de bloques.</p>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                            <Trash2 className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <form onSubmit={handleAdd} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fecha Inicio</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fecha Fin</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Motivo / Notas</label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Ej: Viaje familiar..."
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-primary-500/10 transition-all font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 items-center pt-4 border-t border-slate-50">
                            <div className="mr-auto">
                                <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Días a descontar</span>
                                <span className="text-2xl font-black text-primary-700">{calculateDays(formData.startDate, formData.endDate, calcRoute)} días</span>
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

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo Solicitado</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Días</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ruta Cal.</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {vacations.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <Palmtree className="w-16 h-16 text-slate-100 mx-auto mb-4 animate-pulse" />
                                    <p className="text-slate-400 font-medium">No has programado vacaciones aún.</p>
                                </td>
                            </tr>
                        ) : (
                            vacations.map(vac => (
                                <tr key={vac.id} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-slate-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-300" />
                                            {new Date(vac.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(vac.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-lg font-black text-slate-800">{vac.days} d</td>
                                    <td className="px-8 py-5 text-sm">
                                        <span className={`px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider ${vac.route === '22' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {vac.route === '22' ? 'Hábiles' : 'Calendario'}
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
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
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
