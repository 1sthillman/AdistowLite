'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check, AlertTriangle, MapPinOff, Navigation, Chrome, Smartphone } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { LocationErrorType } from '@/hooks/useGeofence';
import { useTranslations } from 'next-intl';

interface LocationPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPermissionGranted: () => void;
    onPermissionDenied: () => void;
    errorType?: LocationErrorType;
    distance?: number | null;
}

export default function LocationPermissionModal({
    isOpen,
    onClose,
    onPermissionGranted,
    onPermissionDenied,
    errorType,
    distance
}: LocationPermissionModalProps) {
    const t = useTranslations('Permission');
    const [isRequesting, setIsRequesting] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleRequestPermission = async () => {
        // If permission was denied before, show instructions instead
        if (errorType === 'PERMISSION_DENIED') {
            setShowInstructions(true);
            return;
        }

        setIsRequesting(true);

        if (!navigator.geolocation) {
            toast.error(t('browserUnsupported'));
            onPermissionDenied();
            setIsRequesting(false);
            return;
        }

        try {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    localStorage.setItem('locationPermissionAsked', 'true');
                    localStorage.setItem('locationPermissionGranted', 'true');
                    toast.success(t('permissionGranted'));
                    setIsRequesting(false);
                    onPermissionGranted();
                    onClose();
                },
                (error) => {
                    setIsRequesting(false);
                    localStorage.setItem('locationPermissionAsked', 'true');
                    localStorage.setItem('locationPermissionGranted', 'false');

                    if (error.code === 1) {
                        toast.error(t('permissionDeniedToast'));
                        setShowInstructions(true);
                    } else if (error.code === 2) {
                        toast.error(t('locationServicesOff'));
                    } else if (error.code === 3) {
                        toast.error(t('locationFetchError'));
                    }

                    onPermissionDenied();
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } catch (err) {
            console.error('Permission error:', err);
            toast.error(t('errorGeneric'));
            setIsRequesting(false);
            onPermissionDenied();
        }
    };

    // Dynamic content based on error type
    const getModalContent = () => {
        switch (errorType) {
            case 'LOCATION_DISABLED':
                return {
                    icon: MapPinOff,
                    iconColor: 'text-orange-500',
                    iconBg: 'bg-orange-500/10',
                    iconGlow: 'bg-orange-500',
                    title: t('locationDisabledTitle'),
                    description: t('locationDisabledDesc'),
                    actionText: t('understand'),
                    isWarning: true
                };
            case 'TOO_FAR':
                return {
                    icon: AlertTriangle,
                    iconColor: 'text-red-500',
                    iconBg: 'bg-red-500/10',
                    iconGlow: 'bg-red-500',
                    title: t('tooFarTitle'),
                    description: distance
                        ? t('tooFarDesc', { distance })
                        : t('tooFarDescSimple'),
                    actionText: t('checkAgain'),
                    isWarning: true
                };
            case 'PERMISSION_DENIED':
                return {
                    icon: MapPinOff,
                    iconColor: 'text-red-500',
                    iconBg: 'bg-red-500/10',
                    iconGlow: 'bg-red-500',
                    title: t('permissionDeniedTitle'),
                    description: t('permissionDeniedDesc'),
                    actionText: showInstructions ? t('ok') : t('howToAllow'),
                    isWarning: true
                };
            default:
                return {
                    icon: Navigation,
                    iconColor: 'text-[#00cca3]',
                    iconBg: 'bg-[#00cca3]/10',
                    iconGlow: 'bg-[#00cca3]',
                    title: t('verifyTitle'),
                    description: t('verifyDesc'),
                    actionText: t('allow'),
                    isWarning: false
                };
        }
    };

    const content = getModalContent();
    const Icon = content.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto"
                    >
                        {/* Glow Effect */}
                        <div className={`absolute -inset-1 ${content.iconGlow} blur-2xl opacity-20 rounded-2xl`} />

                        {/* Card */}
                        <div className="relative bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-8 shadow-2xl">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all hover:rotate-90 duration-300"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>

                            {/* Icon */}
                            <div className={`w-20 h-20 ${content.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 relative group`}>
                                <div className={`absolute inset-0 ${content.iconGlow} blur-xl opacity-40 animate-pulse`} />
                                <Icon className={`w-10 h-10 ${content.iconColor} relative`} />
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-black text-white text-center mb-3 tracking-tight">
                                {content.title}
                            </h2>

                            {/* Description */}
                            <p className="text-zinc-400 text-center mb-8 leading-relaxed text-sm">
                                {content.description}
                            </p>

                            {/* INSTRUCTIONS - Show for PERMISSION_DENIED */}
                            {showInstructions && errorType === 'PERMISSION_DENIED' && (
                                <div className="mb-6 space-y-4">
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                        <div className="flex items-start gap-3 mb-4">
                                            <Chrome className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-white font-bold text-sm mb-1">{t('instructions.chromeTitle')}</div>
                                                <ol className="text-xs text-zinc-300 space-y-1 list-decimal list-inside">
                                                    <li>{t('instructions.chromeStep1')}</li>
                                                    <li>{t('instructions.chromeStep2')}</li>
                                                    <li>{t('instructions.chromeStep3')}</li>
                                                    <li>{t('instructions.chromeStep4')}</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <Smartphone className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-white font-bold text-sm mb-1">{t('instructions.mobileTitle')}</div>
                                                <ol className="text-xs text-zinc-300 space-y-1 list-decimal list-inside">
                                                    <li>{t('instructions.mobileStep1')}</li>
                                                    <li>{t('instructions.mobileStep2')}</li>
                                                    <li>{t('instructions.mobileStep3')}</li>
                                                </ol>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center pt-2">
                                        <div className="text-xs text-zinc-500">
                                            ⚠️ {t('instructions.refreshNote')}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Benefits (only show if not warning and no instructions) */}
                            {!content.isWarning && !showInstructions && (
                                <div className="space-y-3 mb-8">
                                    {[
                                        { icon: Check, text: t('safeOrder') },
                                        { icon: Check, text: t('callWaiter') },
                                        { icon: Check, text: t('requestBill') }
                                    ].map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                                        >
                                            <div className="w-6 h-6 bg-[#00cca3]/20 rounded-full flex items-center justify-center shrink-0">
                                                <item.icon className="w-4 h-4 text-[#00cca3]" />
                                            </div>
                                            <span className="text-sm text-zinc-300 font-medium">{item.text}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Warning box for TOO_FAR */}
                            {content.isWarning && errorType === 'TOO_FAR' && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-xs text-center">
                                        🔒 {t('safetyWarning')}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3.5 rounded-xl bg-white/5 text-zinc-300 font-bold hover:bg-white/10 transition-all border border-white/10"
                                >
                                    {t('close')}
                                </button>
                                <button
                                    onClick={handleRequestPermission}
                                    disabled={isRequesting}
                                    className={`flex-1 px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 ${content.isWarning
                                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
                                        : 'bg-gradient-to-r from-[#00cca3] to-[#00b894] hover:from-[#00b894] hover:to-[#00cca3] text-black shadow-[#00cca3]/40'
                                        }`}
                                >
                                    {isRequesting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            {t('checking')}
                                        </span>
                                    ) : (
                                        content.actionText
                                    )}
                                </button>
                            </div>

                            {/* Privacy Note */}
                            <p className="text-xs text-zinc-600 text-center mt-6 leading-relaxed">
                                🔒 {t('privacyNote')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
