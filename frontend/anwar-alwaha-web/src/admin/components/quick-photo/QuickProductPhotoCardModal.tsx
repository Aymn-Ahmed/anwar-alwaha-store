import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Check,
  CheckCircle,
  Save,
  Barcode,
  Copy,
  Sparkles,
  Layers,
  ArrowRight,
  Loader2,
  Tag,
  PlusCircle,
} from 'lucide-react';
import { compressImage } from '../../../utils/imageCompressor';
import { adminApi } from '../../../api/adminApi';
import { Product } from '../../../types/product.types';
import { Category } from '../../../types/category.types';
import { useToast } from '../../../context/ToastContext';

interface QuickProductPhotoCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  barcode: string;
  existingProduct: Product | null;
  categories: Category[];
  onProductUpdated: (updatedProduct: Product) => void;
  onScanNext: () => void;
}

export const QuickProductPhotoCardModal: React.FC<QuickProductPhotoCardModalProps> = ({
  isOpen,
  onClose,
  barcode,
  existingProduct,
  categories,
  onProductUpdated,
  onScanNext,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  // Sync state whenever existingProduct or barcode changes
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || '');
      setPrice(existingProduct.price !== undefined ? existingProduct.price.toString() : '');
      setCategoryId(existingProduct.categoryId || (categories[0]?.id ?? ''));
      setPhotoDataUrl(existingProduct.imageUrl || '');
    } else {
      setName('');
      setPrice('');
      setCategoryId(categories[0]?.id || '');
      setPhotoDataUrl('');
    }
    setIsSavedSuccess(false);
  }, [existingProduct, barcode, categories]);

  if (!isOpen) return null;

  const handleCopyBarcode = () => {
    if (!barcode) return;
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 1800);
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      showToast('جاري معالجة وضغط صورة الكاميرا...', 'info');

      const compressed = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.82,
        mimeType: 'image/webp',
      });

      setPhotoDataUrl(compressed);
      showToast('تم التقاط وضغط الصورة بنجاح!', 'success');
    } catch (err: any) {
      showToast(err.message || 'فشل التقاط الصورة من الكاميرا', 'error');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('اسم الصنف مطلوب', 'error');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      showToast('يرجى إدخال سعر صحيح للصنف', 'error');
      return;
    }

    try {
      setIsSaving(true);

      if (existingProduct) {
        // Update existing product using quickPatch for fast single-call save
        await adminApi.products.quickPatch([
          {
            id: existingProduct.id,
            name: name.trim(),
            price: parsedPrice,
            categoryId: categoryId || undefined,
            imageUrl: photoDataUrl || undefined,
            barcode: barcode || undefined,
          },
        ]);

        const updated: Product = {
          ...existingProduct,
          name: name.trim(),
          price: parsedPrice,
          categoryId: categoryId || existingProduct.categoryId,
          imageUrl: photoDataUrl || existingProduct.imageUrl,
          barcode: barcode || existingProduct.barcode,
        };

        onProductUpdated(updated);
        showToast('تم حفظ وتحديث صورة وبيانات الصنف بنجاح!', 'success');
      } else {
        // Create new product directly from aisle scan
        const created = await adminApi.products.create({
          categoryId: categoryId || categories[0]?.id || 'dept_stationery',
          name: name.trim(),
          barcode: barcode || undefined,
          price: parsedPrice,
          imageUrl: photoDataUrl || undefined,
          stockQuantity: 100,
          sortOrder: 0,
          isActive: true,
        });

        onProductUpdated(created);
        showToast('تمت إضافة الصنف الجديد بنجاح وحفظ الصورة!', 'success');
      }

      setIsSavedSuccess(true);
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء حفظ الصورة', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200">
        {/* Hidden File Input configured for rear environment camera capture */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          className="hidden"
        />

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                existingProduct
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {existingProduct ? <CheckCircle size={18} /> : <PlusCircle size={18} />}
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>{existingProduct ? 'تحديث صورة الصنف' : 'إضافة صنف جديد بالباركود'}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    existingProduct
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {existingProduct ? 'صنف مسجل' : 'صنف جديد'}
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                {existingProduct
                  ? 'التقط صورة جديدة للمنتج واعتمدها بلمسة واحدة'
                  : 'أدخل بيانات الصنف والتقط صورته لحفظه فوراً'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Barcode Badge Row */}
          <div className="flex items-center justify-between bg-gray-900/80 p-3 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-2 min-w-0">
              <Barcode size={18} className="text-brand-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-gray-400 block font-bold">رقم الباركود المفحوص:</span>
                <span className="font-mono font-bold text-xs text-white tracking-wider truncate block" dir="ltr">
                  {barcode || 'بدون باركود'}
                </span>
              </div>
            </div>

            {barcode && (
              <button
                type="button"
                onClick={handleCopyBarcode}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedBarcode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedBarcode ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            )}
          </div>

          {/* Photo Preview & Snap Camera Area */}
          <div className="space-y-2">
            <label className="font-bold text-gray-300 block">صورة الصنف:</label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Photo Box */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-700 bg-gray-900 aspect-video flex items-center justify-center group">
                {photoDataUrl ? (
                  <>
                    <img
                      src={photoDataUrl}
                      alt={name || 'صورة الصنف'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white/90 text-black text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera size={14} />
                        <span>إعادة الالتقاط</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 space-y-1 text-gray-500">
                    <Camera size={28} className="mx-auto text-gray-600" />
                    <span className="text-[11px] block">لا توجد صورة حالياً</span>
                  </div>
                )}

                {isCompressing && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="animate-spin text-brand-400" />
                    <span className="text-[10px] font-bold text-white">جاري ضغط الصورة...</span>
                  </div>
                )}
              </div>

              {/* Action: Big Snap Photo CTA */}
              <div className="space-y-2 flex flex-col justify-center">
                <button
                  type="button"
                  disabled={isCompressing}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 active:scale-98 transition-all cursor-pointer"
                >
                  <Camera size={20} />
                  <span>{photoDataUrl ? 'التقاط صورة بديلة 📷' : 'التقط صورة الصنف الآن 📷'}</span>
                </button>
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  تفتح الكاميرا الخلفية لجوالك مباشرة، وتُضغط الصورة تلقائياً لسرعة فائقة.
                </p>
              </div>
            </div>
          </div>

          {/* Product Fields */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            {/* Product Name */}
            <div className="space-y-1">
              <label className="font-bold text-gray-300 block">
                اسم الصنف <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: قلم جاف أزرق شنايدر 0.7 مم"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Price */}
              <div className="space-y-1">
                <label className="font-bold text-gray-300 block">
                  السعر (ر.س) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500 transition-colors font-bold"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-bold text-gray-300 block">القسم / التصنيف:</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-gray-800 space-y-2">
            {!isSavedSuccess ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isCompressing}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>جاري الحفظ والمزامنة...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{existingProduct ? 'حفظ الصورة وتحديث الصنف' : 'إضافة الصنف وحفظ الصورة'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Success Flow: Scan Next Shelf Item */
              <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-4 text-center space-y-3 animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <CheckCircle size={16} />
                  <span>تم حفظ وتحديث صورة الصنف بنجاح في المتجر!</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition-colors"
                  >
                    إغلاق
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onScanNext();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/30 cursor-pointer"
                  >
                    <Camera size={15} />
                    <span>مسح الصنف التالي 📷</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
