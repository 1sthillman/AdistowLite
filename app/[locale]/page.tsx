'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowRight, Globe, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuPageClient from '@/components/MenuPageClient';

interface HomePageProps {
  params: { locale: string };
}

declare global {
  interface Window {
    __RESTQR_RECOVERY?: boolean;
    __RESTQR_DEBUG_LOGS?: any[];
  }
}

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();

  // 1. ATOMIC DETECTION via useState/useEffect (More robust than useMemo for this case)
  const [recoveryState, setRecoveryState] = useState<'loading' | 'recovery' | 'home'>('loading');
  const [recoveryData, setRecoveryData] = useState<{ slug: string; table: string } | null>(null);

  useEffect(() => {
    // DIAGNOSTIC LOGGING
    const logs: any[] = [];
    const log = (...args: any[]) => {
      console.log('[SPA Debug]', ...args);
      logs.push(args);
    };
    window.__RESTQR_DEBUG_LOGS = logs;

    log('Checking for recovery...');
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);
    const p = urlParams.get('p');
    const isGlobalRecovery = window.__RESTQR_RECOVERY === true;

    log('p:', p);
    log('globalRecovery:', isGlobalRecovery);

    if (p || isGlobalRecovery) {
      let target = decodeURIComponent(p || '');
      if (target.includes('%')) target = decodeURIComponent(target);

      log('Target decoded:', target);

      const parts = target.split('/').filter(Boolean);
      const clean = parts.filter(x => !['tr', 'en', 'menu'].includes(x));
      const slug = clean[0];
      const table = clean[1] || '';

      log('Clean parts:', clean);
      log('Slug:', slug);

      if (slug) {
        log('RECOVERY FOUND!');
        setRecoveryData({ slug, table });
        setRecoveryState('recovery');

        // CLEAN URL
        const isProd = window.location.hostname !== 'localhost';
        const repoName = isProd ? '/AdistowLite' : '';
        const cleanPath = `/${params.locale}/menu/${slug}/${table ? table + '/' : ''}`;
        const cleanUrl = window.location.origin + repoName + cleanPath + window.location.hash;
        window.history.replaceState(null, '', cleanUrl);
        return;
      }
    }

    // IF NO RECOVERY, WAIT 500ms BEFORE SHOWING HOME
    // This handles any race conditions where params might come late
    log('No recovery found immediately. Waiting...');
    const timer = setTimeout(() => {
      log('Timeout finished. Showing Home UI.');
      setRecoveryState('home');
    }, 500);

    return () => clearTimeout(timer);
  }, [params.locale]);

  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for the "invalid placeholder" API key
  const isKeyInvalid = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
    return key.includes('-mPq-') || key.includes('p-l-0X-') || key === '';
  }, []);

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

  // A. LOADING / GUARD
  if (recoveryState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="mt-8 text-white/40 font-bold uppercase tracking-widest text-xs">Yükleniyor...</p>
      </div>
    );
  }

  // B. RECOVERY PATH
  if (recoveryState === 'recovery' && recoveryData) {
    return (
      <MenuPageClient
        params={{
          locale: params.locale,
          slug: recoveryData.slug,
          table: recoveryData.table
        }}
      />
    );
  }

  // C. HOME UI
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {isKeyInvalid && (
        <div className="absolute top-0 left-0 right-0 bg-red-600/90 text-white p-4 text-center z-[100] flex items-center justify-center gap-3 font-bold backdrop-blur-md">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>UYARI: API Anahtarı Hatalı! (Lütfen Console Loglarına Bakın)</span>
        </div>
      )}

      {/* BG Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="absolute top-6 right-6">
        <button onClick={toggleLanguage} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2 border border-white/10 transition-all">
          <Globe className="w-4 h-4 text-emerald-500" />
          {params.locale === 'tr' ? 'TUR' : 'ENG'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm text-center relative z-10">
        <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <QrCode className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-5xl font-black text-white mb-2 italic tracking-tighter">RestQR</h1>

        <div className="bg-white/[0.04] backdrop-blur-2xl rounded-[3rem] p-8 border border-white/10 shadow-2xl mt-12">
          <h2 className="text-lg font-black text-white mb-6 uppercase tracking-widest text-emerald-500">Misafir Girişi</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={restaurantSlug}
              onChange={(e) => setRestaurantSlug(e.target.value)}
              placeholder="Restoran Kodu"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-emerald-500 text-center font-bold outline-none"
              required
            />
            <button type="submit" className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl hover:bg-emerald-400 transition-colors">
              GİRİŞ YAP
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}