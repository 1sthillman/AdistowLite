'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useGeofence } from '@/hooks/useGeofence';
import LocationPermissionModal from './LocationPermissionModal';
import { db } from '@/lib/firebase';
import { collection, doc, updateDoc, arrayUnion, addDoc, Timestamp, setDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { triggerNotification } from '@/lib/notifications';
import { trackRevenue } from '@/lib/analytics';

interface CartButtonProps {
    restaurantId: string;
    tableId: string;
    tableName: string;
    location?: { latitude: number; longitude: number };
    onOrderSuccess?: () => void;
}

export default function CartButton({ restaurantId, tableId, tableName, location, onOrderSuccess }: CartButtonProps) {
    const t = useTranslations('Cart');
    const { itemCount, total, items, removeFromCart, updateQuantity, clearCart, cartNote, setCartNote } = useCart();
    const { isWithinRange, error, errorType, distance, checkLocation, hasAskedPermission, requestPermission } = useGeofence(location);
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);


    const handleCheckout = async () => {
        if (!hasAskedPermission) {
            setShowPermissionModal(true);
            return;
        }

        if (!isWithinRange) {
            toast.error(error || t('locationErrorDesc'), {
                style: { background: '#1A1A1A', color: '#FAF7F2', border: '1px solid #dc2626' }
            });
            setShowPermissionModal(true);
            return;
        }

        if (items.length === 0) return;

        setIsSubmitting(true);

        try {
            const ordersCollection = collection(db, 'restaurants', restaurantId, 'orders');
            const tablesCollection = collection(db, 'restaurants', restaurantId, 'tables');
            const tableRef = doc(tablesCollection, tableId);

            const orderData = {
                tableId: tableId,
                tableName: tableName,
                items: items.map(item => ({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    notes: item.note || '',
                    extras: item.options || []
                })),
                status: 'pending' as const,
                total: total,
                timestamp: Timestamp.now(),
                deleteAt: (() => {
                    const d = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
                    d.setHours(6, 0, 0, 0); // Always delete at 06:00 AM
                    return d;
                })(),
                note: cartNote || ''
            };

            const newOrderDoc = await addDoc(ordersCollection, orderData);

            await updateDoc(tableRef, {
                activeOrders: arrayUnion(newOrderDoc.id),
                orders: arrayUnion(...orderData.items),
                totalAmount: increment(total),
                status: 'ordering',
                lastOrderTime: Timestamp.now()
            });

            // Trigger Real-time Notification for the Mobile App
            await triggerNotification({
                restaurantId,
                tableId,
                type: 'order',
                title: `${tableName}`,
                body: `${tableName}: Yeni Sipariş (₺${total})`
            });

            // Track Revenue Real-time
            await trackRevenue(restaurantId, total);

            clearCart();
            setIsOpen(false);
            toast.success(t('orderSent'), {
                icon: '🥂',
                style: { background: '#1A1A1A', color: '#FAF7F2', border: '1px solid #D97706' }
            });

            if (onOrderSuccess) {
                setTimeout(onOrderSuccess, 1500); // Small delay for UX
            }
        } catch (err) {
            console.error('Checkout error:', err);
            toast.error(t('orderError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePermissionGranted = () => {
        setShowPermissionModal(false);
        checkLocation();
        setTimeout(() => {
            if (isWithinRange) {
                handleCheckout();
            }
        }, 500);
    };

    const handlePermissionDenied = () => {
        setShowPermissionModal(false);
        toast.error(t('permissionDenied'));
    };


    if (itemCount === 0) return null;

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

            {/* Floating Cart Button */}
            <motion.button
                initial={{ scale: 0, y: 100 }}
                animate={{ scale: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A]/95 border border-[#D97706]/30 text-[#FAF7F2] px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center gap-5 w-[92%] max-w-sm justify-between backdrop-blur-xl ring-1 ring-white/5"
            >
                <div className="flex items-center gap-4">
                    <div className="bg-[#D97706]/20 p-2.5 rounded-xl border border-[#D97706]/30 relative">
                        <ShoppingBag className="w-6 h-6 text-[#D97706]" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#D97706] rounded-full animate-pulse shadow-[0_0_10px_#D97706]"></div>
                    </div>
                    <div className="flex flex-col items-start leading-none gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D97706]">{t('title')}</span>
                        <span className="font-serif font-bold text-lg">{itemCount} {t('items')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 pl-5 border-l border-[#FAF7F2]/10 text-right">
                    <div className="flex flex-col items-end leading-none gap-1">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#FAF7F2]/50">{t('total')}</span>
                        <span className="font-serif font-black text-xl text-[#D97706] tracking-tight">₺{total}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#FAF7F2]/60" />
                </div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Cart Modal */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="bg-[#1A1A1A] border-t border-[#FAF7F2]/10 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl p-6 relative z-10 max-h-[92vh] flex flex-col shadow-2xl"
                        >
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay rounded-t-[2.5rem]"></div>

                            <div className="w-16 h-1 bg-[#FAF7F2]/10 rounded-full mx-auto mb-8 sm:hidden" />

                            {/* Header */}
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <div>
                                    <h2 className="text-3xl font-serif font-black text-[#FAF7F2] tracking-tight">{t('title')}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
                                        <p className="text-xs text-[#D97706] font-bold uppercase tracking-[0.2em]">{tableName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center bg-[#FAF7F2]/5 hover:bg-[#FAF7F2]/10 border border-[#FAF7F2]/5 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-[#FAF7F2]/80" />
                                </button>
                            </div>

                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto space-y-4 mb-6 custom-scroll px-1 relative z-10">
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="group p-4 rounded-2xl bg-[#FAF7F2]/5 border border-[#FAF7F2]/5 hover:border-[#D97706]/30 hover:bg-[#FAF7F2]/[0.08] transition-all relative overflow-hidden"
                                    >
                                        <div className="flex gap-4">
                                            {item.image && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-[#FAF7F2]/10">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-serif font-bold text-lg text-[#FAF7F2] leading-tight">
                                                            {item.name}
                                                        </h4>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1.5 rounded-lg text-[#FAF7F2]/40 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {item.options && item.options.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {item.options.map((option, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20"
                                                                >
                                                                    {option}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {item.note && (
                                                        <p className="text-[11px] font-medium text-[#FAF7F2]/60 italic mt-2 border-l-2 border-[#D97706]/50 pl-2">
                                                            "{item.note}"
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center bg-[#1A1A1A] rounded-lg border border-[#FAF7F2]/10 p-0.5">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-7 h-7 rounded-md hover:bg-[#FAF7F2]/10 flex items-center justify-center transition-colors text-[#FAF7F2]/60"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="font-medium text-[#FAF7F2] w-6 text-center text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-7 h-7 rounded-md hover:bg-[#FAF7F2]/10 flex items-center justify-center transition-colors text-[#D97706]"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <span className="font-serif font-bold text-lg text-[#FAF7F2]">
                                                        ₺{(item.price * item.quantity).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-[#FAF7F2]/10 relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-[#D97706] uppercase tracking-[0.2em]">{t('note')}</span>
                                    <div className="h-px flex-1 bg-[#D97706]/20" />
                                </div>
                                <textarea
                                    value={cartNote}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 200) {
                                            setCartNote(e.target.value);
                                        }
                                    }}
                                    placeholder={t('notePlaceholder')}
                                    className="w-full px-4 py-3 bg-[#FAF7F2]/5 border border-[#FAF7F2]/10 rounded-xl text-sm text-[#FAF7F2] placeholder:text-[#FAF7F2]/30 resize-none focus:ring-1 focus:ring-[#D97706]/50 focus:border-[#D97706]/50 outline-none transition-all font-sans"
                                    rows={2}
                                />
                                <div className="flex justify-end mt-1 px-1">
                                    <span className="text-[10px] text-[#FAF7F2]/30 font-medium">
                                        {cartNote.length}/200
                                    </span>
                                </div>
                            </div>

                            {!isWithinRange && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 relative z-10"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest">{t('locationError')}</p>
                                        <p className="text-xs text-red-300/60 leading-tight mt-0.5">{t('locationErrorDesc')}</p>
                                    </div>
                                </motion.div>
                            )}

                            <div className="pt-6 border-t border-[#FAF7F2]/10 mt-4 relative z-10">
                                <div className="flex justify-between items-end mb-6 px-1">
                                    <div className="flex flex-col leading-none">
                                        <span className="text-xs font-bold text-[#FAF7F2]/40 uppercase tracking-[0.2em] mb-2">{t('total')}</span>
                                        <span className="text-4xl font-serif font-black text-[#D97706] tracking-tight">₺{total}</span>
                                    </div>

                                    <div className="text-right leading-none pb-1">
                                        <span className="text-sm font-medium text-[#FAF7F2]/60">{itemCount} {t('items')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isSubmitting || !isWithinRange}
                                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] ${isWithinRange
                                        ? 'bg-gradient-to-r from-[#D97706] to-amber-600 text-white shadow-amber-900/20 hover:brightness-110'
                                        : 'bg-[#FAF7F2]/5 text-[#FAF7F2]/20 cursor-not-allowed border border-[#FAF7F2]/5'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="tracking-wide font-sans">{t('checkout')}</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
