'use client';

import { useTables } from '@/context/TableContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { QrCode, Download, Share2, Copy, CheckCircle2, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function QRCodesPage() {
    const { tables, loading } = useTables();
    const { user, slug } = useAuth();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const tableCount = tables.length;

    // Base URL for QR codes
    const baseUrl = "https://1sthillman.github.io/AdistowLite/tr/menu/";
    const restaurantSlug = slug || user?.uid || 'demo';

    const getTableUrl = (table: any) => {
        const tableIdentifier = table.qrCodeId || table.id;
        const targetPath = `/menu/${restaurantSlug}/${tableIdentifier}/`;
        // Build the resolver-friendly URL
        // Format: /tr/?p=/menu/slug/table/
        return `https://1sthillman.github.io/AdistowLite/tr/?p=${encodeURIComponent(targetPath)}`;
    };

    const getQRImageUrl = (content: string) => {
        return `https://quickchart.io/qr?text=${encodeURIComponent(content)}&size=300&margin=2&ecLevel=H`;
    };

    const handleDownloadAll = async () => {
        if (tables.length === 0) {
            toast.error('İndirilecek masa bulunamadı');
            return;
        }

        const loadingToast = toast.loading('QR Kodlar Hazırlanıyor... (Bu işlem masalarınıza bağlı olarak biraz sürebilir)');

        try {
            const zip = new JSZip();
            const qrFolder = zip.folder("RestQR_Kodlar");

            // Fetch all QR codes as blobs
            const promises = tables.map(async (table) => {
                const url = getTableUrl(table);
                const qrUrl = getQRImageUrl(url);
                const response = await fetch(qrUrl);
                const blob = await response.blob();
                qrFolder?.file(`${table.name}_QR.png`, blob);
            });

            await Promise.all(promises);

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `RestQR_Kodlar_${new Date().toLocaleDateString()}.zip`);

            toast.dismiss(loadingToast);
            toast.success('Tüm QR Kodlar ZIP olarak indirildi!');
        } catch (error) {
            console.error('Download error:', error);
            toast.dismiss(loadingToast);
            toast.error('İndirme sırasında bir hata oluştu');
        }
    };

    const handleShare = async (table: any) => {
        const url = getTableUrl(table);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `RestQR - ${table.name}`,
                    text: `${table.name} için QR Menü Linki`,
                    url: url,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to copy to clipboard
            navigator.clipboard.writeText(url);
            toast.success('Link panoya kopyalandı');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <QrCode className="text-emerald-500" size={32} />
                        QR Kod Yönetimi
                        <span className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full font-bold ml-2">
                            {tableCount} Masa
                        </span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        Her masa için özel QR kodlarını buradan yönetebilir ve paylaşabilirsiniz.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-500' : 'text-gray-500'}`}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-500' : 'text-gray-500'}`}
                        >
                            <List size={20} />
                        </button>
                    </div>
                    <button
                        onClick={handleDownloadAll}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Download size={20} />
                        Hepsini İndir
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {tables.map((table) => (
                    <QRCard
                        key={table.id}
                        table={table}
                        url={getTableUrl(table)}
                        qrImage={getQRImageUrl(getTableUrl(table))}
                        onShare={() => handleShare(table)}
                        viewMode={viewMode}
                    />
                ))}
            </div>

            {tables.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <QrCode size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Henüz Masa Bulunmuyor</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Masalar sayfasından masa ekleyerek başlayabilirsiniz.</p>
                </div>
            )}
        </div>
    );
}

function QRCard({ table, url, qrImage, onShare, viewMode }: any) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast.success(`${table.name} linki kopyalandı`);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl flex items-center gap-6 group hover:border-emerald-500/50 transition-all"
            >
                <div className="w-16 h-16 bg-white rounded-lg p-1 border border-gray-100 dark:border-gray-700 shrink-0">
                    <img src={qrImage} alt="QR" className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{table.name}</h3>
                    <p className="text-xs text-gray-500 font-mono truncate">{url}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleCopy} className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                        {isCopied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    </button>
                    <button onClick={onShare} className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-500 transition-all">
                        <Share2 size={18} />
                    </button>
                    <a href={qrImage} download={`QR_${table.name}.png`} className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10">
                        <Download size={18} />
                    </a>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[2rem] p-6 text-center hover:shadow-2xl hover:shadow-emerald-500/10 transition-all hover:-translate-y-1 relative"
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">AKTİF</span>
            </div>

            <div className="w-40 h-40 bg-white rounded-2xl p-2 mx-auto mb-6 shadow-inner border border-gray-50 dark:border-gray-700 relative group/qr">
                <img src={qrImage} alt="QR Code" className="w-full h-full" />
                <div className="absolute inset-0 bg-emerald-500/80 opacity-0 group-hover/qr:opacity-100 transition-all flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                    <button
                        onClick={() => window.open(qrImage, '_blank')}
                        className="text-white text-xs font-bold bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-all"
                    >
                        Tam Ekran
                    </button>
                </div>
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tighter">
                {table.name}
            </h3>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded-xl mb-6 flex items-center justify-between gap-2 overflow-hidden border border-gray-100 dark:border-gray-700">
                <span className="text-[10px] text-gray-400 font-mono truncate px-2">
                    {url.replace('https://', '')}
                </span>
                <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors">
                    {isCopied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onShare}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl text-xs font-bold hover:bg-gray-200 transition-all"
                >
                    <Share2 size={16} />
                    Paylaş
                </button>
                <a
                    href={qrImage}
                    download={`QR_${table.name}.png`}
                    className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Download size={16} />
                    İndir
                </a>
            </div>
        </motion.div>
    );
}
