'use client';

import { useState, useEffect } from 'react';
import MenuHeader from '@/components/MenuHeader';
import CategoryTabs from '@/components/CategoryTabs';
import ProductGrid from '@/components/ProductGrid';
import ProductCustomizer from '@/components/ProductCustomizer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { MenuItem, Category } from '@/types/menu';
import ServiceButtons from '@/components/ServiceButtons';
import CartButton from '@/components/CartButton';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db, isConfigValid } from '@/lib/firebase';
import { AlertTriangle } from 'lucide-react';
import RatingModal from '@/components/RatingModal';
import { trackScan, trackView } from '@/lib/analytics';

interface MenuPageClientProps {
    params: {
        locale: string;
        slug: string;
        table?: string;
    };
}

export default function MenuPageClient({ params }: MenuPageClientProps) {
    const [menuData, setMenuData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
    const [customizerOpen, setCustomizerOpen] = useState(false);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);

    // Modern Layout State
    const [isListView, setIsListView] = useState(false); // False = Grid (2 Col), True = List (1 Col)

    // Check for firebase config
    if (!isConfigValid) {
        return (
            <div className="min-h-screen bg-gray-900 border-t-4 border-yellow-500 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Sistem Yapılandırması Eksik</h1>
                <p className="text-gray-400 max-w-sm mb-8">
                    Müşteri uygulaması henüz Firebase ile bağlanmamış. Lütfen <code>.env.local</code> dosyasını kontrol edin.
                </p>
            </div>
        );
    }

    useEffect(() => {
        const restaurantSlug = params.slug;
        if (!restaurantSlug) return;

        setLoading(true);

        // Initial state for merging
        let currentRestaurant: any = null;
        let currentCategories: Category[] = [];
        let currentProducts: MenuItem[] = [];
        let currentSettings = {
            waiterCallEnabled: true,
            coalRequestEnabled: false,
            ratingSystemEnabled: true
        };

        const updateMenuState = () => {
            if (!currentRestaurant) return;

            const organized = currentCategories.map((cat, index) => {
                const items = currentProducts.filter(p => {
                    return String(p.categoryId) === String(cat.id) ||
                        (p as any).category === cat.id ||
                        (!p.categoryId && index === 0);
                });
                return { ...cat, items };
            });

            setMenuData({
                restaurant: currentRestaurant,
                categories: organized,
                settings: currentSettings
            });
            setLoading(false);
        };

        // 1. Restaurant Listener
        const unsubRestaurant = onSnapshot(doc(db, 'restaurants', restaurantSlug), (snap) => {
            if (!snap.exists()) {
                setError('restaurantNotFound');
                setLoading(false);
                return;
            }
            currentRestaurant = { ...snap.data(), id: snap.id };
            updateMenuState();
        });

        // 2. Categories Listener
        const unsubCategories = onSnapshot(collection(db, 'restaurants', restaurantSlug, 'categories'), (snap) => {
            currentCategories = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
            updateMenuState();
        });

        // 3. Products Listener
        const unsubProducts = onSnapshot(collection(db, 'restaurants', restaurantSlug, 'products'), (snap) => {
            currentProducts = snap.docs
                .map(d => {
                    const data = d.data();
                    const price = Number(data.price || data.basePrice || 0);
                    return {
                        id: d.id,
                        ...data,
                        price: price,
                        basePrice: price, // Force normalization
                        ingredients: data.ingredients || [],
                        extras: data.extras || []
                    };
                })
                .filter((p: any) => p.isActive !== false) as MenuItem[];
            updateMenuState();
        });

        // 4. Settings Listener
        const unsubSettings = onSnapshot(doc(db, 'restaurants', restaurantSlug, 'settings', 'general'), (snap) => {
            if (snap.exists()) {
                currentSettings = { ...currentSettings, ...snap.data() };
                updateMenuState();
            }
        });

        return () => {
            unsubRestaurant();
            unsubCategories();
            unsubProducts();
            unsubSettings();
        };
    }, [params.slug]);

    // Track Real Data (Scans & Views)
    useEffect(() => {
        if (params.slug) {
            trackScan(params.slug);
            trackView(params.slug);
        }
    }, [params.slug]);

    const handleProductClick = (product: MenuItem) => {
        setSelectedProduct(product);
        setCustomizerOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !menuData) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Restoran Bulunamadı
                    </h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-white relative pb-32">
            {/* Hero HEADER (Fixed - Invisible) */}
            <MenuHeader
                restaurant={menuData.restaurant}
                tableNumber={params.table || '1'}
                onRatingClick={() => setRatingModalOpen(true)}
                ratingSystemEnabled={menuData.settings?.ratingSystemEnabled}
            />

            {/* Spacer removed (seamless) */}

            <ServiceButtons
                restaurantId={params.slug}
                tableId={params.table || '1'}
                tableName={menuData.restaurant.tables?.find((t: any) => t.id.toString() === (params.table || '1'))?.name || `Masa ${params.table || '1'}`}
                location={menuData.restaurant.coordinates}
                waiterCallEnabled={menuData.settings?.waiterCallEnabled}
                coalRequestEnabled={menuData.settings?.coalRequestEnabled}
            />

            <CategoryTabs
                categories={menuData.categories}
                onCategoryChange={(categoryId) => {
                    // Kullanıcı kategoriye tıkladığında 'List Mode' (Tek Sıra) aktif olur
                    setIsListView(true);
                }}
            />

            <ProductGrid
                categories={menuData.categories}
                onProductClick={handleProductClick}
                isListView={isListView}
            />

            <CartButton
                restaurantId={params.slug}
                tableId={params.table || '1'}
                tableName={menuData.restaurant.tables?.find((t: any) => t.id.toString() === (params.table || '1'))?.name || `Masa ${params.table || '1'}`}
                location={menuData.restaurant.coordinates}
                onOrderSuccess={() => {
                    if (menuData.settings?.ratingSystemEnabled !== false) {
                        setRatingModalOpen(true);
                    }
                }}
            />

            <ProductCustomizer
                product={selectedProduct}
                isOpen={customizerOpen}
                onClose={() => setCustomizerOpen(false)}
                locale={params.locale}
            />

            <RatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                restaurantId={params.slug}
                restaurantName={menuData.restaurant.name}
            />
        </div>
    );
}
