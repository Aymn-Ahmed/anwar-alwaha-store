import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Camera,
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
  ShieldCheck,
  Eye,
  EyeOff,
  ImageOff,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { categoriesApi } from '../../api/categoriesApi';
import { couponsApi } from '../../api/couponsApi';
import { Product, CatalogIndexItem } from '../../types/product.types';
import { Category } from '../../types/category.types';
import { useToast } from '../../context/ToastContext';
import { useCatalogCache } from '../../context/CatalogCacheContext';
import { compressImage } from '../../utils/imageCompressor';
import { normalizeArabic } from '../../utils/arabicNormalizer';
import { BarcodeScannerModal } from '../components/quick-photo/BarcodeScannerModal';
import { QuickProductPhotoCardModal } from '../components/quick-photo/QuickProductPhotoCardModal';

type FilterTab = 'all' | 'unverified_photo' | 'verified_photo' | 'no_photo';

const PAGE_SIZE = 48;

const catalogItemToProduct = (item: CatalogIndexItem): Product => ({
  id: item.id,
  name: item.name,
  price: item.price,
  oldPrice: item.oldPrice ?? undefined,
  imageUrl: item.imageUrl || undefined,
  isVerifiedPhoto: Boolean(item.isVerifiedPhoto),
  categoryId: item.categoryId,
  categoryTitle: item.categoryTitle || '',
  barcode: item.barcode || undefined,
  sortOrder: 0,
  stockQuantity: 100,
  isActive: true,
  averageRating: 0,
  reviewsCount: 0,
  searchKeywords: item.searchKeywords || undefined,
});

export const AdminQuickPhotoPage: React.FC = () => {
  const { showToast } = useToast();
  const { catalog, isLoading: catalogLoading, refreshCatalog } = useCatalogCache();

  // Full products dataset loaded from CatalogCacheContext (all 5,000+ items)
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('unverified_photo');
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Store Setting: Hide unverified scraped photos on storefront
  const [hideUnverifiedPhotos, setHideUnverifiedPhotos] = useState(false);
  const [updatingSetting, setUpdatingSetting] = useState(false);

  // Scanner & Quick Card Modals State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [quickCardOpen, setQuickCardOpen] = useState(false);
  const [sessionUpdatedCount, setSessionUpdatedCount] = useState(0);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [activeProductForCard, setActiveProductForCard] = useState<Product | null>(null);

  // Per-row Direct Camera Uploading State
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);
  const [verifyingProductId, setVerifyingProductId] = useState<string | null>(null);
  const rowCameraInputRef = useRef<HTMLInputElement | null>(null);
  const targetRowProductRef = useRef<Product | null>(null);

  // Synchronize with CatalogCacheContext when catalog loads or updates
  useEffect(() => {
    if (catalog && catalog.length > 0) {
      setLocalProducts(catalog.map(catalogItemToProduct));
    }
  }, [catalog]);

  // Load categories and store settings on mount
  useEffect(() => {
    categoriesApi
      .getAll()
      .then((cats) => {
        if (cats) setCategories(cats);
      })
      .catch(() => {});

    couponsApi
      .adminGetFullSettings()
      .then((settings) => {
        setHideUnverifiedPhotos(Boolean(settings?.hideUnverifiedPhotos));
      })
      .catch(() => {});
  }, []);

  // Handle explicit manual catalog sync
  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refreshCatalog();
      showToast('تمت مزامنة كتالوج المنتجات بالكامل', 'success');
    } catch {
      showToast('تعذر تحديث الكتالوج', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle hiding unverified photos on public storefront
  const handleToggleHideUnverified = async () => {
    try {
      setUpdatingSetting(true);
      const nextVal = !hideUnverifiedPhotos;
      await couponsApi.adminUpdateFullSettings({ hideUnverifiedPhotos: nextVal });
      setHideUnverifiedPhotos(nextVal);
      showToast(
        nextVal
          ? 'تم تفعيل إخفاء الصور المسحوبة في المتجر حتى يتم تصويرها في المكتبة.'
          : 'يتم الآن إظهار الصور المسحوبة في المتجر مع ملاحظة توضيحية للزبائن.',
        'success'
      );
      refreshCatalog();
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث إعداد المتجر', 'error');
    } finally {
      setUpdatingSetting(false);
    }
  };

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Copy Barcode Helper
  const handleCopyBarcode = (barcode: string) => {
    if (!barcode) return;
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(barcode);
    setTimeout(() => setCopiedBarcode(null), 1800);
  };

  // Barcode Detected from Live Camera Scanner or USB Scanner
  const handleBarcodeScanned = useCallback(
    (barcode: string) => {
      setScannedBarcode(barcode);
      // Keep scannerOpen = true to keep camera warm underneath for instant next-item resume!

      // Search across ALL 5,000+ products in localProducts
      const cleanBarcode = barcode.trim().toLowerCase();
      const found = localProducts.find(
        (p) => (p.barcode || '').trim().toLowerCase() === cleanBarcode
      );

      setActiveProductForCard(found || null);
      setQuickCardOpen(true);
    },
    [localProducts]
  );

  // Direct Row Camera Snap & Update (Marks photo verified automatically)
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

      // 1. Client-Side compression to ~180-240KB WebP
      const compressed = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.82,
        mimeType: 'image/webp',
      });

      // 2. Fast single-item quickPatch API call with IsVerifiedPhoto = true
      await adminApi.products.quickPatch([
        {
          id: targetProduct.id,
          imageUrl: compressed,
          isVerifiedPhoto: true,
        },
      ]);

      // 3. Update local state immediately
      setLocalProducts((prev) =>
        prev.map((p) =>
          p.id === targetProduct.id
            ? { ...p, imageUrl: compressed, isVerifiedPhoto: true }
            : p
        )
      );

      // 4. Immediately sync IndexedDB catalog cache
      refreshCatalog();

      showToast(`تم تصوير واعتماد صورة "${targetProduct.name}" بنجاح!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث الصورة', 'error');
    } finally {
      setUploadingProductId(null);
      targetRowProductRef.current = null;
      if (rowCameraInputRef.current) rowCameraInputRef.current.value = '';
    }
  };

  // 1-Tap Quick Verify Existing Photo (For branded items like Casio or Roco)
  const handleQuickVerifyPhoto = async (product: Product) => {
    try {
      setVerifyingProductId(product.id);
      await adminApi.products.quickPatch([
        {
          id: product.id,
          isVerifiedPhoto: true,
        },
      ]);

      setLocalProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isVerifiedPhoto: true } : p))
      );

      refreshCatalog();
      showToast(`تم اعتماد صورة "${product.name}" كصورة مطابقة للمخزون ✓`, 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل اعتماد الصورة', 'error');
    } finally {
      setVerifyingProductId(null);
    }
  };

  // Product Updated or Created from Quick Card Modal
  const handleProductUpdatedFromModal = (updated: Product) => {
    setLocalProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });

    // Increment live session updated count
    setSessionUpdatedCount((prev) => prev + 1);

    // Refresh store catalog cache
    refreshCatalog();
  };

  // Filter & Search Logic across ALL 5,000+ items
  const filteredProducts = useMemo(() => {
    const cleanSearch = searchQuery.trim();
    const normSearch = normalizeArabic(cleanSearch);

    return localProducts.filter((p) => {
      const hasImg = Boolean(p.imageUrl && p.imageUrl.trim().length > 0);

      // 1. Tab Filter
      if (activeTab === 'unverified_photo') {
        if (!hasImg || p.isVerifiedPhoto) return false;
      } else if (activeTab === 'verified_photo') {
        if (!p.isVerifiedPhoto) return false;
      } else if (activeTab === 'no_photo') {
        if (hasImg) return false;
      }

      // 2. Search Filter (Supports Arabic Name, Keywords, and Barcode)
      if (cleanSearch) {
        const normName = normalizeArabic(p.name || '');
        const normKeywords = normalizeArabic(p.searchKeywords || '');
        const barcodeStr = (p.barcode || '').trim().toLowerCase();

        const matchesName = normName.includes(normSearch);
        const matchesKeywords = normKeywords.includes(normSearch);
        const matchesBarcode = barcodeStr.includes(cleanSearch.toLowerCase());

        return matchesName || matchesKeywords || matchesBarcode;
      }

      return true;
    });
  }, [localProducts, activeTab, searchQuery]);

  // Tab Counts calculated from the entire 5,000+ product catalog
  const tabCounts = useMemo(() => {
    let verified = 0;
    let unverified = 0;
    let noPhoto = 0;

    for (const p of localProducts) {
      const hasImg = Boolean(p.imageUrl && p.imageUrl.trim().length > 0);
      if (p.isVerifiedPhoto) {
        verified++;
      } else if (hasImg) {
        unverified++;
      } else {
        noPhoto++;
      }
    }

    return {
      all: localProducts.length,
      verified,
      unverified,
      noPhoto,
    };
  }, [localProducts]);

  // Pagination for buttery smooth 60fps mobile rendering
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const isInitialLoading = catalogLoading && localProducts.length === 0;

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

      {/* 1. TOP HERO AISLE SCANNER CTA CARD (High-Contrast Light Corporate Style) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2.5">
              <Sparkles size={13} className="text-emerald-600" />
              <span>مساعد تصوير وتوثيق الأصناف بين الأرفف والممرات</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              تحديث وتوثيق صور الأصناف (باركود + كاميرا الجوال)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
              تجوّل في أرفف المكتبة بجوالك: امسح باركود أي صنف لتفتح الكاميرا فوراً، التقط صورة واضحة،
              وسيتم اعتمادها كصورة حقيقية للمتجر واستبدال الصور المسحوبة آلياً بضغطة واحدة!
            </p>
          </div>

          {/* Primary Aisle Scanner Button */}
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer shrink-0"
          >
            <Camera size={19} />
            <span>📷 مسح باركود الصنف بالكاميرا</span>
          </button>
        </div>

        {/* 4-Box High-Contrast Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-slate-100 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-slate-600 block text-[11px] font-bold">إجمالي أصناف المتجر</span>
            <span className="text-slate-900 font-black text-base sm:text-lg">
              {tabCounts.all.toLocaleString('ar-SA')}
            </span>
          </div>

          <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200 shadow-2xs">
            <span className="text-amber-800 block text-[11px] font-bold">صور مسحوبة (تحتاج تصوير) ⚠️</span>
            <span className="text-amber-800 font-black text-base sm:text-lg">
              {tabCounts.unverified.toLocaleString('ar-SA')}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200 shadow-2xs">
            <span className="text-emerald-800 block text-[11px] font-bold">تم تصويرها واعتمادها ✅</span>
            <span className="text-emerald-800 font-black text-base sm:text-lg">
              {tabCounts.verified.toLocaleString('ar-SA')}
            </span>
          </div>

          <div className="p-3 bg-rose-50/90 rounded-2xl border border-rose-200 shadow-2xs">
            <span className="text-rose-800 block text-[11px] font-bold">بدون صورة نهائياً 🚫</span>
            <span className="text-rose-800 font-black text-base sm:text-lg">
              {tabCounts.noPhoto.toLocaleString('ar-SA')}
            </span>
          </div>
        </div>

        {/* Storefront Protection Rule Toggle Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90">
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${hideUnverifiedPhotos ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {hideUnverifiedPhotos ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  سياسة عرض الصور غير المعتمدة في المتجر:
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${hideUnverifiedPhotos ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                  {hideUnverifiedPhotos ? 'مخفية عن الزبائن 🔒' : 'معروضة مع ملاحظة توضيحية ⚠️'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {hideUnverifiedPhotos
                  ? 'الصور المسحوبة آلياً محجوبة في المتجر، ويظهر بدلها أيقونة القسم حتى يتم تصوير الصنف واعتماده بالمكتبة.'
                  : 'تظهر الصور المسحوبة للزبائن مع تنبيه "صورة توضيحية — تتوفر أشكال/ألوان متعددة في المكتبة".'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={updatingSetting}
            onClick={handleToggleHideUnverified}
            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 ${
              hideUnverifiedPhotos
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
            }`}
          >
            {updatingSetting ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : hideUnverifiedPhotos ? (
              <Eye size={13} />
            ) : (
              <EyeOff size={13} />
            )}
            <span>{hideUnverifiedPhotos ? 'السماح بعرض الصور التوضيحية' : 'إخفاء الصور غير المعتمدة'}</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER TABS & SEARCH BAR (High-Contrast Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('unverified_photo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'unverified_photo'
                  ? 'bg-amber-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle size={13} />
              <span>صور مسحوبة ({tabCounts.unverified.toLocaleString('ar-SA')})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verified_photo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'verified_photo'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle size={13} />
              <span>تم تصويرها واعتمادها ({tabCounts.verified.toLocaleString('ar-SA')})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('no_photo')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'no_photo'
                  ? 'bg-rose-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageOff size={13} />
              <span>بدون صورة ({tabCounts.noPhoto.toLocaleString('ar-SA')})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>الكل ({tabCounts.all.toLocaleString('ar-SA')})</span>
            </button>
          </div>

          {/* Sync Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-slate-200 disabled:opacity-50"
              title="تحديث ومزامنة البيانات من الخادم"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>مزامنة الكتالوج</span>
            </button>
          </div>
        </div>

        {/* Instant Search Bar */}
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث فوري عبر كامل أصناف المتجر (5,400+ صنف) باسم الصنف بالعربي أو برقم الباركود..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 pr-9.5 pl-14 py-2.5 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 text-slate-600 hover:bg-slate-300 px-2 py-0.5 rounded-md cursor-pointer font-bold"
            >
              مسح
            </button>
          )}
        </div>
      </div>

      {/* 3. PRODUCTS LIST (CARDS / ROWS) */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-36 border border-slate-200 animate-pulse shadow-2xs" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Camera size={26} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">لا توجد أصناف مطابقة للبحث أو الفلتر</h3>
            <p className="text-xs text-slate-500 mt-1">
              امسح باركود أي صنف جديد بالكاميرا لإضافته أو التقاط صورته فوراً
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Camera size={14} />
            <span>مسح باركود جديد</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedProducts.map((product) => {
              const hasImage = Boolean(product.imageUrl && product.imageUrl.trim().length > 0);
              const isRowUploading = uploadingProductId === product.id;
              const isRowVerifying = verifyingProductId === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all relative overflow-hidden group shadow-2xs hover:shadow-xs"
                >
                  {/* Top Row: Thumbnail + Info */}
                  <div className="flex items-start gap-3">
                    {/* Photo Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 relative flex items-center justify-center">
                      {hasImage ? (
                        <img
                          src={product.imageUrl!}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <ImageIcon size={22} className="mx-auto text-slate-300" />
                          <span className="text-[9px] block text-rose-600 font-bold">بدون صورة</span>
                        </div>
                      )}

                      {isRowUploading && (
                        <div className="absolute inset-0 bg-white/85 flex items-center justify-center">
                          <Loader2 size={18} className="animate-spin text-emerald-600" />
                        </div>
                      )}
                    </div>

                    {/* Name, Price & Barcode */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-xs font-black text-emerald-700 font-mono">
                          {product.price} ر.س
                        </span>

                        {/* Distinct Photo State Badges */}
                        {product.isVerifiedPhoto ? (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>صورة المحل المعتمدة ✓</span>
                          </span>
                        ) : hasImage ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <AlertCircle size={10} className="text-amber-600" />
                            <span>صورة مسحوبة آلياً</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            بدون صورة
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">
                        {product.name}
                      </h3>

                      {/* Barcode snippet */}
                      {product.barcode && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <Barcode size={12} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider truncate" dir="ltr">
                            {product.barcode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBarcode(product.barcode!)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition-colors"
                            title="نسخ الباركود"
                          >
                            {copiedBarcode === product.barcode ? (
                              <Check size={10} className="text-emerald-600" />
                            ) : (
                              <Copy size={10} />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Direct Snap Button & 1-Tap Verify & Card Edit */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {/* Direct Camera Button */}
                    <button
                      type="button"
                      disabled={isRowUploading}
                      onClick={() => handleTriggerRowCamera(product)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isRowUploading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>جاري الحفظ...</span>
                        </>
                      ) : (
                        <>
                          <Camera size={13} />
                          <span>📷 {product.isVerifiedPhoto ? 'إعادة تصوير' : 'تصوير واعتماد'}</span>
                        </>
                      )}
                    </button>

                    {/* 1-Tap Fast Verify for Scraped Photos (Casio, Roco, Standard Brands) */}
                    {!product.isVerifiedPhoto && hasImage && (
                      <button
                        type="button"
                        disabled={isRowVerifying}
                        onClick={() => handleQuickVerifyPhoto(product)}
                        className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                        title="اعتماد هذه الصورة كصورة مطابقة لمخزون المتجر دون إعادة تصويرها"
                      >
                        {isRowVerifying ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        <span>اعتماد ✓</span>
                      </button>
                    )}

                    {/* Open Detail Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setScannedBarcode(product.barcode || '');
                        setActiveProductForCard(product);
                        setQuickCardOpen(true);
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                      title="تعديل تفاصيل الصنف"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clean Pagination Controls for Smooth Mobile Browsing */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-bold">
                عرض {((currentPage - 1) * PAGE_SIZE + 1).toLocaleString('ar-SA')} -{' '}
                {Math.min(currentPage * PAGE_SIZE, filteredProducts.length).toLocaleString('ar-SA')} من أصل{' '}
                {filteredProducts.length.toLocaleString('ar-SA')} صنف
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  السابق
                </button>

                <span className="text-xs font-black text-slate-800 px-2">
                  صفحة {currentPage.toLocaleString('ar-SA')} من {totalPages.toLocaleString('ar-SA')}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 1. FULL-SCREEN HARDWARE BARCODE SCANNER WORKSPACE */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        isDetectionPaused={quickCardOpen}
        sessionCount={sessionUpdatedCount}
        onClose={() => {
          setScannerOpen(false);
          setQuickCardOpen(false);
          setSessionUpdatedCount(0);
        }}
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
        onScanNext={() => {
          setQuickCardOpen(false);
          setScannerOpen(true);
        }}
      />
    </div>
  );
};
