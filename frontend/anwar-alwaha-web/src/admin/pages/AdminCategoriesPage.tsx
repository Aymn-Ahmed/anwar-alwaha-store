import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  X,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Upload,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { Category } from '../../types/category.types';
import { CategoryCreateUpdate } from '../../types/admin.types';
import { CategoryTransferModal } from '../components/CategoryTransferModal';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSourceCategory, setTransferSourceCategory] = useState<Category | null>(null);

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryCreateUpdate>({
    title: '',
    description: '',
    icon: '📦',
    imageUrl: '',
    sortOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.categories.getAll();
      setCategories(data);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب الأقسام', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      title: '',
      description: '',
      icon: '📦',
      imageUrl: '',
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      title: cat.title,
      description: cat.description || '',
      icon: cat.icon || '📦',
      imageUrl: cat.imageUrl || '',
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleOpenTransfer = (cat: Category) => {
    setTransferSourceCategory(cat);
    setTransferModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('الحد الأقصى لحجم الصورة 2 ميجابايت', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const updated = [...categories];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    const withOrders = updated.map((c, idx) => ({ ...c, sortOrder: idx + 1 }));
    setCategories(withOrders);

    try {
      setReordering(true);
      await adminApi.categories.reorder(
        withOrders.map((c) => ({ id: c.id, sortOrder: c.sortOrder }))
      );
      showToast('تم حفظ ترتيب الأقسام', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الترتيب', 'error');
      fetchCategories();
    } finally {
      setReordering(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('اسم القسم مطلوب', 'error');
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        await adminApi.categories.update(editingCategory.id, formData);
        showToast('تم تعديل القسم بنجاح', 'success');
      } else {
        await adminApi.categories.create(formData);
        showToast('تمت إضافة القسم بنجاح', 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ القسم', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف/تعطيل القسم "${title}"؟`)) return;

    try {
      await adminApi.categories.delete(id);
      showToast(`تم حذف/تعطيل القسم "${title}" بنجاح`, 'success');
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف القسم', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة أقسام وتصنيفات المتجر</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            إجمالي الأقسام: {categories.length} قسماً — يمكنك تعديل الصورة والوصف الفرعي وإعادة الترتيب بسهولة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading || reordering ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>إضافة قسم جديد</span>
          </button>
        </div>
      </div>

      {/* Categories Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-gray-900 rounded-2xl h-44 animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  {/* Circular Image or Icon */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                      {cat.imageUrl ? (
                        <img src={cat.imageUrl} alt={cat.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{cat.icon || '📦'}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-gray-500">#{cat.sortOrder}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {cat.isActive ? 'نشط' : 'معطل'}
                    </span>
                    <span className="text-xs bg-brand-950 text-brand-300 border border-brand-800 font-bold px-2.5 py-0.5 rounded-full">
                      {cat.productsCount} صنف
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white">{cat.title}</h3>
                  {cat.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenTransfer(cat)}
                  className="bg-sky-950/70 hover:bg-sky-900 text-sky-300 border border-sky-800/60 text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <ArrowRightLeft size={13} />
                  <span>نقل الأصناف</span>
                </button>

                <div className="flex items-center gap-1">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    disabled={idx === 0 || reordering}
                    onClick={() => handleMove(idx, -1)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg disabled:opacity-25 transition-colors"
                    title="تقديم للأعلى"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === categories.length - 1 || reordering}
                    onClick={() => handleMove(idx, 1)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg disabled:opacity-25 transition-colors"
                    title="تأخير للأسفل"
                  >
                    <ArrowDown size={14} />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="تعديل القسم"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.title)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Split View Category Transfer Modal */}
      <CategoryTransferModal
        sourceCategory={transferSourceCategory}
        categories={categories}
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onTransferred={fetchCategories}
      />

      {/* Create / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-black text-sm text-white">
                {editingCategory ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              {/* Live Circular Preview */}
              <div className="flex flex-col items-center gap-2 py-2 bg-gray-950/60 rounded-2xl border border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{formData.icon || '📦'}</span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-gray-300">
                  {formData.title || 'معاينة القسم'}
                </span>
                {formData.description && (
                  <span className="text-[10px] text-gray-500 px-4 text-center line-clamp-1">
                    {formData.description}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">
                  اسم القسم <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: الدفاتر والمذكرات"
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-300 font-bold">الوصف الفرعي (يظهر تحت الاسم في المتجر)</label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="مثال: كروت زواج وتخرج، مذكرات وملازم PDF..."
                  className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Category Image URL + Local Upload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300 font-bold">صورة القسم (رابط أو رفع مباشر)</label>
                  <label className="cursor-pointer text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                    <Upload size={12} />
                    <span>رفع صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                  />
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="px-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-xl"
                      title="إزالة الصورة"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">الأيقونة الاحتياطية (إيموجي)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📓"
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500 text-center text-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">ترتيب الظهور</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="catActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <label htmlFor="catActiveToggle" className="text-gray-300 font-bold cursor-pointer">
                  تفعيل القسم وظهوره في المتجر للعملاء
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
