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
import { collection, onSnapshot, doc, query, where, getDocs, limit } from 'firebase/firestore';
import { db, isConfigValid } from '@/lib/firebase';
import { AlertTriangle } from 'lucide-react';
import RatingModal from '@/components/RatingModal';
import { trackScan, trackView } from '@/lib/analytics';

interface MenuPageClientProps {
    params: {
        locale: string;
        slug: string;
        table?: string;
        tableId?: string;
    };
}

export default function MenuPageClient({ params }: MenuPageClientProps) {
    const [menuData, setMenuData] = useState<any>(null);
    const [tables, setTables] = useState<any[]>([]);
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

        let masterUid = restaurantSlug;

        const startListeners = (uid: string) => {
            masterUid = uid;

            // 2. Categories Listener
            const unsubCategories = onSnapshot(collection(db, 'restaurants', uid, 'categories'), (snap) => {
                currentCategories = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
                updateMenuState();
            });

            // 3. Products Listener
            const unsubProducts = onSnapshot(collection(db, 'restaurants', uid, 'products'), (snap) => {
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
            const unsubSettings = onSnapshot(doc(db, 'restaurants', uid, 'settings', 'general'), (snap) => {
                if (snap.exists()) {
                    currentSettings = { ...currentSettings, ...snap.data() };
                    updateMenuState();
                }
            });

            // 4. Tables Listener
            const unsubTables = onSnapshot(collection(db, 'restaurants', uid, 'tables'), (snap) => {
                const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setTables(loaded);
            });

            return () => {
                unsubCategories();
                unsubProducts();
                unsubSettings();
                unsubTables();
            };
        };

        let activeUnsubs: (() => void)[] = [];

        // 1. Restaurant Master Discovery
        const unsubDiscovery = onSnapshot(doc(db, 'restaurants', restaurantSlug), async (snap) => {
            if (snap.exists()) {
                currentRestaurant = { ...snap.data(), id: snap.id };
                if (activeUnsubs.length <= 1) { // 1 because unsubDiscovery is already in
                    const cleanup = startListeners(snap.id);
                    activeUnsubs.push(cleanup);
                }
                updateMenuState();
            } else {
                // Not found by ID, try looking up by SLUG field
                try {
                    const q = query(collection(db, 'restaurants'), where('slug', '==', restaurantSlug), limit(1));
                    const querySnap = await getDocs(q);

                    if (!querySnap.empty) {
                        const masterSnap = querySnap.docs[0];
                        currentRestaurant = { ...masterSnap.data(), id: masterSnap.id };
                        const cleanup = startListeners(masterSnap.id);
                        activeUnsubs.push(cleanup);
                        updateMenuState();
                    } else {
                        setError('restaurantNotFound');
                        setLoading(false);
                    }
                } catch (err) {
                    console.error("Slug lookup error:", err);
                    setError('restaurantNotFound');
                    setLoading(false);
                }
            }
        });

        activeUnsubs.push(unsubDiscovery);

        return () => {
            activeUnsubs.forEach(fn => fn && typeof fn === 'function' && fn());
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

    const getTableIdentifierFromUrl = () => {
        if (typeof window === 'undefined') return '1';

        // 1. Next.js Params (Standard)
        if (params.tableId) return params.tableId;
        if (params.table) return params.table;

        // 2. Query Params fallback (?table=X)
        const sp = new URLSearchParams(window.location.search);
        if (sp.get('table')) return sp.get('table')!;

        // 3. Pathname fallback (/menu/slug/tableId)
        const parts = window.location.pathname.split('/').filter(Boolean);
        if (parts.length >= 3 && parts.includes('menu')) {
            const menuIdx = parts.indexOf('menu');
            if (parts[menuIdx + 2]) return parts[menuIdx + 2];
        }

        return '1';
    };

    const tableIdentifier = getTableIdentifierFromUrl();

    // 1. First try to find by qrCodeId (Secure)
    // 2. Fallback to finding by numeric string ID (Legacy)
    const currentTable = tables.find((t: any) =>
        (t.qrCodeId && t.qrCodeId === tableIdentifier) ||
        (t.id?.toString() === tableIdentifier.toString()) ||
        (t.id === tableIdentifier)
    );

    const resolvedTableId = currentTable ? (currentTable.id?.toString() || tableIdentifier) : tableIdentifier;
    const resolvedTableName = currentTable ? currentTable.name : (tableIdentifier ? `Masa ${tableIdentifier}` : undefined);

    return (
        <div className="min-h-screen bg-transparent text-white relative pb-32">
            {/* Hero HEADER (Fixed - Invisible) */}
            <MenuHeader
                restaurant={menuData.restaurant}
                tableNumber={resolvedTableName}
                onRatingClick={() => setRatingModalOpen(true)}
                ratingSystemEnabled={menuData.settings?.ratingSystemEnabled}
            />

            {/* Spacer removed (seamless) */}

            <ServiceButtons
                restaurantId={menuData.restaurant.id || menuData.restaurant.uid}
                tableId={resolvedTableId}
                tableName={resolvedTableName}
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
                restaurantId={menuData.restaurant.id || menuData.restaurant.uid}
                tableId={resolvedTableId}
                tableName={resolvedTableName}
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
                restaurantId={menuData.restaurant.id}
                restaurantName={menuData.restaurant.name}
            />
        </div>
    );
}
