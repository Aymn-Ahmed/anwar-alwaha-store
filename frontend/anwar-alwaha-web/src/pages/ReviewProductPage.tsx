import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useToast } from '../context/ToastContext';
import { productsApi } from '../api/productsApi';
import { reviewsApi } from '../api/reviewsApi';
import { Product } from '../types/product.types';

const RATING_DESCRIPTIONS: Record<number, { text: string; color: string }> = {
  1: { text: 'سيء جداً 😞', color: 'text-red-500' },
  2: { text: 'مقبول 😐', color: 'text-amber-500' },
  3: { text: 'جيد 🙂', color: 'text-yellow-600' },
  4: { text: 'جيد جداً 😊', color: 'text-emerald-600' },
  5: { text: 'ممتاز 🌟', color: 'text-amber-500' },
};

const QUICK_CHIPS = [
  'جودة ممتازة',
  'تغليف محكم',
  'مطابق للوصف',
  'سعر مناسب',
  'توصيل سريع',
  'أنصح بشرائه بشدة',
  'خامة أصلية ورائعة',
];

interface ReviewLocationState {
  orderCode?: string;
  productName?: string;
  productImage?: string;
  categoryTitle?: string;
  unitPrice?: number;
}

export const ReviewProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as ReviewLocationState) || {};

  const { customer } = useCustomer();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find relevant order for orderCode and customer identity
  const relevantOrder = customer.orders.find(
    (o) =>
      o.status.toLowerCase() !== 'cancelled' &&
      (o.orderCode === state.orderCode ||
        o.items.some((it) => it.productId === productId))
  );

  const effectiveOrderCode =
    state.orderCode || relevantOrder?.orderCode || customer.orders[0]?.orderCode || '';

  const effectiveCustomerName =
    customer.name || relevantOrder?.customerName || 'عميل المتجر';

  const effectiveCustomerPhone =
    customer.phone || relevantOrder?.customerPhone || '';

  // Load product info if not provided in location.state
  useEffect(() => {
    if (!productId) return;

    if (state.productName) {
      setProduct({
        id: productId,
        name: state.productName,
        imageUrl: state.productImage,
        categoryTitle: state.categoryTitle || 'منتجات المكتبة',
        price: state.unitPrice || 0,
        categoryId: '',
        sortOrder: 0,
        stockQuantity: 100,
        isActive: true,
        averageRating: 5,
        reviewsCount: 0,
      });
      return;
    }

    setLoadingProduct(true);
    productsApi
      .getById(productId)
      .then((p) => {
        if (p) setProduct(p);
      })
      .catch(() => {})
      .finally(() => setLoadingProduct(false));
  }, [productId, state.productName, state.productImage, state.categoryTitle, state.unitPrice]);

  const handleChipClick = (chipText: string) => {
    setComment((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return chipText;
      if (trimmed.includes(chipText)) return prev;
      return `${trimmed} • ${chipText}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!productId) {
      setErrorMsg('معرف المنتج غير صحيح');
      return;
    }

    try {
      setSubmitting(true);
      await reviewsApi.submit({
        productId,
        orderCode: effectiveOrderCode || undefined,
        customerName: effectiveCustomerName,
        customerPhone: effectiveCustomerPhone,
        rating,
        comment: comment.trim() || undefined,
      });

      showToast('شكراً لك! تم نشر تقييمك الموثّق بنجاح 🎉', 'success');
      navigate('/account?tab=orders');
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'التقييم متاح فقط للعملاء الذين قاموا بشراء هذا المنتج مسبقاً';
      setErrorMsg(serverMsg);
      showToast(serverMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeRatingDisplay = hoverRating || rating;
  const ratingInfo = RATING_DESCRIPTIONS[activeRatingDisplay] || RATING_DESCRIPTIONS[5];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 lg:pb-14 space-y-6">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/account?tab=orders')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-black bg-white hover:bg-zinc-100 border border-[#ebebeb] px-3.5 py-2 rounded-xl transition-colors shadow-sm"
        >
          <ArrowRight size={15} />
          <span>← العودة إلى طلباتي</span>
        </button>

        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
          <ShieldCheck size={14} />
          <span>تقييم مشتري موثّق</span>
        </span>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-3xl border border-[#ebebeb] p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900">
            تقييم المنتج وتجربة الشراء
          </h1>
          <p className="text-xs text-zinc-500">
            رأيك الصادق يساعد عملاء مكتبة أنوار الواحة في اختيار أفضل المنتجات
          </p>
        </div>

        {/* Product Being Reviewed Card */}
        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
            {product?.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package size={28} className="text-zinc-400" />
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            {product?.categoryTitle && (
              <span className="text-[10px] font-bold text-zinc-400 block">
                {product.categoryTitle}
              </span>
            )}
            <h3 className="font-black text-sm sm:text-base text-zinc-900 line-clamp-2">
              {product?.name || (loadingProduct ? 'جاري تحميل الصنف...' : 'منتج من مشترياتك')}
            </h3>
            {effectiveOrderCode && (
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-500 pt-0.5">
                <span>فاتورة الشراء:</span>
                <span className="text-zinc-900">#{effectiveOrderCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-900 flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Selection */}
          <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-center space-y-3">
            <label className="text-xs font-black text-zinc-800 block">
              كيف تقيّم جودة هذا المنتج؟
            </label>

            <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= activeRatingDisplay;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-xl transition-all transform hover:scale-125 active:scale-95 focus:outline-none"
                    aria-label={`تقييم ${star} من 5`}
                  >
                    <Star
                      size={36}
                      className={`transition-colors ${
                        filled
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-zinc-100 text-zinc-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className={`text-xs sm:text-sm font-black transition-colors ${ratingInfo.color}`}>
              {ratingInfo.text}
            </div>
          </div>

          {/* Quick Clickable Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block">
              اقتراحات سريعة (انقر للإضافة):
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleChipClick(chip)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-200/80 transition-colors active:scale-95"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">
              تعليقك وتجربتك بالتفصيل (اختياري):
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب ملاحظاتك عن دقة الصنف، التغليف، وجودة التصنيع..."
              className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-zinc-200 focus:outline-none focus:border-zinc-900 bg-zinc-50 focus:bg-white transition-colors"
            />
          </div>

          {/* Verified Identity Note */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center justify-between text-[11px] text-zinc-500">
            <span>التقييم باسم: <strong className="text-zinc-800">{effectiveCustomerName}</strong></span>
            {effectiveCustomerPhone && (
              <span className="font-mono text-zinc-400">
                ({effectiveCustomerPhone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')})
              </span>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-black hover:bg-[#c40d00] disabled:opacity-50 text-white font-black text-xs sm:text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جاري حفظ ونشر التقييم...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>نشر التقييم الموثّق</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
