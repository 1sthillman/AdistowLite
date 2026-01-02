'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Check, Search, Maximize2 } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useTranslations } from 'next-intl';
import { useCart } from '@/context/CartContext';

interface ProductCustomizerProps {
    product: MenuItem | null;
    isOpen: boolean;
    onClose: () => void;
    locale: string;
}

interface CustomizationState {
    removedIngredients: string[];
    addedExtras: string[];
    specialNotes: string;
}

export default function ProductCustomizer({
    product,
    isOpen,
    onClose,
}: ProductCustomizerProps) {
    const t = useTranslations('Product');
    const { addToCart } = useCart();
    const [customization, setCustomization] = useState<CustomizationState>({
        removedIngredients: [],
        addedExtras: [],
        specialNotes: '',
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [isImageExpanded, setIsImageExpanded] = useState(false);

    useEffect(() => {
        if (product) {
            setTotalPrice(product.price);
            setCustomization({
                removedIngredients: [],
                addedExtras: [],
                specialNotes: '',
            });
        }
    }, [product]);

    useEffect(() => {
        if (product) {
            let newTotal = product.price;
            customization.addedExtras.forEach(extraId => {
                const extra = product.extras?.find(e => e.id === extraId);
                if (extra) newTotal += extra.price;
            });
            setTotalPrice(newTotal);
        }
    }, [customization, product]);

    if (!product) return null;

    const toggleIngredient = (ingredientId: string, isRemovable: boolean) => {
        if (!isRemovable) return;
        setCustomization(prev => ({
            ...prev,
            removedIngredients: prev.removedIngredients.includes(ingredientId)
                ? prev.removedIngredients.filter(id => id !== ingredientId)
                : [...prev.removedIngredients, ingredientId]
        }));
    };

    const toggleExtra = (extraId: string) => {
        setCustomization(prev => ({
            ...prev,
            addedExtras: prev.addedExtras.includes(extraId)
                ? prev.addedExtras.filter(id => id !== extraId)
                : [...prev.addedExtras, extraId]
        }));
    };

    const handleAddToOrder = () => {
        const removedIngredientNames = product.ingredients
            ?.filter(ing => customization.removedIngredients.includes(ing.id) && ing.isRemovable)
            .map(ing => `${ing.name} (-)`) || [];

        const addedExtraNames = product.extras
            ?.filter(e => customization.addedExtras.includes(e.id))
            .map(e => e.name) || [];

        const allCustomizations = [...removedIngredientNames, ...addedExtraNames];

        addToCart({
            productId: product.id,
            name: product.name,
            price: totalPrice,
            quantity: 1,
            image: product.image,
            options: allCustomizations,
            note: customization.specialNotes
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full sm:max-w-xl bg-[#1A1A1A] border border-[#FAF7F2]/10 sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#FAF7F2]/5 bg-[#1A1A1A]/95 relative">
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                            <div className="flex justify-between items-start gap-4 relatie z-10">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-serif font-black text-[#FAF7F2] mb-1 leading-tight">
                                        {product.name}
                                    </h2>
                                    <p className="text-sm text-[#FAF7F2]/60 font-light font-sans line-clamp-2">
                                        {product.description}
                                    </p>
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 bg-[#FAF7F2]/5 hover:bg-[#FAF7F2]/10 rounded-full transition-colors border border-[#FAF7F2]/5"
                                >
                                    <X className="w-5 h-5 text-[#FAF7F2]/60 hover:text-[#FAF7F2]" />
                                </button>
                            </div>
                        </div>

                        {/* Product Image Section */}
                        {product.image && (
                            <div className="relative h-64 w-full overflow-hidden flex-shrink-0 group cursor-zoom-in" onClick={() => setIsImageExpanded(true)}>
                                <motion.img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    layoutId={`product-image-${product.id}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                    <Search className="w-3 h-3 text-white/70" />
                                    <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Büyütmek İçin Dokun</span>
                                </div>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scroll bg-[#1A1A1A] relative">
                            {/* Ingredients */}
                            {product.ingredients && product.ingredients.length > 0 && (
                                <section className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-xs font-bold text-[#D97706] uppercase tracking-[0.2em] font-sans">
                                            {t('ingredients')}
                                        </h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-[#D97706]/30 to-transparent"></div>
                                    </div>

                                    <div className="space-y-2">
                                        {product.ingredients.map((ingredient) => {
                                            const isRemoved = customization.removedIngredients.includes(ingredient.id);
                                            return (
                                                <div
                                                    key={ingredient.id}
                                                    onClick={() => toggleIngredient(ingredient.id, ingredient.isRemovable)}
                                                    className={`p-4 rounded-xl border transition-all duration-300 ${isRemoved
                                                        ? 'bg-red-900/10 border-red-900/30 opacity-60'
                                                        : 'bg-[#FAF7F2]/5 border-[#FAF7F2]/5 hover:border-[#D97706]/30'
                                                        } ${ingredient.isRemovable ? 'cursor-pointer hover:bg-[#FAF7F2]/10' : 'cursor-not-allowed opacity-80'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-base font-sans ${isRemoved ? 'line-through text-red-300' : 'text-[#FAF7F2]'}`}>
                                                            {ingredient.name}
                                                        </span>

                                                        {ingredient.isRemovable ? (
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isRemoved ? 'bg-red-500/20 text-red-300' : 'bg-[#FAF7F2]/10 text-[#FAF7F2]/40'
                                                                }`}>
                                                                {isRemoved ? (
                                                                    <Minus className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-[#FAF7F2]/30 uppercase font-black tracking-wider">
                                                                {t('mandatory')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Extras */}
                            {product.extras && product.extras.length > 0 && (
                                <section className="mb-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-xs font-bold text-[#D97706] uppercase tracking-[0.2em] font-sans">
                                            {t('addExtras')}
                                        </h3>
                                        <div className="h-px flex-1 bg-gradient-to-r from-[#D97706]/30 to-transparent"></div>
                                    </div>

                                    <div className="space-y-2">
                                        {product.extras.map((extra) => {
                                            const isSelected = customization.addedExtras.includes(extra.id);
                                            return (
                                                <div
                                                    key={extra.id}
                                                    onClick={() => toggleExtra(extra.id)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${isSelected
                                                        ? 'bg-[#D97706]/10 border-[#D97706] shadow-[0_0_15px_rgba(217,119,6,0.1)]'
                                                        : 'bg-[#FAF7F2]/5 border-[#FAF7F2]/5 hover:border-[#D97706]/30 hover:bg-[#FAF7F2]/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-base font-sans ${isSelected ? 'text-[#D97706] font-bold' : 'text-[#FAF7F2]'}`}>
                                                            {extra.name}
                                                        </span>
                                                        <span className={`text-base font-serif font-bold ${isSelected ? 'text-[#D97706]' : 'text-[#FAF7F2]/60'}`}>
                                                            +₺{extra.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* Notes */}
                            <section>
                                <div className="flex items-center gap-3 mb-4">
                                    <h3 className="text-xs font-bold text-[#D97706] uppercase tracking-[0.2em] font-sans">
                                        {t('specialNotes')}
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-[#D97706]/30 to-transparent"></div>
                                </div>
                                <textarea
                                    value={customization.specialNotes}
                                    onChange={(e) => setCustomization(prev => ({
                                        ...prev,
                                        specialNotes: e.target.value
                                    }))}
                                    placeholder={t('specialNotesPlaceholder')}
                                    maxLength={500}
                                    className="w-full p-4 bg-[#FAF7F2]/5 border border-[#FAF7F2]/10 rounded-xl text-sm text-[#FAF7F2] placeholder-[#FAF7F2]/30 focus:border-[#D97706]/50 focus:ring-1 focus:ring-[#D97706]/50 outline-none transition-all resize-none min-h-[100px]"
                                />
                                <div className="mt-2 text-right">
                                    <span className="text-xs text-[#FAF7F2]/40">
                                        {customization.specialNotes.length}/500
                                    </span>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-4 border-t border-[#FAF7F2]/10 bg-[#1A1A1A] relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-xs text-[#FAF7F2]/40 uppercase tracking-widest mb-1 font-bold">
                                        {t('total')}
                                    </p>
                                    <p className="text-4xl font-serif font-bold text-[#D97706] tracking-tight">
                                        ₺{(totalPrice || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToOrder}
                                className="w-full h-14 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#D97706] to-amber-600 transition-all group-hover:brightness-110"></div>
                                <Plus className="w-5 h-5 relative z-10" />
                                <span className="text-lg relative z-10 tracking-wide font-sans">{t('addToOrder')}</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Fullscreen Image Preview */}
            <AnimatePresence>
                {isImageExpanded && product?.image && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-2xl"
                        onClick={() => setIsImageExpanded(false)}
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/20 z-10"
                            onClick={() => setIsImageExpanded(false)}
                        >
                            <X className="w-6 h-6" />
                        </motion.button>

                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            src={product.image}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            style={{ touchAction: 'none' }}
                        />

                        <div className="absolute bottom-10 left-0 right-0 text-center">
                            <h3 className="text-white text-xl font-serif font-black mb-1">{product.name}</h3>
                            <p className="text-white/50 text-sm font-light uppercase tracking-[0.3em]">Kapalı Çıkmak İçin Dokun</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
}
