import React from 'react';
import { usePeriods } from '../../hooks/usePeriods';
import CreatePeriod from './CreatePeriod';
import HistoryTable from './HistoryTable';
import EntryForm from './EntryForm';
import OverviewCharts from './OverviewCharts';
import { useUsers } from '../../hooks/useUsers';
import { useGamification } from '../../hooks/useGamification';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { Archive, FileSpreadsheet, FileText, ArrowLeft, Plus, ChevronDown, Trash2, Clock, CheckCircle2, History } from 'lucide-react';

const Dashboard = ({ userId, showCreate, onCreateDone, viewPeriodId = null, onBackToActive, onSelectPeriod, onStartCreate }) => {
    // 1. Hooks siempre al inicio
    const {
        periods,
        activePeriod,
        loading,
        addEntry,
        deleteEntry,
        editEntry,
        createPeriod,
        archivePeriod,
        getPeriodStats,
        deletePeriod,
    } = usePeriods(userId);

    const { users, updateUser } = useUsers();
    const currentUser = users.find(u => u.id === userId);
    const gamification = useGamification(currentUser, updateUser);

    const [showSelector, setShowSelector] = React.useState(false);

    // 2. Cálculos derivados (después de todos los hooks)
    const targetPeriod = viewPeriodId
        ? periods.find(p => p.id === viewPeriodId)
        : activePeriod;

    const stats = targetPeriod ? getPeriodStats(targetPeriod) : { owed: 0, recovered: 0, balance: 0 };
    const isArchived = targetPeriod?.status === 'archived';

    // 3. Early return para loading (después de hooks)
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium font-mono text-xs uppercase tracking-widest">Sincronizando con la nube...</p>
            </div>
        );
    }

    // Handlers
    const handleAddEntry = async (type, data) => {
        try {
            const result = await addEntry(type, data, targetPeriod.id);
            if (result?.completed && !isArchived) {
                gamification.triggerCelebration();
                alert('¡Felicidades! Has recuperado todas las horas pendientes. El período se ha completado y archivado.');
                await archivePeriod(targetPeriod.id);
            }

            // Actualizar gamificación si es recuperación
            if (type === 'recovered') {
                await gamification.updateStats(Number(data.hours));
            }
        } catch (error) {
            alert(error.message);
        }
    };

    const handleEditEntry = (entryId, data) => editEntry(entryId, data, targetPeriod.id);
    const handleDeleteEntry = (entryId) => deleteEntry(entryId, targetPeriod.id);

    const handleDeletePeriod = async () => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el período "${targetPeriod.name}"? Esta acción no se puede deshacer.`)) {
            try {
                await deletePeriod(targetPeriod.id);
                onBackToActive?.();
            } catch {
                alert('Error al eliminar el período');
            }
        }
    };

    // Si se solicita crear o no hay períodos
    if ((!targetPeriod && !periods.length) || (showCreate && !viewPeriodId)) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <button onClick={onBackToActive} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Nuevo Período</h2>
                </div>
                <CreatePeriod
                    onCreate={async (name) => {
                        const newId = await createPeriod(name);
                        onCreateDone?.(newId?.id || null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header del período */}
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                    {onBackToActive && viewPeriodId && (
                        <button
                            onClick={onBackToActive}
                            className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm border border-slate-100"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {activePeriod ? 'Volver al Activo' : 'Panel de Inicio'}
                        </button>
                    )}
                    <div className="relative">
                        <div className="flex flex-col">
                            <button
                                onClick={() => setShowSelector(!showSelector)}
                                className="flex items-center gap-2 group text-left"
                            >
                                <h2 className="text-2xl font-black text-slate-800 group-hover:text-primary-700 transition-colors uppercase tracking-tight">
                                    {targetPeriod?.name || 'Escoger Periodo'}
                                </h2>
                                <div className={`p-1.5 rounded-lg transition-all ${showSelector ? 'bg-primary-600 text-white rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600'}`}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </button>

                            {targetPeriod && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest mt-1 w-fit ${isArchived ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                    {isArchived ? `Completado` : 'En Progreso'}
                                </span>
                            )}
                        </div>

                        {/* Period Selector Dropdown */}
                        {showSelector && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowSelector(false)} />
                                <div className="absolute top-full left-0 mt-3 w-72 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between px-3 py-2 mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tus Periodos</p>
                                        <History className="w-3 h-3 text-slate-300" />
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
                                        {periods.length === 0 ? (
                                            <p className="text-xs text-slate-400 text-center py-4 italic px-4">No tienes periodos creados aún.</p>
                                        ) : periods.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    onSelectPeriod?.(p.id);
                                                    setShowSelector(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex items-center justify-between border-2 ${targetPeriod?.id === p.id
                                                    ? 'bg-primary-700 border-primary-700 text-white shadow-lg shadow-primary-900/20'
                                                    : 'bg-slate-50 border-transparent hover:border-primary-100 hover:bg-white text-slate-600 shadow-sm'}`}
                                            >
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate font-bold">{p.name}</span>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest opacity-60`}>
                                                        {p.status === 'archived' ? 'Histórico' : 'Vigente'}
                                                    </span>
                                                </div>
                                                {targetPeriod?.id === p.id && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="border-t border-slate-50 mt-3 pt-3">
                                        <button
                                            onClick={() => {
                                                onStartCreate?.();
                                                setShowSelector(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-primary-700 font-black bg-primary-50 hover:bg-primary-100 transition-all uppercase tracking-wider"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Nuevo Período
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {targetPeriod && (
                        <div className="flex items-center gap-2 bg-white/40 p-1 rounded-2xl border border-white/40 shadow-sm">
                            <button
                                onClick={() => exportToExcel(targetPeriod, stats)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all"
                                title="Exportar a Excel"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Excel
                            </button>
                            <div className="w-px h-4 bg-slate-200" />
                            <button
                                onClick={() => exportToPDF(targetPeriod, stats)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-red-700 hover:bg-red-50 text-xs font-bold transition-all"
                                title="Exportar a PDF"
                            >
                                <FileText className="w-4 h-4" />
                                PDF
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {targetPeriod && !isArchived && (
                            <button
                                onClick={() => {
                                    if (window.confirm('¿Archivar este período manualmente?')) {
                                        archivePeriod(targetPeriod.id);
                                    }
                                }}
                                className="btn-secondary flex items-center gap-2 text-xs py-2"
                                title="Archivar período actual"
                            >
                                <Archive className="w-4 h-4" />
                                Archivar
                            </button>
                        )}
                        <button
                            onClick={() => onStartCreate?.()}
                            className="btn-primary flex items-center gap-2 text-xs py-2 shadow-md shadow-primary-900/10"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Período
                        </button>
                    </div>

                    {targetPeriod && (
                        <div className="pl-2 border-l border-slate-200 ml-2">
                            <button
                                onClick={handleDeletePeriod}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 text-xs font-bold transition-all"
                                title="Eliminar este período permanentemente"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {targetPeriod ? (
                <>
                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-[32px] relative overflow-hidden group">
                            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Deuda</p>
                                    <p className="text-3xl font-black text-red-600">{stats.owed}<span className="text-sm font-bold ml-1 text-red-300">horas</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-[32px] relative overflow-hidden group">
                            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Recuperado</p>
                                    <p className="text-3xl font-black text-emerald-600">{stats.recovered}<span className="text-sm font-bold ml-1 text-emerald-300">horas</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-[32px] relative overflow-hidden group border-amber-100">
                            <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                                    <History className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Pendiente</p>
                                    <p className="text-3xl font-black text-amber-600">{stats.balance}<span className="text-sm font-bold ml-1 text-amber-300">horas</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario + Gráfico | Tabla */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            <EntryForm onAdd={handleAddEntry} activePeriodStats={stats} />
                            {stats.owed > 0 && <OverviewCharts stats={stats} />}
                        </div>
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Historial de Registros</h3>
                                {targetPeriod.entries.length > 0 && (
                                    <span className="text-xs text-slate-400">{targetPeriod.entries.length} registro(s)</span>
                                )}
                            </div>
                            <HistoryTable entries={targetPeriod.entries} onDelete={handleDeleteEntry} onEdit={handleEditEntry} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="glass-card p-12 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No has seleccionado un período</h3>
                    <p className="text-slate-500 mb-6">Elige uno del selector arriba o crea uno nuevo para empezar a registrar tus horas.</p>
                    <button onClick={() => onStartCreate?.()} className="btn-primary">
                        Crear mi Primer Período
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
