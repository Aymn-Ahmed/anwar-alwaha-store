import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Search,
  ArrowRight,
  Grid,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { categoriesApi } from '../api/categoriesApi';
import { productsApi } from '../api/productsApi';
import { Category } from '../types/category.types';
import { Product } from '../types/product.types';
import { ProductCard } from '../components/products/ProductCard';
import { ProductModal } from '../components/products/ProductModal';
import { useIndependentScroll } from '../hooks/useIndependentScroll';

export const CategoriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoryId: routeCatId } = useParams<{ categoryId?: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  // Category selection can come from URL path (/categories/:categoryId) or query (?cat=id)
  const selectedCategory = routeCatId || searchParams.get('cat') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort') || 'newest') as any;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 20;

  // Independent per-category scroll management
  const activeCatKey = selectedCategory || 'all';
  const { saveCurrentScroll } = useIndependentScroll({
    activeKey: activeCatKey,
    isLoading: productsLoading,
    resetDependencies: [searchQuery, sortBy, page],
    topOffset: 0,
  });

  // 1. Fetch all store categories
  useEffect(() => {
    setCategoriesLoading(true);
    categoriesApi
      .getAll()
      .then((cats) => setCategories(cats || []))
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  // 2. Fetch products whenever category, search, sort, or page changes
  useEffect(() => {
    let isMounted = true;
    setProductsLoading(true);

    productsApi
      .getAll({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        sortBy: sortBy || 'newest',
        page,
        pageSize,
      })
      .then((res: { items: Product[]; totalCount: number }) => {
        if (isMounted) {
          setProducts(res.items || []);
          setTotalCount(res.totalCount || 0);
          setProductsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
          setTotalCount(0);
          setProductsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, sortBy, page]);

  // Update URL search parameters
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  // Switch category directly with independent scroll saving & restoration
  const handleSelectCategory = (catId: string) => {
    saveCurrentScroll();
    setLocalSearch('');
    if (routeCatId) {
      if (catId) {
        navigate(`/categories/${encodeURIComponent(catId)}`);
      } else {
        navigate('/categories');
      }
    } else {
      updateParam('cat', catId);
    }
  };

  // Return to all categories overview with independent scroll saving & restoration
  const handleBackToAllCategories = () => {
    saveCurrentScroll();
    setLocalSearch('');
    if (routeCatId) {
      navigate('/categories');
    } else {
      const next = new URLSearchParams(searchParams);
      next.delete('cat');
      next.delete('search');
      next.set('page', '1');
      setSearchParams(next);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const totalPages = Math.ceil(totalCount / pageSize);
  const isSearchActive = Boolean(searchQuery.trim());
  const isFocusedCategoryView = Boolean(selectedCategory) && !isSearchActive;
  const showOverviewGrid = !isFocusedCategoryView && !isSearchActive;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 sm:pt-8 pb-28 lg:pb-16 space-y-6">
      {/* =========================================================================
          MODE 1: OVERVIEW MODE (When browsing all categories without search or filter)
          Compact 2-Column Mobile Grid, 3-4 Columns Desktop with zero vertical bloat
          ========================================================================= */}
      {showOverviewGrid && (
        <section className="bg-white rounded-3xl border border-zinc-200/90 p-5 sm:p-7 shadow-xs space-y-5">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-zinc-900 flex items-center gap-2">
                <span>📂</span>
                <span>جميع أقسام وتصنيفات المتجر</span>
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                اختر القسم المطلوب لاستعراض منتجاته وخدماته مباشرة بلمسة واحدة
              </p>
            </div>
            <span className="self-start sm:self-center text-xs font-black text-zinc-700 bg-zinc-100 border border-zinc-200 px-3.5 py-1 rounded-full">
              {categories.length} قسماً
            </span>
          </div>

          {/* Compact Categories Grid (2 Columns on Mobile, 3 on Tablet, 4 on Desktop) */}
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-28 bg-zinc-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className="group bg-white hover:bg-zinc-50 border border-zinc-200/80 hover:border-black rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
                >
                  {/* Category Image / Icon */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-2xl leading-none">{cat.icon || '📦'}</span>
                    )}
                  </div>

                  {/* Clean 2-Line Title & Count */}
                  <div className="space-y-1 w-full">
                    <h2 className="font-black text-xs sm:text-sm text-zinc-900 group-hover:text-black line-clamp-2 leading-tight">
                      {cat.title}
                    </h2>
                    <span className="inline-block text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                      {cat.productsCount || 0} منتج
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          MODE 2: SEARCH RESULTS HEADER (When user is searching)
          Hides 15 category cards and displays search results right at the top
          ========================================================================= */}
      {isSearchActive && (
        <section className="bg-white rounded-3xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-zinc-600 shrink-0">🔍</span>
            <h1 className="text-sm sm:text-base font-black text-zinc-900 truncate">
              نتائج البحث عن: "{searchQuery.trim()}"
            </h1>
            <span className="bg-black text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0">
              {totalCount} منتج
            </span>
          </div>
          <button
            type="button"
            onClick={handleBackToAllCategories}
            className="text-xs font-bold text-red-600 hover:underline shrink-0 cursor-pointer"
          >
            مسح البحث ✕
          </button>
        </section>
      )}

      {/* =========================================================================
          MODE 2: FOCUSED CATEGORY VIEW (When a category is active)
          Hides the 15 giant cards, provides instant category pills bar,
          and renders products directly below with ZERO scrolling hacks!
          ========================================================================= */}
      {isFocusedCategoryView && (
        <section className="space-y-5 animate-in fade-in duration-200">
          {/* Focused Header Card with Back Button */}
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              {/* Back to All Categories Button */}
              <button
                type="button"
                onClick={handleBackToAllCategories}
                className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowRight size={15} />
                <span>جميع الأقسام</span>
              </button>

              <span className="text-xs font-black text-zinc-800 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full">
                {totalCount} منتج متاح
              </span>
            </div>

            {/* Active Category Info */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                {activeCategoryObj?.imageUrl ? (
                  <img
                    src={activeCategoryObj.imageUrl}
                    alt={activeCategoryObj.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{activeCategoryObj?.icon || '📦'}</span>
                )}
              </div>

              <div>
                <h1 className="text-base sm:text-xl font-black text-zinc-900">
                  {activeCategoryObj?.title || 'منتجات القسم'}
                </h1>
                {activeCategoryObj?.description ? (
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 leading-relaxed">
                    {activeCategoryObj.description}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    استعرض كافة الأصناف المتوفرة واطلبها مباشرة
                  </p>
                )}
              </div>
            </div>

            {/* Compact Horizontal Scrollable Category Pills Bar (Switch categories with 1 tap) */}
            <div className="pt-2 border-t border-zinc-100">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {/* All categories pill */}
                <button
                  type="button"
                  onClick={handleBackToAllCategories}
                  className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid size={13} />
                  <span>عرض الكل</span>
                </button>

                {/* Individual category pills */}
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`shrink-0 text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white font-black shadow-xs'
                          : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 font-bold'
                      }`}
                    >
                      <span>{cat.icon || '📦'}</span>
                      <span>{cat.title}</span>
                      <span className="opacity-70 text-[10px]">({cat.productsCount || 0})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          PRODUCTS SECTION & FILTER CONTROLS
          Rendered directly below with Search, Sort, and Product Grid
          ========================================================================= */}
      <section className="space-y-4">
        {/* Search & Sort Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                const val = e.target.value;
                setLocalSearch(val);
                if (val.trim().length >= 1) {
                  updateParam('search', val.trim());
                } else if (val === '') {
                  updateParam('search', '');
                }
              }}
              placeholder="ابحث عن منتج بالاسم أو الكود..."
              className="w-full bg-zinc-50 border border-zinc-200 text-xs pr-8 pl-7 py-2.5 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
            />
            <Search
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  updateParam('search', '');
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black text-xs cursor-pointer"
                aria-label="مسح البحث"
              >
                ✕
              </button>
            )}
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-200 text-xs w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 text-zinc-500 font-bold">
              <SlidersHorizontal size={14} />
              <span>الترتيب:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent font-black text-zinc-900 focus:outline-none cursor-pointer"
            >
              <option value="newest">الأحدث وصولاً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="name">الاسم الأبجدي</option>
            </select>
          </div>
        </div>

        {/* Filtered Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="bg-zinc-100 rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-zinc-200/90 shadow-xs space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="font-black text-sm sm:text-base text-zinc-900">
              لم يتم العثور على أي منتج
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              جرب البحث بكلمات أخرى أو اختر قسماً آخر من شريط الأقسام أعلاه
            </p>
            <button
              type="button"
              onClick={handleBackToAllCategories}
              className="text-xs font-bold text-emerald-600 hover:underline pt-2 cursor-pointer"
            >
              العودة لكافة الأقسام ✕
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onQuickView={(p: Product) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => updateParam('page', (page - 1).toString())}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-30 hover:bg-zinc-50 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>

            <span className="text-xs font-black text-zinc-700 px-3">
              صفحة {page} من {totalPages}
            </span>

            <button
              type="button"
              onClick={() => updateParam('page', (page + 1).toString())}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-30 hover:bg-zinc-50 cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <ProductModal
          productId={selectedProduct.id}
          initialProduct={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
