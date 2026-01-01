import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, runTransaction, doc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { restaurantId, rating, comment, userName, deviceId } = body;

        if (!restaurantId || !rating) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Get Security Metrics
        // IP Address
        const forwardedFor = request.headers.get('x-forwarded-for');
        let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';

        // User Agent (Browser/Device info)
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // 2. SECURITY CHECK: Double Layer Protection
        const reviewsRef = collection(db, 'restaurants', restaurantId, 'reviews');

        // Check A: IP Address Block (Network Level)
        if (ip !== 'unknown') {
            const ipQuery = query(reviewsRef, where('ip', '==', ip));
            const ipSnapshot = await getDocs(ipQuery);
            if (!ipSnapshot.empty) {
                return NextResponse.json({ error: 'ALREADY_RATED', reason: 'ip' }, { status: 429 });
            }
        }

        // Check B: Device ID Block (Browser Level)
        if (deviceId) {
            const deviceQuery = query(reviewsRef, where('deviceId', '==', deviceId));
            const deviceSnapshot = await getDocs(deviceQuery);
            if (!deviceSnapshot.empty) {
                return NextResponse.json({ error: 'ALREADY_RATED', reason: 'device' }, { status: 429 });
            }
        }

        // 3. Run Transaction (Update Rating & Save Review)
        await runTransaction(db, async (transaction) => {
            const restaurantRef = doc(db, 'restaurants', restaurantId);
            const restaurantDoc = await transaction.get(restaurantRef);

            if (!restaurantDoc.exists()) {
                throw new Error("Restaurant not found");
            }

            const data = restaurantDoc.data();
            const currentRating = data.rating || 0;
            const currentCount = data.ratingCount || 0;

            const newCount = currentCount + 1;
            const newRating = ((currentRating * currentCount) + rating) / newCount;

            // Update restaurant stats
            transaction.update(restaurantRef, {
                rating: newRating,
                ratingCount: newCount
            });

            // Create new review doc with full fingerprint
            const newReviewRef = doc(collection(db, 'restaurants', restaurantId, 'reviews'));
            transaction.set(newReviewRef, {
                rating,
                comment,
                userName: userName || 'Anonymous',
                createdAt: serverTimestamp(),
                userIp: ip,
                deviceId: deviceId || 'unknown',
                userAgent: userAgent,
                verified: true // Mark as system verified
            });
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Review API error:', error);
        return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
    }
}
