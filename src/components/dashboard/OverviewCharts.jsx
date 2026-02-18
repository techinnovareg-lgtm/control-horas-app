import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const OverviewCharts = ({ stats }) => {
    const { owed, recovered, balance } = stats;

    const data = [
        { name: 'Recuperadas', value: recovered, color: '#10b981' }, // emerald-500
        { name: 'Pendiente', value: balance, color: '#f59e0b' },     // amber-500
    ];

    // Si no hay datos, mostrar placeholder visual o gráfico vacío
    if (owed === 0) {
        return (
            <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-[300px]">
                <p className="text-slate-500">Sin horas registradas aún.</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Progreso del Período</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2 rounded-xl bg-red-50">
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Deuda</p>
                    <p className="text-xl font-bold text-red-600">{owed}h</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50">
                    <p className="text-xs text-slate-500 uppercase font-bold">Recuperado</p>
                    <p className="text-xl font-bold text-emerald-600">{recovered}h</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50">
                    <p className="text-xs text-slate-500 uppercase font-bold">Pendiente</p>
                    <p className="text-xl font-bold text-amber-600">{balance}h</p>
                </div>
            </div>
        </div>
    );
};

export default OverviewCharts;
