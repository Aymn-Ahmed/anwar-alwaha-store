import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Camera,
  Scan,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Barcode,
  Copy,
  Check,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { categoriesApi } from '../../api/categoriesApi';
import { Product } from '../../types/product.types';
import { Category } from '../../types/category.types';
import { useToast } from '../../context/ToastContext';
import { useCatalogCache } from '../../context/CatalogCacheContext';
import { compressImage } from '../../utils/imageCompressor';
import { normalizeArabic } from '../../utils/arabicNormalizer';
import { BarcodeScannerModal } from '../components/quick-photo/BarcodeScannerModal';
import { QuickProductPhotoCardModal } from '../components/quick-photo/QuickProductPhotoCardModal';

type FilterTab = 'all' | 'needs_photo' | 'has_photo';

export const AdminQuickPhotoPage: React.FC = () => {
  const { showToast } = useToast();
  const { catalog, refreshCatalog } = useCatalogCache();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('needs_photo');
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  // Scanner & Quick Card Modals State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [quickCardOpen, setQuickCardOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [activeProductForCard, setActiveProductForCard] = useState<Product | null>(null);

  // Per-row Direct Camera Uploading State
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const rowCameraInputRef = useRef<HTMLInputElement | null>(null);
  const targetRowProductRef = useRef<Product | null>(null);

  // Fetch all products & categories
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        adminApi.products.getAll({ pageSize: 1500, sortBy: 'newest' }),
        categoriesApi.getAll(),
      ]);
      setProducts(pRes.items || []);
      setCategories(cRes || []);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب المنتجات', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Copy Barcode Helper
  const handleCopyBarcode = (barcode: string) => {
    if (!barcode) return;
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(barcode);
    setTimeout(() => setCopiedBarcode(null), 1800);
  };

  // Barcode Detected from Live Scanner
  const handleBarcodeScanned = useCallback(
    async (barcode: string) => {
      setScannedBarcode(barcode);
      setScannerOpen(false);

      // 1. Try to find product in current state
      let found = products.find(
        (p) => (p.barcode || '').trim().toLowerCase() === barcode.toLowerCase()
      );

      // 2. If not found in loaded products, check full CatalogCache
      if (!found && catalog.length > 0) {
        const inCatalog = catalog.find(
          (c) => (c.barcode || '').trim().toLowerCase() === barcode.toLowerCase()
        );
        if (inCatalog) {
          found = {
            id: inCatalog.id,
            name: inCatalog.name,
            price: inCatalog.price,
            oldPrice: inCatalog.oldPrice ?? undefined,
            imageUrl: inCatalog.imageUrl || undefined,
            categoryId: inCatalog.categoryId,
            categoryTitle: inCatalog.categoryTitle || '',
            barcode: inCatalog.barcode || undefined,
            sortOrder: 0,
            stockQuantity: 100,
            isActive: true,
            averageRating: 0,
            reviewsCount: 0,
          };
        }
      }

      // 3. Open focused quick card
      setActiveProductForCard(found || null);
      setQuickCardOpen(true);
    },
    [products, catalog]
  );

  // Direct Row Camera Snap & Update
  const handleTriggerRowCamera = (product: Product) => {
    targetRowProductRef.current = product;
    if (rowCameraInputRef.current) {
      rowCameraInputRef.current.value = '';
      rowCameraInputRef.current.click();
    }
  };

  const handleRowFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetProduct = targetRowProductRef.current;
    if (!file || !targetProduct) return;

    try {
      setUploadingProductId(targetProduct.id);
      showToast(`جاري ضغط ورفع صورة "${targetProduct.name}"...`, 'info');

      // 1. Client-Side compression
      const compressed = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.82,
        mimeType: 'image/webp',
      });

      // 2. Fast single-item quickPatch API call
      await adminApi.products.quickPatch([
        {
          id: targetProduct.id,
          imageUrl: compressed,
        },
      ]);

      // 3. Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === targetProduct.id ? { ...p, imageUrl: compressed } : p))
      );

      // 4. Immediately sync IndexedDB catalog cache
      refreshCatalog();

      showToast(`تم تحديث صورة "${targetProduct.name}" بنجاح!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث الصورة', 'error');
    } finally {
      setUploadingProductId(null);
      targetRowProductRef.current = null;
      if (rowCameraInputRef.current) rowCameraInputRef.current.value = '';
    }
  };

  // Product Updated from Quick Card Modal
  const handleProductUpdatedFromModal = (updated: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (exists) {
        return prev.map((p) => (p.id === updated.id ? updated : p));
      }
      return [updated, ...prev];
    });

    // Refresh store catalog cache
    refreshCatalog();
  };

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchQuery.trim();
    const normSearch = normalizeArabic(cleanSearch);

    return products.filter((p) => {
      // 1. Tab Filter
      if (activeTab === 'needs_photo') {
        if (p.imageUrl && p.imageUrl.trim().length > 0) return false;
      } else if (activeTab === 'has_photo') {
        if (!p.imageUrl || p.imageUrl.trim().length === 0) return false;
      }

      // 2. Search Filter (Supports Arabic Name + Barcode)
      if (cleanSearch) {
        const normName = normalizeArabic(p.name || '');
        const barcodeStr = (p.barcode || '').trim().toLowerCase();
        const matchesName = normName.includes(normSearch);
        const matchesBarcode = barcodeStr.includes(cleanSearch.toLowerCase());

        return matchesName || matchesBarcode;
      }

      return true;
    });
  }, [products, activeTab, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    let needs = 0;
    let has = 0;
    for (const p of products) {
      if (p.imageUrl && p.imageUrl.trim().length > 0) has++;
      else needs++;
    }
    return { all: products.length, needs, has };
  }, [products]);

  return (
    <div className="space-y-5 pb-24">
      {/* Hidden file input for one-click row camera capture */}
      <input
        ref={rowCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleRowFileSelected}
        className="hidden"
      />

      {/* TOP HERO AISLE SCANNER CTA CARD */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border border-gray-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold mb-2">
              <Sparkles size={12} />
              <span>مساعد تصوير الأصناف بين الأرفف والممرات</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              تحديث صور الأصناف (باركود + كاميرا الجوال)
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
              تجوّل في أرفف المكتبة بجوالك: امسح باركود أي صنف لتفتح الكاميرا فوراً، التقط صورة واضحة،
              وسيتم ضغطها وتحديثها في المتجر خلال ثانية واحدة!
            </p>
          </div>

          {/* Primary Aisle Scanner Button */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer"
          >
            <Camera size={20} />
            <span>📷 مسح باركود الصنف بالكاميرا</span>
          </button>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800/80 text-center text-xs">
          <div className="p-2.5 bg-gray-950/60 rounded-xl border border-gray-800/60">
            <span className="text-gray-400 block text-[10px] font-bold">إجمالي الأصناف</span>
            <span className="text-white font-black text-sm">{tabCounts.all}</span>
          </div>
          <div className="p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/20">
            <span className="text-amber-400 block text-[10px] font-bold">تحتاج تصوير ⚠️</span>
            <span className="text-amber-400 font-black text-sm">{tabCounts.needs}</span>
          </div>
          <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
            <span className="text-emerald-400 block text-[10px] font-bold">تم تصويرها ✅</span>
            <span className="text-emerald-400 font-black text-sm">{tabCounts.has}</span>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-xl border border-gray-800 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('needs_photo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'needs_photo'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <AlertCircle size={13} />
              <span>تحتاج تصوير ({tabCounts.needs})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('has_photo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'has_photo'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CheckCircle size={13} />
              <span>تم تحديث صورتها ({tabCounts.has})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>الكل ({tabCounts.all})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadInitialData}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Instant Search Bar (Arabic Name + Barcode) */}
        <div className="relative">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث فوري باسم الصنف بالعربي أو برقم الباركود الدولي..."
            className="w-full bg-gray-950 border border-gray-700 text-white pr-9 pl-4 py-2.5 rounded-xl text-xs placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] bg-gray-800 text-gray-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* PRODUCTS LIST (CARDS / ROWS) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-gray-900 rounded-2xl h-36 border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
            <Camera size={26} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">لا توجد أصناف مطابقة للبحث أو الفلتر</h3>
            <p className="text-xs text-gray-400 mt-1">
              امسح باركود أي صنف جديد بالكاميرا لإضافته أو التقاط صورته فوراً
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
          >
            <Camera size={14} />
            <span>مسح باركود جديد</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProducts.map((product) => {
            const hasImage = Boolean(product.imageUrl && product.imageUrl.trim().length > 0);
            const isRowUploading = uploadingProductId === product.id;

            return (
              <div
                key={product.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all relative overflow-hidden group"
              >
                {/* Top Row: Thumbnail + Info */}
                <div className="flex items-start gap-3">
                  {/* Photo Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shrink-0 relative flex items-center justify-center">
                    {hasImage ? (
                      <img
                        src={product.imageUrl!}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center text-gray-600">
                        <ImageIcon size={22} className="mx-auto" />
                        <span className="text-[9px] block text-amber-500/80 font-bold">بدون صورة</span>
                      </div>
                    )}

                    {isRowUploading && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin text-brand-400" />
                      </div>
                    )}
                  </div>

                  {/* Name, Price & Barcode */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black text-emerald-400 font-mono">
                        {product.price} ر.س
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          hasImage
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {hasImage ? 'صورة معتمدة' : 'يحتاج تصوير'}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-white line-clamp-2 leading-tight">
                      {product.name}
                    </h3>

                    {/* Barcode snippet */}
                    {product.barcode && (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <Barcode size={12} className="text-gray-500 shrink-0" />
                        <span className="text-[10px] text-gray-400 font-mono tracking-wider truncate" dir="ltr">
                          {product.barcode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyBarcode(product.barcode!)}
                          className="text-gray-500 hover:text-white p-0.5 rounded cursor-pointer"
                          title="نسخ الباركود"
                        >
                          {copiedBarcode === product.barcode ? (
                            <Check size={10} className="text-emerald-400" />
                          ) : (
                            <Copy size={10} />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Direct Snap Button & Card Edit */}
                <div className="pt-2 border-t border-gray-800/80 flex items-center gap-2">
                  {/* Direct Camera Button */}
                  <button
                    type="button"
                    disabled={isRowUploading}
                    onClick={() => handleTriggerRowCamera(product)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isRowUploading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={13} />
                        <span>📷 تصوير وتحديث</span>
                      </>
                    )}
                  </button>

                  {/* Open Detail Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setScannedBarcode(product.barcode || '');
                      setActiveProductForCard(product);
                      setQuickCardOpen(true);
                    }}
                    className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                    title="تعديل تفاصيل الصنف"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onBarcodeDetected={handleBarcodeScanned}
      />

      {/* 2. QUICK PRODUCT UPDATE CARD MODAL */}
      <QuickProductPhotoCardModal
        isOpen={quickCardOpen}
        onClose={() => setQuickCardOpen(false)}
        barcode={scannedBarcode}
        existingProduct={activeProductForCard}
        categories={categories}
        onProductUpdated={handleProductUpdatedFromModal}
        onScanNext={() => setScannerOpen(true)}
      />
    </div>
  );
};
