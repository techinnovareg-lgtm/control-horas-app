import { db } from '../config/firebase';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';

export const exportData = async () => {
    try {
        const data = {};

        // Exportar Usuarios
        const usersSnap = await getDocs(collection(db, 'users'));
        usersSnap.forEach(doc => {
            data[`tracker_user_${doc.id}`] = doc.data();
        });

        // Exportar Períodos
        const periodsSnap = await getDocs(collection(db, 'periods'));
        periodsSnap.forEach(doc => {
            data[`tracker_period_${doc.id}`] = doc.data();
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_firestore_horas_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting data:", error);
        alert("Error al exportar datos de la base de datos.");
    }
};

export const importData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const batch = writeBatch(db);

                for (const key of Object.keys(data)) {
                    if (key.startsWith('tracker_user_')) {
                        const userId = key.replace('tracker_user_', '');
                        const userRef = doc(db, 'users', userId);
                        batch.set(userRef, data[key]);
                    } else if (key.startsWith('tracker_period_')) {
                        const periodId = key.replace('tracker_period_', '');
                        const periodRef = doc(db, 'periods', periodId);
                        batch.set(periodRef, data[key]);
                    } else if (key.startsWith('tracker_users')) {
                        // Soporte para backup antiguo (formato array)
                        const users = data[key];
                        if (Array.isArray(users)) {
                            users.forEach(u => {
                                const uRef = doc(db, 'users', u.id);
                                batch.set(uRef, u);
                            });
                        }
                    }
                    // Podríamos añadir más mapeos para el formato antiguo
                }

                await batch.commit();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

