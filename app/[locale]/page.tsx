'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QrCode, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import MenuPageClient from '@/components/MenuPageClient';

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params }: HomePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Mount detection
  useEffect(() => {
    setIsMounted(true);
    console.log('[Resolver] Localized Root Mounted. Params:', params);
  }, [params]);

  // 2. Silent Resolver Logic
  const p = searchParams.get('p');

  // Decide if we should show the menu based on the 'p' parameter
  const targetPath = p ? decodeURIComponent(p) : '';
  const isMenuPath = isMounted && targetPath !== '' && (targetPath.includes('/menu/') || targetPath.split('/').filter(Boolean).length >= 1);

  if (isMenuPath) {
    const parts = targetPath.split('/').filter(Boolean);
    // Remove locale if present at start
    if (['tr', 'en'].includes(parts[0])) parts.shift();

    let slug = '';
    let tableId = '';

    // Structure: [menu, slug, table] OR [slug, table]
    if (parts[0] === 'menu') {
      slug = parts[1];
      tableId = parts[2];
    } else {
      slug = parts[0];
      tableId = parts[1];
    }

    if (slug) {
      console.log('[Resolver] Direct Menu Rendering:', { slug, tableId });
      return (
        <MenuPageClient
          params={{
            locale: params.locale,
            slug: slug,
            table: tableId
          }}
        />
      );
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurantSlug.trim()) {
      setIsLoading(true);
      const target = `/menu/${restaurantSlug}/`;
      router.push(`/${params.locale}/?p=${encodeURIComponent(target)}`);
    }
  };

  const toggleLanguage = () => {
    const newLocale = params.locale === 'tr' ? 'en' : 'tr';
    router.push(`/${newLocale}`);
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-emerald-500/50 transition-all"
        >
          <Globe className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-white">
            {params.locale === 'tr' ? 'EN' : 'TR'}
          </span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-3xl mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <QrCode className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tighter italic">RestQR</h1>
          <p className="text-gray-400">
            {params.locale === 'tr' ? 'Modern Menü Çözümü' : 'Modern Menu Solution'}
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">
            {params.locale === 'tr' ? 'QR Kodu Tarayın' : 'Scan QR Code'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-emerald-500 uppercase tracking-widest mb-2 ml-1">
                {params.locale === 'tr' ? 'Restoran Kodu' : 'Restaurant Code'}
              </label>
              <input
                type="text"
                value={restaurantSlug}
                onChange={(e) => setRestaurantSlug(e.target.value)}
                placeholder={params.locale === 'tr' ? 'örn: burger-shop' : 'e.g. burger-shop'}
                className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder:text-gray-600 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{params.locale === 'tr' ? 'MENÜYÜ GÖSTER' : 'VIEW MENU'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-gray-500 text-xs font-medium">
          Powered by <span className="text-emerald-500">RestQR Platform</span>
        </div>
      </motion.div>
    </div>
  );
}