import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const CreatePeriod = ({ onCreate }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="glass-panel p-8 rounded-2xl text-center">
                <div className="mx-auto bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <PlusCircle className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Crear Nuevo Período</h2>
                <p className="text-slate-500 mb-6">No tienes ningún período activo. Inicia uno nuevo para comenzar a registrar horas.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field text-center"
                        placeholder="Nombre del período (ej. Marzo 2026)"
                        required
                        autoFocus
                    />
                    <button type="submit" className="w-full btn-primary">
                        Comenzar Período
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePeriod;
