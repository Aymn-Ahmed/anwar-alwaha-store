import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { categoriesApi } from '../api/categoriesApi';
import { productsApi } from '../api/productsApi';
import { Category } from '../types/category.types';
import { Product } from '../types/product.types';
import { ProductCard } from '../components/products/ProductCard';
import { ProductModal } from '../components/products/ProductModal';

export const CategoriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '');

  const productsSectionRef = useRef<HTMLDivElement | null>(null);

  const selectedCategory = searchParams.get('cat') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort') || 'newest') as any;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 20;

  useEffect(() => {
    setCategoriesLoading(true);
    categoriesApi
      .getAll()
      .then((cats) => setCategories(cats || []))
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

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

  const updateParam = (key: string, value: string, scrollToProducts = false) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);

    if (scrollToProducts && productsSectionRef.current) {
      setTimeout(() => {
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const clearFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams());
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-12 space-y-8">
      {/* ===== 1. ALL CATEGORIES 3-COLUMN GRID ===== */}
      <section className="bg-white rounded-3xl border border-[#ebebeb] p-5 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-zinc-900 flex items-center gap-2">
              <span>📂</span>
              <span>جميع أقسام وتصنيفات المكتبة</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              اختر أي قسم لعرض أصنافه وتصفيته فوراً
            </p>
          </div>
          <span className="shrink-0 text-xs font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full">
            {categories.length} قسماً
          </span>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-36 bg-zinc-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    updateParam('cat', isSelected ? '' : cat.id, true)
                  }
                  className={`group bg-white hover:bg-zinc-50/70 border rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2.5 transition-all duration-200 hover:shadow-md active:scale-[0.99] ${
                    isSelected
                      ? 'border-zinc-900 ring-2 ring-zinc-900/10 bg-zinc-50/40'
                      : 'border-zinc-200/80 hover:border-zinc-900'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl leading-none">{cat.icon || '📦'}</span>
                    )}
                  </div>

                  <div className="space-y-1 max-w-full">
                    <h2
                      className={`font-black text-sm sm:text-base transition-colors line-clamp-1 ${
                        isSelected ? 'text-[#c40d00]' : 'text-zinc-900 group-hover:text-[#c40d00]'
                      }`}
                    >
                      {cat.title}
                    </h2>
                    {cat.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-1 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== 2. PRODUCTS CATALOG SECTION ===== */}
      <section ref={productsSectionRef} className="space-y-4">
        {/* Header & Search/Sort Controls */}
        <div className="bg-white p-5 rounded-3xl border border-[#ebebeb] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
              {activeCategoryObj ? activeCategoryObj.title : 'أصناف ومنتجات المكتبة'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {totalCount > 0
                ? `عرض ${products.length} من أصل ${totalCount} منتج متاح`
                : 'استكشف كافة المنتجات'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-72">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="ابحث بالاسم أو العامية: مرسام، براية، دفتر سلك، حبر..."
                className="w-full bg-zinc-50 border border-zinc-200 text-xs pr-8 pl-3 py-2.5 rounded-xl focus:outline-none focus:border-zinc-900"
              />
              <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </form>

            <div className="flex items-center gap-2 bg-zinc-50 px-3 py-2.5 rounded-xl border border-zinc-200 text-xs">
              <SlidersHorizontal size={14} className="text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-transparent font-bold text-zinc-700 focus:outline-none"
              >
                <option value="newest">الأحدث وصولاً</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="name">الاسم الأبجدي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => updateParam('cat', '')}
            className={`shrink-0 text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              !selectedCategory
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
            }`}
          >
            الكل ({totalCount > 0 && !selectedCategory ? totalCount : categories.reduce((acc, c) => acc + c.productsCount, 0)})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('cat', cat.id)}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
              }`}
            >
              <span>{cat.icon || '📦'}</span>
              <span>{cat.title}</span>
              <span className="opacity-75 text-[10px]">({cat.productsCount})</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="bg-zinc-100 rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#ebebeb] space-y-3">
            <div className="text-4xl">🔍</div>
            <h3 className="font-extrabold text-base text-zinc-800">لم يتم العثور على أي منتج</h3>
            <p className="text-xs text-zinc-400">جرب البحث بكلمات أخرى أو اختر قسماً آخر</p>
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[#c40d00] hover:underline pt-2"
            >
              إعادة تعيين الفلاتر
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
              onClick={() => updateParam('page', (page - 1).toString())}
              disabled={page <= 1}
              className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-30 hover:bg-zinc-50"
            >
              <ChevronRight size={18} />
            </button>

            <span className="text-xs font-bold text-zinc-600 px-3">
              صفحة {page} من {totalPages}
            </span>

            <button
              onClick={() => updateParam('page', (page + 1).toString())}
              disabled={page >= totalPages}
              className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 disabled:opacity-30 hover:bg-zinc-50"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Quick View Modal */}
      <ProductModal
        productId={selectedProduct?.id || null}
        initialProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
