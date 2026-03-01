import React from 'react';
import { usePeriods } from '../../hooks/usePeriods';
import CreatePeriod from './CreatePeriod';
import HistoryTable from './HistoryTable';
import EntryForm from './EntryForm';
import OverviewCharts from './OverviewCharts';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { Archive, FileSpreadsheet, FileText, ArrowLeft, Plus, ChevronDown, Trash2, Clock, CheckCircle2, History } from 'lucide-react';

const Dashboard = ({ userId, showCreate, onCreateDone, viewPeriodId = null, onBackToActive, onSelectPeriod, onStartCreate }) => {
    const {
        periods,
        activePeriod,
        loading,
        createPeriod,
        addEntry,
        editEntry,
        deleteEntry,
        getPeriodStats,
        archivePeriod,
        deletePeriod,
    } = usePeriods(userId);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // El periodo a mostrar: el seleccionado (si existe) o el activo
    const targetPeriod = viewPeriodId
        ? periods.find(p => p.id === viewPeriodId)
        : activePeriod;

    const isArchived = targetPeriod?.status === 'archived';

    // Si se solicita crear y no hay período activo → mostrar formulario de creación
    if ((!targetPeriod && !loading && !periods.length) || (showCreate && !viewPeriodId)) {
        return (
            <CreatePeriod
                onCreate={async (name) => {
                    const newPeriod = await createPeriod(name);
                    if (newPeriod?.id) {
                        onCreateDone?.(newPeriod.id);
                    } else {
                        onCreateDone?.();
                    }
                }}
            />
        );
    }

    const stats = targetPeriod ? getPeriodStats(targetPeriod) : null;

    const handleAddEntry = async (type, data) => {
        try {
            const result = await addEntry(type, data, targetPeriod.id);
            if (result?.completed && !isArchived) {
                alert('¡Felicidades! Has recuperado todas las horas pendientes. El período se ha completado y archivado.');
                await archivePeriod(targetPeriod.id);
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

    return (
        <div className="space-y-6">
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
                    <div className="relative group">
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-2xl font-bold text-slate-800">{targetPeriod?.name || 'Selecciona un Periodo'}</h2>
                            <div className="bg-slate-100 p-1 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        {/* Period Selector Dropdown */}
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tus Periodos</p>
                            <div className="max-h-48 overflow-y-auto custom-scrollbar">
                                {periods.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => onSelectPeriod?.(p.id)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between ${targetPeriod?.id === p.id ? 'bg-primary-50 text-primary-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        <span className="truncate">{p.name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${p.status === 'archived' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}>
                                            {p.status === 'archived' ? 'Arch.' : 'Act.'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-slate-50 mt-2 pt-2">
                                <button
                                    onClick={() => onStartCreate?.()}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary-600 font-bold hover:bg-primary-50 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nuevo Período
                                </button>
                            </div>
                        </div>

                        {targetPeriod && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${isArchived ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                {isArchived ? `Archivado ${targetPeriod.completedAt && `el ${new Date(targetPeriod.completedAt).toLocaleDateString()}`}` : 'En Progreso'}
                            </span>
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
