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
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Lock,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Check,
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
import { DeliveryLocationMap } from '../components/checkout/DeliveryLocationMap';

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

  // Wizard Step State: 1 = Delivery & Location, 2 = Payment & Review
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Customer Profile State
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

  // Electronic Payment State
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);
  const [paymentSession, setPaymentSession] = useState<InitiatePaymentResponse | null>(null);
  const [isSandboxKey, setIsSandboxKey] = useState(false);

  // Suggested Products
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
      .catch(() => {});
  }, []);

  const filteredSuggestions = suggestions
    .filter((p) => !items.some((i) => i.product.id === p.id))
    .slice(0, 4);

  const persistProfile = (name: string, phone: string) => {
    try {
      localStorage.setItem(
        CUSTOMER_PROFILE_KEY,
        JSON.stringify({ name: name.trim(), phone: phone.trim() })
      );
    } catch {}
  };

  const buildWhatsAppMessage = (orderCode?: string) => {
    const lines: string[] = [];
    lines.push(`🛍️ *طلب جديد — مكتبة أنوار الواحة*`);
    if (orderCode) lines.push(`🔢 *رقم الطلب:* ${orderCode}`);
    lines.push(`👤 *الاسم / الجهة:* ${customerName.trim()}`);
    lines.push(`📱 *الجوال:* ${customerPhone.trim()}`);
    lines.push(
      `📦 *طريقة الاستلام:* ${
        deliveryMethod === 'branch'
          ? 'استلام من الفرع (خميس مشيط)'
          : 'توصيل لموقعي (خميس مشيط / أبها)'
      }`
    );
    if (deliveryMethod === 'delivery' && customerAddress.trim()) {
      lines.push(`📍 *العنوان:* ${customerAddress.trim()}`);
    }
    if (deliveryMethod === 'delivery' && customerLocationLat && customerLocationLng) {
      lines.push(`🗺️ *رابط الموقع عبر الخريطة:* https://www.google.com/maps?q=${customerLocationLat},${customerLocationLng}`);
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
    lines.push(`💳 *طريقة الدفع:* ${paymentChoice === 'electronic' ? 'سداد إلكتروني (Moyasar)' : 'دفع عند الاستلام / تأكيد عبر واتساب'}`);
    return lines.join('\n');
  };

  // Step 1 Validation & Proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('حقيبة المشتريات فارغة!', 'error');
      return;
    }

    if (!customerName.trim()) {
      showToast('يرجى إدخال الاسم الكريم أو اسم الجهة', 'error');
      setEditingProfile(true);
      return;
    }

    const phoneClean = customerPhone.trim();
    if (!/^05\d{8}$/.test(phoneClean)) {
      showToast('رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام (مثال: 0512345678)', 'error');
      setEditingProfile(true);
      return;
    }

    if (deliveryMethod === 'delivery' && !customerAddress.trim() && !customerLocationLat) {
      showToast('يرجى تحديد عنوان التوصيل أو تحديد موقعك على الخريطة أدناه', 'info');
      return;
    }

    persistProfile(customerName, phoneClean);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Submission (Create Order & Route Payment)
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      showToast('سلة المشتريات فارغة!', 'error');
      return;
    }

    const phoneClean = customerPhone.trim();
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
          customerLocationLat:
            deliveryMethod === 'delivery' ? customerLocationLat || 18.3093 : undefined,
          customerLocationLng:
            deliveryMethod === 'delivery' ? customerLocationLng || 42.7336 : undefined,
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

      // Record in local context
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
          totalAmount: order?.totalAmount ?? finalTotal,
          createdAt: order?.createdAt || new Date().toISOString(),
          items: items.map((i: CartItem) => ({
            productId: i.product.id,
            productName: i.product.name,
            unitPrice: i.product.price,
            quantity: i.quantity,
            lineTotal: i.product.price * i.quantity,
            itemNotes: (i.note || i.notes)?.trim() || undefined,
            productSnapshot: i.product,
          })),
        },
        deliveryMethod === 'delivery' ? customerAddress.trim() : undefined
      );

      // 2. Branch A: Electronic Payment
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

      // 3. Branch B: WhatsApp / Cash on Delivery
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

  // ============================================================================
  // Screen 3: Order Success & Fast WhatsApp CTA
  // ============================================================================
  if (submittedOrderCode) {
    const waMsg = buildWhatsAppMessage(submittedOrderCode);
    const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(waMsg)}`;

    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6 animate-in fade-in">
        <div className="bg-white rounded-3xl border border-[#ebebeb] p-6 sm:p-8 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ تم استلام وتسجيل الطلب بنجاح
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 pt-1">
              شكراً لطلبكم من أنوار الواحة!
            </h2>
            <p className="text-xs text-zinc-500">
              تم تسجيل طلبك وحفظه في سجل حسابك الشخصي للمتابعة والتتبع وإعادة الطلب في أي وقت.
            </p>
          </div>

          {/* Reference Receipt Card */}
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80 space-y-3 text-xs text-right">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
              <span className="text-zinc-500 font-bold">رقم الطلب المرجعي:</span>
              <span className="font-mono font-black text-base text-zinc-900 bg-white px-3 py-1 rounded-xl border border-zinc-200 shadow-xs">
                {submittedOrderCode}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-700">
              <span>اسم العميل / الجهة:</span>
              <span className="font-bold text-zinc-900">{customerName}</span>
            </div>

            <div className="flex items-center justify-between text-zinc-700">
              <span>طريقة الاستلام:</span>
              <span className="font-bold text-zinc-900">
                {deliveryMethod === 'branch' ? 'استلام من الفرع (خميس مشيط)' : 'توصيل لموقعي'}
              </span>
            </div>

            {deliveryMethod === 'delivery' && (customerLocationLat || customerAddress) && (
              <div className="flex items-center justify-between text-zinc-700">
                <span>موقع التوصيل:</span>
                <span className="font-bold text-zinc-900 truncate max-w-[220px]">
                  {customerAddress || `${customerLocationLat?.toFixed(4)}, ${customerLocationLng?.toFixed(4)}`}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2.5 border-t border-zinc-200 font-black text-sm">
              <span className="text-zinc-900">المبلغ الإجمالي:</span>
              <span className="text-[#c40d00] text-base">{finalTotal.toFixed(2)} ر.س</span>
            </div>
          </div>

          {/* Prominent High-Contrast Green WhatsApp Action Button */}
          <div className="space-y-2 pt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition-all"
            >
              <MessageCircle size={20} />
              <span>⚡ تعجيل الطلب عبر واتساب (تأكيد وتجهيز فوري)</span>
            </a>
            <p className="text-[11px] text-zinc-400">
              انقر لفتح محادثة واتساب مع المتجر مباشرة مرفقاً بها رقم الطلب وموقعك الجغرافي لتسريع التجهيز الفوري.
            </p>
          </div>

          {/* Action Links */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-zinc-100">
            <button
              onClick={() => navigate('/account?tab=orders')}
              className="flex-1 bg-zinc-900 hover:bg-black text-white font-black text-xs py-3 px-4 rounded-xl transition-colors"
            >
              عرض طلباتي في حسابي
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-3 px-4 rounded-xl transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart Screen
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
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-14 space-y-6">
      {/* 2-Step Focused Checkout Wizard Header */}
      <div className="bg-white rounded-2xl border border-[#ebebeb] p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          {/* Step 1 Indicator */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 font-black transition-colors ${
              currentStep === 1 ? 'text-black' : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black ${
                currentStep === 1
                  ? 'bg-black text-white ring-4 ring-black/10'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {currentStep > 1 ? <Check size={14} /> : '1'}
            </div>
            <span>1. الاستلام وموقع التوصيل</span>
          </button>

          <div
            className={`flex-1 h-0.5 mx-3 sm:mx-6 rounded transition-all ${
              currentStep === 2 ? 'bg-black' : 'bg-zinc-200'
            }`}
          />

          {/* Step 2 Indicator */}
          <div
            className={`flex items-center gap-2 font-black ${
              currentStep === 2 ? 'text-black' : 'text-zinc-400'
            }`}
          >
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black ${
                currentStep === 2
                  ? 'bg-black text-white ring-4 ring-black/10'
                  : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              2
            </div>
            <span>2. مراجعة الطلب وطريقة الدفع</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SCREEN 1: DELIVERY & LOCATION FOCUS (Single Screen) */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToStep2} className="space-y-6 animate-in fade-in">
          {/* Delivery Method Choice */}
          <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-black text-base text-zinc-900 flex items-center gap-2">
                  <span>📦</span>
                  <span>طريقة استلام الطلب</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  اختر ما إذا كنت ترغب في استلام طلبك من الفرع أو التوصيل لمقر سكنك/عملك
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-4 rounded-2xl border-2 text-right flex flex-col justify-between gap-3 transition-all ${
                  deliveryMethod === 'delivery'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Truck
                    size={26}
                    className={deliveryMethod === 'delivery' ? 'text-emerald-600' : 'text-zinc-400'}
                  />
                  {deliveryMethod === 'delivery' && (
                    <span className="bg-emerald-600 text-white rounded-full p-1">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-black text-sm">توصيل لموقعي</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">خميس مشيط / أبها والمراكز المجاورة</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('branch')}
                className={`p-4 rounded-2xl border-2 text-right flex flex-col justify-between gap-3 transition-all ${
                  deliveryMethod === 'branch'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Store
                    size={26}
                    className={deliveryMethod === 'branch' ? 'text-emerald-600' : 'text-zinc-400'}
                  />
                  {deliveryMethod === 'branch' && (
                    <span className="bg-emerald-600 text-white rounded-full p-1">
                      <Check size={12} />
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-black text-sm">استلام من الفرع</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">خميس مشيط (حي العزيزية) • مجاني</div>
                </div>
              </button>
            </div>

            {deliveryMethod === 'branch' && (
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs space-y-1 text-zinc-700">
                <p className="font-bold flex items-center gap-1.5 text-zinc-900">
                  <MapPin size={15} className="text-[#c40d00]" />
                  <span>مقر الفرع: خميس مشيط - طريق الملك فيصل / حي العزيزية</span>
                </p>
                <p className="text-[11px] text-zinc-500">
                  سيكون طلبك جاهزاً للاستلام فور إعداده، وستصلك رسالة تأكيد عبر واتساب.
                </p>
              </div>
            )}
          </div>

          {/* Recipient Profile Card */}
          <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-black text-base text-zinc-900 flex items-center gap-2">
                  <User size={18} className="text-[#c40d00]" />
                  <span>بيانات المستلم والتواصل</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  سيتم استخدام هذه البيانات للتواصل معك وتسليم الطلب
                </p>
              </div>
              {autoFilled && !editingProfile && (
                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="text-[11px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Edit3 size={12} />
                  <span>تعديل</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  الاسم الكريم / اسم الجهة <span className="text-[#c40d00]">*</span>
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
                  className={`w-full text-xs p-3.5 rounded-xl border focus:outline-none transition-colors ${
                    !editingProfile
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-800 font-bold'
                      : 'bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  رقم الجوال للتأكيد والتوصيل <span className="text-[#c40d00]">*</span>
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
                  className={`w-full text-xs p-3.5 rounded-xl border text-left font-mono focus:outline-none transition-colors ${
                    !editingProfile
                      ? 'bg-zinc-50 border-zinc-200 text-zinc-800 font-bold'
                      : 'bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Interactive Embedded Map Section (Delivery Only) */}
          {deliveryMethod === 'delivery' && (
            <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in">
              <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-base text-zinc-900 flex items-center gap-2">
                    <MapPin size={18} className="text-[#c40d00]" />
                    <span>تحديد موقع التوصيل على الخريطة (خميس مشيط / أبها)</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    انقر أو اسحب الدبوس لتحديد منزلك بدقة، أو استخدم زر تحديد موقعي بالـ GPS
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700">وصف الحي / الشارع</label>
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
                            className="text-[10px] font-bold bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            📍 {addr.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="مثال: خميس مشيط - حي الرصراص - بجوار مسجد التقوى..."
                    className="w-full text-xs p-3.5 rounded-xl border border-zinc-300 focus:outline-none focus:border-zinc-900"
                  />
                </div>

                {/* Visible Interactive Leaflet Map */}
                <DeliveryLocationMap
                  lat={customerLocationLat}
                  lng={customerLocationLng}
                  onChange={(newLat, newLng) => {
                    setCustomerLocationLat(newLat);
                    setCustomerLocationLng(newLng);
                    if (!customerAddress || customerAddress === 'خميس مشيط / أبها') {
                      setCustomerAddress(`موقع محدد عبر الخريطة (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick Cart Summary Bar & Next CTA Button */}
          <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-700">
              <span className="font-bold">
                محتويات السلة: <span className="font-black text-zinc-900">{items.length} أصناف ({itemsCount} قطع)</span>
              </span>
              <span className="font-bold">
                المجموع التقديري: <span className="font-black text-[#c40d00] text-base">{finalTotal.toFixed(2)} ر.س</span>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-black hover:bg-[#c40d00] text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20 active:scale-[0.99] transition-all"
            >
              <span>التالي: اختيار طريقة الدفع ←</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: PAYMENT & CONFIRMATION FOCUS (Single Screen) */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Return Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-700 hover:text-black bg-white hover:bg-zinc-100 border border-zinc-200 px-4 py-2.5 rounded-xl transition-colors shadow-xs"
            >
              <ArrowRight size={14} />
              <span>← تعديل بيانات الاستلام والموقع</span>
            </button>

            <span className="text-xs font-bold text-zinc-500">
              الخطوة 2 من 2
            </span>
          </div>

          {/* Recipient & Location Snapshot Summary */}
          <div className="bg-white rounded-3xl border border-[#ebebeb] p-4 sm:p-5 shadow-sm flex items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-bold block">المستلم والموقع المعتمد:</span>
              <p className="font-black text-zinc-900 text-sm">
                {customerName} • <span className="font-mono text-zinc-600 font-bold" dir="ltr">{customerPhone}</span>
              </p>
              <p className="text-zinc-600 flex items-center gap-1">
                {deliveryMethod === 'branch' ? (
                  <span className="flex items-center gap-1 font-bold text-emerald-800">
                    <Store size={13} /> استلام من الفرع (خميس مشيط - حي العزيزية)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-bold text-sky-800">
                    <Truck size={13} /> توصيل لـ: {customerAddress || 'موقع محدد عبر الخريطة'}
                  </span>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="shrink-0 text-xs font-black text-zinc-600 hover:text-black underline"
            >
              تعديل
            </button>
          </div>

          {!paymentSession ? (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Order Items Review */}
              <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="font-black text-sm text-zinc-900 flex items-center gap-2">
                    <ShoppingBag size={16} className="text-[#c40d00]" />
                    <span>محتويات الطلب ({items.length} أصناف • {itemsCount} قطع)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="text-xs font-bold text-zinc-500 hover:text-black underline"
                  >
                    تعديل السلة
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item: CartItem) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product.imageUrl ? (
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{item.product.categoryIcon || '📦'}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 truncate">{item.product.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            الكمية: {item.quantity} × {item.product.price.toFixed(2)} ر.س
                            {item.note || item.notes ? ` • ملاحظة: ${item.note || item.notes}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-zinc-900 shrink-0">
                        {(item.product.price * item.quantity).toFixed(2)} ر.س
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 space-y-4 shadow-sm">
                <div className="border-b border-zinc-100 pb-3">
                  <h3 className="font-black text-sm text-zinc-900 flex items-center gap-2">
                    <CreditCard size={16} className="text-[#c40d00]" />
                    <span>طريقة السداد والتأكيد</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    اختر السداد الإلكتروني الفوري أو الدفع عند الاستلام والتأكيد المباشر عبر واتساب
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentChoice('electronic')}
                    className={`w-full p-4 rounded-2xl border-2 text-right flex items-center justify-between gap-2 transition-all ${
                      paymentChoice === 'electronic'
                        ? 'border-black bg-zinc-900 text-white shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className={paymentChoice === 'electronic' ? 'text-amber-400' : 'text-zinc-500'} />
                      <div>
                        <div className="font-black text-xs sm:text-sm">الدفع الإلكتروني الفوري (Moyasar)</div>
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
                    className={`w-full p-4 rounded-2xl border-2 text-right flex items-center justify-between gap-2 transition-all ${
                      paymentChoice === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle size={20} className={paymentChoice === 'whatsapp' ? 'text-emerald-600' : 'text-zinc-500'} />
                      <div>
                        <div className="font-black text-xs sm:text-sm">الدفع عند الاستلام / تأكيد عبر واتساب</div>
                        <div className="text-[10px] text-zinc-500">
                          إرسال الفاتورة مباشرة لواتساب المتجر للتأكيد الفوري مع الفرع
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* General Order Notes */}
              <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 space-y-2 shadow-sm">
                <label className="text-xs font-bold text-zinc-700">
                  ملاحظات عامة على الطلب (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="أي تعليمات خاصة بالموعد، التغليف، أو تفاصيل الاستلام..."
                  className="w-full text-xs p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              {/* Final Bill Breakdown */}
              <div className="bg-zinc-50 rounded-3xl border border-zinc-200/80 p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>إجمالي المنتجات ({itemsCount} قطع):</span>
                  <span className="font-bold text-zinc-900">{subtotal.toFixed(2)} ر.س</span>
                </div>

                {discountAmount > 0 && appliedCoupon && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>خصم الكوبون ({appliedCoupon.code}):</span>
                    <span>- {discountAmount.toFixed(2)} ر.س</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-zinc-600">
                  <span>رسوم التوصيل / الاستلام:</span>
                  <span className="font-bold text-emerald-700">
                    {deliveryMethod === 'branch' ? 'مجاني (استلام من الفرع)' : 'مجاني / حسب النطاق'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
                  <span className="font-black text-sm text-zinc-900">المبلغ النهائي المطلوب:</span>
                  <span className="font-black text-2xl text-[#c40d00]">
                    {finalTotal.toFixed(2)} ر.س
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full disabled:opacity-50 text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all ${
                  paymentChoice === 'electronic'
                    ? 'bg-black hover:bg-[#c40d00] shadow-zinc-900/20'
                    : 'bg-[#25D366] hover:bg-[#20ba59] shadow-emerald-600/20'
                }`}
              >
                {paymentChoice === 'electronic' ? <Lock size={16} /> : <Rocket size={17} />}
                <span>
                  {isSubmitting
                    ? 'جاري تجهيز الطلب...'
                    : paymentChoice === 'electronic'
                    ? `متابعة للسداد الإلكتروني الآمن (${finalTotal.toFixed(2)} ر.س)`
                    : 'تأكيد وإتمام الطلب عبر واتساب ⚡'}
                </span>
              </button>
            </form>
          ) : (
            /* Active Electronic Payment Form (Live Moyasar or Simulator) */
            <div className="bg-white rounded-3xl border border-[#ebebeb] p-6 space-y-4 shadow-sm animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
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

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-500 block">رقم الطلب</span>
                  <span className="font-mono font-black text-zinc-900 text-sm">
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
                /* Sandbox Simulator */
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
                    مفاتيح Moyasar الحالية في وضع الاختبار التجريبي. يمكنك تجربة دورة الدفع الكاملة وتحديث حالة الطلب:
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
                /* Live Moyasar Embedded Form */
                <div id="moyasar-form-container" className="pt-2 min-h-[300px]" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
