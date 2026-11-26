import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Star,
  Trash2,
  Film,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { compressImage } from '../../../utils/imageCompressor';

interface ServiceSmartPhotoStudioProps {
  images: string[];
  onChangeImages: (newImages: string[]) => void;
  mediaType: string;
  onChangeMediaType: (type: string) => void;
  mediaUrl: string;
  onChangeMediaUrl: (url: string) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ServiceSmartPhotoStudio: React.FC<ServiceSmartPhotoStudioProps> = ({
  images,
  onChangeImages,
  mediaType,
  onChangeMediaType,
  mediaUrl,
  onChangeMediaUrl,
  onToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [showTikTokSection, setShowTikTokSection] = useState(mediaType === 'tiktok');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Allow maximum 5 photos total
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      onToast('الحد الأقصى لمعرض صور الخدمة هو 5 صور', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      onToast(`تم اختيار أول ${remainingSlots} صور فقط لاكتمال الحد الأقصى`, 'info');
    }

    try {
      setCompressing(true);
      onToast('جاري ضغط وتحسين جودة الصور في المتصفح...', 'info');

      const compressedResults: string[] = [];
      for (const file of filesToProcess) {
        const compressed = await compressImage(file, {
          maxWidth: 1280,
          maxHeight: 1280,
          quality: 0.82,
          mimeType: 'image/webp',
        });
        compressedResults.push(compressed);
      }

      const updated = [...images, ...compressedResults];
      onChangeImages(updated);

      // If mediaType was 'none' or empty, switch to image
      if (mediaType === 'none' || !mediaType) {
        onChangeMediaType('image');
      }

      onToast(`تمت إضافة ${compressedResults.length} صور مضغوطة بنجاح`, 'success');
    } catch (err: any) {
      onToast(err.message || 'حدث خطأ أثناء معالجة الصور', 'error');
    } finally {
      setCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    const updated = [target, ...filtered];
    onChangeImages(updated);
    onToast('تم تعيين الصورة كغلاف رئيسي للخدمة', 'success');
  };

  const handleDeleteImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChangeImages(updated);
    onToast('تم حذف الصورة من الاستوديو', 'info');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <ImageIcon size={18} />
            </span>
            <span>استوديو الصور الذكي</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            ارفع صور أعمال الخدمة (يتم ضغطها وتصغيرها تلقائياً لتفتح في أقل من ثانية). أول صورة هي الغلاف الرئيسي.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
            {images.length} / 5 صور
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Visual Thumbnail Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((imgUrl, index) => {
            const isCover = index === 0;

            return (
              <div
                key={index}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all group aspect-square bg-gray-950 flex flex-col justify-between ${
                  isCover
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-950/40'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Photo Preview */}
                <img
                  src={imgUrl}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Top Badges & Actions */}
                <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1 z-10 pointer-events-none">
                  {isCover ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-md">
                      <Star size={11} className="fill-white" />
                      <span>الغلاف الرئيسي</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-black/60 backdrop-blur-xs text-gray-300 px-2 py-0.5 rounded-lg">
                      معرض #{index}
                    </span>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(index)}
                    className="w-6 h-6 rounded-lg bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors pointer-events-auto cursor-pointer shadow-md"
                    title="حذف الصورة"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Bottom Overlay Action: Set as Cover */}
                {!isCover && (
                  <div className="absolute bottom-2 inset-x-2 z-10">
                    <button
                      type="button"
                      onClick={() => handleSetCover(index)}
                      className="w-full bg-gray-900/90 hover:bg-emerald-600 backdrop-blur-xs text-white text-[10px] font-bold py-1.5 px-2 rounded-xl border border-gray-700/80 hover:border-emerald-500 transition-colors flex items-center justify-center gap-1 shadow-md cursor-pointer"
                    >
                      <Star size={11} />
                      <span>تعيين كغلاف</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add More Photos Card (if < 5) */}
          {images.length < 5 && (
            <button
              type="button"
              disabled={compressing}
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-700 hover:border-brand-500 bg-gray-800/40 hover:bg-gray-800/80 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-brand-400 cursor-pointer disabled:opacity-50 p-3 text-center"
            >
              {compressing ? (
                <>
                  <Loader2 size={24} className="animate-spin text-brand-400" />
                  <span className="text-[11px] font-bold">جاري الضغط...</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300">
                    <UploadCloud size={20} />
                  </div>
                  <span className="text-xs font-bold">إضافة صورة أخرى</span>
                  <span className="text-[10px] text-gray-500">حتى 5 صور</span>
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => !compressing && fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-brand-500 bg-gray-950/60 hover:bg-gray-900/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-3 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
            {compressing ? (
              <Loader2 size={28} className="animate-spin text-brand-400" />
            ) : (
              <UploadCloud size={28} />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">
              {compressing ? 'جاري ضغط وتحسين الصور...' : 'إضافة صور من الاستوديو أو الكاميرا'}
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              اختر حتى 5 صور مباشرة من جوالك أو جهازك. يتم تقليص حجم الصور الثقيلة تلقائياً لسرعة تصفح فائقة.
            </p>
          </div>

          <button
            type="button"
            disabled={compressing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black shadow-md shadow-brand-600/20 transition-all pointer-events-none"
          >
            <Sparkles size={14} />
            <span>اختر الصور الآن</span>
          </button>
        </div>
      )}

      {/* Collapsible TikTok / Video Link Toggle */}
      <div className="pt-2 border-t border-gray-800/80">
        <button
          type="button"
          onClick={() => setShowTikTokSection(!showTikTokSection)}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Film size={15} className="text-pink-400" />
            <span>أو إضافة رابط فيديو تيك توك / يوتيوب كعرض مرئي تفاعلي</span>
          </div>
          {showTikTokSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showTikTokSection && (
          <div className="mt-3 p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 animate-in fade-in">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <span>رابط الفيديو (TikTok أو YouTube):</span>
                <span className="text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full font-bold">
                  يعرض الفيديو في المتجر
                </span>
              </label>
              <input
                type="text"
                dir="ltr"
                value={mediaType === 'tiktok' || mediaType === 'youtube' ? mediaUrl : ''}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  onChangeMediaUrl(val);
                  if (val.includes('tiktok.com')) {
                    onChangeMediaType('tiktok');
                  } else if (val.includes('youtube.com') || val.includes('youtu.be')) {
                    onChangeMediaType('youtube');
                  } else if (val) {
                    onChangeMediaType('tiktok');
                  } else if (images.length > 0) {
                    onChangeMediaType('image');
                  } else {
                    onChangeMediaType('none');
                  }
                }}
                placeholder="https://www.tiktok.com/@anwaralwaha_1/video/..."
                className="w-full bg-gray-900 border border-gray-700 text-white p-2.5 rounded-xl text-xs font-mono focus:outline-none focus:border-pink-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              💡 عند إضافة رابط فيديو تيك توك أو يوتيوب، سيظهر للمستخدم كمشغل فيديو تفاعلي داخل كرت الخدمة، وتظل الصور المرفوعة تعمل كمعرض داعم.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
