'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface HeroSectionProps {
    restaurantName: string;
    tableNumber?: string;
}

export default function HeroSection({ restaurantName, tableNumber }: HeroSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <div ref={ref} className="relative h-[60vh] min-h-[400px] overflow-hidden flex items-center justify-center">
            {/* Parallax Background */}
            <motion.div
                style={{ y }}
                className="absolute inset-0 z-0 bg-neutral-900"
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </motion.div>

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative z-10 text-center px-4"
            >
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xs font-medium tracking-[0.3em] text-[var(--color-accent)] mb-4 uppercase"
                >
                    {tableNumber ? `Table ${tableNumber}` : 'Welcome to'}
                </motion.p>

                <motion.h1
                    initial={{ y: 40, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="display-text text-6xl sm:text-8xl text-white mb-2 tracking-tighter"
                >
                    {restaurantName.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                    ))}
                </motion.h1>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    className="h-1 w-24 bg-[var(--color-accent)] mx-auto mt-6"
                />
            </motion.div>
        </div>
    );
}
