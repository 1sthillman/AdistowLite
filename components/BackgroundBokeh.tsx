'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackgroundBokeh() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="fixed inset-0 z-[-1] bg-[#050505]" />;

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505] selection:bg-amber-500/30">

            {/* 1. Base Gradient (Derinlik için) */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-[#050505] to-black" />

            {/* 2. Fluid Mesh Gradients (Hareketli Işıklar) */}

            {/* Golden Flow (Lüks) */}
            <motion.div
                animate={{
                    x: ['-20%', '20%', '-20%'],
                    y: ['-20%', '10%', '-20%'],
                    scale: [1, 1.4, 1],
                    opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-[80vw] h-[80vw] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.15)_0%,rgba(0,0,0,0)_60%)] blur-[80px] mix-blend-screen"
            />

            {/* Emerald Mist (Canlılık) */}
            <motion.div
                animate={{
                    x: ['20%', '-20%', '20%'],
                    y: ['10%', '-20%', '10%'],
                    scale: [1.2, 0.8, 1.2],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-10%] left-[-10%] w-[90vw] h-[90vw] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,rgba(0,0,0,0)_60%)] blur-[90px] mix-blend-screen"
            />

            {/* Royal Purple Hint (Modernlik & Derinlik - Ref görseldeki gibi) */}
            <motion.div
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[40%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,rgba(0,0,0,0)_60%)] blur-[100px] mix-blend-screen"
            />

            {/* 3. Cinematic Film Grain (Profesyonel Doku) */}
            <div
                className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                }}
            />

            {/* 4. Vignette (Kenarları Karartma - Odaklama için) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
        </div>
    );
}
