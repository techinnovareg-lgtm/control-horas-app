import React, { useState, useEffect } from 'react';
import { Calculator, Calendar as CalendarIcon, Clock, ArrowRight, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import { addDays, format, isWeekend, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isWithinInterval, addMonths, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente de Calendario Visual
const VisualCalendar = ({ startDate, endDate, includeWeekends }) => {
    // Determinar meses a mostrar
    const start = new Date(startDate + 'T00:00:00');
    const end = endDate;

    // Mostramos mes de inicio y mes de fin (si son diferentes)
    // Limitamos a máximo 3 meses para no saturar la UI
    const monthsToShow = [];
    let currentMonth = startOfMonth(start);
    const lastMonth = startOfMonth(end);

    while (monthsToShow.length < 3 && (isBefore(currentMonth, lastMonth) || isSameDay(currentMonth, lastMonth))) {
        monthsToShow.push(currentMonth);
        currentMonth = addMonths(currentMonth, 1);
    }

    // Si el fin está más allá de los 3 meses mostrados
    const isTruncated = isBefore(currentMonth, lastMonth);

    return (
        <div className="mt-8 space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Cronograma Visual</h3>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                {monthsToShow.map((monthStart) => (
                    <MonthGrid
                        key={monthStart.toString()}
                        monthStart={monthStart}
                        rangeStart={start}
                        rangeEnd={end}
                        includeWeekends={includeWeekends}
                    />
                ))}
                {isTruncated && (
                    <div className="flex items-center justify-center h-full pt-10">
                        <div className="text-slate-300">
                            <ChevronRight className="w-8 h-8" />
                            <span className="text-xs">...</span>
                        </div>
                    </div>
                )}
                {isTruncated && (
                    <MonthGrid
                        monthStart={lastMonth}
                        rangeStart={start}
                        rangeEnd={end}
                        includeWeekends={includeWeekends}
                    />
                )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 justify-center lg:justify-start mt-2">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                    <span>Días de recuperación</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-200"></div>
                    <span>Días normales</span>
                </div>
                {!includeWeekends && (
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-slate-100 opacity-50"></div>
                        <span>Fines de semana (Excluidos)</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const MonthGrid = ({ monthStart, rangeStart, rangeEnd, includeWeekends }) => {
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(monthStart),
        end: endOfMonth(monthStart)
    });

    // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    // Ajustamos para que Lunes sea 0 porque es más común en calendarios latinos
    const startDayOfWeek = (getDay(startOfMonth(monthStart)) + 6) % 7;
    const emptyDays = Array(startDayOfWeek).fill(null);

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm w-64">
            <h4 className="text-center font-bold text-slate-700 mb-3 capitalize">
                {format(monthStart, 'MMMM yyyy', { locale: es })}
            </h4>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                    <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                {daysInMonth.map(day => {
                    const isRangeStart = isSameDay(day, rangeStart);
                    const isRangeEnd = isSameDay(day, rangeEnd);
                    const isInRange = isWithinInterval(day, { start: rangeStart, end: rangeEnd });
                    const isWknd = isWeekend(day);
                    const isExcluded = isWknd && !includeWeekends;

                    let bgClass = 'bg-transparent text-slate-600 hover:bg-slate-50';
                    if (isRangeStart || isRangeEnd) {
                        bgClass = 'bg-primary-600 text-white shadow-md shadow-primary-500/30 scale-110 relative z-10';
                    } else if (isInRange && !isExcluded) {
                        bgClass = 'bg-primary-100 text-primary-800';
                    } else if (isExcluded) {
                        bgClass = 'bg-slate-50 text-slate-300';
                    }

                    return (
                        <div
                            key={day.toString()}
                            className={`
                                h-7 w-7 flex items-center justify-center rounded-full text-xs font-medium transition-all
                                ${bgClass}
                                ${isExcluded && !isInRange ? 'text-slate-300' : ''}
                            `}
                        >
                            {format(day, 'd')}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CalculatorTool = () => {
    const [missedDays, setMissedDays] = useState(1);
    const [hoursPerDay, setHoursPerDay] = useState(8);
    const [recoveryHours, setRecoveryHours] = useState(1);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [includeWeekends, setIncludeWeekends] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const calculate = () => {
        try {
            setError(null);

            // Validaciones básicas
            if (!startDate) return;
            if (missedDays <= 0 || hoursPerDay <= 0 || recoveryHours <= 0) {
                setResult(null);
                return;
            }

            const totalHours = missedDays * hoursPerDay;
            const safeRecovery = Math.max(0.1, recoveryHours);
            const totalDaysNeeded = Math.ceil(totalHours / safeRecovery);

            if (totalDaysNeeded > 3650) {
                setError("El período excede los 10 años.");
                setResult(null);
                return;
            }

            const startParts = startDate.split('-');
            // Aseguramos que se interprete como fecha local
            const currentDate = new Date(parseInt(startParts[0]), parseInt(startParts[1]) - 1, parseInt(startParts[2]));

            if (isNaN(currentDate.getTime())) {
                setError("Fecha inválida.");
                setResult(null);
                return;
            }

            let daysCounted = 0;
            let calendarDays = 0;
            let safetyCounter = 0;

            // Lógica corregida: 
            // - Evaluar el día actual (calendarDays = 0) antes de incrementar.
            // - Si el día es válido para recuperar, incrementar daysCounted.
            // - Si daysCounted < totalDaysNeeded, pasar al siguiente día (calendarDays++).
            while (daysCounted < totalDaysNeeded) {
                safetyCounter++;

                if (safetyCounter > 10000) break;

                let checkDate = addDays(currentDate, calendarDays);

                if (includeWeekends || (!isWeekend(checkDate))) {
                    daysCounted++;
                }

                if (daysCounted < totalDaysNeeded) {
                    calendarDays++;
                }
            }

            const endDate = addDays(currentDate, calendarDays);

            setResult({
                totalHours,
                totalDaysNeeded,
                endDate,
                calendarDays: calendarDays + 1 // +1 porque calendarDays es índice base 0 (o offset), si empezamos hoy y terminamos hoy, es 1 día calendario.
            });

        } catch (e) {
            console.error(e);
            setResult(null);
        }
    };

    useEffect(() => {
        calculate();
    }, [missedDays, hoursPerDay, recoveryHours, startDate, includeWeekends]);

    return (
        <div className="glass-card rounded-3xl overflow-hidden mb-8 border-primary-100 shadow-xl shadow-primary-900/5">
            <div className="bg-primary-700 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold">Calculadora de Recuperación</h2>
                </div>
                <p className="text-primary-100 text-sm">Planifica cuánto tiempo te tomará estar al día.</p>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Días Faltados</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-primary-600" />
                                <input
                                    type="number"
                                    min="1"
                                    value={missedDays}
                                    onChange={(e) => setMissedDays(Math.max(1, Number(e.target.value)))}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Horas/Día</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 w-4 h-4 text-primary-600" />
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    value={hoursPerDay}
                                    onChange={(e) => setHoursPerDay(Math.min(12, Math.max(1, Number(e.target.value))))}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Horas a recuperar por día</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0.5"
                                max="4"
                                step="0.5"
                                value={recoveryHours}
                                onChange={(e) => setRecoveryHours(Number(e.target.value))}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <span className="bg-primary-50 text-primary-700 font-bold px-3 py-1 rounded-lg border border-primary-100 min-w-[60px] text-center">
                                {recoveryHours}h
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Fecha de Inicio</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={includeWeekends}
                                onChange={(e) => setIncludeWeekends(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-10 h-5 rounded-full transition-colors ${includeWeekends ? 'bg-primary-600' : 'bg-slate-300'}`} />
                            <div className={`absolute left-1 w-3 h-3 bg-white rounded-full transition-transform ${includeWeekends ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        <span className="text-sm text-slate-600 group-hover:text-primary-700 transition-colors">Incluir fines de semana</span>
                    </label>
                </div>

                {/* Result Card & Calendar */}
                <div>
                    {result ? (
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Calculator className="w-24 h-24" />
                                </div>

                                <div className="space-y-6 relative z-10">
                                    <div>
                                        <p className="text-sm text-slate-500 font-medium">Deuda total a recuperar:</p>
                                        <p className="text-4xl font-black text-slate-800">{result.totalHours}<span className="text-xl font-bold ml-1">horas</span></p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Fecha Final</p>
                                            <p className="text-lg font-bold text-primary-700">
                                                {format(result.endDate, "d 'de' MMMM", { locale: es })}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {format(result.endDate, "yyyy", { locale: es })}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-primary-600 rounded-xl">
                                            <ArrowRight className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Días Lab. Necesarios</p>
                                            <p className="text-xl font-bold text-slate-700">{result.totalDaysNeeded}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Días Calendario</p>
                                            <p className="text-xl font-bold text-slate-700">{result.calendarDays}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Calendar */}
                            <VisualCalendar
                                startDate={startDate}
                                endDate={result.endDate}
                                includeWeekends={includeWeekends}
                            />
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-8 bg-slate-50/50 h-full">
                            <div className="text-center text-slate-400">
                                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Ingresa los datos para ver la proyección visual.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalculatorTool;
