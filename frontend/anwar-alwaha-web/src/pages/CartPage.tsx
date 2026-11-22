import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Heart,
  ChevronDown,
  ChevronUp,
  Store,
  Truck,
  Tag,
  ArrowLeft,
  Sparkles,
  FileText,
  X,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { useToast } from '../context/ToastContext';
import { productsApi } from '../api/productsApi';
import { Product } from '../types/product.types';
import { PriceTag } from '../components/common/PriceTag';
import { ProductCard } from '../components/products/ProductCard';
import { ProductModal } from '../components/products/ProductModal';

export const CartPage: React.FC = () => {
  const {
    items,
    itemsCount,
    subtotal,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    deliveryMethod,
    setDeliveryMethod,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalTotal,
  } = useCart();

  const { isInWishlist, toggleWishlist } = useCustomer();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Collapsible per-item note toggles
  const [openNoteIds, setOpenNoteIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.note || item.notes) {
        map[item.product.id] = true;
      }
    });
    return map;
  });

  // Coupon input
  const [couponInput, setCouponInput] = useState(appliedCoupon?.code || '');

  // Featured products for empty state (4 products)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    productsApi
      .getProducts({ isFeatured: true, pageSize: 4 })
      .then((res) => {
        if (res.items && res.items.length >= 4) {
          setFeaturedProducts(res.items.slice(0, 4));
        } else {
          productsApi
            .getProducts({ pageSize: 4, sortBy: 'newest' })
            .then((fallback) => setFeaturedProducts((fallback.items || []).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const toggleNoteOpen = (productId: string) => {
    setOpenNoteIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleMoveToWishlist = (item: CartItem) => {
    if (!isInWishlist(item.product.id)) {
      toggleWishlist(item.product);
    }
    removeFromCart(item.product.id);
    showToast(`تم نقل "${item.product.name}" إلى قائمة المفضلة ❤️`, 'success');
  };

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyCoupon(couponInput);
  };

  // Empty Cart State
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 pb-24 lg:pb-14 space-y-10">
        <div className="max-w-lg mx-auto bg-white rounded-3xl border border-[#ebebeb] p-8 sm:p-10 text-center space-y-5 shadow-sm">
          <div className="w-20 h-20 bg-zinc-50 border border-zinc-200 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
            🛍️
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900">
              حقيبة المشتريات فارغة حالياً
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              لم تقم بإضافة أي أصناف إلى حقيبتك بعد. استكشف تشكيلة القرطاسية والأدوات المدرسية والمكتبية المميزة لدينا!
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="inline-flex items-center justify-center gap-2 bg-black hover:bg-[#c40d00] text-white font-black text-xs sm:text-sm py-3.5 px-8 rounded-2xl transition-colors shadow-md"
            >
              <ShoppingBag size={17} />
              <span>تصفح منتجات المكتبة</span>
            </button>
          </div>
        </div>

        {/* 4 Suggested Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-black text-zinc-900">
                  منتجات مميزة مقترحة لك
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="text-xs font-bold text-zinc-600 hover:text-black flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ArrowLeft size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          </div>
        )}

        {selectedProduct && (
          <ProductModal
            productId={selectedProduct.id}
            initialProduct={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-12 space-y-6">
      {/* Top Page Header */}
      <div className="bg-white rounded-2xl border border-[#ebebeb] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black text-zinc-900">
                  حقيبة المشتريات
                </h1>
                <span className="bg-zinc-100 text-zinc-800 text-xs font-black px-3 py-1 rounded-full">
                  {items.length} أصناف ({itemsCount} قطع)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                راجع أصنافك، أضف ملاحظات خاصة لكل صنف، واختر طريقة الاستلام وكود الخصم قبل إتمام الطلب
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('هل تريد إفراغ حقيبة المشتريات بالكامل؟')) {
              clearCart();
            }
          }}
          className="text-xs font-bold text-[#c40d00] hover:bg-red-50 border border-red-100 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Trash2 size={14} />
          <span>إفراغ الحقيبة</span>
        </button>
      </div>

      {/* Professional 2-Column Layout: 65% Main Column (8/12) + 35% Side Column (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAIN COLUMN (65% -> lg:col-span-8): Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const noteValue = item.note ?? item.notes ?? '';
            const isNoteOpen = Boolean(openNoteIds[item.product.id] || noteValue);
            const lineTotal = item.product.price * item.quantity;

            return (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-[#ebebeb] hover:border-zinc-300 p-4 sm:p-5 transition-all shadow-sm space-y-3.5"
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Product Thumbnail */}
                  <div
                    onClick={() => setSelectedProduct(item.product)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-zinc-50 border border-zinc-200/80 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group"
                  >
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-3xl">{item.product.categoryIcon || '📦'}</span>
                    )}
                  </div>

                  {/* Product Info & Controls */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        {/* Category Badge */}
                        <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          <span>{item.product.categoryIcon || '📂'}</span>
                          <span>{item.product.categoryTitle || 'قرطاسية ومستلزمات'}</span>
                        </span>

                        {/* Product Name */}
                        <h3
                          onClick={() => setSelectedProduct(item.product)}
                          className="font-black text-sm sm:text-base text-zinc-900 hover:text-[#c40d00] cursor-pointer leading-snug"
                        >
                          {item.product.name}
                        </h3>
                      </div>

                      {/* Quick Action Buttons: Move to Wishlist + Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveToWishlist(item)}
                          className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-[#fa2c19] bg-zinc-50 hover:bg-red-50 border border-zinc-200/80 hover:border-red-200 px-2.5 py-1.5 rounded-xl transition-colors"
                          title="نقل للمفضلة"
                        >
                          <Heart size={13} className="text-[#fa2c19]" />
                          <span className="hidden sm:inline">نقل للمفضلة ❤️</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 hover:text-[#c40d00] bg-zinc-50 hover:bg-red-50 border border-zinc-200/80 hover:border-red-200 px-2.5 py-1.5 rounded-xl transition-colors"
                          title="حذف من السلة"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline">حذف 🗑️</span>
                        </button>
                      </div>
                    </div>

                    {/* Prices (Unit & Total) + Quantity Stepper */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="block text-[10px] text-zinc-400 font-bold">
                            السعر الإفرادي
                          </span>
                          <PriceTag price={item.product.price} size="sm" />
                        </div>

                        <div className="h-7 w-px bg-zinc-200" />

                        <div>
                          <span className="block text-[10px] text-zinc-400 font-bold">
                            إجمالي الصنف
                          </span>
                          <PriceTag price={lineTotal} size="md" />
                        </div>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 transition-colors"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-xs sm:text-sm font-black w-7 text-center text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800 transition-colors"
                          aria-label="زيادة الكمية"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Per-Item Special Note (item.note) */}
                <div className="pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => toggleNoteOpen(item.product.id)}
                    className="flex items-center justify-between w-full text-right text-xs font-bold text-zinc-600 hover:text-black py-1 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} className="text-amber-600" />
                      <span>
                        ملاحظة خاصة للصنف{' '}
                        {noteValue ? (
                          <span className="text-emerald-600 font-black">(تمت إضافة ملاحظة ✓)</span>
                        ) : (
                          <span className="text-zinc-400 font-normal">
                            (مثل: "تغليف شفاف" أو "لون أزرق")
                          </span>
                        )}
                      </span>
                    </span>
                    {isNoteOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {isNoteOpen && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={noteValue}
                        onChange={(e) => updateNotes(item.product.id, e.target.value)}
                        placeholder='اكتب ملاحظتك الخاصة لهذا الصنف (مثال: "تغليف شفاف" أو "لون أزرق")...'
                        className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SIDE COLUMN (35% -> lg:col-span-4): Order Summary & Pickup/Delivery Options */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded-2xl border border-[#ebebeb] p-5 shadow-sm space-y-5">
            <h2 className="text-base font-black text-zinc-900 border-b border-zinc-100 pb-3">
              ملخص الطلب وخيارات الاستلام
            </h2>

            {/* Delivery Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-zinc-700">
                طريقة الاستلام المفضلة:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('branch')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                    deliveryMethod === 'branch'
                      ? 'border-black bg-zinc-900 text-white shadow-sm'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Store size={16} />
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        deliveryMethod === 'branch'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      مجاناً
                    </span>
                  </div>
                  <span className="text-xs font-black mt-1">استلام من الفرع</span>
                  <span
                    className={`text-[10px] ${
                      deliveryMethod === 'branch' ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    فرع خميس مشيط
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 ${
                    deliveryMethod === 'delivery'
                      ? 'border-black bg-zinc-900 text-white shadow-sm'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Truck size={16} />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deliveryMethod === 'delivery'
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      سريع
                    </span>
                  </div>
                  <span className="text-xs font-black mt-1">توصيل للمنزل</span>
                  <span
                    className={`text-[10px] ${
                      deliveryMethod === 'delivery' ? 'text-zinc-300' : 'text-zinc-400'
                    }`}
                  >
                    خميس مشيط وأبها
                  </span>
                </button>
              </div>
            </div>

            {/* Discount Code / Coupon Input */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="block text-xs font-black text-zinc-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag size={13} className="text-[#c40d00]" />
                  <span>كود الخصم / الكوبون</span>
                </span>
                {!appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => {
                      setCouponInput('WAHA10');
                      applyCoupon('WAHA10');
                    }}
                    className="text-[10px] font-bold text-emerald-700 hover:underline"
                  >
                    جرّب كود: WAHA10
                  </button>
                )}
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-emerald-950 font-mono">
                        {appliedCoupon.code}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700">
                        {appliedCoupon.label} (-{appliedCoupon.discountAmount.toFixed(2)} ر.س)
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      setCouponInput('');
                    }}
                    className="text-emerald-700 hover:text-red-600 p-1 rounded-lg transition-colors"
                    title="إزالة الكوبون"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="أدخل كود الخصم (مثال: WAHA10)"
                    className="flex-1 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-black rounded-xl px-3 py-2 text-xs font-mono uppercase text-zinc-900 placeholder:font-cairo placeholder:text-zinc-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-900 hover:bg-black text-white text-xs font-black px-4 py-2 rounded-xl transition-colors shrink-0"
                  >
                    تطبيق
                  </button>
                </form>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-zinc-100 text-xs">
              <div className="flex items-center justify-between text-zinc-600">
                <span>المجموع الفرعي ({itemsCount} قطع)</span>
                <span className="font-bold text-zinc-900">{subtotal.toFixed(2)} ر.س</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span>قيمة الخصم ({appliedCoupon?.code})</span>
                  <span>- {discountAmount.toFixed(2)} ر.س</span>
                </div>
              )}

              <div className="flex items-center justify-between text-zinc-600">
                <span>التوصيل / الاستلام</span>
                <span className="font-bold text-emerald-700">
                  {deliveryMethod === 'branch'
                    ? 'استلام من الفرع (مجاناً)'
                    : 'يُحدد حسب الحي عند التأكيد'}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-black text-zinc-900">
                    الإجمالي النهائي
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    شامل ضريبة القيمة المضافة 15%
                  </span>
                </div>
                <PriceTag price={finalTotal} size="lg" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full bg-black hover:bg-[#c40d00] text-white font-black text-sm py-3.5 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>متابعة لإتمام الطلب ⬅</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-3 px-6 rounded-2xl transition-colors"
              >
                متابعة التسوق
              </button>
            </div>

            {/* Trust Badge */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
              <span>دفع آمن عبر مدى وApple Pay أو الدفع عند الاستلام</span>
            </div>
          </div>
        </div>
      </div>

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
