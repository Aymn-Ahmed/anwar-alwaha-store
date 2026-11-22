import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { DashboardStats } from '../../types/admin.types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.dashboard.getStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">لوحة الإحصائيات والمؤشرات</h1>
          <p className="text-xs text-gray-400 mt-0.5">نظرة عامة على مبيعات وأداء متجر مكتبة أنوار الواحة</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>
          <Link
            to="/admin/products"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-colors"
          >
            <Plus size={15} />
            <span>إضافة صنف</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">إجمالي المبيعات المعتمدة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {stats ? stats.totalSales.toFixed(2) : '0.00'} <span className="text-xs text-gray-400 font-semibold">ر.س</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">مدفوعات مؤكدة عبر مويسر والفرع</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">إجمالي الطلبات</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{stats?.totalOrders || 0}</div>
            <p className="text-[11px] text-gray-500 mt-1">كافة الطلبات المسجلة بالنظام</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">طلبات قيد المتابعة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-400">{stats?.pendingOrders || 0}</div>
            <Link to="/admin/orders?status=pending" className="text-[11px] text-amber-500/80 hover:underline flex items-center gap-1 mt-1">
              <span>استعراض الطلبات المعلقة</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">تنبيهات انخفاض المخزون</span>
            <div className="w-9 h-9 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-red-400">{stats?.lowStockProductsCount || 0}</div>
            <p className="text-[11px] text-gray-500 mt-1">أصناف متبقي منها 5 قطع أو أقل</p>
          </div>
        </div>
      </div>

      {/* Catalog Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-800 text-brand-400 rounded-xl">
              <Package size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold">إجمالي المنتجات المفعلة</div>
              <div className="text-lg font-black text-white">{stats?.totalProducts || 0} صنف</div>
            </div>
          </div>
          <Link to="/admin/products" className="text-xs font-bold text-brand-400 hover:underline">
            إدارة الأصناف ←
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-800 text-sky-400 rounded-xl">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-bold">إجمالي الأقسام النشطة</div>
              <div className="text-lg font-black text-white">{stats?.totalCategories || 0} قسم</div>
            </div>
          </div>
          <Link to="/admin/categories" className="text-xs font-bold text-sky-400 hover:underline">
            إدارة الأقسام والنقل ←
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-400" />
            <h3 className="font-extrabold text-sm text-white">أحدث طلبات الشراء الواردة</h3>
          </div>
          <Link to="/admin/orders" className="text-xs font-bold text-brand-400 hover:underline">
            عرض كافة الطلبات
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-gray-950/60 text-gray-400 uppercase text-[11px] border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">كود الطلب</th>
                <th className="py-3 px-4">اسم العميل</th>
                <th className="py-3 px-4">الهاتف</th>
                <th className="py-3 px-4">طريقة الاستلام</th>
                <th className="py-3 px-4">الإجمالي</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{ord.orderCode}</td>
                    <td className="py-3.5 px-4 text-gray-300 font-semibold">{ord.customerName}</td>
                    <td className="py-3.5 px-4 text-gray-400" dir="ltr">{ord.customerPhone || '-'}</td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {ord.deliveryMethod === 'branch' ? 'استلام من الفرع' : 'توصيل'}
                    </td>
                    <td className="py-3.5 px-4 font-black text-brand-400">{ord.totalAmount.toFixed(2)} ر.س</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ord.status === 'processing' || ord.status === 'paid'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : ord.status === 'cancelled'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {new Date(ord.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    لا توجد طلبات مسجلة حديثاً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
