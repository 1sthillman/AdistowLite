'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowRight, Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuPageClient from '@/components/MenuPageClient';

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();

  // 1. ATOMIC DETECTION (Directly from window.location)
  // We use useMemo to have this answer IMMEDIATELY upon execution
  const recoveryInfo = useMemo(() => {
    if (typeof window === 'undefined') return { type: 'loading', data: null };

    // Check if '?p=' is present in the ACTUAL search string
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const p = urlParams.get('p');

    if (p) {
      let target = decodeURIComponent(p);
      if (target.includes('%')) target = decodeURIComponent(target);

      const parts = target.split('/').filter(Boolean);
      const clean = parts.filter(x => !['tr', 'en', 'menu'].includes(x));
      const slug = clean[0];
      const table = clean[1] || '';

      if (slug) {
        return { type: 'recovery', data: { slug, table } };
      }
    }

    return { type: 'home', data: null };
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for the "invalid placeholder" API key from your screenshot
  const isKeyInvalid = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
    return key.includes('-mPq-') || key.includes('p-l-0X');
  }, []);

  useEffect(() => {
    setIsMounted(true);

    // SILENT URL CLEANUP (Only if we are in recovery mode)
    if (recoveryInfo.type === 'recovery' && recoveryInfo.data) {
      const isProd = window.location.hostname !== 'localhost';
      const repoName = isProd ? '/AdistowLite' : '';
      const { slug, table } = recoveryInfo.data;
      const cleanPath = `/${params.locale}/menu/${slug}/${table ? table + '/' : ''}`;
      const cleanUrl = window.location.origin + repoName + cleanPath + window.location.hash;

      window.history.replaceState(null, '', cleanUrl);
    }
  }, [recoveryInfo, params.locale]);

  const toggleLanguage = () => {
    const newLocale = params.locale === 'tr' ? 'en' : 'tr';
    router.push(`/${newLocale}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurantSlug.trim()) {
      setIsLoading(true);
      const target = `/menu/${restaurantSlug}/`;
      router.push(`/${params.locale}/?p=${encodeURIComponent(target)}`);
    }
  };

  // --- RENDER LOGIC ---

  // A. Hydration Guard: To prevent flicker, we show a clean loader until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // B. RECOVERY MODE: Render the Menu IMMEDIATELY
  if (recoveryInfo.type === 'recovery' && recoveryInfo.data) {
    return (
      <MenuPageClient
        params={{
          locale: params.locale,
          slug: recoveryInfo.data.slug,
          table: recoveryInfo.data.table
        }}
      />
    );
  }

  // C. NORMAL HOME UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0A0A0A] to-black flex flex-col items-center justify-center p-4">

      {/* Configuration Error Alert */}
      {isKeyInvalid && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/90 text-white p-4 text-center z-50 flex items-center justify-center gap-3 backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold">
            DİKKAT: Firebase API Anahtarı eksik veya hatalı! Menüler yüklenemeyecektir.
          </p>
        </div>
      )}

      <div className="absolute top-6 right-6">
        <button
          onClick={toggleLanguage}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all backdrop-blur-md text-white font-bold"
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          {params.locale === 'tr' ? 'EN' : 'TR'}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500 rounded-[2.5rem] mb-6 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3 tracking-tighter">RestQR</h1>
          <p className="text-gray-400 font-medium">Modern QR Menü Çözümü</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-2xl">
          <h2 className="text-xl font-bold text-emerald-500 mb-8 text-center uppercase tracking-widest italic">
            {params.locale === 'tr' ? 'Menüye Giriş' : 'Menu Entrance'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">
                Restoran Kodu
              </label>
              <input
                type="text"
                value={restaurantSlug}
                onChange={(e) => setRestaurantSlug(e.target.value)}
                placeholder="örn: demo-restaurant"
                className="w-full px-8 py-5 bg-black/50 border border-white/5 rounded-3xl focus:ring-2 focus:ring-emerald-500 text-white outline-none font-bold text-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 px-8 rounded-3xl flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>GÖRÜNTÜLE</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}