import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    query,
    where,
    deleteDoc,
    orderBy
} from 'firebase/firestore';

export function useDocuments(userId) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'documents'),
            where('userId', '==', userId),
            orderBy('year', 'desc'),
            orderBy('month', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setDocuments(list);
            setLoading(false);
        }, (error) => {
            console.error("Documents error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const addDocument = async (name, year, month, fileBase64) => {
        const docId = crypto.randomUUID();
        const newDoc = {
            userId,
            name,
            year: Number(year),
            month: Number(month),
            file: fileBase64, // Storing as base64 for simplicity since we don't have Storage configured in the plan
            createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'documents', docId), newDoc);
        return { ...newDoc, id: docId };
    };

    const deleteDocument = async (docId) => {
        await deleteDoc(doc(db, 'documents', docId));
    };

    return {
        documents,
        loading,
        addDocument,
        deleteDocument
    };
}
