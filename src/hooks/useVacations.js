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

export function useVacations(userId) {
    const [vacations, setVacations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'vacations'), where('userId', '==', userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setVacations(list);
            setLoading(false);
        }, (error) => {
            console.error("Vacations error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const addVacation = async (data) => {
        const vacationId = crypto.randomUUID();
        const newVacation = {
            ...data,
            userId,
            createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'vacations', vacationId), newVacation);
        return { ...newVacation, id: vacationId };
    };

    const deleteVacation = async (vacationId) => {
        await deleteDoc(doc(db, 'vacations', vacationId));
    };

    const getStats = (year, route = '30', staffType = 'asistencial') => {
        const yearVacations = vacations.filter(v => new Date(v.startDate).getFullYear() === year);
        const totalUsed = yearVacations.reduce((acc, v) => acc + Number(v.days), 0);

        const totalAllowed = (staffType === 'administrativo' && route === '22') ? 22 : 30;

        return {
            total: totalAllowed,
            used: totalUsed,
            remaining: totalAllowed - totalUsed,
            isRoute22: route === '22'
        };
    };

    return {
        vacations,
        loading,
        addVacation,
        deleteVacation,
        getStats
    };
}
