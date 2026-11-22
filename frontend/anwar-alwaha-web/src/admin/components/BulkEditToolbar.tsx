import React, { useState } from 'react';
import { Layers, DollarSign, Package, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { Category } from '../../types/category.types';
import { BulkProductUpdateItem } from '../../types/admin.types';

interface BulkEditToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  categories: Category[];
  onApplyBulk: (items: BulkProductUpdateItem[]) => Promise<void>;
  onClearSelection: () => void;
}

export const BulkEditToolbar: React.FC<BulkEditToolbarProps> = ({
  selectedCount,
  selectedIds,
  categories,
  onApplyBulk,
  onClearSelection,
}) => {
  const [targetCategory, setTargetCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [clearOldPrice, setClearOldPrice] = useState(false);
  const [newStock, setNewStock] = useState('');
  const [newIsActive, setNewIsActive] = useState<string>('');
  const [applying, setApplying] = useState(false);

  if (selectedCount === 0) return null;

  const handleApply = async () => {
    const items: BulkProductUpdateItem[] = selectedIds.map((id) => ({
      id,
      price: newPrice ? parseFloat(newPrice) : undefined,
      oldPrice: newOldPrice ? parseFloat(newOldPrice) : undefined,
      clearOldPrice: clearOldPrice || undefined,
      categoryId: targetCategory || undefined,
      stockQuantity: newStock ? parseInt(newStock, 10) : undefined,
      isActive: newIsActive !== '' ? newIsActive === 'true' : undefined,
    }));

    setApplying(true);
    try {
      await onApplyBulk(items);
      // Reset form fields
      setTargetCategory('');
      setNewPrice('');
      setNewOldPrice('');
      setClearOldPrice(false);
      setNewStock('');
      setNewIsActive('');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 max-w-4xl mx-auto z-40 bg-gray-900/95 backdrop-blur-xl border border-gray-700/80 shadow-2xl rounded-2xl p-4 text-white animate-in slide-in-from-bottom-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-brand-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">
            {selectedCount}
          </span>
          <span className="text-xs font-bold text-gray-200">أصناف محددة للتعديل السريع الجماعي (Bulk Edit)</span>
        </div>

        <button
          onClick={onClearSelection}
          className="text-gray-400 hover:text-white text-xs flex items-center gap-1 font-semibold"
        >
          <X size={14} />
          <span>إلغاء التحديد</span>
        </button>
      </div>

      {/* Bulk Inputs Form */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {/* Set Target Category */}
        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">نقل لقسم:</label>
          <select
            value={targetCategory}
            onChange={(e) => setTargetCategory(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">(بدون تغيير)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Set Price */}
        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">تحديد سعر جديد:</label>
          <input
            type="number"
            step="0.01"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="السعر (ر.س)"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Set Old Price */}
        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">سعر قبل الخصم:</label>
          <input
            type="number"
            step="0.01"
            disabled={clearOldPrice}
            value={newOldPrice}
            onChange={(e) => setNewOldPrice(e.target.value)}
            placeholder="السابق (ر.س)"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-brand-500 disabled:opacity-40"
          />
        </div>

        {/* Set Stock */}
        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">تعديل المخزون:</label>
          <input
            type="number"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            placeholder="الكمية"
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Active Toggle */}
        <div>
          <label className="text-[10px] text-gray-400 font-bold block mb-1">حالة التفعيل:</label>
          <select
            value={newIsActive}
            onChange={(e) => setNewIsActive(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-2 text-xs focus:outline-none focus:border-brand-500"
          >
            <option value="">(بدون تغيير)</option>
            <option value="true">مفعل للبيع</option>
            <option value="false">معطل / مخفي</option>
          </select>
        </div>

        {/* Apply Button */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-extrabold p-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-md shadow-brand-600/25 transition-all disabled:opacity-50"
          >
            <Check size={14} />
            <span>{applying ? 'جاري التطبيق...' : 'تنفيذ التعديل'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
