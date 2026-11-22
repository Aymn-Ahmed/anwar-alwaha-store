import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Layers, Check, Search, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { Category } from '../../types/category.types';
import { Product } from '../../types/product.types';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

interface CategoryTransferModalProps {
  sourceCategory: Category | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onTransferred: () => void;
}

export const CategoryTransferModal: React.FC<CategoryTransferModalProps> = ({
  sourceCategory,
  categories,
  isOpen,
  onClose,
  onTransferred,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const { showToast } = useToast();

  const otherCategories = categories.filter((c) => c.id !== sourceCategory?.id);

  useEffect(() => {
    if (otherCategories.length > 0 && !targetCategoryId) {
      setTargetCategoryId(otherCategories[0].id);
    }
  }, [otherCategories, targetCategoryId]);

  useEffect(() => {
    if (!sourceCategory || !isOpen) return;

    let isMounted = true;
    setLoading(true);
    setSelectedIds([]);

    adminApi.products.getAll({ categoryId: sourceCategory.id, pageSize: 100 })
      .then((res) => {
        if (isMounted) {
          setProducts(res.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [sourceCategory, isOpen]);

  if (!isOpen || !sourceCategory) return null;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExecuteTransfer = async () => {
    if (selectedIds.length === 0) {
      showToast('يرجى اختيار صنف واحد على الأقل للنقل', 'error');
      return;
    }
    if (!targetCategoryId) {
      showToast('يرجى اختيار القسم الهدف', 'error');
      return;
    }

    try {
      setTransferring(true);
      const count = await adminApi.categories.transferProducts({
        targetCategoryId,
        productIds: selectedIds,
      });

      const targetCat = categories.find((c) => c.id === targetCategoryId);
      showToast(
        `تم نقل ${count} منتج بنجاح إلى قسم "${targetCat?.title || targetCategoryId}"!`,
        'success'
      );
      onTransferred();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'فشل نقل الأصناف', 'error');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-400" />
            <h3 className="font-extrabold text-sm text-white">
              نافذة النقل المزدوج للأصناف بين الأقسام (Split-View)
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Split View Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-gray-800 overflow-y-auto flex-1">
          {/* Right Column: Source Category Products */}
          <div className="p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] text-gray-400 font-bold">القسم المصدر (الحالي)</span>
                <h4 className="font-black text-sm text-white flex items-center gap-1.5 mt-0.5">
                  <span>{sourceCategory.icon || '📦'}</span>
                  <span>{sourceCategory.title}</span>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-bold">
                    {products.length} صنف
                  </span>
                </h4>
              </div>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs text-brand-400 hover:underline font-bold flex items-center gap-1"
              >
                {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                  <>
                    <CheckSquare size={14} />
                    <span>إلغاء التحديد</span>
                  </>
                ) : (
                  <>
                    <Square size={14} />
                    <span>تحديد الكل ({filteredProducts.length})</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="تصفية أصناف هذا القسم..."
                className="w-full bg-gray-800 border border-gray-700 text-white text-xs pr-8 pl-3 py-2 rounded-xl focus:outline-none focus:border-brand-500"
              />
              <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Products Selection List */}
            <div className="space-y-1.5 overflow-y-auto max-h-80 flex-1 pr-1">
              {loading ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-brand-500" />
                  <p className="text-xs">جاري تحميل الأصناف...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">لا توجد منتجات مسجلة في هذا القسم</p>
              ) : (
                filteredProducts.map((prod) => {
                  const isChecked = selectedIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleToggleOne(prod.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                        isChecked
                          ? 'bg-brand-950/40 border-brand-600 text-white'
                          : 'bg-gray-800/40 border-gray-700/60 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gray-700 overflow-hidden shrink-0 flex items-center justify-center">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <span className="font-bold truncate">{prod.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-black text-brand-400">
                          {prod.price.toFixed(2)} ر.س
                        </span>
                        {isChecked ? (
                          <CheckSquare size={16} className="text-brand-500" />
                        ) : (
                          <Square size={16} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Left Column: Destination Target & Transfer Action */}
          <div className="p-5 flex flex-col justify-between space-y-6 bg-gray-950/30">
            <div className="space-y-4">
              <div className="border-b border-gray-800 pb-3">
                <span className="text-[10px] text-gray-400 font-bold">القسم المستهدف (الوجهة الجديدة)</span>
                <h4 className="font-black text-sm text-white mt-0.5">اختر القسم لنقل الأصناف إليه</h4>
              </div>

              {/* Destination Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">القسم الجديد:</label>
                <select
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-brand-500 font-bold"
                >
                  {otherCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon || '📦'} {c.title} ({c.productsCount} صنف)
                    </option>
                  ))}
                </select>
              </div>

              {/* Transfer Details Card */}
              <div className="bg-gray-800/60 p-4 rounded-2xl border border-gray-700/60 text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span>الأصناف المحددة للنقل:</span>
                  <span className="font-black text-brand-400">{selectedIds.length} صنف</span>
                </div>
                <div className="flex items-center justify-between text-gray-400">
                  <span>القسم المصدر:</span>
                  <span className="font-bold text-gray-200">{sourceCategory.title}</span>
                </div>
                <div className="flex items-center justify-between text-gray-400 pt-1 border-t border-gray-700">
                  <span>القسم الهدف:</span>
                  <span className="font-bold text-emerald-400">
                    {categories.find((c) => c.id === targetCategoryId)?.title}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                * عند تنفيذ النقل، ستُحدّث قاعدة البيانات تلقائياً وتُنقل كافة الأصناف المحددة إلى القسم الهدف مع تحديث عدادات الأقسام فوراً دون تأثر المبيعات السابقة.
              </p>
            </div>

            {/* Execute Button */}
            <div className="pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={transferring || selectedIds.length === 0}
                className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-black py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 active:scale-95 transition-all disabled:opacity-40"
              >
                <ArrowLeft size={16} />
                <span>
                  {transferring
                    ? 'جاري نقل الأصناف...'
                    : `نقل ${selectedIds.length} صنف إلى القسم المحدد`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
