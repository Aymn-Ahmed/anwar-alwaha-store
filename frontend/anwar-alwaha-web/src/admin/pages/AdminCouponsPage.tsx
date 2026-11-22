import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Percent,
  Coins,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { couponsApi, CouponItem, CreateCouponPayload } from '../../api/couponsApi';
import { useToast } from '../../context/ToastContext';

export const AdminCouponsPage: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [showCouponField, setShowCouponField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [usageLimit, setUsageLimit] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [list, isVisible] = await Promise.all([
        couponsApi.adminGetAll(),
        couponsApi.adminGetSettings(),
      ]);
      setCoupons(list);
      setShowCouponField(isVisible);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل بيانات الكوبونات.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleShowCouponField = async () => {
    const nextVal = !showCouponField;
    try {
      setUpdatingSettings(true);
      const updated = await couponsApi.adminUpdateSettings(nextVal);
      setShowCouponField(updated);
      showToast(
        updated
          ? 'تم تفعيل إظهار حقل الكوبون للزبائن في السلة والدفع 🎉'
          : 'تم إخفاء حقل الكوبون عن الزبائن تماماً 🔒',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث إعداد الكوبونات.', 'error');
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setValue(10);
    setMinOrderAmount(0);
    setMaxDiscountAmount('');
    setExpiryDate('');
    setUsageLimit('');
    setIsActive(true);
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: CouponItem) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setValue(c.value);
    setMinOrderAmount(c.minOrderAmount);
    setMaxDiscountAmount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '');
    setExpiryDate(c.expiryDate ? c.expiryDate.split('T')[0] : '');
    setUsageLimit(c.usageLimit ? String(c.usageLimit) : '');
    setIsActive(c.isActive);
    setDescription(c.description || '');
    setModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('رمز الكوبون مطلوب.', 'error');
      return;
    }

    const payload: CreateCouponPayload = {
      code: code.trim().toUpperCase(),
      discountType,
      value: Number(value),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount.trim() ? Number(maxDiscountAmount) : null,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      usageLimit: usageLimit.trim() ? Number(usageLimit) : null,
      isActive,
      description: description.trim() || undefined,
    };

    try {
      setSubmitting(true);
      if (editingCoupon) {
        await couponsApi.adminUpdate(editingCoupon.id, payload);
        showToast('تم تحديث الكوبون بنجاح ✓', 'success');
      } else {
        await couponsApi.adminCreate(payload);
        showToast('تم إنشاء الكوبون الجديد بنجاح 🎉', 'success');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الكوبون.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await couponsApi.adminToggleActive(id);
      setCoupons((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast(updated.isActive ? 'تم تفعيل الكوبون.' : 'تم تعطيل الكوبون.', 'info');
    } catch (err: any) {
      showToast(err.message || 'فشل تعديل حالة الكوبون.', 'error');
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الكوبون (${codeName})؟`)) return;
    try {
      await couponsApi.adminDelete(id);
      showToast('تم حذف الكوبون بنجاح.', 'info');
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الكوبون.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Tag size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900">إدارة الكوبونات وأكواد الخصم</h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                التحكم في العروض الترويجية، حدود الاستخدام، وإظهار أو إخفاء حقل الكوبون عن الزبائن
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-black flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-zinc-500' : ''} />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-black hover:bg-[#c40d00] text-white text-xs font-black flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            <Plus size={16} />
            <span>إضافة كود خصم</span>
          </button>
        </div>
      </div>

      {/* Visibility Master Switch Card */}
      <div className="bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-white p-6 rounded-3xl border border-amber-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-white text-amber-600 border border-amber-200 shadow-sm shrink-0">
            {showCouponField ? <Eye size={22} /> : <EyeOff size={22} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-zinc-900">
                إظهار حقل إدخال الكوبون للزبائن في السلة وصفحة الدفع
              </h2>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  showCouponField
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                }`}
              >
                {showCouponField ? 'ظاهر للزبائن ✓' : 'مخفي تماماً 🔒'}
              </span>
            </div>
            <p className="text-xs text-zinc-600 mt-1 max-w-xl leading-relaxed">
              عند تعطيل هذا الخيار، يتم إخفاء صندوق إدخال كود الخصم بالكامل عن الزوار والمشترين في صفحة السلة
              وصفحة إتمام الطلب لتفادي تشتت العميل.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleShowCouponField}
          disabled={updatingSettings}
          className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
            showCouponField
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-zinc-900 hover:bg-black text-white'
          }`}
        >
          {updatingSettings ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : showCouponField ? (
            <>
              <EyeOff size={16} />
              <span>إخفاء الحقل عن الزبائن</span>
            </>
          ) : (
            <>
              <Eye size={16} />
              <span>تفعيل وإظهار الحقل للزبائن</span>
            </>
          )}
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        {loading && coupons.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 font-bold">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-zinc-500" />
            جاري تحميل الكوبونات...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Tag size={36} className="mx-auto text-amber-400 mb-2" />
            <p className="font-black text-sm text-zinc-800">لا توجد أكواد خصم مضافة بعد.</p>
            <p className="text-xs text-zinc-400 mt-1">اضغط على زر "إضافة كود خصم" لإنشاء أول كود ترويجي.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-black">
                  <th className="p-4">كود الخصم</th>
                  <th className="p-4">نوع وقيمة الخصم</th>
                  <th className="p-4">الحد الأدنى للطلب</th>
                  <th className="p-4">مرات الاستخدام</th>
                  <th className="p-4">تاريخ الانتهاء</th>
                  <th className="p-4 text-center">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
                          {c.code}
                        </span>
                      </div>
                      {c.description && (
                        <div className="text-[11px] text-zinc-400 mt-1 max-w-[200px] truncate">
                          {c.description}
                        </div>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-black text-zinc-900">
                        {c.discountType === 'percentage' ? (
                          <>
                            <Percent size={14} className="text-amber-500" />
                            <span>خصم {c.value}%</span>
                            {c.maxDiscountAmount && (
                              <span className="text-[10px] text-zinc-400 font-normal">
                                (سقف {c.maxDiscountAmount} ر.س)
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <Coins size={14} className="text-emerald-500" />
                            <span>خصم ثابت {c.value} ر.س</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap text-zinc-700 font-bold">
                      {c.minOrderAmount > 0 ? `${c.minOrderAmount.toFixed(2)} ر.س` : 'بدون حد أدنى'}
                    </td>

                    <td className="p-4 whitespace-nowrap text-zinc-700">
                      <span className="font-black text-zinc-900">{c.timesUsed}</span>
                      {c.usageLimit ? (
                        <span className="text-zinc-400"> / {c.usageLimit} مرة</span>
                      ) : (
                        <span className="text-zinc-400"> (غير محدود)</span>
                      )}
                    </td>

                    <td className="p-4 whitespace-nowrap text-zinc-600">
                      {c.expiryDate ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <Calendar size={13} className="text-zinc-400" />
                          <span>{new Date(c.expiryDate).toLocaleDateString('ar-SA')}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">مستمر بدون انتهاء</span>
                      )}
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-colors ${
                          c.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {c.isActive ? 'مفعل ✓' : 'معطل ✕'}
                      </button>
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <h3 className="font-black text-sm text-zinc-900">
                {editingCoupon ? 'تعديل كود الخصم' : 'إضافة كود خصم جديد'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-full hover:bg-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-4 text-xs">
              {/* Code */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">رمز الكوبون (Code) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثال: WAHA15 أو WELCOME"
                  className="w-full font-mono uppercase font-black px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">نوع الخصم</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (ر.س)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">
                    قيمة الخصم {discountType === 'percentage' ? '(%)' : '(ر.س)'} *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-black focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">الحد الأدنى للطلب (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">سقف الخصم (اختياري)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="بدون سقف"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">حد مرات الاستخدام (اختياري)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="غير محدود"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-700 block mb-1">تاريخ الانتهاء (اختياري)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-zinc-700 block mb-1">وصف الكوبون (اختياري)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: خصم افتتاح المتجر 10% للطلبات فوق 50 ريال"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="couponActiveCheck" className="font-black text-zinc-800 cursor-pointer">
                  تفعيل الكوبون للعمل فوراً
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-[#c40d00] text-white font-black flex items-center gap-1.5"
                >
                  {submitting ? 'جاري الحفظ...' : editingCoupon ? 'حفظ التعديلات' : 'إنشاء الكوبون'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
