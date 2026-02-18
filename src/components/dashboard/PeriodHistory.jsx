import React from 'react';
import { usePeriods } from '../../hooks/usePeriods';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, PlusCircle } from 'lucide-react';

const PeriodHistory = ({ userId, onCreateNew }) => {
    const { periods, getPeriodStats } = usePeriods(userId);

    const archivedPeriods = periods
        .filter(p => p.status === 'archived')
        .sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));

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

            {archivedPeriods.length === 0 ? (
                <div className="glass-card p-12 rounded-2xl text-center">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hay períodos archivados aún.</p>
                    <p className="text-slate-400 text-sm mt-1">Los períodos completados o archivados aparecerán aquí.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {archivedPeriods.map(period => {
                        const stats = getPeriodStats(period);
                        const isCompleted = stats.owed > 0 && stats.balance === 0;
                        const progressPct = stats.owed > 0 ? Math.min(100, (stats.recovered / stats.owed) * 100) : 0;

                        return (
                            <div key={period.id} className="glass-card p-6 rounded-2xl">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-xl ${isCompleted ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                            <CheckCircle2 className={`w-6 h-6 ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{period.name}</h3>
                                            <p className="text-slate-500 text-sm">
                                                Creado: {format(parseISO(period.createdAt), 'dd MMM yyyy', { locale: es })}
                                                {period.completedAt && (
                                                    <> · Archivado: {format(parseISO(period.completedAt), 'dd MMM yyyy', { locale: es })}</>
                                                )}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {isCompleted ? 'Completado' : 'Archivado'}
                                            </span>
                                        </div>
                                    </div>

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
