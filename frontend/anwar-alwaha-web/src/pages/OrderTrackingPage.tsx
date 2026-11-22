import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Clock, Truck, Package, Store, ShieldCheck, Star } from 'lucide-react';
import { ordersApi } from '../api/ordersApi';
import { OrderResponse, OrderItemResponse } from '../types/order.types';
import { useToast } from '../context/ToastContext';

const STATUS_STEPS = [
  { key: 'pending', label: 'تم الاستلام', icon: Clock },
  { key: 'processing', label: 'قيد التجهيز', icon: Package },
  { key: 'ready', label: 'جاهز للاستلام', icon: Store },
  { key: 'shipping', label: 'جاري التوصيل', icon: Truck },
  { key: 'delivered', label: 'تم التسليم', icon: CheckCircle },
];

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderCode, setOrderCode] = useState(searchParams.get('code') || '');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const storedPhone = sessionStorage.getItem('last_order_phone_last4') || '';

  useEffect(() => {
    if (storedPhone && !phoneLast4) {
      setPhoneLast4(storedPhone);
    }
  }, [storedPhone, phoneLast4]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) {
      showToast('يرجى إدخال رمز الطلب', 'error');
      return;
    }
    if (!phoneLast4.trim() || phoneLast4.trim().length !== 4) {
      showToast('يرجى إدخال آخر 4 أرقام من رقم الجوال المسجل', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await ordersApi.getByCode(orderCode.trim(), phoneLast4.trim());
      setOrder(res);
      if (!res) {
        showToast('لم يتم العثور على طلب مطابق', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل جلب تفاصيل الطلب. تأكد من صحة البيانات', 'error');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipping') return 3;
    if (s === 'ready') return 2;
    if (s === 'processing' || s === 'paid') return 1;
    return 0; // pending
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">تتبع حالة طلبك</h1>
        <p className="text-xs text-gray-500">
          أدخل رمز الطلب وآخر 4 أرقام من جوالك لمعرفة المرحلة الحالية لطلبك في المكتبة
        </p>
      </div>

      {/* Query Form */}
      <form onSubmit={handleTrackSubmit} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">رمز الطلب</label>
            <input
              type="text"
              required
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
              placeholder="مثال: AW-K8M4X9P2"
              className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">آخر 4 أرقام من الجوال (حماية أمنية)</label>
            <input
              type="text"
              maxLength={4}
              dir="ltr"
              required
              value={phoneLast4}
              onChange={(e) => setPhoneLast4(e.target.value.replace(/\D/g, ''))}
              placeholder="مثال: 5678"
              className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-500 text-center"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Search size={16} />
          <span>{loading ? 'جاري البحث عن الطلب...' : 'استعلام عن حالة الطلب'}</span>
        </button>
      </form>

      {/* Order Details Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-6 space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[10px] text-gray-400 font-semibold">رمز الطلب</span>
              <h3 className="font-mono font-black text-lg text-gray-900">{order.orderCode}</h3>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-gray-400 font-semibold block">تاريخ الإنشاء</span>
              <span className="text-xs font-bold text-gray-700">
                {new Date(order.createdAt).toLocaleDateString('ar-SA')}
              </span>
            </div>
          </div>

          {/* Timeline Progress Bar */}
          <div className="py-4">
            <div className="grid grid-cols-5 gap-2 text-center relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold ${
                        isCurrent ? 'text-brand-700 font-black' : isPassed ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-xs text-gray-900">الأصناف المشمولة في هذا الطلب:</h4>
            <div className="space-y-2">
              {order.items.map((item: OrderItemResponse) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{item.productName}</p>
                    <p className="text-[10px] text-gray-400">
                      {item.quantity} × {item.unitPrice.toFixed(2)} ر.س
                    </p>
                  </div>
                  <span className="font-extrabold text-brand-700">{item.lineTotal.toFixed(2)} ر.س</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>الإجمالي المدفوع</span>
              <span className="text-brand-700 text-lg">{order.totalAmount.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
