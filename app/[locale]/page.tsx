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

  // 1. Ensure hydration match by waiting for mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- In-line Menu Recovery ---
  const p = searchParams.get('p');
  const isMenuPath = p && p.includes('/menu/');

  // If we are on a recovery path and mounted, render the Menu
  if (isMounted && isMenuPath) {
    const parts = p.split('/').filter(Boolean);
    const menuIndex = parts.indexOf('menu');
    if (menuIndex !== -1) {
      const slug = parts[menuIndex + 1];
      const tableId = parts[menuIndex + 2];

      return (
        <MenuPageClient
          params={{
            locale: params.locale,
            slug: slug || 'demo',
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
      // We use a query param approach for consistency in dev
      router.push(`/${params.locale}/?p=${encodeURIComponent('/menu/' + restaurantSlug + '/')}`);
    }
  };

  const toggleLanguage = () => {
    const newLocale = params.locale === 'tr' ? 'en' : 'tr';
    router.push(`/${newLocale}`);
  };

  // If not mounted yet, render a skeleton/empty to match server
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-restqr-emerald-50 to-restqr-gold-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4 text-gray-900 dark:text-gray-100">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {params.locale === 'tr' ? 'EN' : 'TR'}
          </span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-restqr-emerald-500 rounded-2xl mb-4 shadow-lg"
          >
            <QrCode className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">RestQR</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {params.locale === 'tr' ? 'Modern QR Menü Sistemi' : 'Modern QR Menu System'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 text-center">
            {params.locale === 'tr' ? 'QR Kodu Tarayın' : 'Scan QR Code'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                {params.locale === 'tr' ? 'Restoran Kodu' : 'Restaurant Code'}
              </label>
              <input
                type="text"
                value={restaurantSlug}
                onChange={(e) => setRestaurantSlug(e.target.value)}
                placeholder={params.locale === 'tr' ? 'örn: demo-restoran' : 'e.g. demo-restaurant'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-restqr-emerald-500 focus:border-transparent bg-white dark:bg-gray-800"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-restqr-emerald-500 hover:bg-restqr-emerald-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{params.locale === 'tr' ? 'Menüyü Görüntüle' : 'View Menu'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}