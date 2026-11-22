import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckSquare,
  Square,
  X,
  RefreshCw,
  Upload,
  MoreVertical,
  Save,
  ChevronRight,
  ChevronLeft,
  Check,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Camera,
  Sparkles,
  Play,
  Pause,
  Loader2,
} from 'lucide-react';
import { PosImportModal } from '../components/PosImportModal';
import { BarcodeImageFetcherModal } from '../components/BarcodeImageFetcherModal';
import { adminApi, KeywordEnrichmentStatus } from '../../api/adminApi';
import { categoriesApi } from '../../api/categoriesApi';
import { Product } from '../../types/product.types';
import { Category } from '../../types/category.types';
import {
  ProductCreateUpdate,
  BulkProductUpdateItem,
  QuickProductPatch,
} from '../../types/admin.types';
import { BulkEditToolbar } from '../components/BulkEditToolbar';
import { useToast } from '../../context/ToastContext';

type InlineEditMode = null | 'all' | 'price' | 'name' | 'image' | 'category';
type ViewMode = 'grid' | 'table';
type ImageFilterMode = 'all' | 'without_image' | 'with_image';

const VIEW_MODE_KEY = 'anwar_admin_products_view';

const EDIT_MODE_OPTIONS: { mode: Exclude<InlineEditMode, null>; label: string }[] = [
  { mode: 'all', label: 'تعديل الكل' },
  { mode: 'price', label: 'تعديل الأسعار فقط' },
  { mode: 'name', label: 'تعديل الأسماء فقط' },
  { mode: 'image', label: 'تعديل الصور فقط' },
  { mode: 'category', label: 'تعديل الأقسام فقط' },
];

const PAGE_SIZE = 25;

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // View Mode: Default to Visual Grid View ('grid')
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      return saved === 'table' ? 'table' : 'grid';
    } catch {
      return 'grid';
    }
  });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [imageFilter, setImageFilter] = useState<ImageFilterMode>('all');
  const [page, setPage] = useState(1);

  // Selection for Bulk Edit
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [barcodeFetcherOpen, setBarcodeFetcherOpen] = useState(false);

  // Quick Image Edit Modal State (`📷 تعديل الصورة`)
  const [quickImageProduct, setQuickImageProduct] = useState<Product | null>(null);
  const [quickImageUrl, setQuickImageUrl] = useState('');
  const [savingQuickImage, setSavingQuickImage] = useState(false);

  // Inline Quick Edit Mode (⋮ menu)
  const [editMode, setEditMode] = useState<InlineEditMode>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dirtyItems, setDirtyItems] = useState<Record<string, QuickProductPatch>>({});
  const [savingQuickPatch, setSavingQuickPatch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Full Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductCreateUpdate>({
    categoryId: '',
    name: '',
    searchKeywords: '',
    imageUrl: '',
    tikTokVideoId: '',
    price: 0,
    oldPrice: undefined,
    sortOrder: 0,
    stockQuantity: 100,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Smart Keyword Enrichment Status (Google Autocomplete + Synonyms)
  const [kwStatus, setKwStatus] = useState<KeywordEnrichmentStatus | null>(null);
  const [kwLoading, setKwLoading] = useState(false);

  const fetchKeywordsStatus = async () => {
    try {
      const s = await adminApi.products.getKeywordsStatus();
      setKwStatus(s);
    } catch {}
  };

  useEffect(() => {
    fetchKeywordsStatus();
  }, []);

  useEffect(() => {
    if (!kwStatus?.isRunning) return;
    const timer = setInterval(fetchKeywordsStatus, 3000);
    return () => clearInterval(timer);
  }, [kwStatus?.isRunning]);

  const handleToggleKeywordsJob = async () => {
    try {
      setKwLoading(true);
      if (kwStatus?.isRunning) {
        const s = await adminApi.products.stopKeywordsEnrichment();
        setKwStatus(s);
        showToast('تم إيقاف توليد الكلمات المفتاحية مؤقتاً', 'info');
      } else {
        const s = await adminApi.products.startKeywordsEnrichment();
        setKwStatus(s);
        showToast('بدأ توليد الكلمات المفتاحية ومرادفات البحث في خلفية السيرفر!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر تشغيل توليد الكلمات المفتاحية', 'error');
    } finally {
      setKwLoading(false);
    }
  };

  const { showToast } = useToast();

  const handleChangeViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {}
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.products.getAll({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        imageFilter: imageFilter === 'all' ? undefined : imageFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      setProducts(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب المنتجات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, imageFilter, page]);

  // Bulk Edit Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApplyBulk = async (items: BulkProductUpdateItem[]) => {
    try {
      const count = await adminApi.products.bulkUpdate(items);
      showToast(`تم تحديث ${count} صنف بنجاح في معاملة واحدة!`, 'success');
      setSelectedIds([]);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'فشل التعديل الجماعي', 'error');
    }
  };

  // Quick Image Modal Handlers (`📷 تعديل الصورة`)
  const handleOpenQuickImage = (prod: Product) => {
    setQuickImageProduct(prod);
    setQuickImageUrl(prod.imageUrl || '');
  };

  const handleQuickImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast('الحد الأقصى لحجم الصورة 3 ميجابايت', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setQuickImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveQuickImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickImageProduct) return;

    try {
      setSavingQuickImage(true);
      const cleanUrl = quickImageUrl.trim();
      const updated = await adminApi.products.update(quickImageProduct.id, {
        categoryId: quickImageProduct.categoryId,
        name: quickImageProduct.name,
        imageUrl: cleanUrl || undefined,
        tikTokVideoId: quickImageProduct.tikTokVideoId,
        price: quickImageProduct.price,
        oldPrice: quickImageProduct.oldPrice,
        sortOrder: quickImageProduct.sortOrder,
        stockQuantity: quickImageProduct.stockQuantity,
        isActive: quickImageProduct.isActive,
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === quickImageProduct.id ? { ...p, imageUrl: updated.imageUrl } : p))
      );
      showToast(`تم تحديث صورة "${quickImageProduct.name}" بنجاح!`, 'success');
      setQuickImageProduct(null);
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الصورة', 'error');
    } finally {
      setSavingQuickImage(false);
    }
  };

  // Delete product image only and move product to "without_image"
  const handleDeleteProductImage = async (productId: string, productName?: string) => {
    try {
      await adminApi.products.deleteImage(productId);
      showToast(
        'تم حذف الصورة الخاطئة ونقل الصنف إلى قائمة (بدون صورة) ليقوم الموظف برفع صورته',
        'success'
      );

      // Immediately update local state
      if (imageFilter === 'with_image') {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setTotalCount((c) => Math.max(0, c - 1));
      } else {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, imageUrl: undefined } : p))
        );
      }

      // If QuickImageModal is currently open for this product, update it too
      if (quickImageProduct?.id === productId) {
        setQuickImageUrl('');
        setQuickImageProduct((prev) => (prev ? { ...prev, imageUrl: undefined } : null));
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر حذف صورة المنتج', 'error');
    }
  };

  // Open Full Create/Edit Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      categoryId: categories[0]?.id || '',
      name: '',
      searchKeywords: '',
      imageUrl: '',
      tikTokVideoId: '',
      price: 0,
      oldPrice: undefined,
      sortOrder: 0,
      stockQuantity: 100,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      categoryId: prod.categoryId,
      name: prod.name,
      searchKeywords: prod.searchKeywords || '',
      imageUrl: prod.imageUrl || '',
      tikTokVideoId: prod.tikTokVideoId || '',
      price: prod.price,
      oldPrice: prod.oldPrice || undefined,
      sortOrder: prod.sortOrder,
      stockQuantity: prod.stockQuantity,
      isActive: prod.isActive,
    });
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.categoryId) {
      showToast('يرجى إدخال اسم المنتج واختيار القسم', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingProduct) {
        await adminApi.products.update(editingProduct.id, formData);
        showToast('تم تعديل المنتج بنجاح', 'success');
      } else {
        await adminApi.products.create(formData);
        showToast('تمت إضافة المنتج بنجاح', 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المنتج', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف/تعطيل المنتج "${name}"؟`)) return;

    try {
      await adminApi.products.delete(id);
      showToast(`تم حذف/تعطيل "${name}" بنجاح`, 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المنتج', 'error');
    }
  };

  const handleSelectEditMode = (mode: Exclude<InlineEditMode, null>) => {
    setEditMode(mode);
    handleChangeViewMode('table');
    setMenuOpen(false);
  };

  const handleExitEditMode = () => {
    setEditMode(null);
    setDirtyItems({});
  };

  const handleInlineFieldChange = (
    prod: Product,
    field: 'name' | 'price' | 'categoryId' | 'imageUrl',
    value: string | number
  ) => {
    setDirtyItems((prev) => {
      const existing: QuickProductPatch = prev[prod.id]
        ? { ...prev[prod.id] }
        : { id: prod.id };

      const originalVal =
        field === 'imageUrl'
          ? prod.imageUrl || ''
          : field === 'price'
          ? prod.price
          : field === 'name'
          ? prod.name
          : prod.categoryId;

      if (value === originalVal) {
        delete existing[field];
      } else {
        (existing as any)[field] = value;
      }

      const hasAnyField =
        existing.name !== undefined ||
        existing.price !== undefined ||
        existing.discountPercent !== undefined ||
        existing.categoryId !== undefined ||
        existing.imageUrl !== undefined;

      const next = { ...prev };
      if (hasAnyField) {
        next[prod.id] = existing;
      } else {
        delete next[prod.id];
      }
      return next;
    });
  };

  const handleSaveQuickPatch = async () => {
    const payload = Object.values(dirtyItems);
    if (payload.length === 0) return;

    try {
      setSavingQuickPatch(true);
      const count = await adminApi.products.quickPatch(payload);
      showToast(`تم حفظ تعديلات ${count} صنف بنجاح`, 'success');
      setDirtyItems({});
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ التعديلات السريعة', 'error');
    } finally {
      setSavingQuickPatch(false);
    }
  };

  const dirtyCount = Object.keys(dirtyItems).length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const activeModeLabel = EDIT_MODE_OPTIONS.find((o) => o.mode === editMode)?.label || '';

  return (
    <div className="space-y-6 pb-24">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة الأصناف والمنتجات</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            إجمالي الأصناف المطابقة: {totalCount} صنف — مراجعة بصرية وتعديل فوري للصور والأسعار
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher (Grid View Default vs Table View) */}
          <div className="flex items-center bg-gray-900 border border-gray-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => handleChangeViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="عرض البطاقات البصرية الكبير"
            >
              <LayoutGrid size={14} />
              <span>عرض الشبكة</span>
            </button>
            <button
              type="button"
              onClick={() => handleChangeViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-extrabold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="عرض الجدول التفصيلي"
            >
              <List size={14} />
              <span>عرض الجدول</span>
            </button>
          </div>

          <button
            onClick={() => setImportOpen(true)}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Upload size={16} />
            <span>استيراد CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>إضافة منتج</span>
          </button>

          {/* Three-dots (⋮) Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className={`p-2.5 rounded-xl border transition-all ${
                editMode
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
              }`}
              title="خيارات التعديل المباشر وجلب الصور"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl py-2 z-40 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-black text-gray-400 border-b border-gray-800 mb-1">
                  تعديل مباشر بالجدول
                </div>
                {EDIT_MODE_OPTIONS.map((opt) => {
                  const isActive = editMode === opt.mode;
                  return (
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => handleSelectEditMode(opt.mode)}
                      className={`w-full text-right px-3.5 py-2 flex items-center justify-between hover:bg-gray-800 transition-colors ${
                        isActive
                          ? 'text-amber-400 font-black bg-amber-500/10'
                          : 'text-gray-200 font-bold'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isActive && <Check size={14} />}
                    </button>
                  );
                })}

                <div className="border-t border-gray-800 my-1.5" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setBarcodeFetcherOpen(true);
                  }}
                  className="w-full text-right px-3.5 py-2 flex items-center gap-2 text-sky-400 hover:bg-gray-800 font-black transition-colors"
                >
                  <ImageIcon size={14} />
                  <span>جلب الصور تلقائياً (Google / Serper)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PosImportModal
        open={importOpen}
        categories={categories}
        onClose={() => setImportOpen(false)}
        onImported={fetchProducts}
      />

      <BarcodeImageFetcherModal
        open={barcodeFetcherOpen}
        onClose={() => setBarcodeFetcherOpen(false)}
        onUpdated={fetchProducts}
      />

      {/* Smart Search Keywords & Google Autocomplete Enrichment Card */}
      {kwStatus && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-sm">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span className="font-black text-white">
                توليد الكلمات المفتاحية ومرادفات البحث تلقائياً (Google Autocomplete + مرادفات القرطاسية)
              </span>
              <span className="bg-brand-950 text-brand-300 border border-brand-800 font-bold px-2.5 py-0.5 rounded-full">
                {kwStatus.enrichedCount} / {kwStatus.totalProducts} صنف محشو
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              {kwStatus.lastMessage ||
                `يربط الأصناف بالمرادفات السعودية والفصحى (مرسام ↔ قلم رصاص، براية ↔ مبراة، كشكول ↔ دفتر...) وإكمال جوجل التلقائي. المتبقي: ${kwStatus.remainingCount} صنف.`}
            </p>
            <div className="w-full max-w-md h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-300"
                style={{
                  width: `${
                    kwStatus.totalProducts > 0
                      ? Math.min(
                          100,
                          Math.round((kwStatus.enrichedCount / kwStatus.totalProducts) * 100)
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={kwLoading || (!kwStatus.isRunning && kwStatus.remainingCount === 0)}
            onClick={handleToggleKeywordsJob}
            className={`shrink-0 font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 ${
              kwStatus.isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20'
            }`}
          >
            {kwLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : kwStatus.isRunning ? (
              <Pause size={14} />
            ) : (
              <Play size={14} />
            )}
            <span>
              {kwStatus.isRunning
                ? 'إيقاف التوليد المؤقت'
                : kwStatus.remainingCount === 0
                ? 'مكتمل لجميع الأصناف ✓'
                : `توليد المرادفات تلقائياً (${kwStatus.remainingCount})`}
            </span>
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar (Search + Category + Image Status Quick Filter) */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[210px] flex-1 max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث بالاسم أو الباركود..."
              className="w-full bg-gray-800 border border-gray-700 text-white text-xs pr-8 pl-3 py-2 rounded-xl focus:outline-none focus:border-brand-500"
            />
            <Search
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-gray-800 border border-gray-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-brand-500"
          >
            <option value="">جميع الأقسام ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Image Status Filter Pills */}
          <div className="flex items-center bg-gray-800 border border-gray-700 p-1 rounded-xl gap-1">
            {[
              { id: 'all' as ImageFilterMode, label: 'جميع المنتجات' },
              { id: 'without_image' as ImageFilterMode, label: 'بدون صورة (مهام الموظف)' },
              { id: 'with_image' as ImageFilterMode, label: 'لها صور حقيقية' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setImageFilter(f.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  imageFilter === f.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={fetchProducts}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-gray-700"
          title="تحديث القائمة"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Inline Edit Action Bar */}
      {editMode && (
        <div className="bg-amber-950/40 border border-amber-500/40 px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-black text-amber-200">
              وضع التعديل المباشر: {activeModeLabel}
            </span>
            <span className="text-amber-300/80 text-[11px]">
              ({dirtyCount > 0 ? `${dirtyCount} صنف معدّل` : 'لم يتم تعديل أي صنف بعد'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveQuickPatch}
              disabled={dirtyCount === 0 || savingQuickPatch}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Save size={14} />
              <span>
                {savingQuickPatch ? 'جاري الحفظ...' : `حفظ التعديلات (${dirtyCount})`}
              </span>
            </button>
            <button
              type="button"
              onClick={handleExitEditMode}
              disabled={savingQuickPatch}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <X size={14} />
              <span>إنهاء التعديل</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================== VIEW 1: VISUAL GRID VIEW (DEFAULT) ==================== */}
      {viewMode === 'grid' ? (
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className="bg-gray-900 border border-gray-800 rounded-2xl h-80 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl py-16 text-center text-gray-400 text-xs">
              لا توجد منتجات مطابقة للبحث أو الفلتر المحدد.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((prod) => {
                const isSelected = selectedIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    className={`group bg-gray-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${
                      isSelected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-gray-800'
                    }`}
                  >
                    {/* Large Clear Image Section */}
                    <div>
                      <div className="relative aspect-square w-full bg-gray-800 overflow-hidden flex items-center justify-center border-b border-gray-800">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-gray-400">
                            <span className="text-5xl">{prod.categoryIcon || '📦'}</span>
                            <span className="text-[10px] font-bold">بدون صورة</span>
                          </div>
                        )}

                        {/* Checkbox top-right */}
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(prod.id)}
                          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-white/90 text-slate-800 flex items-center justify-center shadow-sm"
                          title="تحديد للتعديل الجماعي"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-brand-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>

                        {/* Active Badge top-left */}
                        <span
                          className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                            prod.isActive
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          {prod.isActive ? 'مفعل' : 'معطل'}
                        </span>

                        {/* Quick Change Image Overlay Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenQuickImage(prod)}
                          className="keep-white absolute bottom-2.5 inset-x-2.5 bg-black/80 hover:bg-brand-600 text-white text-xs font-extrabold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
                        >
                          <Camera size={14} />
                          <span>📷 تعديل الصورة</span>
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-3.5 space-y-1.5">
                        <span className="inline-block text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md truncate max-w-full">
                          {prod.categoryTitle || prod.categoryId}
                        </span>
                        <h3
                          className="font-extrabold text-xs sm:text-sm text-white line-clamp-2 leading-snug"
                          title={prod.name}
                        >
                          {prod.name}
                        </h3>
                      </div>
                    </div>

                    {/* Price & Quick Action Buttons */}
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-gray-800/60 flex items-center justify-between gap-2">
                      <span className="font-black text-sm text-brand-400">
                        {prod.price.toFixed(2)} ر.س
                      </span>

                      <div className="flex items-center gap-1">
                        {prod.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProductImage(prod.id, prod.name)}
                            className="px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="حذف الصورة ونقل الصنف إلى قائمة بدون صورة"
                          >
                            <span>حذف الصورة ❌</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(prod)}
                          className="px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="تعديل سريع"
                        >
                          <Edit2 size={12} />
                          <span>تعديل ✏️</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 bg-gray-800 hover:bg-red-950/60 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                          title="حذف 🗑️"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grid Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-gray-400 shadow-sm">
              <span>
                صفحة {page} من {totalPages} ({totalCount} صنف)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ==================== VIEW 2: TABLE VIEW ==================== */
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-gray-950/70 text-gray-400 uppercase text-[11px] border-b border-gray-800">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-gray-400 hover:text-white"
                    >
                      {selectedIds.length > 0 && selectedIds.length === products.length ? (
                        <CheckSquare size={16} className="text-brand-500" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">الصورة (انقر لتغييرها)</th>
                  <th className="py-3 px-4">اسم الصنف</th>
                  <th className="py-3 px-4">القسم</th>
                  <th className="py-3 px-4">السعر الحالي</th>
                  <th className="py-3 px-4">السعر السابق</th>
                  <th className="py-3 px-4">المخزون</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500" />
                      <p>جاري تحميل الأصناف...</p>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      لا توجد منتجات مطابقة للبحث أو القسم المحدد.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const isSelected = selectedIds.includes(prod.id);
                    const dirty = dirtyItems[prod.id];
                    const isDirty = Boolean(dirty);

                    const canEditImage = editMode === 'all' || editMode === 'image';
                    const canEditName = editMode === 'all' || editMode === 'name';
                    const canEditCategory = editMode === 'all' || editMode === 'category';
                    const canEditPrice = editMode === 'all' || editMode === 'price';

                    const currentImageUrl =
                      dirty?.imageUrl !== undefined ? dirty.imageUrl : prod.imageUrl || '';
                    const currentName = dirty?.name !== undefined ? dirty.name : prod.name;
                    const currentCategoryId =
                      dirty?.categoryId !== undefined ? dirty.categoryId : prod.categoryId;
                    const currentPrice = dirty?.price !== undefined ? dirty.price : prod.price;

                    return (
                      <tr
                        key={prod.id}
                        className={`hover:bg-gray-800/40 transition-colors ${
                          isDirty
                            ? 'bg-amber-500/10'
                            : isSelected
                            ? 'bg-brand-950/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleSelectOne(prod.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-brand-500" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenQuickImage(prod)}
                              className="relative group/img w-14 h-14 shrink-0 rounded-xl bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-700/60 hover:border-brand-500 transition-all"
                              title="انقر لتغيير صورة المنتج فوراً"
                            >
                              {currentImageUrl ? (
                                <img
                                  src={currentImageUrl}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform"
                                />
                              ) : (
                                <span className="text-xl">{prod.categoryIcon || '📦'}</span>
                              )}
                              <span className="keep-white absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Camera size={14} />
                              </span>
                            </button>
                            {canEditImage && (
                              <input
                                type="text"
                                dir="ltr"
                                value={currentImageUrl}
                                onChange={(e) =>
                                  handleInlineFieldChange(prod, 'imageUrl', e.target.value)
                                }
                                placeholder="https://..."
                                className="w-40 bg-gray-800 border border-amber-500/50 text-white text-[11px] px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {canEditName ? (
                            <input
                              type="text"
                              value={currentName}
                              onChange={(e) =>
                                handleInlineFieldChange(prod, 'name', e.target.value)
                              }
                              className="w-full min-w-[200px] bg-gray-800 border border-amber-500/50 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400"
                            />
                          ) : (
                            <>
                              <div className="font-bold text-white max-w-xs truncate">
                                {prod.name}
                              </div>
                              {prod.tikTokVideoId && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                  <span>🎵 تيك توك:</span>
                                  <span className="font-mono">{prod.tikTokVideoId}</span>
                                </span>
                              )}
                            </>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-300 font-medium">
                          {canEditCategory ? (
                            <select
                              value={currentCategoryId}
                              onChange={(e) =>
                                handleInlineFieldChange(prod, 'categoryId', e.target.value)
                              }
                              className="bg-gray-800 border border-amber-500/50 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 max-w-[190px]"
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.title}
                                </option>
                              ))}
                            </select>
                          ) : (
                            prod.categoryTitle || prod.categoryId
                          )}
                        </td>
                        <td className="py-3 px-4 font-black text-brand-400">
                          {canEditPrice ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={currentPrice}
                              onChange={(e) => {
                                const parsed = parseFloat(e.target.value);
                                handleInlineFieldChange(
                                  prod,
                                  'price',
                                  isNaN(parsed) ? 0 : parsed
                                );
                              }}
                              className="w-24 bg-gray-800 border border-amber-500/50 text-amber-300 font-black text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-mono"
                            />
                          ) : (
                            `${prod.price.toFixed(2)} ر.س`
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {prod.oldPrice ? `${prod.oldPrice.toFixed(2)} ر.س` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                              prod.stockQuantity <= 5
                                ? 'bg-red-950/60 text-red-400 border border-red-800/50'
                                : 'text-gray-300'
                            }`}
                          >
                            {prod.stockQuantity} قطعة
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              prod.isActive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                          >
                            {prod.isActive ? 'مفعل' : 'معطل'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {prod.imageUrl && (
                              <button
                                type="button"
                                onClick={() => handleDeleteProductImage(prod.id, prod.name)}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                                title="حذف الصورة ونقل الصنف إلى قائمة بدون صورة"
                              >
                                <span>حذف الصورة ❌</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenQuickImage(prod)}
                              className="p-1.5 text-gray-400 hover:text-brand-400 hover:bg-gray-800 rounded-lg transition-colors"
                              title="تغيير الصورة السريع 📷"
                            >
                              <Camera size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                              title="تعديل الصنف"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                              title="حذف"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between text-xs text-gray-400">
              <span>
                صفحة {page} من {totalPages} ({totalCount} صنف)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg disabled:opacity-30"
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Edit Floating Toolbar */}
      <BulkEditToolbar
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        categories={categories}
        onApplyBulk={handleApplyBulk}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* ==================== QUICK IMAGE EDIT MODAL (`📷 تعديل الصورة`) ==================== */}
      {quickImageProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <Camera size={16} className="text-brand-400" />
                  <span>تعديل صورة الصنف السريع</span>
                </h3>
                <p className="text-[11px] text-gray-400 truncate max-w-[280px] mt-0.5">
                  {quickImageProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickImageProduct(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickImage} className="space-y-4">
              {/* Large Live Image Preview */}
              <div className="aspect-square w-56 mx-auto rounded-2xl bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                {quickImageUrl.trim() ? (
                  <img
                    src={quickImageUrl}
                    alt="معاينة الصورة"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400 space-y-1">
                    <span className="text-5xl block">
                      {quickImageProduct.categoryIcon || '📦'}
                    </span>
                    <span className="text-[11px] font-bold">بدون صورة (أيقونة القسم)</span>
                  </div>
                )}
              </div>

              {/* Upload from device OR paste URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-300">رابط الصورة أو رفع من الجهاز</label>
                  <label className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Upload size={13} />
                    <span>رفع صورة من الجهاز</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuickImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={quickImageUrl}
                    onChange={(e) => setQuickImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                  />
                  {quickImageUrl && (
                    <button
                      type="button"
                      onClick={() => setQuickImageUrl('')}
                      className="px-3 bg-gray-800 hover:bg-red-950/60 border border-gray-700 text-gray-400 hover:text-red-400 rounded-xl font-bold"
                      title="حذف الصورة"
                    >
                      مسح
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-800">
                {quickImageProduct.imageUrl ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProductImage(quickImageProduct.id, quickImageProduct.name)}
                    className="px-3 py-2 bg-amber-500/15 hover:bg-red-950/60 border border-amber-500/40 text-amber-400 hover:text-red-300 rounded-xl font-bold transition-colors flex items-center gap-1"
                  >
                    <span>حذف الصورة ❌</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickImageProduct(null)}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuickImage}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black disabled:opacity-50"
                  >
                    {savingQuickImage ? 'جاري الحفظ...' : 'حفظ الصورة فوراً'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== FULL ADD / EDIT PRODUCT MODAL ==================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-black text-sm text-white">
                {editingProduct ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gray-300 font-bold">
                  اسم المنتج <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: قلم حبر جاف أزرق روكو"
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">
                  القسم التابع له <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">
                    السعر الحالي (ر.س) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.oldPrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        oldPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="فارغ في حال لا يوجد خصم"
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">كمية المخزون</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">الترتيب</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sortOrder: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">رابط صورة المنتج (URL)</label>
                <input
                  type="text"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">
                  الكلمات المفتاحية للبحث (مفصولة بفاصلة — تُولّد تلقائياً عند تركها فارغة)
                </label>
                <textarea
                  rows={2}
                  value={formData.searchKeywords || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, searchKeywords: e.target.value })
                  }
                  placeholder="مثال: مرسام، قلم رصاص، براية، دفتر سلك، كشكول..."
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">
                  معرف فيديو تيك توك (TikTok Video ID)
                </label>
                <input
                  type="text"
                  value={formData.tikTokVideoId || ''}
                  onChange={(e) => setFormData({ ...formData, tikTokVideoId: e.target.value })}
                  placeholder="مثال: 7352345678901234567"
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-gray-300 font-bold cursor-pointer"
                >
                  تفعيل الصنف للبيع وظهوره في المتجر للعملاء
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
