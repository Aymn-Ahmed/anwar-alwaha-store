import React from 'react';
import { Sparkles, Check, ArrowLeft, MessageCircle, Star } from 'lucide-react';
import { ServiceIcon } from '../../../components/common/ServiceIcon';
import { UniversalMediaEmbedder } from '../../../components/common/UniversalMediaEmbedder';

interface ServiceLivePreviewProps {
  title: string;
  description: string;
  iconName: string;
  accentColor: string;
  images: string[];
  mediaType: string;
  mediaUrl: string;
  availableOptionsOrSizes: string;
}

export const ServiceLivePreview: React.FC<ServiceLivePreviewProps> = ({
  title,
  description,
  iconName,
  accentColor,
  images,
  mediaType,
  mediaUrl,
  availableOptionsOrSizes,
}) => {
  const color = accentColor || '#059669';
  const displayTitle = title.trim() || 'عنوان الخدمة';
  const displayDesc = description.trim() || 'وصف مختصر لأعمال الخدمة كما يظهر للعملاء في المتجر...';

  // Parse options chips
  const optionsList = availableOptionsOrSizes
    ? availableOptionsOrSizes
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : ['خيار تجريبي 1', 'خيار تجريبي 2'];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-4 shadow-xl">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span>معاينة حية للمتجر (Live Store Preview)</span>
          </h4>
        </div>
        <span className="text-[10px] text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full font-bold">
          كما يراها العميل
        </span>
      </div>

      {/* 1. Circular Service Card Preview (As on Services Page) */}
      <div className="bg-white rounded-2xl p-4 text-center border border-zinc-200/90 shadow-sm flex flex-col items-center gap-2 relative">
        <span className="absolute top-2 right-2 text-[9px] font-bold text-zinc-400">
          في شبكة الخدمات
        </span>

        {/* Circular Container with Colored Arc */}
        <div className="relative pt-2">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center relative select-none shadow-xs"
            style={{
              backgroundColor: `${color}14`,
              boxShadow: `0 0 0 2px ${color}`,
            }}
          >
            {/* Colored Bottom Arc SVG Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeOpacity={0.4}
              />
              <path
                d="M 14 68 A 44 44 0 0 0 86 68"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            {/* Contextual Icon */}
            <div className="relative z-10">
              <ServiceIcon iconName={iconName} size={24} color={color} />
            </div>
          </div>

          {/* Active Red Dot */}
          <span className="absolute top-1 -right-0.5 w-3 h-3 rounded-full bg-[#FA2C19] border-2 border-white shadow-xs" />
        </div>

        <h5 className="text-xs font-black text-zinc-900 line-clamp-1 mt-1">{displayTitle}</h5>
      </div>

      {/* 2. In-Place Expanded Card Drawer Preview */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-md space-y-3 relative text-right text-zinc-900">
        {/* Caret pointing up */}
        <div className="absolute -top-1.5 right-1/2 translate-x-1/2 w-3 h-3 bg-white border-t border-r border-zinc-200 rotate-[-45deg]" />

        {/* Header inside drawer */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs font-black text-zinc-900">{displayTitle}</span>
          </div>
          <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
            الدرج المنبثق
          </span>
        </div>

        {/* Media or Photos Showcase */}
        {mediaType === 'tiktok' && mediaUrl ? (
          <div className="rounded-xl overflow-hidden border border-zinc-100 shadow-xs max-h-48">
            <UniversalMediaEmbedder
              mediaType="tiktok"
              mediaUrl={mediaUrl}
              title={displayTitle}
            />
          </div>
        ) : images.length > 0 ? (
          <div className="space-y-1.5">
            <div className="relative rounded-xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-100">
              <img
                src={images[0]}
                alt="الغلاف الرئيسي"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span>الغلاف</span>
              </span>
            </div>

            {/* Gallery Thumbnails Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {images.slice(1).map((gUrl, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 shrink-0 bg-zinc-100"
                  >
                    <img src={gUrl} alt="معرض" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-50 border border-dashed border-zinc-200 text-center text-zinc-400 text-[11px]">
            أضف صوراً أو رابط تيك توك لتشاهد المعاينة هنا
          </div>
        )}

        {/* Options Pills Preview */}
        {optionsList.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-zinc-500 block">خيارات سريعة:</span>
            <div className="flex flex-wrap gap-1">
              {optionsList.slice(0, 4).map((opt, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-bold ${
                    idx === 0
                      ? 'bg-black text-white border-black flex items-center gap-1'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {idx === 0 && <span className="w-1 h-1 rounded-full bg-red-500" />}
                  <span>{opt}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Short Description */}
        <p className="text-[10px] text-zinc-600 leading-relaxed bg-zinc-50 p-2 rounded-xl">
          {displayDesc}
        </p>

        {/* Buttons Preview */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="flex-1 bg-[#059669] text-white text-[11px] font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1 shadow-sm">
            <span>المزيد وتفاصيل الخدمة</span>
            <ArrowLeft size={12} />
          </div>
          <div className="bg-[#25D366] text-white text-[11px] font-bold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1 shadow-xs">
            <MessageCircle size={13} />
            <span>طلب</span>
          </div>
        </div>
      </div>
    </div>
  );
};
