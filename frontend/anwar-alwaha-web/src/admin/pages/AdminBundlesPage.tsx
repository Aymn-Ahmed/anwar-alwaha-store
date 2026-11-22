import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { ProductBundle } from '../../types/bundle.types';
import { useToast } from '../../context/ToastContext';

export const AdminBundlesPage: React.FC = () => {
  const [bundles, setBundles] = useState<ProductBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const data = await adminApi.bundles.getAll();
      setBundles(data);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب الباقات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف/تعطيل الباقة "${title}"؟`)) return;

    try {
      await adminApi.bundles.delete(id);
      showToast(`تم حذف الباقة بنجاح`, 'success');
      fetchBundles();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الباقة', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة باقات وعروض التوفير</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            تجميع عدة منتجات في باقة ترويجية بسعر مخفض
          </p>
        </div>

        <button
          onClick={fetchBundles}
          className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors self-start sm:self-auto"
          title="تحديث"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-gray-900 border border-gray-800 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
          لا توجد باقات مسجلة حالياً
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 bg-gray-800 rounded-xl">🎁</span>
                  {bundle.badge && (
                    <span className="bg-gold-500/20 text-gold-400 border border-gold-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {bundle.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-black text-base text-white">{bundle.title}</h3>
                  {bundle.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {bundle.description}
                    </p>
                  )}
                </div>

                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-lg font-black text-brand-400">
                    {bundle.bundlePrice.toFixed(2)} ر.س
                  </span>
                  {bundle.originalPrice && (
                    <span className="text-xs text-gray-500 line-through">
                      {bundle.originalPrice.toFixed(2)} ر.س
                    </span>
                  )}
                </div>

                {bundle.items && bundle.items.length > 0 && (
                  <div className="pt-2 border-t border-gray-800/80 space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold block">محتويات الباقة:</span>
                    <ul className="text-xs text-gray-400 space-y-0.5">
                      {bundle.items.map((i) => (
                        <li key={i.productId} className="flex items-center justify-between">
                          <span className="truncate max-w-[180px]">{i.productName}</span>
                          <span className="font-mono text-[11px] text-gray-500">× {i.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-800 flex items-center justify-end">
                <button
                  onClick={() => handleDelete(bundle.id, bundle.title)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                  title="حذف الباقة"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
