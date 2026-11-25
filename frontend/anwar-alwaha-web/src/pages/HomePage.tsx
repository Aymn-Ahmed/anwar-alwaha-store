import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { categoriesApi } from '../api/categoriesApi';
import { productsApi } from '../api/productsApi';
import { Category } from '../types/category.types';
import { Product } from '../types/product.types';
import { ProductCard } from '../components/products/ProductCard';
import { ProductModal } from '../components/products/ProductModal';

// --- Hero slides (from backup design) ---
const HERO_SLIDES = [
  {
    id: 0,
    gradient: 'from-[#800000] via-[#be0b00] to-[#6b0000]',
    badge: 'موسم التخرج والبحوث 🎓',
    mainTitle: 'تجليد فاخر وطباعة ليزر',
    subTitle: 'طباعة رسائل الماجستير وبحوث التخرج بأعلى جودة مع كروت المناسبات',
    buttonText: 'تصفح خدمات التخرج',
    bgImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 1,
    gradient: 'from-[#5096be] via-[#74b3d7] to-[#4085ac]',
    badge: 'باقات طلبة الهندسة والجامعات 📐',
    mainTitle: 'استوديو أدوات العمارة والرسم',
    subTitle: 'مساطر ليزر، حاسبات علمية معتمدة، وكراسات ورق قطني ثقيل',
    buttonText: 'استكشف أدوات الهندسة',
    bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 2,
    gradient: 'from-[#2e947e] via-[#48bfa3] to-[#267c69]',
    badge: 'عروض مستلزمات المدارس 🎒',
    mainTitle: 'أطقم أقلام ومفكرات باستيل',
    subTitle: 'كل ما تحتاجه للترم الجديد بأسعار تبدأ من 5 ريال فقط',
    buttonText: 'تجهيز الحقيبة المدرسية',
    bgImage: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=1400&q=80',
  },
];

// Quick info bar items
const INFO_ITEMS = [
  { icon: '🚚', text: 'توصيل مجاني للجامعات والمدارس' },
  { icon: '🖨️', text: 'طباعة سريعة وجاهزة في نفس اليوم' },
  { icon: '📞', text: 'تواصل واتساب: 0572350050' },
  { icon: '⚡', text: 'تجليد فوري وخدمة سريعة' },
];

const HOME_PAGE_SIZE = 40;

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroSlide, setHeroSlide] = useState(0);
  const heroTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  // Fetch categories independently so it never blocks products
  useEffect(() => {
    let isMounted = true;
    categoriesApi
      .getAll()
      .then((cats) => {
        if (isMounted) setCategories(cats || []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch products from server whenever category, search, or page changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productsApi
      .getAll({
        categoryId: selectedCategory || undefined,
        search: searchQuery.trim() || undefined,
        page,
        pageSize: HOME_PAGE_SIZE,
        sortBy: 'newest',
      })
      .then((res) => {
        if (isMounted) {
          setProducts(res.items || []);
          setTotalCount(res.totalCount || 0);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProducts([]);
          setTotalCount(0);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, page]);

  // Auto-rotate hero
  useEffect(() => {
    heroTimer.current = setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => {
      if (heroTimer.current) clearInterval(heroTimer.current);
    };
  }, []);

  const handleSelectCategory = (catId: string | null) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / HOME_PAGE_SIZE));
  const slide = HERO_SLIDES[heroSlide];

  return (
    <div className="pb-20 lg:pb-10">
      {/* ===== HERO SECTION ===== */}
      <section className="relative h-64 sm:h-72 overflow-hidden">
        <img
          src={slide.bgImage}
          alt={slide.mainTitle}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          loading="eager"
        />
        {/* Soft tint overlay so stationery photos look crisp and lively */}
        <div className={`absolute inset-0 bg-gradient-to-l ${slide.gradient} opacity-35 mix-blend-multiply`} />

        {/* Text protection vignette gradient (bottom and text side) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/60" />

        <div className="relative z-10 h-full flex flex-col justify-end px-5 pb-6 text-white">
          <span className="inline-block text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2 self-start">
            {slide.badge}
          </span>
          <h1 className="text-xl sm:text-2xl font-black leading-tight mb-1">{slide.mainTitle}</h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm mb-3 line-clamp-2">
            {slide.subTitle}
          </p>
          <button
            onClick={() => navigate('/services')}
            className="self-start bg-white text-black text-xs font-black px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors active:scale-95"
          >
            {slide.buttonText} ←
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setHeroSlide(i);
                if (heroTimer.current) clearInterval(heroTimer.current);
              }}
              className={`transition-all rounded-full ${
                i === heroSlide ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ===== QUICK INFO BAR (SMOOTH CONTINUOUS TICKER MARQUEE) ===== */}
      <div className="bg-black text-white overflow-hidden py-2 border-b border-zinc-900 select-none">
        <div className="animate-marquee-ticker flex items-center gap-6 whitespace-nowrap">
          {[...INFO_ITEMS, ...INFO_ITEMS, ...INFO_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold whitespace-nowrap shrink-0"
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
              <span className="text-zinc-600 mr-5">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="bg-white py-3 sm:py-4 px-3 sm:px-4 border-b border-[#ebebeb]">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Compact Smooth Horizontal Scrollable Strip (1 row, full 2-line labels) */}
          <div className="flex sm:hidden overflow-x-auto no-scrollbar gap-2.5 py-1 px-1">
            {/* "الكل" button */}
            <button
              onClick={() => handleSelectCategory(null)}
              className="flex flex-col items-center gap-1 shrink-0 w-16 text-center cursor-pointer"
            >
              <div
                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                  !selectedCategory
                    ? 'border-black bg-black text-white scale-105 shadow-xs'
                    : 'border-[#ebebeb] bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                <span className="text-base">🏠</span>
              </div>
              <span
                className={`text-[10px] font-bold leading-tight text-center line-clamp-2 w-16 ${
                  !selectedCategory ? 'text-black font-black' : 'text-zinc-600'
                }`}
              >
                الكل
              </span>
            </button>

            {/* Categories list */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  handleSelectCategory(cat.id === selectedCategory ? null : cat.id)
                }
                className="flex flex-col items-center gap-1 shrink-0 w-16 text-center cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-full border-2 overflow-hidden bg-zinc-50 flex items-center justify-center transition-all ${
                    selectedCategory === cat.id
                      ? 'border-black scale-105 shadow-xs'
                      : 'border-[#ebebeb] hover:border-zinc-300'
                  }`}
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-lg">{cat.icon || '📦'}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold leading-tight text-center line-clamp-2 w-16 px-0.5 ${
                    selectedCategory === cat.id ? 'text-black font-black' : 'text-zinc-600'
                  }`}
                  title={cat.title}
                >
                  {cat.title}
                </span>
              </button>
            ))}
          </div>

          {/* Desktop/Tablet (sm: and up): Multi-column grid */}
          <div className="hidden sm:grid sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-2 sm:gap-3">
            {/* "الكل" circle */}
            <button
              onClick={() => handleSelectCategory(null)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                  !selectedCategory
                    ? 'border-black bg-black text-white scale-110 shadow-md'
                    : 'border-[#ebebeb] bg-zinc-50 hover:border-zinc-400'
                }`}
              >
                <span className="text-lg">🏠</span>
              </div>
              <span
                className={`text-[10px] font-bold leading-tight text-center ${
                  !selectedCategory ? 'text-black' : 'text-zinc-500'
                }`}
              >
                الكل
              </span>
            </button>

            {/* Category circles */}
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  handleSelectCategory(cat.id === selectedCategory ? null : cat.id)
                }
                className="flex flex-col items-center gap-1 group"
              >
                <div
                  className={`w-12 h-12 rounded-full border-2 overflow-hidden bg-zinc-100 flex items-center justify-center transition-all ${
                    selectedCategory === cat.id
                      ? 'border-black scale-110 shadow-md'
                      : 'border-[#ebebeb] hover:border-zinc-400'
                  }`}
                >
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xl">{cat.icon || '📦'}</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold leading-tight text-center line-clamp-2 max-w-[64px] ${
                    selectedCategory === cat.id ? 'text-black font-black' : 'text-zinc-500'
                  }`}
                  title={cat.title}
                >
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-2 bg-[#f7f7f8]" />

      {/* ===== PRODUCTS SECTION ===== */}
      <section className="bg-white px-4 pt-4 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Section header (Clean without duplicate search bar) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-zinc-900">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.title || 'المنتجات'
                  : 'جميع خدمات ومنتجات المكتبة'}
              </h2>
              {!loading && (
                <span className="bg-zinc-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
              {selectedCategory && (
                <button
                  onClick={() => handleSelectCategory(null)}
                  className="text-xs font-bold text-[#c40d00] hover:underline mr-2"
                >
                  مسح الفلتر ✕
                </button>
              )}
            </div>
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div key={n} className="bg-zinc-100 rounded-2xl aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-extrabold text-sm text-zinc-700">لا يوجد منتجات مطابقة</h3>
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={() => {
                    handleSelectCategory(null);
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-[#c40d00] hover:underline"
                >
                  عرض جميع المنتجات
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onQuickView={(p: Product) => setSelectedProduct(p)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <span className="text-xs font-bold text-zinc-600 px-3">
                    صفحة {page} من {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ===== WHATSAPP CTA ===== */}
      <section className="px-4 py-6 bg-[#f7f7f8]">
        <div className="max-w-2xl mx-auto">
          <a
            href="https://wa.me/966572350050"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-sm py-4 px-6 rounded-2xl transition-colors shadow-lg shadow-green-500/20 active:scale-98"
          >
            <span className="text-2xl">📱</span>
            <div className="text-right">
              <div>تواصل معنا عبر واتساب</div>
              <div className="text-xs font-medium opacity-90">0572350050 — خميس مشيط</div>
            </div>
          </a>
        </div>
      </section>

      {/* Product Quick View Modal */}
      <ProductModal
        productId={selectedProduct?.id || null}
        initialProduct={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
