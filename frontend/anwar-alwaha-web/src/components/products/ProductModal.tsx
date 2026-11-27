import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Heart,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Product, ProductDetail } from '../../types/product.types';
import { ProductReview } from '../../types/review.types';
import { productsApi } from '../../api/productsApi';
import { reviewsApi } from '../../api/reviewsApi';
import { PriceTag } from '../common/PriceTag';
import { StarRating } from '../common/StarRating';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useCatalogCache } from '../../context/CatalogCacheContext';

interface ProductModalProps {
  productId: string | null;
  initialProduct?: Product | null;
  onClose: () => void;
}

function toProductDetail(p: Product): ProductDetail {
  return {
    ...p,
    complementaryProducts: (p as ProductDetail).complementaryProducts || [],
    relatedBundles: (p as ProductDetail).relatedBundles || [],
  };
}

export const ProductModal: React.FC<ProductModalProps> = ({
  productId,
  initialProduct,
  onClose,
}) => {
  const effectiveId = initialProduct?.id || productId;

  const [product, setProduct] = useState<ProductDetail | null>(() =>
    initialProduct ? toProductDetail(initialProduct) : null
  );
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useCustomer();
  const { hideUnverifiedPhotos } = useCatalogCache();

  useEffect(() => {
    if (!effectiveId) {
      setProduct(null);
      return;
    }

    let isMounted = true;
    setQuantity(1);
    setNotes('');

    if (initialProduct) {
      setProduct(toProductDetail(initialProduct));
      setLoading(false);
    } else {
      setLoading(true);
    }

    productsApi
      .getById(effectiveId)
      .then((detail) => {
        if (isMounted && detail) {
          setProduct((prev) => ({
            ...(prev || detail),
            ...detail,
            categoryTitle: detail.categoryTitle || prev?.categoryTitle || '',
            categoryIcon: detail.categoryIcon || prev?.categoryIcon || '📦',
            complementaryProducts: detail.complementaryProducts || [],
            relatedBundles: detail.relatedBundles || [],
          }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    reviewsApi
      .getByProductId(effectiveId)
      .then((revs) => {
        if (isMounted && Array.isArray(revs)) {
          setReviews(revs);
        }
      })
      .catch(() => {
        if (isMounted) setReviews([]);
      });

    return () => {
      isMounted = false;
    };
  }, [effectiveId, initialProduct]);

  if (!effectiveId && !initialProduct) return null;

  const displayProduct = product || (initialProduct ? toProductDetail(initialProduct) : null);
  const liked = displayProduct ? isInWishlist(displayProduct.id) : false;

  const isPhotoVerified = Boolean(displayProduct?.isVerifiedPhoto);
  const hasRawImage = Boolean(displayProduct?.imageUrl);
  const shouldShowImage = hasRawImage && (!hideUnverifiedPhotos || isPhotoVerified);

  const computedReviewsCount =
    reviews.length > 0 ? reviews.length : displayProduct?.reviewsCount || 0;
  const computedAverageRating =
    reviews.length > 0
      ? Number(
          (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        )
      : displayProduct?.averageRating || 5;

  const handleAddToCart = () => {
    if (!displayProduct) return;
    addToCart(displayProduct, quantity, notes.trim() || undefined);
    onClose();
  };

  const handleAddComplement = (comp: Product) => {
    addToCart(comp, 1);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#ebebeb] flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛍️</span>
            <span className="font-black text-zinc-900 text-sm">تفاصيل المنتج والتقييمات</span>
          </div>
          <div className="flex items-center gap-1.5">
            {displayProduct && (
              <button
                type="button"
                onClick={() => toggleWishlist(displayProduct)}
                className={`p-2 rounded-full border transition-colors ${
                  liked
                    ? 'bg-red-50 border-red-200 text-[#fa2c19]'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-[#fa2c19]'
                }`}
                title={liked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
              >
                <Heart size={16} className={liked ? 'fill-[#fa2c19]' : ''} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {loading && !displayProduct ? (
            <div className="py-16 text-center text-zinc-400 space-y-3">
              <div className="animate-spin text-3xl">⏳</div>
              <p className="text-sm font-bold">جاري جلب تفاصيل المنتج...</p>
            </div>
          ) : !displayProduct ? (
            <div className="py-12 text-center text-zinc-500 font-bold">
              تعذر تحميل بيانات المنتج حالياً
            </div>
          ) : (
            <>
              {/* Product Media & Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-200/70 flex flex-col items-center justify-center gap-2 p-2">
                        {shouldShowImage ? (
                          <img
                            src={displayProduct.imageUrl!}
                            alt={displayProduct.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <span className="text-6xl leading-none mb-2">
                              {displayProduct.categoryIcon || '📦'}
                            </span>
                            {displayProduct.categoryTitle && (
                              <span className="text-xs font-bold text-zinc-500 px-3">
                                {displayProduct.categoryTitle}
                              </span>
                            )}
                            <span className="text-[11px] font-medium text-zinc-400 mt-2">
                              جاري تجهيز الصورة المعتمدة من أرفف المكتبة قريباً
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Photo verification / clarification badge */}
                      {shouldShowImage && (
                        isPhotoVerified ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                            <span>صورة حقيقية معتمدة ومطابقة لمنتج المكتبة ✓</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                            <AlertCircle size={16} className="text-amber-600 shrink-0" />
                            <span>صورة توضيحية — تتوفر أشكال وموديلات متعددة في المكتبة</span>
                          </div>
                        )
                      )}

                      {displayProduct.tikTokVideoId && (
                        <a
                          href={`https://www.tiktok.com/@anwaralwaha/video/${displayProduct.tikTokVideoId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 bg-black text-white text-xs font-bold py-2.5 px-3 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                          <span>مشاهدة استعراض المنتج على تيك توك 🎵</span>
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>

                <div className="flex flex-col justify-between space-y-4">
                  <div>
                    {displayProduct.categoryTitle && (
                      <span className="inline-block bg-zinc-100 text-zinc-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                        {displayProduct.categoryIcon || '📦'} {displayProduct.categoryTitle}
                      </span>
                    )}
                    <h2 className="text-lg sm:text-xl font-black text-zinc-900 leading-snug">
                      {displayProduct.name}
                    </h2>

                    {/* Top Rating Summary + Stock Status */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        <StarRating
                          rating={computedAverageRating}
                          count={computedReviewsCount}
                        />
                        <span className="text-[11px] font-black text-amber-900">
                          ({computedAverageRating.toFixed(1)} • {computedReviewsCount} تقييم)
                        </span>
                      </div>

                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                        {displayProduct.stockQuantity > 0
                          ? `متوفر (${displayProduct.stockQuantity} قطعة)`
                          : 'متاح للطلب الفوري'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <PriceTag
                        price={displayProduct.price}
                        oldPrice={displayProduct.oldPrice}
                        discountPercent={displayProduct.discountPercent}
                        size="xl"
                      />
                    </div>
                  </div>

                  {/* Quantity selector & Execution notes */}
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700">الكمية المطلوبة:</span>
                      <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-700 hover:bg-zinc-200 transition-colors shadow-sm"
                        >
                          <Minus size={15} />
                        </button>
                        <span className="font-black text-sm w-6 text-center text-zinc-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-700 hover:bg-zinc-200 transition-colors shadow-sm"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="ملاحظات التنفيذ على هذا الصنف (المقاس، اللون، الاسم...)"
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-900"
                    />
                  </div>
                </div>
              </div>

              {/* Complementary Products Carousel */}
              {displayProduct.complementaryProducts &&
                displayProduct.complementaryProducts.length > 0 && (
                  <div className="pt-4 border-t border-zinc-100">
                    <div className="flex items-center gap-1.5 mb-3 text-xs font-extrabold text-zinc-800">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>منتجات مكملة من نفس القسم:</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {displayProduct.complementaryProducts.slice(0, 3).map((comp) => (
                        <div
                          key={comp.id}
                          className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/70 flex flex-col justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200/60 overflow-hidden shrink-0 flex items-center justify-center">
                              {comp.imageUrl ? (
                                <img
                                  src={comp.imageUrl}
                                  alt={comp.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-base">{comp.categoryIcon || '📦'}</span>
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-zinc-800 line-clamp-2">
                              {comp.name}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <PriceTag price={comp.price} size="xs" />
                            <button
                              type="button"
                              onClick={() => handleAddComplement(comp)}
                              className="bg-zinc-900 hover:bg-[#c40d00] text-white px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-0.5 transition-colors"
                            >
                              <Plus size={11} />
                              <span>أضف</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Customer Reviews Section (Read-Only) */}
              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-zinc-700" />
                  <h4 className="font-black text-xs sm:text-sm text-zinc-900">
                    تقييمات وتعليقات المشترين ({reviews.length})
                  </h4>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <ShieldCheck size={11} />
                    <span>مشتري موثّق</span>
                  </span>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-0.5">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3 bg-zinc-50 rounded-2xl text-xs space-y-1.5 border border-zinc-200/80"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-zinc-900">{rev.customerName}</span>
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                              ✓ مشتري موثّق
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarRating rating={rev.rating} size={11} />
                            {rev.createdAt && (
                              <span className="text-[10px] text-zinc-400">
                                {new Date(rev.createdAt).toLocaleDateString('ar-SA')}
                              </span>
                            )}
                          </div>
                        </div>
                        {rev.comment && (
                          <p className="text-zinc-700 leading-relaxed">{rev.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 text-center py-3 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    لا توجد تقييمات لهذا المنتج بعد.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer / Add to Cart Button */}
        {displayProduct && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-4 sticky bottom-0">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold block">الإجمالي</span>
              <PriceTag price={displayProduct.price * quantity} size="lg" />
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 bg-black hover:bg-[#c40d00] text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <ShoppingBag size={18} />
              <span>إضافة إلى الحقيبة</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
