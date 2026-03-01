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
