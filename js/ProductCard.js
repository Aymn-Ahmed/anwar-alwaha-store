// =========================================================================
// MAKTABAH - Product Card & Grid Components (js/ProductCard.js)
// =========================================================================

    const FALLBACK_IMG = window.FALLBACK_IMG || '';
const PriceTag = window.PriceTag;

function ProductCard({ product, onSelect, reviews, isFavorite = false, onToggleFavorite = null }) {
      if (!product) return null;

      const prodReviews = (reviews && reviews.length ? reviews : (window.ALL_APPROVED_REVIEWS || [])).filter(r => r.product_id === product.id);
      const hasReviews = prodReviews.length > 0;
      const avgRating = hasReviews ? (prodReviews.reduce((s, r) => s + r.rating, 0) / prodReviews.length).toFixed(1) : null;

      return (
        <div
          onClick={() => onSelect && onSelect(product)}
          className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-900 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between group h-full relative"
          dir="rtl"
        >
          {/* حاوية الصورة المربعة بنسبة ثابتة ومنع التمدد الطولي */}
          <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-gray-100">
            <img
              src={product.img}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              alt={product.name}
              loading="lazy"
            />
            {/* زر حفظ الصنف في المفضلة */}
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product.id, e);
                }}
                className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-full backdrop-blur-xs flex items-center justify-center text-xs transition-transform active:scale-90 shadow-2xs cursor-pointer z-10 ${isFavorite ? 'bg-red-50 text-red-500 scale-105' : 'bg-white/80 hover:bg-white text-zinc-400 hover:text-red-500'
                  }`}
                title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
            {product.discount && (
              <span className="absolute top-2.5 right-2.5 bg-[#c40d00] text-white text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
                {product.discount}
              </span>
            )}
            {product.badge && (
              <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md max-w-[85%] truncate shadow-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* محتوى وتفاصيل البطاقة مع ضبط التباين والهيكل البصري */}
          <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
            <div>
              {/* تصنيف المنتج فوق العنوان مباشرة */}
              {product.categoryName && (
                <span className="text-[11px] font-bold text-zinc-400 block mb-1 truncate">
                  {product.categoryName}
                </span>
              )}
              {/* عنوان المنتج بارتفاع موحد وقص لسطرين فقط */}
              <h3
                className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-[#c40d00] transition-colors"
                title={product.name}
              >
                {product.name}
              </h3>

              {/* تقييم النجوم وعدد المراجعات إن وُجدت */}
              {hasReviews && (
                <div className="flex items-center gap-1 mt-1 text-[11px] font-black text-amber-500">
                  <span>★</span>
                  <span className="text-zinc-900">{avgRating}</span>
                  <span className="text-zinc-400 font-normal text-[10px]">({prodReviews.length})</span>
                </div>
              )}
            </div>

            {/* صف السعر والطلبات مع زر الطلب الفوري */}
            <div className="mt-3 pt-2.5 border-t border-zinc-100">
              <div className="flex items-baseline justify-between gap-2">
                {product.price && Number(product.price) > 0 ? (
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <PriceTag price={product.price} size="md" />
                    {product.origPrice && Number(product.origPrice) > Number(product.price) && (
                      <span className="text-xs text-gray-400 line-through">
                        <PriceTag price={product.origPrice} size="xs" className="text-zinc-400" />
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                    السعر حسب الطلب
                  </span>
                )}
                {product.soldCount && (
                  <span className="text-xs text-gray-400 font-medium shrink-0">
                    {product.soldCount}
                  </span>
                )}
              </div>

              {/* زر اتخاذ القرار بعرض كامل وتفاعل Hover أنيق */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelect) onSelect(product);
                }}
                className="w-full mt-3 py-2 px-3 bg-zinc-900 hover:bg-[#c40d00] active:scale-[0.98] text-white text-xs md:text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-[#c40d00] cursor-pointer"
              >
                <span>{product.price && Number(product.price) > 0 ? 'اطلب الآن' : 'استفسر واطلب الآن'}</span>
                <span className="text-xs transition-transform duration-200 group-hover:-translate-x-1">←</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // =========================================================================
    // مكون شبكة المنتجات المتجاوبة (ProductGrid Organism)
    // =========================================================================
    function ProductGrid({ products, onSelectProduct, className = "", favorites = [], onToggleFavorite = null }) {
      if (!products || products.length === 0) {
        return (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <span className="text-4xl block mb-2">🛍️</span>
            <h3 className="text-base font-bold text-zinc-700">لا توجد منتجات متوفرة حالياً في هذا القسم</h3>
          </div>
        );
      }

      return (
        <div className={`max-w-7xl mx-auto px-4 w-full ${className}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-24">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      );
    }

// Make available globally on window
window.ProductCard = ProductCard;
window.ProductGrid = ProductGrid;