'use client';

import { Category } from '@/types/menu';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CategoryTabsProps {
    categories: Category[];
    onCategoryChange?: (categoryId: string) => void;
    activeCategory?: string; // Optional yaptım
}

export default function CategoryTabs({ categories, onCategoryChange, activeCategory: propActiveCategory }: CategoryTabsProps) {
    const [activeId, setActiveId] = useState(propActiveCategory || (categories[0]?.id));
    const [isSticky, setIsSticky] = useState(false);

    // Scroll listener for sticky state and active category detection
    useEffect(() => {
        const handleScroll = () => {
            // Sticky check (basit bir threshold)
            setIsSticky(window.scrollY > 300);

            // Active category detection (Scroll Spy)
            const scrollPosition = window.scrollY + 150; // Offset

            // Reverse loop to find the last category that is above the scroll position
            for (let i = categories.length - 1; i >= 0; i--) {
                const category = categories[i];
                const element = document.getElementById(`category-${category.id}`);
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveId(category.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [categories]);

    // Update internal state if prop changes
    useEffect(() => {
        if (propActiveCategory) setActiveId(propActiveCategory);
    }, [propActiveCategory]);

    const handleCategoryClick = (id: string) => {
        setActiveId(id);
        if (onCategoryChange) onCategoryChange(id);

        // Manual smooth scroll
        const element = document.getElementById(`category-${id}`);
        if (element) {
            const offset = 100; // Header height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    if (!categories || categories.length === 0) return null;

    return (
        <div className={`sticky top-20 z-30 transition-all duration-300 py-4 ${isSticky ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
            <div className="w-full overflow-x-auto no-scrollbar px-4 sm:px-6">
                <div className="flex items-center gap-3 w-max mx-auto">
                    {categories.map((category) => {
                        const isActive = activeId === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category.id)}
                                className={`
                                    relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap
                                    flex items-center gap-2 group
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white bg-white/5 border border-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                {/* Active Background Gradient */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBackground"
                                        className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full shadow-[0_0_20px_rgba(217,119,6,0.4)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                {/* Content lies above the background */}
                                <span className="relative z-10 font-serif tracking-wide">{category.name}</span>

                                {/* Count Badge (Optional) */}
                                {(category.items && category.items.length > 0) && (
                                    <span className={`
                                        relative z-10 text-[10px] px-1.5 py-0.5 rounded-md font-bold
                                        ${isActive ? 'bg-black/20 text-white/90' : 'bg-black/20 text-gray-500 group-hover:text-gray-300'}
                                    `}>
                                        {category.items.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
