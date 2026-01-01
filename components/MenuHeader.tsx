'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, Clock, Globe, Share2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface MenuHeaderProps {
    restaurant: any;
    tableNumber?: string;
    onRatingClick?: () => void;
    ratingSystemEnabled?: boolean;
}

export default function MenuHeader({ restaurant, tableNumber, onRatingClick, ratingSystemEnabled = true }: MenuHeaderProps) {
    const t = useTranslations('Common');
    const { scrollY } = useScroll();
    const router = useRouter();
    const [showLangMenu, setShowLangMenu] = useState(false);

    // Ultra-Smooth Parallax
    const y = useTransform(scrollY, [0, 500], [0, 250]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1.1, 1.2]); // Hafif zoom etkisi

    // Sticky Bar Effect
    const stickyOpacity = useTransform(scrollY, [200, 250], [0, 1]);
    const stickyY = useTransform(scrollY, [200, 250], [-20, 0]);

    // Rating & Time
    const rating = restaurant?.rating ? Number(restaurant.rating).toFixed(1) : '5.0';
    const waitingTime = restaurant?.avgPreparationTime || '15-20';

    const changeLanguage = (lang: string) => {
        let path = window.location.pathname;
        const search = window.location.search;
        if (path.startsWith('/tr')) path = path.replace('/tr', '');
        else if (path.startsWith('/en')) path = path.replace('/en', '');
        if (!path.startsWith('/')) path = '/' + path;
        router.push(`/${lang}${path}${search}`.replace('//', '/'));
        setShowLangMenu(false);
    };

    return (
        <>
            {/* 1. CINEMATIC BACKGROUND LAYER (Fixed & Masked) */}
            <div className="absolute top-0 left-0 right-0 h-[60vh] overflow-hidden z-0 pointer-events-none">
                <motion.div style={{ y, scale, opacity }} className="relative w-full h-full">
                    <Image
                        src={restaurant?.coverImage || restaurant?.image || "https://images.unsplash.com/photo-1514362545857-3bc165497db5?q=80&w=2670&auto=format&fit=crop"}
                        alt="Background"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* ELIT MASKING: Resmi alttan yumuşakça silerek arka plan rengine karıştırır */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050505]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
                </motion.div>
            </div>

            {/* 2. FLOATING CONTENT (No Borders, Just Typography) */}
            <div className="relative z-10 w-full flex flex-col items-center pt-24 pb-8 px-6 text-center">

                {/* Logo - Floating Glass Orb */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-24 h-24 mb-6 rounded-full p-1 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full backdrop-blur-md border border-white/10" />
                    <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                        <Image
                            src={restaurant?.logo || "https://ui-avatars.com/api/?name=R&background=000&color=fff"}
                            alt="Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                </motion.div>

                {/* Restaurant Name - Big Serif Typography */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="text-4xl sm:text-5xl font-serif font-medium text-white mb-2 tracking-tight drop-shadow-2xl"
                >
                    {restaurant?.name}
                </motion.h1>

                {/* Metadata Pills - Minimal & Glass */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex items-center gap-3 mt-4"
                >
                    {ratingSystemEnabled && (
                        <button
                            onClick={onRatingClick}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all group"
                        >
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500/20 group-hover:fill-amber-500 transition-colors" />
                            <span className="text-sm font-medium text-white">{rating}</span>
                        </button>
                    )}

                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-white/90">{t('table')} {tableNumber}</span>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white/90">{waitingTime} min</span>
                    </div>
                </motion.div>
            </div>

            {/* 3. MINIMAL STICKY HEADER (Appears on Scroll) */}
            <motion.div
                style={{ opacity: stickyOpacity, y: stickyY }}
                className="fixed top-0 left-0 right-0 h-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6"
            >
                <div className="font-serif text-xl font-bold text-white tracking-wide">
                    {restaurant?.name}
                </div>

                {/* Right Actions */}
                <div className="flex gap-3">
                    <button onClick={() => setShowLangMenu(!showLangMenu)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <Globe className="w-5 h-5 text-white/80" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <Share2 className="w-5 h-5 text-white/80" />
                    </button>
                </div>

                {/* Language Menu Dropdown (Inside Sticky) */}
                {showLangMenu && (
                    <div className="absolute top-20 right-6 bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[140px] animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => changeLanguage('tr')} className="w-full text-left px-5 py-3 text-white/90 hover:bg-white/5 text-sm">Türkçe</button>
                        <button onClick={() => changeLanguage('en')} className="w-full text-left px-5 py-3 text-white/90 hover:bg-white/5 text-sm">English</button>
                    </div>
                )}
            </motion.div>

            {/* Top Actions (Absolute for Initial View) */}
            <div className="absolute top-0 right-0 p-6 z-20 flex gap-3">
                <button onClick={() => setShowLangMenu(!showLangMenu)} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center hover:bg-black/40 transition-colors border border-white/10">
                    <Globe className="w-5 h-5 text-white" />
                </button>
                {/* Language Menu for Top View */}
                {showLangMenu && scrollY.get() < 200 && (
                    <div className="absolute top-20 right-6 bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[140px] z-[60]">
                        <button onClick={() => changeLanguage('tr')} className="w-full text-left px-5 py-3 text-white hover:bg-white/5 text-sm">Türkçe</button>
                        <button onClick={() => changeLanguage('en')} className="w-full text-left px-5 py-3 text-white hover:bg-white/5 text-sm">English</button>
                    </div>
                )}
            </div>
        </>
    );
}
