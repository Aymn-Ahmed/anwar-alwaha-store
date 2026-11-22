import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { paymentsApi } from '../api/paymentsApi';
import { PaymentStatusResponse } from '../types/payment.types';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';

export const PaymentCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [phoneLast4Input, setPhoneLast4Input] = useState('');
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);

  const { clearCart } = useCart();
  const { customer, refreshAccountOrders } = useCustomer();
  const navigate = useNavigate();

  // Moyasar callback query params
  const paymentId = searchParams.get('id') || searchParams.get('paymentId');
  const moyasarStatus = searchParams.get('status');
  const moyasarMessage = searchParams.get('message');

  const orderCode =
    searchParams.get('orderCode') ||
    sessionStorage.getItem('last_order_code') ||
    localStorage.getItem('last_order_code') ||
    '';

  const storedPhone =
    sessionStorage.getItem('last_order_phone_last4') ||
    localStorage.getItem('last_order_phone_last4') ||
    (customer.phone.length >= 4 ? customer.phone.slice(-4) : '');

  const verifyPayment = async (phone4: string) => {
    if (!orderCode) {
      setErrorMsg('رمز الطلب غير متوفر للتحقق.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await paymentsApi.verify(orderCode, phone4, paymentId, moyasarStatus);
      setPaymentStatus(res);
      setNeedsPhoneVerification(false);

      if (res && res.isPaid) {
        // Clear cart ONLY after payment is confirmed as paid
        clearCart();
        refreshAccountOrders();

        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } catch (err: any) {
      if (err.message && err.message.includes('غير مطابق')) {
        setNeedsPhoneVerification(true);
        setErrorMsg('آخر 4 أرقام من الجوال غير مطابقة لبيانات الطلب.');
      } else {
        setErrorMsg(err.message || 'تعذر التحقق من حالة الدفع.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (storedPhone && storedPhone.length === 4) {
      verifyPayment(storedPhone);
    } else {
      setNeedsPhoneVerification(true);
      setLoading(false);
    }
  }, [orderCode, storedPhone, paymentId, moyasarStatus]);

  const handleManualPhoneVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneLast4Input.trim().length === 4) {
      verifyPayment(phoneLast4Input.trim());
    } else {
      setErrorMsg('يرجى إدخال 4 أرقام بالضبط.');
    }
  };

  const isFailed =
    moyasarStatus?.toLowerCase() === 'failed' ||
    (paymentStatus && !paymentStatus.isPaid);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 pb-24 space-y-6">
      <div className="bg-white rounded-3xl border border-[#ebebeb] shadow-xl p-6 sm:p-8 text-center space-y-6">
        {loading ? (
          <div className="py-12 space-y-4">
            <RefreshCw className="w-12 h-12 text-black animate-spin mx-auto" />
            <h3 className="text-lg font-black text-zinc-900">
              جاري التحقق من عملية السداد الإلكتروني...
            </h3>
            <p className="text-xs text-zinc-400">
              لحظات قليلة ونؤكد معاملتك ونصدّر إيصال السداد الرسمي
            </p>
          </div>
        ) : needsPhoneVerification ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-zinc-100 text-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">
              🔒
            </div>
            <h3 className="text-lg font-black text-zinc-900">التحقق الأمني للطلب</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              لحماية بياناتك، يرجى إدخال آخر 4 أرقام من رقم الجوال المسجل في الطلب ({orderCode}):
            </p>

            <form onSubmit={handleManualPhoneVerify} className="max-w-xs mx-auto space-y-3">
              <input
                type="text"
                maxLength={4}
                dir="ltr"
                required
                value={phoneLast4Input}
                onChange={(e) => setPhoneLast4Input(e.target.value.replace(/\D/g, ''))}
                placeholder="مثال: 5678"
                className="w-full text-center text-lg tracking-widest font-mono font-bold p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
              />

              {errorMsg && <p className="text-xs text-[#c40d00] font-bold">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full bg-black hover:bg-[#c40d00] text-white font-black py-3 rounded-xl text-xs transition-colors"
              >
                تأكيد واستعراض الإيصال
              </button>
            </form>
          </div>
        ) : paymentStatus && paymentStatus.isPaid && !isFailed ? (
          <div className="space-y-5">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={44} />
            </div>

            <div>
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                عملية سداد ناجحة ومؤكدة
              </span>
              <h2 className="text-2xl font-black text-zinc-900 mt-2">
                شكراً لك! تم سداد طلبك بنجاح
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                تم تحديث حالة طلبك إلى «قيد التجهيز» في مكتبة أنوار الواحة
              </p>
            </div>

            {/* Payment Receipt Card */}
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 text-xs space-y-2.5 text-right">
              <div className="flex items-center justify-between border-b border-zinc-200/70 pb-2">
                <span className="text-zinc-500 font-bold">رقم الطلب</span>
                <span className="font-mono font-black text-zinc-900 bg-white px-2.5 py-0.5 rounded-lg border border-zinc-200">
                  {paymentStatus.orderCode}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-500 font-bold">المبلغ المسدد</span>
                <span className="font-black text-[#c40d00] text-base">
                  {paymentStatus.totalAmount.toFixed(2)} ر.س
                </span>
              </div>

              {paymentStatus.paymentMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-bold">وسيلة الدفع</span>
                  <span className="font-bold text-zinc-800 uppercase">
                    {paymentStatus.paymentMethod}
                  </span>
                </div>
              )}

              {paymentStatus.gatewayReferenceId && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-bold">رقم المرجع (Moyasar)</span>
                  <span className="font-mono text-[11px] text-zinc-600" dir="ltr">
                    {paymentStatus.gatewayReferenceId}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-zinc-200/70">
                <span className="text-zinc-500 font-bold">حالة الطلب الحالية</span>
                <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-full text-[11px]">
                  قيد التجهيز والتنفيذ
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/account?tab=orders"
                className="flex-1 bg-black hover:bg-[#c40d00] text-white font-black py-3.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag size={15} />
                <span>متابعة الطلب في حسابي</span>
              </Link>
              <Link
                to="/"
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-3.5 px-4 rounded-xl text-xs transition-colors"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Failed / Cancelled State (Cart is preserved!) */
          <div className="space-y-5">
            <div className="w-20 h-20 bg-red-50 text-[#c40d00] border border-red-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={44} />
            </div>

            <div>
              <span className="text-xs font-black text-[#c40d00] bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                لم تكتمل عملية السداد
              </span>
              <h2 className="text-2xl font-black text-zinc-900 mt-2">
                تعذر تأكيد عملية الدفع
              </h2>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {moyasarMessage ||
                  errorMsg ||
                  'تم إلغاء المعاملة أو رفض البطاقة من قبل البنك المصدر. أصناف سلتك محفوظة كما هي ويمكنك إعادة المحاولة فوراً.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="flex-1 bg-[#c40d00] hover:bg-[#a50b00] text-white font-black py-3.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowRight size={15} />
                <span>إعادة محاولة الدفع (سلتك محفوظة)</span>
              </button>
              <Link
                to="/"
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-3.5 px-4 rounded-xl text-xs transition-colors"
              >
                العودة للمتجر
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
