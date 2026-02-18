import React from 'react';
import { usePeriods } from '../../hooks/usePeriods';
import CreatePeriod from './CreatePeriod';
import HistoryTable from './HistoryTable';
import EntryForm from './EntryForm';
import OverviewCharts from './OverviewCharts';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { Archive, FileSpreadsheet, FileText } from 'lucide-react';

const Dashboard = ({ userId, showCreate, onCreateDone }) => {
    const {
        activePeriod,
        createPeriod,
        addEntry,
        editEntry,
        deleteEntry,
        getPeriodStats,
        archivePeriod,
    } = usePeriods(userId);

    // Si se solicita crear y no hay período activo → mostrar formulario de creación
    if (!activePeriod || showCreate) {
        return (
            <CreatePeriod
                onCreate={(name) => {
                    createPeriod(name);
                    onCreateDone?.();
                }}
            />
        );
    }

    const stats = getPeriodStats(activePeriod);

    const handleAddEntry = (type, data) => {
        const result = addEntry(type, data);
        if (result?.completed) {
            alert('¡Felicidades! Has recuperado todas las horas pendientes. El período se ha completado y archivado.');
            archivePeriod(activePeriod.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header del período */}
            <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{activePeriod.name}</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        En Progreso
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => exportToExcel(activePeriod, stats)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                    </button>
                    <button
                        onClick={() => exportToPDF(activePeriod, stats)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-500/20"
                    >
                        <FileText className="w-4 h-4" />
                        PDF
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Archivar este período manualmente?')) {
                                archivePeriod(activePeriod.id);
                            }
                        }}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <Archive className="w-4 h-4" />
                        Archivar
                    </button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 rounded-2xl text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Deuda</p>
                    <p className="text-3xl font-bold text-red-500">{stats.owed}<span className="text-lg">h</span></p>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Recuperado</p>
                    <p className="text-3xl font-bold text-emerald-500">{stats.recovered}<span className="text-lg">h</span></p>
                </div>
                <div className="glass-card p-4 rounded-2xl text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Pendiente</p>
                    <p className="text-3xl font-bold text-amber-500">{stats.balance}<span className="text-lg">h</span></p>
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
                        {activePeriod.entries.length > 0 && (
                            <span className="text-xs text-slate-400">{activePeriod.entries.length} registro(s)</span>
                        )}
                    </div>
                    <HistoryTable entries={activePeriod.entries} onDelete={deleteEntry} onEdit={editEntry} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
