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

    const getStats = (year) => {
        const yearVacations = vacations.filter(v => new Date(v.startDate).getFullYear() === year);
        const totalUsed = yearVacations.reduce((acc, v) => acc + Number(v.days), 0);

        // D.L. 1405 logic
        const flexibleUsed = yearVacations
            .filter(v => v.type === 'flexible')
            .reduce((acc, v) => acc + Number(v.days), 0);

        const blocksUsed = yearVacations
            .filter(v => v.type === 'block')
            .reduce((acc, v) => acc + Number(v.days), 0);

        return {
            total: 30,
            used: totalUsed,
            remaining: 30 - totalUsed,
            flexibleUsed,
            flexibleRemaining: 7 - flexibleUsed,
            blocksUsed,
            blocksRemaining: 23 - blocksUsed
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
