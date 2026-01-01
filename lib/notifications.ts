import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type NotificationType = 'waiter' | 'bill' | 'order' | 'coal';

interface TriggerNotificationProps {
    restaurantId: string;
    tableId: string;
    type: NotificationType;
    title: string;
    body: string;
}

export async function triggerNotification({
    restaurantId,
    tableId,
    type,
    title,
    body
}: TriggerNotificationProps) {
    try {
        // 1. Write to the central 'notifications' collection of the restaurant
        // The Waiter App listens to this in real-time (Foreground)
        const notificationsRef = collection(db, 'restaurants', restaurantId, 'notifications');
        await addDoc(notificationsRef, {
            type,
            tableId,
            title,
            body,
            status: 'new',
            createdAt: serverTimestamp(),
            deleteAt: (() => {
                const d = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
                d.setHours(6, 0, 0, 0); // Always delete at 06:00 AM
                return d;
            })(),
            isRead: false
        });

        // 2. [NO EXTRA SERVER] Using Firebase Cloud Functions
        // The Cloud Function in admin/functions/index.js will automatically trigger
        // when this document is created and send the push notification via FCM.
        console.log(`Notification created in Firestore: ${type} for Table ${tableId}. Cloud Function will handle FCM.`);

    } catch (error) {
        console.error('Error triggering notification:', error);
    }
}
