import React, { useState } from 'react';
import { Calendar, Save, AlertTriangle, Plus, Minus } from 'lucide-react';
import { format } from 'date-fns';

const MAX_HOURS = 8;
const MIN_HOURS = 1;

const EntryForm = ({ onAdd, activePeriodStats }) => {
    const [type, setType] = useState('owed'); // 'owed' | 'recovered'
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [hours, setHours] = useState(1);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const maxAllowed = type === 'owed'
        ? MAX_HOURS
        : Math.min(MAX_HOURS, activePeriodStats.balance);

    const increment = () => {
        setHours(h => Math.min(h + 1, maxAllowed));
        setError('');
    };

    const decrement = () => {
        setHours(h => Math.max(h - 1, MIN_HOURS));
        setError('');
    };

    const handleTypeChange = (newType) => {
        setType(newType);
        setHours(1);
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (type === 'recovered' && hours > activePeriodStats.balance) {
            setError(`No puedes recuperar más de lo pendiente (${activePeriodStats.balance}h).`);
            return;
        }

        if (type === 'recovered' && activePeriodStats.balance === 0) {
            setError('No tienes horas pendientes por recuperar.');
            return;
        }

        try {
            onAdd(type, { date, hours, notes });
            setHours(1);
            setNotes('');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl">
            {/* Tabs de tipo */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'owed' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    onClick={() => handleTypeChange('owed')}
                >
                    Registrar Falta
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'recovered' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    onClick={() => handleTypeChange('recovered')}
                >
                    Registrar Recuperación
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Fecha */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400 pointer-events-none" />
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                </div>

                {/* Selector de horas con +/- */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Horas <span className="text-slate-400 normal-case font-normal">(máx. {maxAllowed}h)</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={decrement}
                            disabled={hours <= MIN_HOURS}
                            className="w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Minus className="w-5 h-5" />
                        </button>

                        <div className="flex-1 text-center">
                            <span className={`text-4xl font-bold tabular-nums ${type === 'owed' ? 'text-red-500' : 'text-emerald-500'
                                }`}>
                                {hours}
                            </span>
                            <span className="text-slate-400 text-lg ml-1">h</span>
                        </div>

                        <button
                            type="button"
                            onClick={increment}
                            disabled={hours >= maxAllowed}
                            className="w-11 h-11 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Barra visual de horas */}
                    <div className="flex gap-1 mt-3">
                        {Array.from({ length: MAX_HOURS }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => { if (i + 1 <= maxAllowed) { setHours(i + 1); setError(''); } }}
                                className={`flex-1 h-2 rounded-full transition-all ${i < hours
                                        ? type === 'owed' ? 'bg-red-400' : 'bg-emerald-400'
                                        : i < maxAllowed ? 'bg-slate-200 hover:bg-slate-300 cursor-pointer' : 'bg-slate-100 cursor-not-allowed'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>1h</span>
                        <span>8h</span>
                    </div>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas (Opcional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="input-field text-sm resize-none"
                        rows="2"
                        placeholder="Motivo o descripción..."
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2 border border-red-100">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Botón guardar */}
                <button
                    type="submit"
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all active:scale-95 shadow-md ${type === 'owed'
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                        }`}
                >
                    <Save className="w-5 h-5" />
                    Guardar {type === 'owed' ? 'Falta' : 'Recuperación'}
                </button>
            </form>
        </div>
    );
};

export default EntryForm;
