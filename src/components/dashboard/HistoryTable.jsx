import React, { useState } from 'react';
import { Trash2, AlertCircle, CheckCircle2, Pencil, X, Check, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const HistoryTable = ({ entries, onDelete, onEdit }) => {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [error, setError] = useState(null);

    if (!entries || entries.length === 0) {
        return (
            <div className="glass-card p-8 rounded-2xl text-center">
                <p className="text-slate-500">No hay registros en este período.</p>
            </div>
        );
    }

    const startEdit = (entry) => {
        setEditingId(entry.id);
        setEditData({
            hours: entry.hours,
            date: entry.date,
            notes: entry.notes || ''
        });
        setError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
        setError(null);
    };

    const handleSave = async (entryId) => {
        try {
            if (!editData.date || !editData.hours) {
                setError('Completa los campos obligatorios.');
                return;
            }
            if (Number(editData.hours) <= 0) {
                setError('Las horas deben ser mayores a 0.');
                return;
            }

            const result = await onEdit(entryId, editData);
            if (result?.completed) {
                cancelEdit();
            } else {
                cancelEdit();
            }
        } catch (e) {
            setError(e.message);
        }
    };

    // Ordenar por fecha descendente
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Fecha</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Horas</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Notas</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedEntries.map((entry) => {
                            const isEditing = editingId === entry.id;

                            return (
                                <tr key={entry.id} className={`transition-colors ${isEditing ? 'bg-primary-50/50' : 'hover:bg-slate-50/50'}`}>
                                    {isEditing ? (
                                        // MODO EDICIÓN
                                        <>
                                            <td className="px-4 py-4 align-top">
                                                <input
                                                    type="date"
                                                    value={editData.date}
                                                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                                    className="w-full text-sm border-b border-primary-300 bg-transparent focus:outline-none focus:border-primary-600 text-slate-700 font-medium"
                                                />
                                            </td>
                                            <td className="px-6 py-4 align-top">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border opacity-80 ${entry.type === 'owed'
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {entry.type === 'owed' ? 'Falta' : 'Recuperación'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={editData.hours}
                                                    onChange={(e) => setEditData({ ...editData, hours: e.target.value })}
                                                    className="w-20 text-sm font-bold border-b border-primary-300 bg-transparent focus:outline-none focus:border-primary-600 text-slate-800"
                                                />
                                            </td>
                                            <td className="px-4 py-4 align-top">
                                                <input
                                                    type="text"
                                                    value={editData.notes}
                                                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                                                    className="w-full text-sm border-b border-primary-300 bg-transparent focus:outline-none focus:border-primary-600 text-slate-600"
                                                    placeholder="Añadir nota..."
                                                />
                                                {error && (
                                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" /> {error}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 align-top text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleSave(entry.id)}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg mr-1 transition-all"
                                                    title="Guardar"
                                                >
                                                    <Save className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Cancelar"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        // MODO LECTURA
                                        <>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {format(parseISO(entry.date), 'dd MMM yyyy', { locale: es })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${entry.type === 'owed'
                                                    ? 'bg-red-50 text-red-700 border-red-100'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {entry.type === 'owed' ? (
                                                        <><AlertCircle className="w-3 h-3" /> Falta</>
                                                    ) : (
                                                        <><CheckCircle2 className="w-3 h-3" /> Recuperación</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                                {entry.hours}h
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                                {entry.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => startEdit(entry)}
                                                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all mr-1"
                                                    title="Editar registro"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(entry.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTable;
