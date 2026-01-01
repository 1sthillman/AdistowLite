'use client';

import { Phone, Flame, AlertCircle, Bell, Receipt } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGeofence } from '@/hooks/useGeofence';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import LocationPermissionModal from './LocationPermissionModal';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { triggerNotification, NotificationType } from '@/lib/notifications';

interface ServiceButtonsProps {
    restaurantId: string;
    tableId: string;
    tableName?: string;
    location?: { latitude: number; longitude: number };
    waiterCallEnabled?: boolean;
    coalRequestEnabled?: boolean;
}

export default function ServiceButtons({
    restaurantId,
    tableId,
    tableName,
    location,
    waiterCallEnabled = true,
    coalRequestEnabled = false
}: ServiceButtonsProps) {
    const t = useTranslations('Service');
    const tCart = useTranslations('Cart'); // For common location errors
    const { isWithinRange, error, errorType, distance, checkLocation, hasAskedPermission, requestPermission } = useGeofence(location);
    const [pendingRequest, setPendingRequest] = useState<'waiter' | 'coal' | 'bill' | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<'waiter' | 'coal' | 'bill' | null>(null);
    const [cooldownUntil, setCooldownUntil] = useState<number>(0);
    const [countdown, setCountdown] = useState<number>(0);

    // Countdown timer
    useEffect(() => {
        const interval = setInterval(() => {
            const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
            setCountdown(remaining);
        }, 100);
        return () => clearInterval(interval);
    }, [cooldownUntil]);

    const handleRequest = async (type: 'waiter' | 'coal' | 'bill') => {
        if (countdown > 0) {
            toast.error(t('cooldown', { seconds: countdown }));
            return;
        }

        if (!hasAskedPermission) {
            setPendingAction(type);
            setShowPermissionModal(true);
            return;
        }

        if (isWithinRange === false) {
            toast.error(error || tCart('locationErrorDesc'));
            return;
        }

        setPendingRequest(type);
        try {
            const tableRef = doc(db, 'restaurants', restaurantId, 'tables', tableId);
            const messageKey = type === 'waiter' ? 'Garson Çağırıyor' : type === 'coal' ? 'Köz İstiyor' : 'Hesap İstiyor'; // Keep these in TR for waiter dashboard consistency or translate them too? Let's keep TR for now as dashboard is TR.

            await updateDoc(tableRef, {
                requests: arrayUnion({
                    type: type,
                    timestamp: Date.now(),
                    status: 'pending',
                    message: messageKey
                })
            });

            // Trigger Real-time Notification for the Mobile App
            await triggerNotification({
                restaurantId,
                tableId,
                type: type as NotificationType,
                title: `${tableName}`, // Changed from Masa tableId to tableName for better identification
                body: `${tableName} ${messageKey}` // Include table name in body too for lock screen clarity
            });

            setCooldownUntil(Date.now() + 30000);

            let successMsg = '';
            if (type === 'waiter') successMsg = t('waiterSent');
            else if (type === 'coal') successMsg = t('coalSent');
            else if (type === 'bill') successMsg = t('billSent');

            toast.success(successMsg, {
                icon: type === 'waiter' ? '🛎️' : type === 'coal' ? '🔥' : '💳',
                style: { background: '#1A1A1A', color: '#FAF7F2', border: '1px solid #D97706' }
            });
        } catch (err) {
            console.error('Request error:', err);
            toast.error(tCart('orderError')); // Generic error
        } finally {
            setPendingRequest(null);
        }
    };

    const handlePermissionGranted = () => {
        if (pendingAction) {
            handleRequest(pendingAction);
            setPendingAction(null);
        }
    };

    const handlePermissionDenied = () => {
        setPendingAction(null);
        toast.error(t('locationError'));
    };

    const hasLocationError = isWithinRange === false;

    const handleLocationErrorClick = () => {
        if (!hasAskedPermission || errorType === 'PERMISSION_DENIED' || errorType === 'LOCATION_DISABLED') {
            setShowPermissionModal(true);
        } else {
            checkLocation();
        }
    };

    return (
        <>
            <LocationPermissionModal
                isOpen={showPermissionModal}
                onClose={() => setShowPermissionModal(false)}
                onPermissionGranted={handlePermissionGranted}
                onPermissionDenied={handlePermissionDenied}
                errorType={errorType}
                distance={distance}
            />

            <div className="fixed bottom-36 right-6 z-30 flex flex-col gap-4">
                {/* Location Error Overlay */}
                {hasLocationError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleLocationErrorClick}
                        className="absolute bottom-0 right-20 mb-[-1rem] mr-[-1rem] bg-[#1A1A1A] rounded-2xl border border-red-500/50 p-4 shadow-2xl w-48 text-center"
                    >
                        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2 animate-pulse" />
                        <div className="text-[#FAF7F2] font-bold text-xs mb-1">{tCart('locationError')}</div>
                        <div className="text-red-400 text-[10px] mb-2">{tCart('locationErrorDesc')}</div>
                        <button className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full w-full">FIX</button>
                    </motion.div>
                )}

                {/* Service Buttons - Luxury Style */}
                <div className="flex flex-col gap-4">
                    {/* Waiter Call Button */}
                    {waiterCallEnabled && (
                        <motion.button
                            onClick={() => handleRequest('waiter')}
                            disabled={pendingRequest === 'waiter' || countdown > 0 || hasLocationError}
                            whileHover={{ scale: (countdown > 0 || hasLocationError) ? 1 : 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative group ${countdown > 0 || hasLocationError
                                ? 'bg-[#1A1A1A] border border-[#FAF7F2]/10 opacity-50 cursor-not-allowed'
                                : 'bg-[#1A1A1A] border border-[#D97706]/30 hover:border-[#D97706] hover:bg-[#FAF7F2]/5'
                                }`}
                        >
                            <div className="absolute inset-0 rounded-full bg-[#D97706]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            {countdown > 0 ? (
                                <span className="text-xs font-bold text-[#FAF7F2]">{countdown}s</span>
                            ) : (
                                <Bell className="w-6 h-6 text-[#D97706]" />
                            )}
                        </motion.button>
                    )}

                    {/* Coal Request Button */}
                    {coalRequestEnabled && (
                        <motion.button
                            onClick={() => handleRequest('coal')}
                            disabled={pendingRequest === 'coal' || countdown > 0 || hasLocationError}
                            whileHover={{ scale: (countdown > 0 || hasLocationError) ? 1 : 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative group ${countdown > 0 || hasLocationError
                                ? 'bg-[#1A1A1A] border border-[#FAF7F2]/10 opacity-50 cursor-not-allowed'
                                : 'bg-[#1A1A1A] border border-[#EA580C]/30 hover:border-[#EA580C] hover:bg-[#FAF7F2]/5'
                                }`}
                        >
                            <div className="absolute inset-0 rounded-full bg-[#EA580C]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            {countdown > 0 ? (
                                <span className="text-xs font-bold text-[#FAF7F2]">{countdown}s</span>
                            ) : (
                                <Flame className="w-6 h-6 text-[#EA580C]" />
                            )}
                        </motion.button>
                    )}

                    {/* Bill Request Button */}
                    <motion.button
                        onClick={() => handleRequest('bill')}
                        disabled={pendingRequest === 'bill' || countdown > 0 || hasLocationError}
                        whileHover={{ scale: (countdown > 0 || hasLocationError) ? 1 : 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative group ${countdown > 0 || hasLocationError
                            ? 'bg-[#1A1A1A] border border-[#FAF7F2]/10 opacity-50 cursor-not-allowed'
                            : 'bg-[#1A1A1A] border border-[#FAF7F2]/20 hover:border-[#FAF7F2]/50 hover:bg-[#FAF7F2]/5'
                            }`}
                    >
                        <div className="absolute inset-0 rounded-full bg-[#FAF7F2]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                        {countdown > 0 ? (
                            <span className="text-xs font-bold text-[#FAF7F2]">{countdown}s</span>
                        ) : (
                            <Receipt className="w-6 h-6 text-[#FAF7F2]" />
                        )}
                    </motion.button>
                </div>
            </div>
        </>
    );
}
