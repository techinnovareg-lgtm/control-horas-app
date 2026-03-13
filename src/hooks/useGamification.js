import { db } from '../config/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import confetti from 'canvas-confetti';

export const ACHIEVEMENTS = [
    { 
        id: 'initiator', 
        name: 'Iniciador', 
        description: 'Registraste tu primera hora recuperada', 
        icon: '🚀',
        type: 'badge'
    },
    { 
        id: 'constant', 
        name: 'Constante', 
        description: 'Mantuviste una racha de 3 días', 
        icon: '🔥',
        type: 'badge'
    },
    { 
        id: 'expert', 
        name: 'Experto', 
        description: 'Recuperaste 50 horas en total', 
        icon: '⭐',
        type: 'level'
    },
    { 
        id: 'legend', 
        name: 'Leyenda Labora', 
        description: 'Recuperaste 100 horas en total', 
        icon: '👑',
        type: 'level'
    },
    { 
        id: 'loyalty', 
        name: 'Fidelidad', 
        description: 'Un año con nosotros', 
        icon: '📅',
        type: 'badge'
    }
];

export function useGamification(user, updateUser) {
    
    const triggerCelebration = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#0f172a', '#1d4ed8', '#0ea5e9']
        });
    };

    const updateStats = async (recoveredHours) => {
        if (!user) return;

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const lastAction = user.lastActionDate ? user.lastActionDate.split('T')[0] : null;
        
        let newStreak = user.streakCount || 0;
        
        if (lastAction) {
            const lastDate = new Date(lastAction);
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        const totalRecovered = (user.totalHoursRecovered || 0) + recoveredHours;
        const updates = {
            streakCount: newStreak,
            lastActionDate: now.toISOString(),
            totalHoursRecovered: totalRecovered
        };

        // Verificar nuevos logros
        const newAchievements = [];
        const currentAchievements = user.achievements || [];

        if (totalRecovered > 0 && !currentAchievements.includes('initiator')) {
            newAchievements.push('initiator');
        }
        if (newStreak >= 3 && !currentAchievements.includes('constant')) {
            newAchievements.push('constant');
        }
        if (totalRecovered >= 50 && !currentAchievements.includes('expert')) {
            newAchievements.push('expert');
        }
        if (totalRecovered >= 100 && !currentAchievements.includes('legend')) {
            newAchievements.push('legend');
        }

        if (newAchievements.length > 0) {
            triggerCelebration();
            updates.achievements = arrayUnion(...newAchievements);
        }

        await updateDoc(doc(db, 'users', user.id), updates);
    };

    const claimReward = async (type) => {
        if (!user) return;
        
        const now = new Date();
        const currentEnd = new Date(user.contractEnd || now);
        const baseDate = currentEnd > now ? currentEnd : now;
        const newEnd = new Date(baseDate.getTime() + 30 * 86400000);

        if (type === 'self') {
            await updateDoc(doc(db, 'users', user.id), {
                contractEnd: newEnd.toISOString(),
                plan: 'pro',
                status: 'active'
            });
            triggerCelebration();
        } else {
            // Generar código simple para invitación (lógica mock para este ejemplo)
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            alert(`¡Código de invitación generado: ${code}! Compártelo con un colega para que obtenga 1 mes PRO.`);
        }
    };

    return {
        updateStats,
        claimReward,
        triggerCelebration,
        achievements: ACHIEVEMENTS
    };
}
