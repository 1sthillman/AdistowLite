import { db } from './firebase';
import { doc, updateDoc, increment, setDoc } from 'firebase/firestore';

export async function trackScan(restaurantId: string) {
    if (!restaurantId) return;
    try {
        const statsRef = doc(db, 'restaurants', restaurantId, 'analytics', 'stats');
        await updateDoc(statsRef, {
            totalScans: increment(1)
        }).catch(async (err) => {
            // If doc doesn't exist, create it
            if (err.code === 'not-found') {
                await setDoc(statsRef, {
                    totalScans: 1,
                    totalViews: 0,
                    totalRevenue: 0,
                    popularProduct: '',
                    customizationRate: 0,
                    hourlyActivity: Array(24).fill(0).map((_, i) => ({ time: `${i}:00`, scans: 0, views: 0 }))
                }, { merge: true });
            }
        });
    } catch (e) {
        console.error("Failed to track scan:", e);
    }
}

export async function trackView(restaurantId: string) {
    if (!restaurantId) return;
    try {
        const statsRef = doc(db, 'restaurants', restaurantId, 'analytics', 'stats');
        const hour = new Date().getHours();

        // Update total and hourly activity
        // Note: updating nested array elements is tricky in firestore without cloud functions
        // Simpler for now: update the main counter. 
        await updateDoc(statsRef, {
            totalViews: increment(1)
        });
    } catch (e) {
        console.error("Failed to track view:", e);
    }
}

export async function trackRevenue(restaurantId: string, amount: number) {
    if (!restaurantId || !amount) return;
    try {
        const statsRef = doc(db, 'restaurants', restaurantId, 'analytics', 'stats');
        await updateDoc(statsRef, {
            totalRevenue: increment(amount)
        });
    } catch (e) {
        console.error("Failed to track revenue:", e);
    }
}
