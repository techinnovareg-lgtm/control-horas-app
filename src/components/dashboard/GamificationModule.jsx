import React from 'react';
import { Trophy, Star, Zap, Calendar, Gift, ChevronRight, Award } from 'lucide-react';

const GamificationModule = ({ user, gamification }) => {
    const { updateStats, claimReward, achievements } = gamification;
    
    const userAchievements = user.achievements || [];
    const totalRecovered = user.totalHoursRecovered || 0;
    const streak = user.streakCount || 0;

    const getEfficiencyLevel = () => {
        if (totalRecovered >= 100) return { name: 'Leyenda Labora', color: 'text-purple-600', bg: 'bg-purple-100', icon: <Trophy className="w-8 h-8" /> };
        if (totalRecovered >= 50) return { name: 'Experto', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Award className="w-8 h-8" /> };
        return { name: 'Ahorrador Junior', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: <Zap className="w-8 h-8" /> };
    };

    const level = getEfficiencyLevel();

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Header / Nivel Actual */}
            <div className="glass-panel p-8 rounded-[32px] border-2 border-primary-100 flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-primary-900/5">
                <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-3xl ${level.bg} ${level.color} shadow-inner`}>
                        {level.icon}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu Rango Actual</p>
                        <h2 className={`text-3xl font-black ${level.color} uppercase tracking-tight`}>{level.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                             <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary-600 transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, (totalRecovered / 100) * 100)}%` }}
                                />
                             </div>
                             <span className="text-[10px] font-bold text-slate-400">{totalRecovered}/100h para ser Leyenda</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[100px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Racha</p>
                        <p className="text-2xl font-black text-orange-500 flex items-center justify-center gap-1">
                            <Zap className="w-5 h-5 fill-current" /> {streak}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400">Días seguidos</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center min-w-[100px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recuperado</p>
                        <p className="text-2xl font-black text-blue-600">{totalRecovered}h</p>
                        <p className="text-[9px] font-bold text-slate-400">Total histórico</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Insignias y Logros */}
                <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight ml-2">Mis Insignias</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {achievements.map((ach) => (
                            <div 
                                key={ach.id} 
                                className={`glass-card p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                                    userAchievements.includes(ach.id) 
                                    ? 'border-emerald-100 bg-emerald-50/20' 
                                    : 'border-slate-100 opacity-60 grayscale'
                                }`}
                            >
                                <div className="text-3xl p-3 bg-white rounded-xl shadow-sm border border-slate-50">
                                    {ach.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{ach.name}</h4>
                                    <p className="text-xs text-slate-500 leading-tight">{ach.description}</p>
                                </div>
                                {userAchievements.includes(ach.id) && (
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recompensas / Reclamos */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight ml-2">Recompensas PRO</h3>
                    <div className="glass-card p-6 rounded-[32px] border-2 border-amber-100 bg-amber-50/20 relative overflow-hidden">
                        <Gift className="absolute top-[-10px] right-[-10px] w-24 h-24 text-amber-200/50 -rotate-12" />
                        
                        <div className="relative z-10">
                            <h4 className="font-black text-amber-800 uppercase tracking-wider text-sm mb-2">Pase Pro Gratuito</h4>
                            <p className="text-xs text-amber-700 font-medium mb-6">Canjea tus hitos por beneficios exclusivos de la suscripción.</p>
                            
                            <div className="space-y-3">
                                <button 
                                    disabled={!userAchievements.includes('legend') && !userAchievements.includes('expert')}
                                    onClick={() => claimReward('self')}
                                    className="w-full btn-primary bg-amber-600 hover:bg-amber-700 border-none flex items-center justify-between group disabled:opacity-50"
                                >
                                    <span className="text-xs font-black">CANJEAR PARA MÍ</span>
                                    <Star className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                                </button>
                                
                                <button 
                                    disabled={!userAchievements.includes('legend')}
                                    onClick={() => claimReward('guest')}
                                    className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-amber-200 text-amber-700 font-black text-xs hover:bg-amber-100 transition-all flex items-center justify-between group disabled:opacity-50"
                                >
                                    <span>REGALAR A COLEGA</span>
                                    <Gift className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                            
                            <p className="text-[9px] text-amber-600/60 mt-4 text-center font-bold">
                                * Se requiere nivel Experto para canje personal y Leyenda para regalo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamificationModule;
