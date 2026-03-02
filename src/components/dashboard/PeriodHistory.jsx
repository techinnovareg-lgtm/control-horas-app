import React from 'react';
import { usePeriods } from '../../hooks/usePeriods';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, PlusCircle, Trash2 } from 'lucide-react';

const PeriodHistory = ({ userId, onCreateNew, onViewPeriod }) => {
    const { periods, getPeriodStats, loading, deletePeriod } = usePeriods(userId);

    const sortedPeriods = [...periods]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Historial de Períodos</h2>
                    <p className="text-slate-500 text-sm mt-1">Períodos archivados y completados</p>
                </div>
                <button onClick={onCreateNew} className="btn-primary flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Nuevo Período
                </button>
            </div>

            {sortedPeriods.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hay períodos registrados aún.</p>
                    <p className="text-slate-400 text-sm mt-1">Los períodos que crees aparecerán aquí.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedPeriods.map(period => {
                        const stats = getPeriodStats(period);
                        const isActive = period.status === 'active';
                        const isCompleted = stats.owed > 0 && stats.balance === 0;
                        const progressPct = stats.owed > 0 ? Math.min(100, (stats.recovered / stats.owed) * 100) : 0;

                        return (
                            <div key={period.id} className={`glass-card p-6 rounded-2xl border-l-4 ${isActive ? 'border-l-primary-500' : 'border-l-slate-300'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-xl ${isActive ? 'bg-primary-50' : isCompleted ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                            {isActive ? <Clock className="w-6 h-6 text-primary-600" /> : <CheckCircle2 className={`w-6 h-6 ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{period.name}</h3>
                                            <p className="text-slate-500 text-sm">
                                                Creado: {format(parseISO(period.createdAt), 'dd MMM yyyy', { locale: es })}
                                                {period.completedAt && (
                                                    <> · Archivado: {format(parseISO(period.completedAt), 'dd MMM yyyy', { locale: es })}</>
                                                )}
                                            </p>
                                            <div className="flex gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {isActive ? 'EN PROGRESO' : 'ARCHIVADO'}
                                                </span>
                                                {isCompleted && !isActive && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 bg-emerald-100 text-emerald-700 uppercase">
                                                        Completado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <div className="flex gap-3 text-center">
                                            <div className="px-3 py-2 bg-red-50 rounded-xl">
                                                <p className="text-xs text-slate-500 font-bold uppercase">Deuda</p>
                                                <p className="text-xl font-bold text-red-500">{stats.owed}h</p>
                                            </div>
                                            <div className="px-3 py-2 bg-emerald-50 rounded-xl">
                                                <p className="text-xs text-slate-500 font-bold uppercase">Recuperado</p>
                                                <p className="text-xl font-bold text-emerald-500">{stats.recovered}h</p>
                                            </div>
                                            <div className="px-3 py-2 bg-amber-50 rounded-xl">
                                                <p className="text-xs text-slate-500 font-bold uppercase">Pendiente</p>
                                                <p className="text-xl font-bold text-amber-500">{stats.balance}h</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => onViewPeriod(period.id)}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                                            >
                                                <PlusCircle className="w-4 h-4 rotate-45" />
                                                Ver Detalles
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`¿Eliminar permanentemente el período "${period.name}"?`)) {
                                                        deletePeriod(period.id);
                                                    }
                                                }}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl text-xs font-bold transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {stats.owed > 0 && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>Progreso de recuperación</span>
                                            <span>{Math.round(progressPct)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PeriodHistory;
