import { useLocalStorage } from './useLocalStorage';

// Hash simple (no criptográfico, solo para ofuscación básica en LocalStorage)
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

const generateId = () =>
    crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2);

// Usuario superadmin por defecto (siempre existe)
const SUPERADMIN = {
    id: 'superadmin',
    name: 'Administrador',
    email: 'admin@techinnova.com',
    passwordHash: simpleHash('Admin2026!'),
    role: 'admin',
    status: 'active',
    mustChangePassword: false,
    licenseType: 'annual',
    licenseHistory: [{
        type: 'annual',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
    }],
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
};

export function useUsers() {
    const [users, setUsers] = useLocalStorage('tracker_users', [SUPERADMIN]);

    // Asegurar que el superadmin siempre exista
    const allUsers = users.some(u => u.id === 'superadmin')
        ? users
        : [SUPERADMIN, ...users];

    /**
     * Obtiene el estado actual de la licencia de un usuario.
     */
    const getLicenseStatus = (user) => {
        if (user.role === 'admin') return { active: true, daysLeft: 9999, label: 'Administrador' };

        const history = user.licenseHistory || [];
        if (history.length === 0) return { active: false, daysLeft: 0, label: 'Sin licencia' };

        // La licencia activa es la más reciente
        const latest = [...history].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
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

    /**
     * Crea un nuevo usuario. El admin define email y licencia.
     * La contraseña queda vacía (mustSetPassword = true).
     */
    const createUser = ({ name, email, licenseType }) => {
        if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Ya existe un usuario con ese correo.');
        }

        const startDate = new Date().toISOString();
        const days = LICENSE_TYPES[licenseType]?.days || 30;
        const endDate = new Date(Date.now() + days * 86400000).toISOString();

        const newUser = {
            id: generateId(),
            name,
            email: email.toLowerCase().trim(),
            passwordHash: null,
            role: 'user',
            status: 'active',
            mustSetPassword: true, // El usuario debe crear su contraseña en el primer login
            licenseType,
            licenseHistory: [{ type: licenseType, startDate, endDate, createdAt: startDate }],
            createdAt: startDate,
            lastLoginAt: null,
        };

        setUsers([...allUsers, newUser]);
        return newUser;
    };

    /**
     * El usuario crea su propia contraseña (primer acceso).
     */
    const setUserPassword = (userId, password) => {
        setUsers(allUsers.map(u =>
            u.id === userId
                ? { ...u, passwordHash: simpleHash(password), mustSetPassword: false }
                : u
        ));
    };

    /**
     * Admin resetea la contraseña de un usuario (lo obliga a crear una nueva).
     */
    const resetPassword = (userId) => {
        setUsers(allUsers.map(u =>
            u.id === userId
                ? { ...u, passwordHash: null, mustSetPassword: true }
                : u
        ));
    };

    /**
     * Admin actualiza el email de un usuario.
     */
    const updateEmail = (userId, newEmail) => {
        const emailLower = newEmail.toLowerCase().trim();
        if (allUsers.some(u => u.id !== userId && u.email === emailLower)) {
            throw new Error('Ese correo ya está en uso.');
        }
        setUsers(allUsers.map(u =>
            u.id === userId ? { ...u, email: emailLower } : u
        ));
    };

    /**
     * Admin actualiza datos generales de un usuario.
     */
    const updateUser = (userId, data) => {
        setUsers(allUsers.map(u =>
            u.id === userId ? { ...u, ...data } : u
        ));
    };

    /**
     * Renueva la licencia de un usuario (añade entrada al historial).
     */
    const renewLicense = (userId, licenseType) => {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;

        const days = LICENSE_TYPES[licenseType]?.days || 30;
        const startDate = new Date().toISOString();
        const endDate = new Date(Date.now() + days * 86400000).toISOString();

        const newEntry = { type: licenseType, startDate, endDate, createdAt: startDate };

        setUsers(allUsers.map(u =>
            u.id === userId
                ? { ...u, licenseType, licenseHistory: [...(u.licenseHistory || []), newEntry], status: 'active' }
                : u
        ));
    };

    /**
     * Desactiva un usuario (conserva historial).
     */
    const deactivateUser = (userId) => {
        setUsers(allUsers.map(u =>
            u.id === userId ? { ...u, status: 'inactive' } : u
        ));
    };

    /**
     * Reactiva un usuario.
     */
    const activateUser = (userId) => {
        setUsers(allUsers.map(u =>
            u.id === userId ? { ...u, status: 'active' } : u
        ));
    };

    /**
     * Autentica un usuario con email + contraseña.
     * Retorna { user, error, mustSetPassword }
     */
    const authenticate = (email, password) => {
        const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

        if (!user) return { user: null, error: 'Correo no encontrado.' };
        if (user.status === 'inactive') return { user: null, error: 'Tu cuenta está desactivada. Contacta al administrador.' };

        // Si debe crear contraseña (primer acceso o reset)
        if (user.mustSetPassword) {
            return { user, error: null, mustSetPassword: true };
        }

        if (user.passwordHash !== simpleHash(password)) {
            return { user: null, error: 'Contraseña incorrecta.' };
        }

        // Verificar licencia (solo para usuarios no admin)
        if (user.role !== 'admin') {
            const licStatus = getLicenseStatus(user);
            if (!licStatus.active) {
                return { user: null, error: 'Tu licencia ha vencido. Contacta al administrador para renovarla.' };
            }
        }

        // Actualizar lastLoginAt
        setUsers(allUsers.map(u =>
            u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u
        ));

        return { user, error: null, mustSetPassword: false };
    };

    return {
        users: allUsers,
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
    };
}
