import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ArrowRight,
  Save,
  X,
  Eye,
  Film,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { ServiceItem } from '../../types/service.types';
import { Category } from '../../types/category.types';
import { ServiceCreateUpdate } from '../../types/admin.types';
import { ServiceIcon } from '../../components/common/ServiceIcon';
import { useToast } from '../../context/ToastContext';
import { ServiceSmartPhotoStudio } from '../components/services/ServiceSmartPhotoStudio';
import { ServiceAdvancedSettings } from '../components/services/ServiceAdvancedSettings';
import { ServiceLivePreview } from '../components/services/ServiceLivePreview';

type ViewMode = 'list' | 'editor';

const INITIAL_SERVICE_STATE: ServiceCreateUpdate = {
  title: '',
  description: '',
  iconName: 'printer',
  accentColor: '#059669',
  mediaType: 'image',
  mediaUrl: '',
  linkedCategoryId: '',
  whatsAppTemplate: '',
  detailedOverview: '',
  availableOptionsOrSizes: '',
  galleryImageUrls: '',
  sortOrder: 0,
  isActive: true,
};

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Mode State (Full-Page instead of popup modal)
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ServiceCreateUpdate>(INITIAL_SERVICE_STATE);
  const [images, setImages] = useState<string[]>([]);

  // Initial Snapshot for Dirty Checking (Unsaved Changes Guard)
  const [initialSnapshot, setInitialSnapshot] = useState<{
    formData: ServiceCreateUpdate;
    images: string[];
  }>({
    formData: INITIAL_SERVICE_STATE,
    images: [],
  });

  // Mobile Live Preview Drawer Modal State
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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

  // Calculate Unsaved Changes State
  const hasUnsavedChanges = useMemo(() => {
    if (viewMode !== 'editor') return false;

    // Check images diff
    if (images.length !== initialSnapshot.images.length) return true;
    for (let i = 0; i < images.length; i++) {
      if (images[i] !== initialSnapshot.images[i]) return true;
    }

    // Check formData diff
    const cur = formData;
    const init = initialSnapshot.formData;

    return (
      cur.title !== init.title ||
      cur.description !== init.description ||
      cur.iconName !== init.iconName ||
      cur.accentColor !== init.accentColor ||
      cur.mediaType !== init.mediaType ||
      cur.mediaUrl !== init.mediaUrl ||
      cur.linkedCategoryId !== init.linkedCategoryId ||
      cur.whatsAppTemplate !== init.whatsAppTemplate ||
      cur.detailedOverview !== init.detailedOverview ||
      cur.availableOptionsOrSizes !== init.availableOptionsOrSizes ||
      cur.sortOrder !== init.sortOrder ||
      cur.isActive !== init.isActive
    );
  }, [viewMode, formData, images, initialSnapshot]);

  // Browser BeforeUnload Guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Open Create Mode
  const handleOpenCreate = () => {
    setEditingService(null);
    const newForm: ServiceCreateUpdate = {
      ...INITIAL_SERVICE_STATE,
      sortOrder: services.length + 1,
    };
    setFormData(newForm);
    setImages([]);
    setInitialSnapshot({
      formData: newForm,
      images: [],
    });
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit Mode
  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);

    // Parse existing images into list: first image is mediaUrl (if type image), rest from galleryImageUrls
    const existingImages: string[] = [];
    if (srv.mediaType === 'image' && srv.mediaUrl?.trim()) {
      existingImages.push(srv.mediaUrl.trim());
    }
    if (srv.galleryImageUrls?.trim()) {
      const gallery = srv.galleryImageUrls
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const g of gallery) {
        if (!existingImages.includes(g)) {
          existingImages.push(g);
        }
      }
    }

    const editForm: ServiceCreateUpdate = {
      title: srv.title,
      description: srv.description || '',
      iconName: srv.iconName || 'sparkles',
      accentColor: srv.accentColor || '#059669',
      mediaType: srv.mediaType || (existingImages.length > 0 ? 'image' : 'none'),
      mediaUrl: srv.mediaUrl || '',
      linkedCategoryId: srv.linkedCategoryId || '',
      whatsAppTemplate: srv.whatsAppTemplate || '',
      detailedOverview: srv.detailedOverview || '',
      availableOptionsOrSizes: srv.availableOptionsOrSizes || '',
      galleryImageUrls: srv.galleryImageUrls || '',
      sortOrder: srv.sortOrder,
      isActive: srv.isActive,
    };

    setFormData(editForm);
    setImages(existingImages);
    setInitialSnapshot({
      formData: editForm,
      images: existingImages,
    });
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe Exit Handler (Guard against lost work)
  const handleSafeExit = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmExit = window.confirm('لديك تعديلات لم تُحفظ، هل تريد الخروج بدون حفظ؟');
      if (!confirmExit) return;
    }
    setViewMode('list');
    setEditingService(null);
  }, [hasUnsavedChanges]);

  // Save Service
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('عنوان الخدمة مطلوب', 'error');
      return;
    }

    // Determine primary mediaUrl and gallery
    let finalMediaType = formData.mediaType;
    let finalMediaUrl = formData.mediaUrl?.trim();
    let finalGallery = '';

    if (finalMediaType === 'tiktok' || finalMediaType === 'youtube') {
      // If TikTok/YouTube video was provided
      finalMediaUrl = formData.mediaUrl?.trim();
      finalGallery = images.join(', ');
    } else if (images.length > 0) {
      finalMediaType = 'image';
      finalMediaUrl = images[0]; // Primary cover
      finalGallery = images.slice(1).join(', '); // Gallery items
    } else {
      finalMediaType = 'none';
      finalMediaUrl = undefined;
      finalGallery = '';
    }

    const payload: ServiceCreateUpdate = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      mediaType: finalMediaType,
      mediaUrl: finalMediaUrl || undefined,
      galleryImageUrls: finalGallery || undefined,
      linkedCategoryId: formData.linkedCategoryId || undefined,
      whatsAppTemplate: formData.whatsAppTemplate?.trim() || undefined,
      detailedOverview: formData.detailedOverview?.trim() || undefined,
      availableOptionsOrSizes: formData.availableOptionsOrSizes?.trim() || undefined,
    };

    try {
      setSaving(true);
      if (editingService) {
        await adminApi.services.update(editingService.id, payload);
        showToast('تم حفظ وتحديث الخدمة بنجاح', 'success');
      } else {
        await adminApi.services.create(payload);
        showToast('تمت إضافة الخدمة الجديدة بنجاح', 'success');
      }

      // Mark clean and return to list
      setInitialSnapshot({ formData, images });
      setViewMode('list');
      setEditingService(null);
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ الخدمة', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Service
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

  /* =========================================================================
     VIEW 1: FULL-PAGE SERVICE STUDIO EDITOR (ZERO POPUP MODALS)
     ========================================================================= */
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 pb-24 animate-in fade-in duration-200">
        {/* 1. STICKY TOP HEADER */}
        <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleSafeExit}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
              title="العودة لقائمة الخدمات"
            >
              <ArrowRight size={15} />
              <span>العودة للخدمات</span>
            </button>

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white truncate flex items-center gap-2">
                <span>{editingService ? `تعديل خدمة: ${formData.title || 'بدون عنوان'}` : 'إضافة خدمة جديدة'}</span>
                {hasUnsavedChanges && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold shrink-0">
                    تعديلات غير محفوظة
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Right Header Action: Mobile Preview Trigger on < lg */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              className="lg:hidden px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-brand-400 border border-brand-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye size={14} />
              <span>معاينة الشكل</span>
            </button>
          </div>
        </div>

        {/* 2. MAIN 2-COLUMN LAYOUT (DESKTOP) */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* RIGHT 7 COLUMNS: MAIN EDITOR FORM */}
          <div className="lg:col-span-7 space-y-6">
            {/* SECTION 1: BASIC INFORMATION (Title & Description) */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <div className="border-b border-gray-800 pb-3">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <span>البيانات الأساسية للخدمة</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  أدخل اسم الخدمة المعروض ووصفاً سريعاً يوضح للعملاء طبيعة أعمال هذا القسم.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Service Title */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-200 block">
                    عنوان الخدمة أو القسم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="مثال: الطباعة الإعلانية والاستكرات، حفلات التخرج..."
                    className="w-full bg-gray-950 border border-gray-700 text-white p-3 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-200 block">
                    الوصف المختصر للخدمة
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="اكتب نبذة سريعة عن الخدمات والمنتجات المتاحة في هذا القسم (مثلاً: بنرات إعلانية، رول أب ستاند، لوحات فلين...)"
                    className="w-full bg-gray-950 border border-gray-700 text-white p-3 rounded-2xl text-xs leading-relaxed focus:outline-none focus:border-brand-500 transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>يظهر هذا الوصف في كرت الخدمة وشاشة المعاينة السريعة</span>
                    <span>{formData.description.length} حرف</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: SMART PHOTO STUDIO */}
            <ServiceSmartPhotoStudio
              images={images}
              onChangeImages={setImages}
              mediaType={formData.mediaType}
              onChangeMediaType={(type) => setFormData({ ...formData, mediaType: type })}
              mediaUrl={formData.mediaUrl || ''}
              onChangeMediaUrl={(url) => setFormData({ ...formData, mediaUrl: url })}
              onToast={showToast}
            />

            {/* SECTION 3: ADVANCED SETTINGS ACCORDION (Progressive Disclosure) */}
            <ServiceAdvancedSettings
              iconName={formData.iconName}
              onChangeIconName={(icon) => setFormData({ ...formData, iconName: icon })}
              accentColor={formData.accentColor}
              onChangeAccentColor={(color) => setFormData({ ...formData, accentColor: color })}
              linkedCategoryId={formData.linkedCategoryId || ''}
              onChangeLinkedCategoryId={(catId) =>
                setFormData({ ...formData, linkedCategoryId: catId })
              }
              categories={categories}
              sortOrder={formData.sortOrder}
              onChangeSortOrder={(order) => setFormData({ ...formData, sortOrder: order })}
              isActive={formData.isActive}
              onChangeIsActive={(active) => setFormData({ ...formData, isActive: active })}
              detailedOverview={formData.detailedOverview || ''}
              onChangeDetailedOverview={(val) => setFormData({ ...formData, detailedOverview: val })}
              availableOptionsOrSizes={formData.availableOptionsOrSizes || ''}
              onChangeAvailableOptionsOrSizes={(val) =>
                setFormData({ ...formData, availableOptionsOrSizes: val })
              }
              whatsAppTemplate={formData.whatsAppTemplate || ''}
              onChangeWhatsAppTemplate={(val) =>
                setFormData({ ...formData, whatsAppTemplate: val })
              }
              serviceTitle={formData.title}
            />
          </div>

          {/* LEFT 5 COLUMNS: STICKY LIVE STORE PREVIEW (DESKTOP) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-20">
            <ServiceLivePreview
              title={formData.title}
              description={formData.description}
              iconName={formData.iconName}
              accentColor={formData.accentColor}
              images={images}
              mediaType={formData.mediaType}
              mediaUrl={formData.mediaUrl || ''}
              availableOptionsOrSizes={formData.availableOptionsOrSizes || ''}
            />
          </div>

          {/* 3. STICKY BOTTOM ACTION BAR */}
          <div className="fixed bottom-0 inset-x-0 z-30 bg-gray-950/95 backdrop-blur-md border-t border-gray-800 p-3.5 sm:p-4 shadow-2xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSafeExit}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء والعودة
                </button>
                {hasUnsavedChanges ? (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                    <AlertCircle size={14} />
                    <span>تعديلاتك لم تُحفظ بعد</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <CheckCircle size={14} />
                    <span>كافة البيانات متطابقة</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-600/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{saving ? 'جاري الحفظ...' : editingService ? 'حفظ التعديلات' : 'إضافة الخدمة للمتجر'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* MOBILE LIVE PREVIEW MODAL / DRAWER */}
        {mobilePreviewOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye size={14} className="text-brand-400" />
                  <span>معاينة العرض في المتجر</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setMobilePreviewOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <ServiceLivePreview
                title={formData.title}
                description={formData.description}
                iconName={formData.iconName}
                accentColor={formData.accentColor}
                images={images}
                mediaType={formData.mediaType}
                mediaUrl={formData.mediaUrl || ''}
                availableOptionsOrSizes={formData.availableOptionsOrSizes || ''}
              />

              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs"
              >
                إغلاق المعاينة ومتابعة التعديل
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =========================================================================
     VIEW 2: SERVICES LIST OVERVIEW
     ========================================================================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">إدارة الخدمات وعارض الوسائط</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            تحكم بأقسام وخدمات المكتبة التفاعلية واستوديو الصور الذكي مع معاينة مباشرة للمتجر
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors cursor-pointer"
            title="تحديث القائمة"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all active:scale-95 cursor-pointer"
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
      ) : services.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
            <Layers size={28} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">لا توجد خدمات مضافة حتى الآن</h3>
            <p className="text-xs text-gray-400 mt-1">
              ابدأ بإضافة أول قسم أو خدمة لمكتبة ومتجر أنوار الواحة
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2"
          >
            <Plus size={16} />
            <span>إضافة خدمة جديدة</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => {
            const color = srv.accentColor || '#059669';
            return (
              <div
                key={srv.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all"
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
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="فتح محرر الخدمة الكامل"
                    >
                      <Edit2 size={13} />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id, srv.title)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
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
    </div>
  );
};
