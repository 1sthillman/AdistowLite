'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Check, Heart, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { getDeviceId } from '@/utils/device';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId: string;
    restaurantName: string;
}

const REACTIONS = [
    { label: 'Üzgün', emoji: '😔', color: '#EF4444' }, // 1
    { label: 'Eh İşte', emoji: '😐', color: '#F97316' }, // 2
    { label: 'İyi', emoji: '🙂', color: '#EAB308' }, // 3
    { label: 'Harika', emoji: '😄', color: '#84CC16' }, // 4
    { label: 'Mükemmel!', emoji: '🤩', color: '#22C55E' }, // 5
];

export default function RatingModal({ isOpen, onClose, restaurantId, restaurantName }: RatingModalProps) {
    const t = useTranslations('Rating');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setComment('');
            setIsSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (rating === 0) return;

        setIsSubmitting(true);
        const deviceId = getDeviceId();

        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurantId,
                    rating,
                    comment,
                    deviceId,
                    userName: 'Misafir'
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error === 'ALREADY_RATED') {
                    toast.error(t('alreadyRated'), {
                        icon: '👮',
                        style: { background: '#1A1A1A', color: '#FAF7F2', border: '1px solid #dc2626' }
                    });
                    onClose();
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Success UI sequence
                setIsSuccess(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#D97706', '#FAF7F2', '#065F46']
                });

                toast.success(t('success'), {
                    icon: '🌟',
                    style: { background: '#1A1A1A', color: '#FAF7F2', border: '1px solid #D97706' }
                });

                setTimeout(onClose, 3000);
            }
        } catch (error) {
            console.error('Rating error:', error);
            toast.error(t('error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentReaction = (hoverRating || rating) > 0 ? REACTIONS[(hoverRating || rating) - 1] : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Dark Premium Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-lg bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Elite Accent Lines */}
                        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

                        {/* Status Content */}
                        <div className="relative z-10 p-8 sm:p-12">
                            <AnimatePresence mode="wait">
                                {!isSuccess ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex flex-col items-center text-center"
                                    >
                                        {/* Close Button Inside */}
                                        <button
                                            onClick={onClose}
                                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>

                                        {/* Header */}
                                        <div className="mb-8">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest font-bold mb-4">
                                                <Heart className="w-3 h-3" /> Değerlendirme
                                            </div>
                                            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white mb-2 leading-tight">
                                                {t('title')}
                                            </h2>
                                            <p className="text-zinc-500 text-sm">{restaurantName}</p>
                                        </div>

                                        {/* Reaction Display */}
                                        <div className="h-24 flex flex-col items-center justify-center mb-4">
                                            <AnimatePresence mode="wait">
                                                {currentReaction ? (
                                                    <motion.div
                                                        key={currentReaction.label}
                                                        initial={{ y: 10, opacity: 0, scale: 0.8 }}
                                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                                        exit={{ y: -10, opacity: 0, scale: 0.8 }}
                                                        className="flex flex-col items-center"
                                                    >
                                                        <span className="text-6xl mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                                            {currentReaction.emoji}
                                                        </span>
                                                        <span className="text-sm font-bold tracking-widest uppercase italic" style={{ color: currentReaction.color }}>
                                                            {currentReaction.label}
                                                        </span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        initial={{ opacity: 0.2 }}
                                                        animate={{ opacity: 0.3 }}
                                                        className="text-6xl grayscale filter"
                                                    >
                                                        😶
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Stars Strip */}
                                        <div className="flex justify-center gap-3 mb-10 bg-white/[0.02] p-4 rounded-3xl border border-white/[0.05]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="relative focus:outline-none transition-transform active:scale-95 p-1"
                                                >
                                                    <Star
                                                        className={`w-10 h-10 transition-all duration-300 ${star <= (hoverRating || rating)
                                                            ? 'fill-amber-500 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                                                            : 'text-zinc-800 hover:text-zinc-700'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>

                                        {/* Comment Section */}
                                        <div className="w-full relative">
                                            <div className="absolute top-4 left-4 text-amber-500/30">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder={t('placeholder')}
                                                className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-3xl p-5 pl-12 text-white placeholder-zinc-700 text-sm resize-none focus:border-amber-500/40 focus:bg-white/[0.05] outline-none transition-all font-sans"
                                            />
                                        </div>

                                        {/* Submit Action */}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={rating === 0 || isSubmitting}
                                            className={`w-full mt-8 py-5 rounded-[1.5rem] font-black text-sm tracking-[0.2em] uppercase transition-all relative overflow-hidden group ${rating > 0 && !isSubmitting
                                                    ? 'bg-amber-500 text-black hover:bg-amber-400 hover:scale-[1.02] shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)]'
                                                    : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5'
                                                }`}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    <span>GÖNDERİLİYOR</span>
                                                </div>
                                            ) : (
                                                <span>{t('submit')}</span>
                                            )}
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12 flex flex-col items-center text-center"
                                    >
                                        <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                                            <Check className="w-12 h-12 text-black stroke-[3]" />
                                        </div>
                                        <h2 className="text-3xl font-serif font-medium text-white mb-4">
                                            Teşekkür Ederiz
                                        </h2>
                                        <p className="text-zinc-500 max-w-[250px] leading-relaxed">
                                            Geri bildiriminiz başarıyla iletildi. Deneyiminizi paylaştığınız için teşekkürler.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Background Texture Overlay */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
