import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Store,
  XCircle,
  RefreshCw,
  X,
  FileText,
  MapPin,
  Copy,
  Check,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { OrderAdminSummary } from '../../types/admin.types';
import { OrderResponse } from '../../types/order.types';
import { useToast } from '../../context/ToastContext';

export const AdminOrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrderAdminSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Real-time Search & Quick Copy States
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string | undefined | null, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  // Selected Order for Detail Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const selectedStatus = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 20;

  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await adminApi.orders.getAll({
        status: selectedStatus || undefined,
        page,
        pageSize,
      });
      setOrders(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleOpenDetail = async (id: string) => {
    setSelectedOrderId(id);
    try {
      setLoadingDetail(true);
      const ord = await adminApi.orders.getById(id);
      setSelectedOrderDetail(ord);
      if (ord) {
        setNewStatus(ord.status);
        setAdminNotes(ord.adminNotes || '');
      }
    } catch (err: any) {
      showToast(err.message || 'فشل جلب تفاصيل الطلب', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSaveOrderStatus = async () => {
    if (!selectedOrderId || !newStatus) return;

    try {
      setSavingStatus(true);
      await adminApi.orders.updateStatus(selectedOrderId, {
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined,
      });
      showToast('تم تحديث حالة الطلب وملاحظات الإدارة بنجاح', 'success');
      setSelectedOrderId(null);
      setSelectedOrderDetail(null);
      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'فشل تحديث حالة الطلب', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (ord.orderCode || '').toLowerCase().includes(q) ||
      (ord.customerName || '').toLowerCase().includes(q) ||
      (ord.customerPhone || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة ومتابعة طلبات الشراء</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            إجمالي الطلبات: {totalCount} طلب مسجل بالنظام
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors self-start sm:self-auto"
          title="تحديث"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Real-time Search Filter Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث فوري برقم الطلب (AW-...)، اسم العميل، أو رقم الجوال..."
            className="w-full bg-gray-950 border border-gray-800 text-white pr-9 pl-4 py-2.5 rounded-xl text-xs placeholder:text-gray-500 focus:outline-none focus:border-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs bg-gray-800 px-1.5 py-0.5 rounded"
            >
              مسح
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="text-[11px] font-bold text-brand-400 shrink-0">
            تم العثور على ({filteredOrders.length}) طلب
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { key: '', label: 'كافة الطلبات' },
          { key: 'pending', label: 'المعلقة (جديدة)' },
          { key: 'processing', label: 'قيد التجهيز / مدفوعة' },
          { key: 'ready', label: 'جاهز للاستلام' },
          { key: 'shipping', label: 'جاري التوصيل' },
          { key: 'delivered', label: 'تم التسليم' },
          { key: 'cancelled', label: 'ملغية' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => updateParam('status', tab.key)}
            className={`shrink-0 font-bold px-3.5 py-2 rounded-xl transition-all ${
              selectedStatus === tab.key
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-gray-950/70 text-gray-400 uppercase text-[11px] border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">كود الطلب</th>
                <th className="py-3 px-4">اسم العميل</th>
                <th className="py-3 px-4">رقم الجوال</th>
                <th className="py-3 px-4">طريقة الاستلام</th>
                <th className="py-3 px-4">الأصناف</th>
                <th className="py-3 px-4">المبلغ الإجمالي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4 text-center">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                    <span>جاري تحميل الطلبات...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    {searchQuery ? 'لا توجد نتائج مطابقة لبحثك' : 'لا توجد طلبات مسجلة بهذه الحالة'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.orderCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ord.orderCode, `code-${ord.id}`)}
                          className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                          title="نسخ كود الطلب"
                        >
                          {copiedId === `code-${ord.id}` ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check size={11} />
                              <span>تم</span>
                            </span>
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-200 font-bold">{ord.customerName}</td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono" dir="ltr">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>{ord.customerPhone || '-'}</span>
                        {ord.customerPhone && (
                          <button
                            type="button"
                            onClick={() => handleCopy(ord.customerPhone, `phone-${ord.id}`)}
                            className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                            title="نسخ رقم الجوال"
                          >
                            {copiedId === `phone-${ord.id}` ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                                <Check size={11} />
                              </span>
                            ) : (
                              <Copy size={11} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {ord.deliveryMethod === 'branch' ? (
                        <span className="flex items-center gap-1"><Store size={13} /> استلام الفرع</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sky-400">
                          <Truck size={13} /> توصيل
                          {(ord.googleMapsUrl || (ord.customerLocationLat && ord.customerLocationLng)) && (
                            <a
                              href={ord.googleMapsUrl || `https://www.google.com/maps?q=${ord.customerLocationLat},${ord.customerLocationLng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="فتح موقع العميل على خرائط Google"
                              className="text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 p-1 rounded-md border border-emerald-800"
                            >
                              <MapPin size={12} />
                            </a>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-bold">{ord.itemsCount} صنف</td>
                    <td className="py-3.5 px-4 font-black text-brand-400 text-sm">
                      {ord.totalAmount.toFixed(2)} ر.س
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : ord.status === 'processing' || ord.status === 'paid'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : ord.status === 'ready'
                              ? 'bg-purple-950 text-purple-400 border border-purple-800'
                              : ord.status === 'cancelled'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ord.status, `status-${ord.id}`)}
                          className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
                          title="نسخ حالة الطلب"
                        >
                          {copiedId === `status-${ord.id}` ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <Check size={10} />
                            </span>
                          ) : (
                            <Copy size={10} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(ord.id)}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
                        title="عرض تفاصيل الطلب"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Status Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] text-gray-400 font-bold">تفاصيل الطلب الكاملة</span>
                <h3 className="font-mono font-black text-lg text-white">
                  {selectedOrderDetail?.orderCode || 'جاري التحميل...'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDetail || !selectedOrderDetail ? (
              <div className="py-12 text-center text-gray-500">جاري جلب الفاتورة...</div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* Customer Info */}
                <div className="bg-gray-950/60 p-4 rounded-2xl border border-gray-800 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-500 block mb-0.5">اسم العميل:</span>
                    <span className="font-bold text-white text-sm">{selectedOrderDetail.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">رقم الجوال:</span>
                    <span className="font-mono font-bold text-white text-sm" dir="ltr">
                      {selectedOrderDetail.customerPhone || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">طريقة الاستلام:</span>
                    <span className="font-bold text-gray-200">
                      {selectedOrderDetail.deliveryMethod === 'branch' ? 'استلام من الفرع' : 'توصيل'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-0.5">العنوان:</span>
                    <span className="font-bold text-gray-200">{selectedOrderDetail.customerAddress || '-'}</span>
                  </div>
                  {(selectedOrderDetail.googleMapsUrl || (selectedOrderDetail.customerLocationLat && selectedOrderDetail.customerLocationLng)) && (
                    <div className="col-span-2 pt-2 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-gray-400 text-[11px]">موقع العميل محدد عبر GPS (الخريطة):</span>
                      <a
                        href={selectedOrderDetail.googleMapsUrl || `https://www.google.com/maps?q=${selectedOrderDetail.customerLocationLat},${selectedOrderDetail.customerLocationLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs hover:bg-emerald-600/30 transition-all"
                      >
                        <MapPin size={13} />
                        <span>فتح الموقع في Google Maps 🗺️</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Items Snapshot */}
                <div className="space-y-2">
                  <h4 className="font-bold text-gray-300">محتويات الطلب ({selectedOrderDetail.items.length} صنف):</h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedOrderDetail.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-800/60 rounded-xl border border-gray-700/60 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-white">{item.productName}</p>
                          <p className="text-[10px] text-gray-400">
                            الكمية: {item.quantity} × {item.unitPrice.toFixed(2)} ر.س
                          </p>
                          {item.itemNotes && (
                            <p className="text-[10px] text-amber-400 mt-0.5">ملاحظة: {item.itemNotes}</p>
                          )}
                        </div>
                        <span className="font-black text-brand-400">{item.lineTotal.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm font-black text-white pt-2 border-t border-gray-800">
                    <span>الإجمالي:</span>
                    <span className="text-brand-400 text-base">{selectedOrderDetail.totalAmount.toFixed(2)} ر.س</span>
                  </div>
                </div>

                {/* Status Update Form */}
                <div className="space-y-3 pt-3 border-t border-gray-800">
                  <h4 className="font-bold text-gray-300">تحديث مرحلة الطلب وملاحظات الإدارة:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-gray-400">حالة الطلب:</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl font-bold focus:outline-none focus:border-brand-500"
                      >
                        <option value="pending">معلق (Pending)</option>
                        <option value="processing">قيد التجهيز / مدفوع (Processing)</option>
                        <option value="ready">جاهز للاستلام (Ready)</option>
                        <option value="shipping">جاري التوصيل (Shipping)</option>
                        <option value="delivered">تم التسليم (Delivered)</option>
                        <option value="cancelled">ملغي (Cancelled)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400">ملاحظات الإدارة الداخلية:</label>
                      <input
                        type="text"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="أي تفاصيل خاصة بالشحن أو السداد..."
                        className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                      >
                      </input>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveOrderStatus}
                    disabled={savingStatus}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black disabled:opacity-50"
                  >
                    {savingStatus ? 'جاري التحديث...' : 'حفظ حالة الطلب'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
