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
    getDoc,
    getDocs
} from 'firebase/firestore';
import { sendSecurityEmail } from '../utils/emailUtils';

// Hash simple (no criptográfico, solo para ofuscación básica)
export const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
};

export const LICENSE_TYPES = {
    monthly: { label: 'Mensual', days: 30 },
    quarterly: { label: 'Trimestral', days: 90 },
    semiannual: { label: 'Semestral', days: 180 },
    annual: { label: 'Anual', days: 365 },
    biannual: { label: 'Bianual', days: 730 },
};

export const PLANS = {
    basic: { label: 'Básico', features: { vacations: false, documents: false }, color: 'blue' },
    essential: { label: 'Esencial', features: { vacations: true, documents: false }, color: 'primary' },
    pro: { label: 'Pro', features: { vacations: true, documents: true }, color: 'emerald' }
};

const generateId = () =>
    crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

// Usuario superadmin por defecto (se creará en Firestore si no existe)
const SUPERADMIN_ID = 'superadmin';

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Suscripción en tiempo real a la colección de usuarios
    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
                const usersList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setUsers(usersList);
            } catch (err) {
                console.error("Error mapping users:", err);
            } finally {
                setLoading(false);
            }
        }, (error) => {
            if (error.code === 'permission-denied') {
                console.warn("Firestore: Acceso restringido hasta autenticación.");
                // No lanzamos error fatal, esperamos a que el usuario intente loguearse
            } else {
                console.error("Firestore Subscription Error:", error);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Asegura que el superadmin inicial exista en Firestore.
     */
    const initSuperAdmin = async () => {
        try {
            console.log("[useUsers] Checking SuperAdmin initialization...");
            const adminRef = doc(db, 'users', SUPERADMIN_ID);
            const adminSnap = await getDoc(adminRef);

            if (!adminSnap.exists()) {
                console.log("[useUsers] SuperAdmin NOT found in Firestore. Creating now...");
                const superAdminData = {
                    name: 'Administrador',
                    email: 'admin@techinnova.com',
                    passwordHash: simpleHash('Admin2026!'),
                    role: 'admin',
                    status: 'active',
                    mustChangePassword: false,
                    plan: 'pro',
                    features: PLANS.pro.features,
                    contractStart: new Date().toISOString(),
                    contractEnd: new Date(Date.now() + 365 * 86400000).toISOString(),
                    createdAt: new Date().toISOString(),
                    lastLoginAt: null,
                };
                await setDoc(adminRef, superAdminData);
                console.log("[useUsers] SuperAdmin created SUCCESSFULLY.");
            } else {
                console.log("[useUsers] SuperAdmin already EXISTS in Firestore.");
            }
        } catch (error) {
            // Si falla por permisos, es normal si el usuario no tiene reglas públicas.
            // No bloqueamos el flujo principal.
            if (error.code === 'permission-denied') {
                console.warn("[useUsers] SuperAdmin init skipped: Permission Denied (Review Firestore Rules).");
            } else {
                console.error("[useUsers] CRITICAL ERROR in initSuperAdmin:", error.code, error.message);
            }
        }
    };

    const getLicenseStatus = (user) => {
        if (!user || user.role === 'admin') return { active: true, daysLeft: 9999, label: 'Administrador' };

        const history = user.licenseHistory || [];
        if (history.length === 0) return { active: false, daysLeft: 0, label: 'Sin licencia' };

        const latest = [...history].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
        if (!latest) return { active: false, daysLeft: 0, label: 'Sin licencia' };

        const endDate = new Date(latest.endDate);
        const now = new Date();
        const daysLeft = Math.ceil((endDate - now) / 86400000);

        return {
            active: daysLeft > 0,
            daysLeft: Math.max(0, daysLeft),
            endDate: latest.endDate,
            label: LICENSE_TYPES[latest.type]?.label || latest.type,
        };
    };

    const createUser = async ({ name, email, licenseType, plan = 'basic' }) => {
        const emailLower = email.toLowerCase().trim();
        if (users.some(u => u.email && u.email.toLowerCase() === emailLower)) {
            throw new Error('Ya existe un usuario con ese correo.');
        }

        const startDate = new Date().toISOString();
        const days = LICENSE_TYPES[licenseType]?.days || 30;
        const endDate = new Date(Date.now() + days * 86400000).toISOString();
        const userId = generateId();

        const newUser = {
            name,
            email: emailLower,
            passwordHash: null,
            role: 'user',
            status: 'active',
            mustSetPassword: true,
            plan,
            features: PLANS[plan]?.features || PLANS.basic.features,
            licenseType,
            licenseHistory: [{ type: licenseType, startDate, endDate, createdAt: startDate }],
            contractStart: startDate,
            contractEnd: endDate,
            createdAt: startDate,
            lastLoginAt: null,
        };

        await setDoc(doc(db, 'users', userId), newUser);
        return { ...newUser, id: userId };
    };

    const setUserPassword = async (userId, password) => {
        await updateDoc(doc(db, 'users', userId), {
            passwordHash: simpleHash(password),
            mustSetPassword: false
        });
    };

    const resetPassword = async (userId) => {
        await updateDoc(doc(db, 'users', userId), {
            passwordHash: null,
            mustSetPassword: true
        });
    };

    const updateEmail = async (userId, newEmail) => {
        const emailLower = newEmail.toLowerCase().trim();
        if (users.some(u => u.id !== userId && u.email && u.email.toLowerCase() === emailLower)) {
            throw new Error('Ese correo ya está en uso.');
        }
        await updateDoc(doc(db, 'users', userId), { email: emailLower });
    };

    const updateUser = async (userId, data) => {
        await updateDoc(doc(db, 'users', userId), data);
    };

    const renewLicense = async (userId, licenseType) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const days = LICENSE_TYPES[licenseType]?.days || 30;
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + days * 86400000).toISOString();

        const newEntry = { type: licenseType, startDate, endDate, createdAt: startDate };

        await updateDoc(doc(db, 'users', userId), {
            licenseType,
            licenseHistory: [...(user.licenseHistory || []), newEntry],
            status: 'active'
        });
    };

    const deactivateUser = async (userId) => {
        await updateDoc(doc(db, 'users', userId), { status: 'inactive' });
    };

    const activateUser = async (userId) => {
        await updateDoc(doc(db, 'users', userId), { status: 'active' });
    };

    const extendLicense = async (userId, type, amount) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const status = getLicenseStatus(user);
        let baseDate = status.active ? new Date(status.endDate) : new Date();

        let newEndDate;
        const tempDate = new Date(baseDate);
        if (type === 'days') {
            newEndDate = new Date(tempDate.getTime() + amount * 86400000);
        } else if (type === 'years') {
            tempDate.setFullYear(tempDate.getFullYear() + amount);
            newEndDate = tempDate;
        }

        const newEntry = {
            type: `${amount}${type === 'days' ? 'd' : 'y'}`,
            startDate: new Date().toISOString(),
            endDate: newEndDate.toISOString(),
            createdAt: new Date().toISOString()
        };

        await updateDoc(doc(db, 'users', userId), {
            licenseHistory: [...(user.licenseHistory || []), newEntry],
            status: 'active'
        });
    };

    const updateUserPlan = async (userId, plan, features) => {
        await updateDoc(doc(db, 'users', userId), { plan, features });
    };

    const authenticate = async (email, password) => {
        const emailTrim = email.toLowerCase().trim();
        let user = null;

        try {
            // 1. Intentar buscar en la lista ya sincronizada (más rápido)
            user = users.find(u => u.email && u.email.toLowerCase() === emailTrim);

            // 2. Si no está en la lista (por retraso en sync), buscar directamente en Firestore
            if (!user) {
                // Caso especial: Si es el admin por defecto, buscar por su ID fijo
                if (emailTrim === 'admin@techinnova.com') {
                    const adminRef = doc(db, 'users', SUPERADMIN_ID);
                    const adminSnap = await getDoc(adminRef);
                    if (adminSnap.exists()) {
                        user = { ...adminSnap.data(), id: adminSnap.id };
                    }
                }

                // Si aún no se encuentra, hacer una consulta general por email
                if (!user) {
                    const q = query(collection(db, 'users'), where('email', '==', emailTrim));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const docData = querySnapshot.docs[0];
                        user = { ...docData.data(), id: docData.id };
                    }
                }
            }
        } catch (err) {
            console.error("Authentication Error:", err.code, err.message);
            if (err.code === 'permission-denied') {
                return { user: null, error: 'Acceso denegado. Revisa las reglas de seguridad de Firestore.' };
            }
            return { user: null, error: 'Error de conexión con la base de datos.' };
        }

        if (!user) {
            return { user: null, error: 'Correo no encontrado.' };
        }

        if (user.status === 'inactive') return { user: null, error: 'Tu cuenta está desactivada.' };

        if (user.mustSetPassword) {
            return { user, error: null, mustSetPassword: true };
        }

        if (user.passwordHash !== simpleHash(password)) {
            return { user: null, error: 'Contraseña incorrecta.' };
        }

        if (user.role !== 'admin') {
            const licStatus = getLicenseStatus(user);
            if (!licStatus.active) {
                return { user: null, error: 'Tu licencia ha vencido.' };
            }
        }

        // Actualizar lastLoginAt
        updateDoc(doc(db, 'users', user.id), { lastLoginAt: new Date().toISOString() }).catch(() => { });

        return { user, error: null, mustSetPassword: false };
    };

    const updateAdminSecurity = async (userId, { newPassword, newPin }) => {
        const updates = {};
        let type = '';

        if (newPassword) {
            updates.passwordHash = simpleHash(newPassword);
            type = 'password_change';
        }

        if (newPin) {
            updates.securityPinHash = simpleHash(newPin);
            type = type ? 'password_and_pin_change' : 'pin_change';
        }

        if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, 'users', userId), updates);
            // Pasar los valores reales al email para que el admin los vea
            const emailResult = await sendSecurityEmail(type, {
                user_email: 'admin@techinnova.com',
                new_password: newPassword || '********',
                security_code: newPin || '******'
            });
            return { success: true, emailSent: emailResult.success, emailError: emailResult.error };
        }
        return { success: false, error: 'No hay cambios que realizar' };
    };

    const validateAdminPin = async (userId, pin) => {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            return userData.securityPinHash === simpleHash(pin);
        }
        return false;
    };

    return {
        users,
        loading,
        initSuperAdmin,
        createUser,
        updateUser,
        updateEmail,
        resetPassword,
        setUserPassword,
        renewLicense,
        deactivateUser,
        activateUser,
        authenticate,
        getLicenseStatus,
        updateAdminSecurity,
        validateAdminPin,
        extendLicense,
    };
}

