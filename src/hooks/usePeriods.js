import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    onSnapshot,
    query,
    where,
    deleteDoc
} from 'firebase/firestore';

const generateId = () =>
    crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

export function usePeriods(userId) {
    const [periods, setPeriods] = useState([]);
    const [activePeriodId, setActivePeriodId] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Suscripción a períodos del usuario
    useEffect(() => {
        if (!userId) return;

        const q = query(collection(db, 'periods'), where('ownerId', '==', userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const periodsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setPeriods(periodsList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // 2. Suscripción al ID del período activo del usuario
    useEffect(() => {
        if (!userId) return;

        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setActivePeriodId(docSnap.data().activePeriodId || null);
            }
        });

        return () => unsubscribe();
    }, [userId]);

    const activePeriod = periods.find(p => p.id === activePeriodId) || null;

    const createPeriod = async (name) => {
        try {
            const periodId = generateId();
            const newPeriod = {
                id: periodId, // Añadimos ID aquí para el estado local
                name,
                ownerId: userId,
                status: 'active',
                createdAt: new Date().toISOString(),
                entries: [],
            };

            // Actualización optimista del estado local
            setPeriods(prev => [...prev, newPeriod]);
            setActivePeriodId(periodId);

            // Guardar período en Firestore
            await setDoc(doc(db, 'periods', periodId), newPeriod);

            // Actualizar referencia de activo en el usuario
            await updateDoc(doc(db, 'users', userId), { activePeriodId: periodId });

            return newPeriod;
        } catch (error) {
            console.error("Error creating period:", error);
            throw error;
        }
    };

    const archivePeriod = async (periodId) => {
        await updateDoc(doc(db, 'periods', periodId), {
            status: 'archived',
            completedAt: new Date().toISOString()
        });

        if (activePeriodId === periodId) {
            await updateDoc(doc(db, 'users', userId), { activePeriodId: null });
        }
    };

    const deletePeriod = async (periodId) => {
        try {
            // 1. Eliminar el documento del período
            await deleteDoc(doc(db, 'periods', periodId));

            // 2. Si es el activo, limpiar la referencia en el usuario
            if (activePeriodId === periodId) {
                await updateDoc(doc(db, 'users', userId), { activePeriodId: null });
            }
        } catch (error) {
            console.error("Error deleting period:", error);
            throw error;
        }
    };

    const addEntry = async (type, data, targetPeriodId = null) => {
        const periodId = targetPeriodId || activePeriodId;
        if (!periodId) return;

        const period = periods.find(p => p.id === periodId);
        if (!period) return;

        const newEntry = {
            id: generateId(),
            type,
            hours: Number(data.hours),
            date: data.date,
            createdAt: new Date().toISOString(),
            notes: data.notes || '',
        };

        if (type === 'recovered') {
            const stats = getPeriodStats(period);
            if (newEntry.hours > stats.balance) {
                throw new Error(`No puedes recuperar ${newEntry.hours}h. Solo debes ${stats.balance}h.`);
            }
        }

        const updatedEntries = [...period.entries, newEntry];
        await updateDoc(doc(db, 'periods', periodId), { entries: updatedEntries });

        const newStats = calculateStats(updatedEntries);
        if (newStats.owed > 0 && newStats.recovered >= newStats.owed) {
            return { success: true, completed: true, periodId };
        }
        return { success: true, completed: false, periodId };
    };

    const editEntry = async (entryId, newData, targetPeriodId = null) => {
        const periodId = targetPeriodId || activePeriodId;
        if (!periodId) return;

        const period = periods.find(p => p.id === periodId);
        if (!period) return;

        const originalEntry = period.entries.find(e => e.id === entryId);
        if (!originalEntry) return;

        if (originalEntry.type === 'recovered') {
            const stats = getPeriodStats(period);
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

        const updatedEntries = period.entries.map(e => e.id === entryId ? updatedEntry : e);
        await updateDoc(doc(db, 'periods', periodId), { entries: updatedEntries });

        const newStats = calculateStats(updatedEntries);
        if (newStats.owed > 0 && newStats.recovered >= newStats.owed) {
            return { success: true, completed: true, periodId };
        }
        return { success: true, completed: false, periodId };
    };

    const deleteEntry = async (entryId, targetPeriodId = null) => {
        const periodId = targetPeriodId || activePeriodId;
        if (!periodId) return;

        const period = periods.find(p => p.id === periodId);
        if (!period) return;

        const updatedEntries = period.entries.filter(e => e.id !== entryId);
        await updateDoc(doc(db, 'periods', periodId), { entries: updatedEntries });
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
        loading,
        createPeriod,
        archivePeriod,
        addEntry,
        editEntry,
        deleteEntry,
        deletePeriod,
        getPeriodStats,
    };
}

