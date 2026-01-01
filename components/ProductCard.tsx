'use client';

import { MenuItem } from '@/types/menu';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ProductCardProps {
    item: MenuItem;
    onClick: () => void;
}

export default function ProductCard({ item, onClick }: ProductCardProps) {
    const t = useTranslations('Product');
    const [imageError, setImageError] = useState(false);
    const hasImage = item.image && !imageError;

    return (
        <motion.div
            onClick={onClick}
            className="h-full cursor-pointer group relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
            {/* Glow Effect Behind Card */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-700" />

            {/* Main Glass Card Container */}
            <div className="relative h-full flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/10 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">

                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {hasImage ? (
                        <div className="w-full h-full relative">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                onError={() => setImageError(true)}
                            />
                            {/* Cinematic Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-800 to-black">
                            <ImageIcon className="w-8 h-8 text-white/10" />
                        </div>
                    )}

                    {/* Price Tag - Floating Glass Prism */}
                    <div className="absolute top-3 right-3 z-10">
                        <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-1 group-hover:border-amber-500/30 transition-colors">
                            <span className="text-amber-500 font-bold text-sm tracking-wide">₺</span>
                            <span className="text-white font-bold text-lg tracking-tight">{item.price}</span>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col relative">
                    {/* Title */}
                    <h3 className="font-serif font-bold text-xl text-white mb-2 leading-tight group-hover:text-amber-400 transition-colors duration-300 drop-shadow-sm">
                        {item.name}
                    </h3>

                    {/* Description */}
                    {item.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-light mb-4 group-hover:text-gray-300 transition-colors">
                            {item.description}
                        </p>
                    )}

                    {/* Bottom Action Area */}
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                        {/* Options Badge */}
                        {item.extras && item.extras.length > 0 ? (
                            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                                {t('options', { count: item.extras.length })}
                            </span>
                        ) : <div />}

                        {/* Add Button - Neon Glow */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:shadow-amber-500/40 opacity-90 group-hover:opacity-100 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
