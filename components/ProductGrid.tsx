'use client';

import { Category, MenuItem } from '@/types/menu';
import ProductCard from './ProductCard';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface ProductGridProps {
    categories: Category[];
    onProductClick: (product: MenuItem) => void;
    isListView?: boolean; // Tıklama durumuna göre görünüm modu
}

// Animated Section Wrapper
function CategorySection({ category, onProductClick, isListView }: { category: Category, onProductClick: (p: MenuItem) => void, isListView?: boolean }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    return (
        <div
            ref={ref}
            id={`category-${category.id}`}
            className="mb-24 scroll-mt-40"
        >
            {/* Elegant Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-6 mb-10 px-4"
            >
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-[#FAF7F2] tracking-wide text-center drop-shadow-xl">
                    {category.name}
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            </motion.div>

            {/* Product Grid - Dynamic Layout Logic */}
            {/* isListView (Tıklandıysa): Tek Sütun (grid-cols-1) */}
            {/* Varsayılan (Tıklanmadıysa): Çift Sütun (grid-cols-2) */}
            <div className={`grid gap-x-4 gap-y-10 px-4 transition-all duration-500 ${isListView ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {category.items?.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                        <ProductCard
                            item={item}
                            onClick={() => onProductClick(item)}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function ProductGrid({ categories, onProductClick, isListView }: ProductGridProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="container max-w-screen-xl mx-auto pb-24">
            {categories.map((category) => (
                <CategorySection
                    key={category.id}
                    category={category}
                    onProductClick={onProductClick}
                    isListView={isListView}
                />
            ))}
        </div>
    );
}
