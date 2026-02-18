import { useLocalStorage } from './useLocalStorage';

const generateId = () =>
    crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

/**
 * Hook de gestión de períodos aislado por usuario.
 * Cada usuario tiene sus propias claves en LocalStorage:
 *   tracker_periods_<userId>
 *   tracker_active_period_id_<userId>
 */
export function usePeriods(userId) {
    // Claves únicas por usuario — garantiza aislamiento total
    const periodsKey = userId ? `tracker_periods_${userId}` : 'tracker_periods_anonymous';
    const activeIdKey = userId ? `tracker_active_period_id_${userId}` : 'tracker_active_period_id_anonymous';

    const [periods, setPeriods] = useLocalStorage(periodsKey, []);
    const [activePeriodId, setActivePeriodId] = useLocalStorage(activeIdKey, null);

    const activePeriod = periods.find(p => p.id === activePeriodId) || null;

    const createPeriod = (name) => {
        if (activePeriod) {
            throw new Error('Ya existe un período activo.');
        }
        const newPeriod = {
            id: generateId(),
            name,
            ownerId: userId,
            status: 'active',
            createdAt: new Date().toISOString(),
            entries: [],
        };
        setPeriods([...periods, newPeriod]);
        setActivePeriodId(newPeriod.id);
        return newPeriod;
    };

    const archivePeriod = (periodId) => {
        const updatedPeriods = periods.map(p =>
            p.id === periodId
                ? { ...p, status: 'archived', completedAt: new Date().toISOString() }
                : p
        );
        setPeriods(updatedPeriods);
        if (activePeriodId === periodId) {
            setActivePeriodId(null);
        }
    };

    const addEntry = (type, data) => {
        if (!activePeriod) return;

        const newEntry = {
            id: generateId(),
            type,
            hours: Number(data.hours),
            date: data.date,
            createdAt: new Date().toISOString(),
            notes: data.notes || '',
        };

        if (type === 'recovered') {
            const stats = getPeriodStats(activePeriod);
            if (newEntry.hours > stats.balance) {
                throw new Error(`No puedes recuperar ${newEntry.hours}h. Solo debes ${stats.balance}h.`);
            }
        }

        const updatedPeriod = {
            ...activePeriod,
            entries: [...activePeriod.entries, newEntry],
        };

        setPeriods(periods.map(p => p.id === activePeriod.id ? updatedPeriod : p));

        const newStats = calculateStats(updatedPeriod.entries);
        if (newStats.owed > 0 && newStats.recovered >= newStats.owed) {
            return { success: true, completed: true };
        }
        return { success: true, completed: false };
    };

    const editEntry = (entryId, newData) => {
        if (!activePeriod) return;

        const originalEntry = activePeriod.entries.find(e => e.id === entryId);
        if (!originalEntry) return;

        // Validaciones
        if (originalEntry.type === 'recovered') {
            const stats = getPeriodStats(activePeriod);
            // Calculamos el balance excluyendo, temporalmente, la entrada actual para ver si el nuevo valor cabe
            const currentBalanceWithoutEntry = stats.owed - (stats.recovered - originalEntry.hours);

            if (Number(newData.hours) > currentBalanceWithoutEntry) {
                throw new Error(`No puedes recuperar ${newData.hours}h. Solo debes ${currentBalanceWithoutEntry}h.`);
            }
        }

        const updatedEntry = {
            ...originalEntry,
            hours: Number(newData.hours),
            date: newData.date,
            notes: newData.notes || ''
        };

        const updatedPeriod = {
            ...activePeriod,
            entries: activePeriod.entries.map(e => e.id === entryId ? updatedEntry : e)
        };

        setPeriods(periods.map(p => p.id === activePeriod.id ? updatedPeriod : p));

        // Check completion logic
        const newStats = calculateStats(updatedPeriod.entries);
        if (newStats.owed > 0 && newStats.recovered >= newStats.owed) {
            return { success: true, completed: true };
        }
        return { success: true, completed: false };
    };

    const deleteEntry = (entryId) => {
        if (!activePeriod) return;
        const updatedEntries = activePeriod.entries.filter(e => e.id !== entryId);
        const updatedPeriod = { ...activePeriod, entries: updatedEntries };
        setPeriods(periods.map(p => p.id === activePeriod.id ? updatedPeriod : p));
    };

    const getPeriodStats = (period) => {
        if (!period) return { owed: 0, recovered: 0, balance: 0 };
        return calculateStats(period.entries);
    };

    const calculateStats = (entries) => {
        const owed = entries
            .filter(e => e.type === 'owed')
            .reduce((acc, curr) => acc + curr.hours, 0);
        const recovered = entries
            .filter(e => e.type === 'recovered')
            .reduce((acc, curr) => acc + curr.hours, 0);
        return { owed, recovered, balance: Math.max(0, owed - recovered) };
    };

    return {
        periods,
        activePeriod,
        createPeriod,
        archivePeriod,
        addEntry,
        editEntry,
        deleteEntry,
        getPeriodStats,
    };
}
