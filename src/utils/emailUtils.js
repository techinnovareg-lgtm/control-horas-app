import emailjs from '@emailjs/browser';

/**
 * CONFIGURACIÓN DE EMAILJS
 * Reemplaza estos valores con los de tu dashboard en https://dashboard.emailjs.com/
 */
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_dhq0qev',
    TEMPLATE_ID: 'template_ca22rgp',
    PUBLIC_KEY: 'To3dpPbcFx-dLBnrN',
    ADMIN_EMAIL: 'tech.innova.reg@gmail.com'
};

/**
 * Envía una notificación de seguridad al administrador.
 * @param {string} type - Tipo de alerta ('password_change', 'pin_change', 'login_alert')
 * @param {Object} details - Detalles adicionales del evento
 */
export const sendSecurityEmail = async (type, details = {}) => {
    try {
        let alertLabel = 'Alerta de Seguridad';
        if (type === 'password_change') alertLabel = 'Cambio de Contraseña';
        else if (type === 'pin_change') alertLabel = 'Cambio de PIN de Seguridad';
        else if (type === 'password_and_pin_change') alertLabel = 'Cambio de Contraseña y PIN';

        const templateParams = {
            to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
            user_email: EMAILJS_CONFIG.ADMIN_EMAIL, // Alias común
            email: EMAILJS_CONFIG.ADMIN_EMAIL,      // Alias común
            alert_type: alertLabel,
            event_date: new Date().toLocaleString('es-PE'),
            client_info: window.navigator.userAgent,
            ...details
        };

        console.log(`📧 Intentando enviar email (${type}) usando Template: ${EMAILJS_CONFIG.TEMPLATE_ID}...`);

        if (EMAILJS_CONFIG.PUBLIC_KEY === 'your_public_key_here' || !EMAILJS_CONFIG.PUBLIC_KEY) {
            console.warn('⚠️ EmailJS no configurado. Simulación:', templateParams);
            return { success: true, simulated: true };
        }

        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams,
            {
                publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
            }
        );

        console.log('✅ EmailJS Response:', response.status, response.text);
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error crítico en sendSecurityEmail:', error);

        // Extraer mensaje legible si es un objeto de error de EmailJS
        const errorMessage = error?.text || error?.message || (typeof error === 'string' ? error : JSON.stringify(error));

        return { success: false, error: errorMessage };
    }
};

/**
 * Notifica al usuario y al administrador sobre el estado de su plan.
 * @param {string} type - 'warning' (por vencer) o 'expired' (vencido)
 * @param {Object} user - Datos del usuario
 * @param {number} daysLeft - Días restantes
 */
export const sendPlanNotification = async (type, user, daysLeft = 0) => {
    try {
        const isWarning = type === 'warning';
        const subject = isWarning
            ? `⚠️ Tu plan vence en ${daysLeft} días - Labora`
            : `🛑 Tu plan de Labora ha vencido`;

        const message = isWarning
            ? `Hola ${user.name}, te recordamos que tu plan ${user.plan === 'basic_promo' ? 'Pro de prueba' : user.plan} está por vencer en ${daysLeft} días. Por favor, contacta al administrador para renovar.`
            : `Hola ${user.name}, tu plan ${user.plan === 'basic_promo' ? 'Pro de prueba' : user.plan} ha vencido hoy. Tu acceso ha sido limitado al plan Básico si correspondía.`;

        // Notificación al Admin
        await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            {
                to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
                user_email: user.email,
                alert_type: isWarning ? 'Aviso de Vencimiento' : 'Plan Vencido',
                event_date: new Date().toLocaleString('es-PE'),
                message: `Usuario: ${user.name} (${user.email})\nPlan: ${user.plan}\nDetalle: ${message}`,
                client_info: 'Sistema de Notificaciones Automáticas'
            },
            { publicKey: EMAILJS_CONFIG.PUBLIC_KEY }
        );

        // Notificación al Usuario (si tiene correo válido)
        if (user.email && !user.email.includes('admin@techinnova.com')) {
            await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                {
                    to_email: user.email,
                    user_email: user.email,
                    alert_type: isWarning ? 'Aviso de Vencimiento' : 'Plan Vencido',
                    event_date: new Date().toLocaleString('es-PE'),
                    message: message,
                    client_info: 'Labora App'
                },
                { publicKey: EMAILJS_CONFIG.PUBLIC_KEY }
            );
        }

        return { success: true };
    } catch (error) {
        console.error('Error enviando notificación de plan:', error);
        return { success: false, error: error.message };
    }
};
