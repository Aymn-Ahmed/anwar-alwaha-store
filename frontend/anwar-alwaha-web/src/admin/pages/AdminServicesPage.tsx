import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, RefreshCw, Upload, Film } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { ServiceItem } from '../../types/service.types';
import { Category } from '../../types/category.types';
import { ServiceCreateUpdate } from '../../types/admin.types';
import { ServiceIcon, SERVICE_ICON_OPTIONS } from '../../components/common/ServiceIcon';
import { UniversalMediaEmbedder } from '../../components/common/UniversalMediaEmbedder';
import { useToast } from '../../context/ToastContext';

const ACCENT_PRESETS = [
  '#0284c7', // Sky
  '#f59e0b', // Amber
  '#6366f1', // Indigo
  '#e11d48', // Rose
  '#10b981', // Emerald
  '#f97316', // Orange
  '#c40d00', // Red
  '#111111', // Black
];

const MEDIA_TYPES = [
  { value: 'tiktok', label: 'فيديو تيك توك (TikTok)' },
  { value: 'youtube', label: 'فيديو يوتيوب (YouTube / Shorts)' },
  { value: 'video', label: 'فيديو مباشر (MP4 / WebM)' },
  { value: 'image', label: 'صورة / معرض صور (Image)' },
  { value: 'none', label: 'بدون وسائط' },
];

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ServiceCreateUpdate>({
    title: '',
    description: '',
    iconName: 'printer',
    accentColor: '#0284c7',
    mediaType: 'tiktok',
    mediaUrl: '',
    linkedCategoryId: '',
    whatsAppTemplate: '',
    sortOrder: 0,
    isActive: true,
  });

  const { showToast } = useToast();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [srvs, cats] = await Promise.all([
        adminApi.services.getAll(),
        adminApi.categories.getAll(),
      ]);
      setServices(srvs);
      setCategories(cats);
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب الخدمات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      iconName: 'printer',
      accentColor: '#0284c7',
      mediaType: 'tiktok',
      mediaUrl: '',
      linkedCategoryId: '',
      whatsAppTemplate: '',
      sortOrder: services.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setFormData({
      title: srv.title,
      description: srv.description || '',
      iconName: srv.iconName || 'zap',
      accentColor: srv.accentColor || '#0284c7',
      mediaType: srv.mediaType || 'none',
      mediaUrl: srv.mediaUrl || '',
      linkedCategoryId: srv.linkedCategoryId || '',
      whatsAppTemplate: srv.whatsAppTemplate || '',
      sortOrder: srv.sortOrder,
      isActive: srv.isActive,
    });
    setModalOpen(true);
  };

  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('الحد الأقصى لحجم الملف 5 ميجابايت', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const isVideo = file.type.startsWith('video/');
        setFormData((prev) => ({
          ...prev,
          mediaType: isVideo ? 'video' : 'image',
          mediaUrl: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('اسم الخدمة مطلوب', 'error');
      return;
    }

    const payload: ServiceCreateUpdate = {
      ...formData,
      linkedCategoryId: formData.linkedCategoryId || undefined,
      mediaUrl: formData.mediaType === 'none' ? undefined : formData.mediaUrl?.trim() || undefined,
    };

    try {
      setSaving(true);
      if (editingService) {
        await adminApi.services.update(editingService.id, payload);
        showToast('تم تحديث الخدمة بنجاح', 'success');
      } else {
        await adminApi.services.create(payload);
        showToast('تمت إضافة الخدمة بنجاح', 'success');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الخدمة', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الخدمة "${title}"؟`)) return;
    try {
      await adminApi.services.delete(id);
      showToast('تم حذف الخدمة بنجاح', 'success');
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف الخدمة', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة الخدمات وعارض الوسائط</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            تحكم بالدوائر التعريفية للخدمات ووسائط العرض (TikTok، YouTube، فيديو، صور) مع معاينة فورية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>إضافة خدمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-gray-900 rounded-2xl h-44 animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => {
            const color = srv.accentColor || '#0284c7';
            return (
              <div
                key={srv.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 p-5 rounded-2xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${color}20`,
                        border: `2px solid ${color}`,
                      }}
                    >
                      <ServiceIcon iconName={srv.iconName} size={24} color={color} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 border border-gray-700 uppercase">
                        {srv.mediaType || 'none'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          srv.isActive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-gray-800 text-gray-500'
                        }`}
                      >
                        {srv.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-white">{srv.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{srv.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-mono">الترتيب: #{srv.sortOrder}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                      title="تعديل"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id, srv.title)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Service Modal with Live Media Preview */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Film size={16} className="text-brand-400" />
                <span>{editingService ? 'تعديل الخدمة ووسائط العرض' : 'إضافة خدمة جديدة'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              {/* Right Side: Form Controls */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">
                    عنوان الخدمة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: الطباعة الإعلانية والاستكرات"
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">وصف الخدمة</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="تفاصيل الخدمة التي ستظهر أسفل الوسائط..."
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Color & Icon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-gray-300 font-bold">لون الدائرة</label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ACCENT_PRESETS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({ ...formData, accentColor: c })}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            formData.accentColor === c ? 'border-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-7 h-7 rounded bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-300 font-bold">الأيقونة</label>
                    <select
                      value={formData.iconName}
                      onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                    >
                      {SERVICE_ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Media Type & URL/Upload */}
                <div className="space-y-2 p-3.5 bg-gray-950/60 border border-gray-800 rounded-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-gray-200 font-black">نوع الوسائط</label>
                    <label className="cursor-pointer text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1">
                      <Upload size={12} />
                      <span>رفع صورة/فيديو</span>
                      <input
                        type="file"
                        accept="image/*,video/mp4,video/webm"
                        onChange={handleMediaFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  >
                    {MEDIA_TYPES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  {formData.mediaType !== 'none' && (
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[11px]">
                        الرابط (أو عدة روابط — كل رابط في سطر مستقل لإنشاء معرض تنقل)
                      </label>
                      <textarea
                        rows={3}
                        dir="ltr"
                        value={formData.mediaUrl || ''}
                        onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                        placeholder={
                          formData.mediaType === 'tiktok'
                            ? 'https://www.tiktok.com/@user/video/7352345678901234567'
                            : formData.mediaType === 'youtube'
                            ? 'https://youtube.com/watch?v=... أو https://youtube.com/shorts/...'
                            : 'https://...'
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500 font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>

                {/* Linked Category, SortOrder, WhatsApp Template */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-gray-300 font-bold">ربط بقسم (اختياري)</label>
                    <select
                      value={formData.linkedCategoryId || ''}
                      onChange={(e) => setFormData({ ...formData, linkedCategoryId: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl"
                    >
                      <option value="">بدون ربط</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-300 font-bold">ترتيب الظهور</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-300 font-bold">نص رسالة واتساب الجاهزة (اختياري)</label>
                  <input
                    type="text"
                    value={formData.whatsAppTemplate || ''}
                    onChange={(e) => setFormData({ ...formData, whatsAppTemplate: e.target.value })}
                    placeholder="مرحباً، أود طلب خدمة..."
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="srvActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <label htmlFor="srvActive" className="text-gray-300 font-bold cursor-pointer">
                    تفعيل الخدمة في المتجر
                  </label>
                </div>
              </div>

              {/* Left Side: Live Preview */}
              <div className="lg:col-span-5 bg-white text-zinc-900 rounded-2xl p-4 space-y-4 border border-gray-700 flex flex-col">
                <div className="text-[11px] font-black text-zinc-400 border-b border-zinc-100 pb-2">
                  معاينة فورية كما تظهر في المتجر
                </div>

                {/* Circle Button Preview */}
                <div className="flex flex-col items-center gap-2 py-2">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${formData.accentColor || '#0284c7'}15`,
                      border: `2px solid ${formData.accentColor || '#0284c7'}`,
                    }}
                  >
                    <ServiceIcon
                      iconName={formData.iconName}
                      size={28}
                      color={formData.accentColor || '#0284c7'}
                    />
                  </div>
                  <span className="font-black text-xs text-center">
                    {formData.title || 'عنوان الخدمة'}
                  </span>
                </div>

                {/* Media Embedder Live Preview */}
                {formData.mediaType !== 'none' && formData.mediaUrl?.trim() ? (
                  <div className="flex-1">
                    <UniversalMediaEmbedder
                      mediaType={formData.mediaType}
                      mediaUrl={formData.mediaUrl}
                      title={formData.title || 'معاينة'}
                    />
                  </div>
                ) : (
                  <div className="flex-1 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-6 flex items-center justify-center text-zinc-400 text-center">
                    أضف رابط تيك توك أو يوتيوب أو صورة/فيديو لمشاهدة المعاينة الحية هنا
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="lg:col-span-12 flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
