import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  CheckCircle2,
  User,
  Edit3,
  Rocket,
  MapPin,
  Navigation,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Lock,
  XCircle,
} from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../api/ordersApi';
import { paymentsApi } from '../api/paymentsApi';
import { productsApi } from '../api/productsApi';
import { Product } from '../types/product.types';
import { OrderResponse } from '../types/order.types';
import { InitiatePaymentResponse } from '../types/payment.types';
import { PriceTag } from '../components/common/PriceTag';

declare global {
  interface Window {
    Moyasar?: any;
  }
}

const CUSTOMER_PROFILE_KEY = 'anwar_alwaha_customer_profile';
const STORE_WHATSAPP = '966572350050';

export const CheckoutPage: React.FC = () => {
  const {
    items,
    itemsCount,
    subtotal,
    deliveryMethod,
    setDeliveryMethod,
    appliedCoupon,
    discountAmount,
    finalTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
  } = useCart();
  const { customer, defaultAddress, recordCompletedOrder } = useCustomer();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Customer Profile
  const [customerName, setCustomerName] = useState(customer.name || '');
  const [customerPhone, setCustomerPhone] = useState(
    defaultAddress?.phone || customer.phone || ''
  );
  const [autoFilled, setAutoFilled] = useState(Boolean(customer.name || customer.phone));
  const [editingProfile, setEditingProfile] = useState(!Boolean(customer.name && customer.phone));

  const [paymentChoice, setPaymentChoice] = useState<'electronic' | 'whatsapp'>('electronic');
  const [customerAddress, setCustomerAddress] = useState(
    defaultAddress ? `${defaultAddress.district} - ${defaultAddress.details}` : ''
  );
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerLocationLat, setCustomerLocationLat] = useState<number | undefined>(undefined);
  const [customerLocationLng, setCustomerLocationLng] = useState<number | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('متصفحك لا يدعم تحديد الموقع التلقائي (GPS)', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCustomerLocationLat(lat);
        setCustomerLocationLng(lng);
        setIsLocating(false);
        setLocationSuccess(true);
        showToast('تم التقاط إحداثيات موقعك الجغرافي (GPS) بنجاح!', 'success');
        if (!customerAddress || customerAddress === 'خميس مشيط / أبها') {
          setCustomerAddress(`موقع محدد عبر الخريطة (GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        }
      },
      (err) => {
        setIsLocating(false);
        showToast('تعذر الوصول إلى الموقع، يرجى تفعيل إذن الموقع (GPS) في المتصفح أو إدخال العنوان يدوياً', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Electronic Payment State (Moyasar Live Form OR Sandbox Simulator)
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [paymentSession, setPaymentSession] = useState<InitiatePaymentResponse | null>(null);
  const [isSandboxKey, setIsSandboxKey] = useState(false);

  // Suggested / Complementary Products
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrderCode, setSubmittedOrderCode] = useState<string | null>(null);

  useEffect(() => {
    if (customer.name || customer.phone) {
      setCustomerName((prev) => prev || customer.name);
      setCustomerPhone((prev) => prev || defaultAddress?.phone || customer.phone);
      setAutoFilled(true);
      setEditingProfile(false);
    }
    if (defaultAddress && !customerAddress) {
      setCustomerAddress(`${defaultAddress.district} - ${defaultAddress.details}`);
    }
  }, [customer.name, customer.phone, defaultAddress]);

  useEffect(() => {
    productsApi
      .getAll({ pageSize: 8, sortBy: 'newest' })
      .then((res) => setSuggestions(res.items || []))
      .catch(() => { });
  }, []);

  const filteredSuggestions = suggestions
    .filter((p) => !items.some((i) => i.product.id === p.id))
    .slice(0, 6);

  const persistProfile = (name: string, phone: string) => {
    try {
      localStorage.setItem(
        CUSTOMER_PROFILE_KEY,
        JSON.stringify({ name: name.trim(), phone: phone.trim() })
      );
    } catch { }
  };

  const buildWhatsAppMessage = (orderCode?: string) => {
    const lines: string[] = [];
    lines.push(`🛍️ *طلب جديد — مكتبة أنوار الواحة*`);
    if (orderCode) lines.push(`🔢 *رقم الطلب:* ${orderCode}`);
    lines.push(`👤 *الاسم / الجهة:* ${customerName.trim()}`);
    lines.push(`📱 *الجوال:* ${customerPhone.trim()}`);
    lines.push(
      `📦 *طريقة الاستلام:* ${deliveryMethod === 'branch'
        ? 'استلام من الفرع (خميس مشيط)'
        : 'توصيل لموقعي (خميس مشيط / أبها)'
      }`
    );
    if (deliveryMethod === 'delivery' && customerAddress.trim()) {
      lines.push(`📍 *العنوان:* ${customerAddress.trim()}`);
    }
    if (deliveryMethod === 'delivery' && customerLocationLat && customerLocationLng) {
      lines.push(`🗺️ *الموقع الدقيق:* https://www.google.com/maps?q=${customerLocationLat},${customerLocationLng}`);
    }
    lines.push(``);
    lines.push(`*📋 الأصناف المطلوبة (${items.length} أصناف | ${itemsCount} قطع):*`);
    items.forEach((item, idx) => {
      const lineTotal = (item.product.price * item.quantity).toFixed(2);
      lines.push(`${idx + 1}. ${item.product.name} × ${item.quantity} = ${lineTotal} ر.س`);
      const itemNote = item.note || item.notes;
      if (itemNote && itemNote.trim()) {
        lines.push(`   📝 ملاحظة الصنف: ${itemNote.trim()}`);
      }
    });
    if (customerNotes.trim()) {
      lines.push(``);
      lines.push(`💬 *ملاحظات عامة:* ${customerNotes.trim()}`);
    }
    lines.push(``);
    if (discountAmount > 0 && appliedCoupon) {
      lines.push(`🏷️ *كود الخصم (${appliedCoupon.code}):* -${discountAmount.toFixed(2)} ر.س`);
    }
    lines.push(`💰 *المبلغ الإجمالي:* ${finalTotal.toFixed(2)} ر.س`);
    return lines.join('\n');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      showToast('سلة المشتريات فارغة!', 'error');
      return;
    }

    if (!customerName.trim()) {
      showToast('يرجى إدخال الاسم الكريم أو الجهة', 'error');
      setEditingProfile(true);
      return;
    }

    const phoneClean = customerPhone.trim();
    if (!/^05\d{8}$/.test(phoneClean)) {
      showToast('رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام (مثال: 0512345678)', 'error');
      setEditingProfile(true);
      return;
    }

    persistProfile(customerName, phoneClean);

    try {
      setIsSubmitting(true);

      // 1. Create Order in Backend DB
      let order: OrderResponse | null = null;
      try {
        order = await ordersApi.create({
          customerName: customerName.trim(),
          customerPhone: phoneClean,
          customerAddress:
            deliveryMethod === 'delivery'
              ? customerAddress.trim() || 'خميس مشيط / أبها'
              : undefined,
          deliveryMethod,
          customerLocationLat: deliveryMethod === 'delivery' ? customerLocationLat : undefined,
          customerLocationLng: deliveryMethod === 'delivery' ? customerLocationLng : undefined,
          customerNotes: customerNotes.trim() || undefined,
          couponCode: appliedCoupon?.code || undefined,
          items: items.map((i: CartItem) => ({
            productId: i.product.id,
            quantity: i.quantity,
            notes: (i.note || i.notes)?.trim() || undefined,
          })),
        });
      } catch (apiErr: any) {
        if (paymentChoice === 'electronic') {
          showToast(apiErr.message || 'تعذر إنشاء الطلب للدفع الإلكتروني', 'error');
          return;
        }
      }

      const finalCode = order?.orderCode || `WA-${Date.now().toString().slice(-6)}`;
      const phoneLast4 = phoneClean.slice(-4);

      sessionStorage.setItem('last_order_code', finalCode);
      sessionStorage.setItem('last_order_phone_last4', phoneLast4);
      localStorage.setItem('last_order_code', finalCode);
      localStorage.setItem('last_order_phone_last4', phoneLast4);

      // Record order in CustomerContext
      recordCompletedOrder(
        {
          orderCode: finalCode,
          customerName: customerName.trim(),
          customerPhone: phoneClean,
          customerAddress:
            deliveryMethod === 'delivery'
              ? customerAddress.trim() || 'خميس مشيط / أبها'
              : undefined,
          deliveryMethod,
          status: 'pending',
          totalAmount: order?.totalAmount ?? subtotal,
          createdAt: order?.createdAt || new Date().toISOString(),
          items: items.map((i: CartItem) => ({
            productId: i.product.id,
            productName: i.product.name,
            unitPrice: i.product.price,
            quantity: i.quantity,
            lineTotal: i.product.price * i.quantity,
            itemNotes: i.notes?.trim() || undefined,
            productSnapshot: i.product,
          })),
        },
        deliveryMethod === 'delivery' ? customerAddress.trim() : undefined
      );

      // 2. Branch A: Electronic Payment via Moyasar
      if (paymentChoice === 'electronic' && order) {
        setCreatedOrder(order);
        const session = await paymentsApi.initiate({ orderId: order.id });
        setPaymentSession(session);

        const isSample =
          !session.publishableKey ||
          session.publishableKey.toLowerCase().includes('sample') ||
          session.publishableKey.toLowerCase().includes('placeholder');

        setIsSandboxKey(isSample);

        if (!isSample) {
          const callbackUrl = `${window.location.origin}/payment/callback?orderCode=${encodeURIComponent(
            order.orderCode
          )}`;

          setTimeout(() => {
            if (window.Moyasar) {
              const container = document.getElementById('moyasar-form-container');
              if (container) container.innerHTML = '';

              window.Moyasar.init({
                element: '#moyasar-form-container',
                amount: session.amountInHalalas,
                currency: session.currency || 'SAR',
                description: session.description,
                publishable_api_key: session.publishableKey,
                callback_url: callbackUrl,
                methods: ['creditcard', 'applepay'],
                metadata: session.metadata,
              });
            }
          }, 100);
        }

        showToast('تم إنشاء الطلب! يرجى إتمام السداد الإلكتروني الآن', 'info');
        return;
      }

      // 3. Branch B: Cash on Delivery / WhatsApp Order Confirmation
      const waMsg = buildWhatsAppMessage(order?.orderCode);
      const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank');

      setSubmittedOrderCode(finalCode);
      clearCart();
      showToast('تم إرسال الطلب بنجاح وحفظه في حسابك الشخصي!', 'success');
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء تهيئة الطلب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedOrderCode) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-zinc-900">تم إرسال طلبك بنجاح!</h2>
        <p className="text-sm text-zinc-600">
          رقم الطلب المرجعي:{' '}
          <span className="font-mono font-black bg-zinc-100 px-2.5 py-1 rounded-lg text-zinc-900">
            {submittedOrderCode}
          </span>
        </p>
        <p className="text-xs text-zinc-500">
          تم فتح فاتورة طلبك المنسقة عبر واتساب للمتابعة والتأكيد الفوري مع فرع خميس مشيط.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="bg-black hover:bg-zinc-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition-colors"
          >
            العودة للرئيسية
          </button>
          <button
            onClick={() => navigate('/account')}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-3 px-6 rounded-xl transition-colors"
          >
            عرض طلباتي في حسابي
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !paymentSession) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-white border border-[#ebebeb] rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">
          🛍️
        </div>
        <h2 className="text-xl font-black text-zinc-900">حقيبة المشتريات فارغة حالياً</h2>
        <p className="text-xs text-zinc-500">تصفح أقسام ومنتجات المكتبة وأضف ما تحتاجه لطلبك</p>
        <button
          onClick={() => navigate('/categories')}
          className="bg-black hover:bg-[#c40d00] text-white font-black text-xs py-3 px-7 rounded-xl transition-colors"
        >
          تصفح الأقسام والمنتجات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-12 space-y-6">
      {/* Page Top Header */}
      <div className="bg-white rounded-2xl border border-[#ebebeb] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xl">🛍️</span>
            <h1 className="text-lg sm:text-2xl font-black text-zinc-900">
              حقيبة المشتريات والطلبات
            </h1>
            <span className="bg-zinc-100 text-zinc-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
              {items.length} أصناف ({itemsCount} قطع)
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            مكتبة أنوار الواحة • فرع خميس مشيط • سداد إلكتروني آمن (مدى / Apple Pay) أو تأكيد عبر واتساب
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm('هل تريد إفراغ السلة بالكامل؟')) clearCart();
          }}
          className="text-xs font-bold text-[#c40d00] hover:bg-red-50 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <Trash2 size={14} />
          <span>إفراغ السلة</span>
        </button>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* RIGHT COLUMN (in RTL): Selected Items + Complementary Suggestions */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#ebebeb] p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="font-black text-sm text-zinc-900">
                المنتجات والخدمات المحددة ({items.length}):
              </h2>
              <span className="text-[11px] text-zinc-400">
                يمكنك كتابة ملاحظات مخصصة لكل صنف
              </span>
            </div>

            <div className="space-y-4">
              {items.map((item: CartItem) => (
                <div
                  key={item.product.id}
                  className="p-4 rounded-2xl border border-zinc-200/80 bg-white space-y-3 hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-50 border border-zinc-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{item.product.categoryIcon || '📦'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-xs sm:text-sm text-zinc-900 leading-snug">
                          {item.product.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-zinc-400 hover:text-[#c40d00] p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                          title="حذف الصنف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <PriceTag price={item.product.price} size="md" />

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400 font-bold">الكمية:</span>
                          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-black w-5 text-center text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.product.id, e.target.value)}
                      placeholder="ملاحظات التنفيذ (المقاس، اللون، الاسم المطلوب...)"
                      className="w-full bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-xl px-3.5 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complementary Products Section */}
          {filteredSuggestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#ebebeb] p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-sm text-zinc-900 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-amber-500" />
                    <span>✨ قد تحتاج أيضاً (منتجات مكملة لطلبك)</span>
                  </h2>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    مقترحات تناسب مشترياتك الحالية، أضفها بضغطة زر واحدة
                  </p>
                </div>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  {filteredSuggestions.length} مقترحات
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {filteredSuggestions.map((prod) => (
                  <div
                    key={prod.id}
                    className="w-44 shrink-0 rounded-2xl border border-zinc-200/80 bg-white overflow-hidden flex flex-col justify-between hover:border-zinc-900 transition-colors"
                  >
                    <div className="aspect-square bg-zinc-50 flex items-center justify-center overflow-hidden">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-4xl">{prod.categoryIcon || '📦'}</span>
                      )}
                    </div>
                    <div className="p-2.5 space-y-2 flex-1 flex flex-col justify-between">
                      <h4 className="text-[11px] font-bold text-zinc-900 line-clamp-2 leading-snug">
                        {prod.name}
                      </h4>
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <PriceTag price={prod.price} size="xs" />
                        <button
                          type="button"
                          onClick={() => addToCart(prod, 1)}
                          className="bg-zinc-900 hover:bg-[#c40d00] text-white text-[10px] font-black px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                        >
                          + إضافة
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LEFT COLUMN (in RTL): Receiver Info / Payment Choice OR Active Moyasar Gateway */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-[#ebebeb] p-5 space-y-5 shadow-sm sticky top-20">
          {!paymentSession ? (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Section Title */}
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="font-black text-sm text-zinc-900 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-[#c40d00]" />
                  <span>بيانات المستلم والاستلام والدفع</span>
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  اختر طريقة الاستلام ووسيلة الدفع المناسبة لك
                </p>
              </div>

              {/* Auto-filled Profile Banner */}
              {autoFilled && !editingProfile && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <User size={13} className="shrink-0" />
                    <span>✨ تم ملء بياناتك تلقائياً من ملفك الشخصي</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(true)}
                    className="shrink-0 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 font-black px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Edit3 size={11} />
                    <span>تعديل البيانات</span>
                  </button>
                </div>
              )}

              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  الاسم الكريم / الجهة أو المدرسة <span className="text-[#c40d00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  readOnly={!editingProfile}
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    persistProfile(e.target.value, customerPhone);
                  }}
                  placeholder="مثال: أيمن القحطاني / مدرسة الواحة"
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none transition-colors ${!editingProfile
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-700 font-bold'
                      : 'bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900'
                    }`}
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  رقم الجوال للتواصل وتأكيد الطلب <span className="text-[#c40d00]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  maxLength={10}
                  readOnly={!editingProfile}
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    persistProfile(customerName, e.target.value);
                  }}
                  placeholder="05XXXXXXXX"
                  className={`w-full text-xs p-3 rounded-xl border text-left font-mono focus:outline-none transition-colors ${!editingProfile
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-700 font-bold'
                      : 'bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900'
                    }`}
                />
              </div>

              {/* Delivery Method 2 Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">طريقة الاستلام المطلوبة:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('branch')}
                    className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition-all ${deliveryMethod === 'branch'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'
                      }`}
                  >
                    <Store
                      size={20}
                      className={deliveryMethod === 'branch' ? 'text-emerald-600' : 'text-zinc-400'}
                    />
                    <div className="font-black text-xs">استلام من الفرع</div>
                    <div className="text-[10px] text-zinc-500">خميس مشيط</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition-all ${deliveryMethod === 'delivery'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'
                      }`}
                  >
                    <Truck
                      size={20}
                      className={deliveryMethod === 'delivery' ? 'text-emerald-600' : 'text-zinc-400'}
                    />
                    <div className="font-black text-xs">توصيل لموقعي</div>
                    <div className="text-[10px] text-zinc-500">خميس مشيط / أبها</div>
                  </button>
                </div>
              </div>

              {/* Address when Delivery is chosen */}
              {deliveryMethod === 'delivery' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700">العنوان / الحي للتوصيل</label>
                    {customer.addresses.length > 0 && (
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {customer.addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
                              setCustomerAddress(`${addr.district} - ${addr.details}`);
                              if (addr.phone) setCustomerPhone(addr.phone);
                            }}
                            className="text-[10px] font-bold bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            📍 {addr.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="اسم الحي، الشارع، أو رابط الموقع..."
                      className="w-full text-xs p-3 pr-9 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
                    />
                    <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Navigation size={13} className={isLocating ? 'animate-spin text-emerald-600' : 'text-emerald-600'} />
                      <span>{isLocating ? 'جاري تحديد موقعك...' : locationSuccess ? '✓ تم تحديد موقعك الجغرافي بنجاح' : 'تحديد موقعي بدقة عبر GPS (الخريطة)'}</span>
                    </button>
                    {customerLocationLat && customerLocationLng && (
                      <a
                        href={`https://www.google.com/maps?q=${customerLocationLat},${customerLocationLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <span>معاينة في Google Maps 🗺️</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method Choice (Electronic vs WhatsApp/COD) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">طريقة السداد:</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentChoice('electronic')}
                    className={`w-full p-3.5 rounded-2xl border-2 text-right flex items-center justify-between gap-2 transition-all ${paymentChoice === 'electronic'
                        ? 'border-black bg-zinc-900 text-white shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={18} className={paymentChoice === 'electronic' ? 'text-amber-400' : 'text-zinc-500'} />
                      <div>
                        <div className="font-black text-xs">الدفع الإلكتروني الفوري (Moyasar)</div>
                        <div className={`text-[10px] ${paymentChoice === 'electronic' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          مدى • فيزا • ماستركارد • Apple Pay
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-mono font-black shrink-0">
                      <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded">mada</span>
                      <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded">VISA</span>
                      <span className="bg-black border border-zinc-600 text-white px-1.5 py-0.5 rounded">Pay</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChoice('whatsapp')}
                    className={`w-full p-3.5 rounded-2xl border-2 text-right flex items-center justify-between gap-2 transition-all ${paymentChoice === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle size={18} className={paymentChoice === 'whatsapp' ? 'text-emerald-600' : 'text-zinc-500'} />
                      <div>
                        <div className="font-black text-xs">الدفع عند الاستلام / تأكيد عبر واتساب</div>
                        <div className="text-[10px] text-zinc-500">
                          إرسال الفاتورة مباشرة لواتساب المتجر للتأكيد الفوري
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* General Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  ملاحظات عامة على الطلب (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="أي تعليمات عامة بخصوص موعد التسليم أو تفاصيل إضافية..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              {/* Estimated Bill Summary */}
              <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-4 space-y-2.5 text-xs">
                <h3 className="font-black text-zinc-900 flex items-center gap-1.5 border-b border-zinc-200/80 pb-2">
                  <span>🧾</span>
                  <span>ملخص الحساب التقديري:</span>
                </h3>

                <div className="flex items-center justify-between text-zinc-600">
                  <span>الأصناف المختارة</span>
                  <span className="font-bold text-zinc-900">
                    {items.length} أصناف ({itemsCount} قطع)
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-600">
                  <span>إجمالي المنتجات المسعرة</span>
                  <span className="font-bold text-zinc-900">{subtotal.toFixed(2)} ر.س</span>
                </div>

                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>خصم الكوبون ({appliedCoupon.code})</span>
                    <span>- {discountAmount.toFixed(2)} ر.س</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                  <span className="font-black text-sm text-zinc-900">المبلغ الإجمالي:</span>
                  <span className="font-black text-xl text-[#c40d00]">
                    {finalTotal.toFixed(2)} ر.س
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full disabled:opacity-50 text-white font-black text-xs sm:text-sm py-4 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all ${paymentChoice === 'electronic'
                    ? 'bg-black hover:bg-[#c40d00] shadow-zinc-900/20'
                    : 'bg-[#c40d00] hover:bg-[#a50b00] shadow-red-600/20'
                  }`}
              >
                {paymentChoice === 'electronic' ? <Lock size={16} /> : <Rocket size={17} />}
                <span>
                  {isSubmitting
                    ? 'جاري تجهيز الطلب...'
                    : paymentChoice === 'electronic'
                      ? `متابعة للسداد الإلكتروني الآمن (${finalTotal.toFixed(2)} ر.س)`
                      : 'إرسال الطلب للمتجر مباشرة • تأكيد فوري'}
                </span>
              </button>
            </form>
          ) : (
            /* ACTIVE ELECTRONIC PAYMENT STEP (Moyasar Live Form OR Sandbox Simulator) */
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <h3 className="font-black text-sm text-zinc-900">بوابة السداد الإلكتروني الآمن</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentSession(null)}
                  className="text-xs font-bold text-zinc-500 hover:text-black"
                >
                  تغيير الطريقة
                </button>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 block">رقم الطلب</span>
                  <span className="font-mono font-black text-zinc-900">
                    {createdOrder?.orderCode}
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-zinc-500 block">المبلغ المطلوب</span>
                  <span className="font-black text-lg text-[#c40d00]">
                    {createdOrder?.totalAmount.toFixed(2)} ر.س
                  </span>
                </div>
              </div>

              {isSandboxKey ? (
                /* Built-in Sandbox Payment Simulator when sample keys are configured */
                <div className="p-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/50 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-900 flex items-center gap-1.5">
                      <CreditCard size={15} />
                      <span>وضع المحاكاة التجريبية (Moyasar Sandbox)</span>
                    </span>
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                      TEST MODE
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    مفاتيح Moyasar الحالية في وضع الاختبار الافتراضي. يمكنك تجربة دورة الدفع الكاملة (النجاح وتحديث حالة الطلب أو الفشل) بضغطة زر:
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-1.5 font-mono text-[11px] text-zinc-700" dir="ltr">
                    <div className="flex justify-between">
                      <span>CARD:</span>
                      <span className="font-bold">4201 32** **** 1010 (mada)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AMOUNT:</span>
                      <span className="font-bold">{createdOrder?.totalAmount.toFixed(2)} SAR</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/payment/callback?orderCode=${encodeURIComponent(
                            createdOrder?.orderCode || ''
                          )}&id=sim_paid_${Date.now()}&status=paid&message=Succeeded`
                        )
                      }
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
                    >
                      <CheckCircle2 size={16} />
                      <span>تأكيد الدفع التجريبي (محاكاة سداد ناجح)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/payment/callback?orderCode=${encodeURIComponent(
                            createdOrder?.orderCode || ''
                          )}&id=sim_fail_${Date.now()}&status=failed&message=${encodeURIComponent(
                            'تم رفض البطاقة التجريبية (محاكاة فشل الدفع)'
                          )}`
                        )
                      }
                      className="w-full bg-white hover:bg-red-50 text-[#c40d00] border border-red-200 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <XCircle size={15} />
                      <span>محاكاة فشل / رفض الدفع</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Real Moyasar Embedded Form Container */
                <div id="moyasar-form-container" className="pt-2 min-h-[300px]" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
