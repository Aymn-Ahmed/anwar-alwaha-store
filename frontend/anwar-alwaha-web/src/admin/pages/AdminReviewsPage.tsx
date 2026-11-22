import React, { useState, useEffect } from 'react';
import { Star, Check, Trash2, RefreshCw, MessageSquare } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { ProductReview } from '../../types/review.types';
import { useToast } from '../../context/ToastContext';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterApproved, setFilterApproved] = useState<boolean | undefined>(undefined);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminApi.reviews.getAll({
        isApproved: filterApproved,
        pageSize: 50,
      });
      setReviews(res.items);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب التقييمات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterApproved]);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.reviews.approve(id);
      showToast('تمت الموافقة على التقييم ونشره في المتجر', 'success');
      fetchReviews();
    } catch (err: any) {
      showToast(err.message || 'فشل اعتماد التقييم', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;

    try {
      await adminApi.reviews.delete(id);
      showToast('تم حذف التقييم بنجاح', 'success');
      fetchReviews();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف التقييم', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة واعتماد تقييمات المشترين</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            مراجعة آراء وتقييمات العملاء للمنتجات والخدمات
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors self-start sm:self-auto"
          title="تحديث"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterApproved(undefined)}
          className={`font-bold px-4 py-2 rounded-xl transition-all ${
            filterApproved === undefined
              ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          كافة التقييمات
        </button>
        <button
          onClick={() => setFilterApproved(false)}
          className={`font-bold px-4 py-2 rounded-xl transition-all ${
            filterApproved === false
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          المعلقة فقط (بانتظار الموافقة)
        </button>
        <button
          onClick={() => setFilterApproved(true)}
          className={`font-bold px-4 py-2 rounded-xl transition-all ${
            filterApproved === true
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          المعتمدة والمنشورة
        </button>
      </div>

      {/* Reviews Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-gray-950/70 text-gray-400 uppercase text-[11px] border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">المنتج</th>
                <th className="py-3 px-4">كود الطلب</th>
                <th className="py-3 px-4">اسم العميل</th>
                <th className="py-3 px-4">التقييم</th>
                <th className="py-3 px-4">التعليق</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">التاريخ</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-2" />
                    <span>جاري تحميل التقييمات...</span>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    لا توجد تقييمات مسجلة بهذه الفئة
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {rev.productName || rev.productId}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-400">
                      {rev.orderCode}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-semibold">{rev.customerName}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <span>{rev.rating}</span>
                        <span>⭐</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 max-w-sm truncate">
                      {rev.comment || <span className="text-gray-500">(بدون تعليق نصي)</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rev.isApproved
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {rev.isApproved ? 'معتمد ومنشور' : 'معلق للمراجعة'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(rev.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {!rev.isApproved && (
                          <button
                            onClick={() => handleApprove(rev.id)}
                            className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg transition-colors flex items-center gap-1 font-bold text-[10px]"
                            title="اعتماد ونشر"
                          >
                            <Check size={13} />
                            <span>موافقة</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
