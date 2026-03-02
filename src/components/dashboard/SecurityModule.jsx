import React from 'react';
import { ShieldCheck, Lock, EyeOff, UserCheck, Key, Server, CheckCircle2 } from 'lucide-react';

const SecurityModule = () => {
    const securityItems = [
        {
            icon: <Lock className="w-6 h-6 text-primary-600" />,
            title: "Cifrado de Extremo a Extremo",
            description: "Toda la información registrada (horas, boletas, notas) se encripta antes de guardarse en la base de datos de Google Firebase."
        },
        {
            icon: <EyeOff className="w-6 h-6 text-primary-600" />,
            title: "Privacidad Total del Usuario",
            description: "Ni el administrador del sistema ni otros usuarios pueden ver sus registros personales, períodos o documentos privados."
        },
        {
            icon: <UserCheck className="w-6 h-6 text-primary-600" />,
            title: "Acceso Restringido",
            description: "El aplicativo utiliza reglas de seguridad de nivel empresarial (Security Rules) que verifican la identidad del usuario en cada solicitud."
        },
        {
            icon: <Key className="w-6 h-6 text-primary-600" />,
            title: "Gestión Segura de Contraseñas",
            description: "Su contraseña nunca es visible para nadie. Si la olvida, el administrador solo puede resetearla para que usted cree una nueva."
        },
        {
            icon: <Server className="w-6 h-6 text-primary-600" />,
            title: "Infraestructura Confiable",
            description: "Utilizamos la tecnología de Google Cloud Platform para garantizar que sus datos estén respaldados y siempre disponibles."
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-40 h-40 text-primary-600" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Compromiso de Seguridad</h2>
                    <p className="text-slate-500 max-w-2xl">
                        Su confianza es nuestra prioridad. Hemos diseñado este aplicativo bajo el principio de "Privacidad por Diseño",
                        donde usted es el único dueño de su información.
                    </p>
                </div>
            </div>

            {/* Grid de seguridad */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {securityItems.map((item, index) => (
                    <div key={index} className="glass-panel p-6 rounded-3xl border border-slate-100 hover:border-primary-200 transition-all hover:shadow-xl hover:shadow-primary-900/5 group">
                        <div className="p-3 bg-primary-50 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                            {item.icon}
                        </div>
                        <h3 className="font-bold text-slate-800 mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
                    </div>
                ))}
            </div>

            {/* Compromiso Final */}
            <div className="bg-primary-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-10 h-10 text-primary-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black mb-2">Información para su Tranquilidad</h3>
                        <p className="text-primary-100 text-sm max-w-3xl leading-relaxed">
                            A diferencia de otras herramientas, este sistema no vende sus datos ni los utiliza con fines publicitarios.
                            La base de datos es exclusivamente técnica y administrativa para su gestión personal de horas y beneficios laborales.
                            Usted puede solicitar la eliminación total de su cuenta y registros en cualquier momento a través del área de soporte.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityModule;
