import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Sparkles,
  Layers,
  Palette,
  FileImage,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StoreQrPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PosterTheme = 'emerald' | 'light' | 'dark';
type PosterLayout = 'poster' | 'sticker';

export const StoreQrPosterModal: React.FC<StoreQrPosterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();

  // Resolve default store URL (fallback to live Pages.dev if on localhost)
  const defaultUrl =
    typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
      ? window.location.origin
      : 'https://anwar-alwaha-store.pages.dev';

  const [targetUrl, setTargetUrl] = useState(defaultUrl);
  const [theme, setTheme] = useState<PosterTheme>('emerald');
  const [layout, setLayout] = useState<PosterLayout>('poster');
  const [titleText, setTitleText] = useState('امسح الكود واطلب أونلاين الآن');
  const [subtitleText, setSubtitleText] = useState(
    'توصيل سريع لموقعك • دفع إلكتروني آمن • استلام من الفرع'
  );
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Hidden high-res QR canvas ref for clean image extraction
  const highResQrRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      showToast('تم نسخ الرابط بنجاح!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('تعذر نسخ الرابط تلقائياً', 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQrOnly = () => {
    if (!highResQrRef.current) return;
    const link = document.createElement('a');
    link.download = `anwar-alwaha-qr-${Date.now()}.png`;
    link.href = highResQrRef.current.toDataURL('image/png');
    link.click();
    showToast('تم تحميل رمز QR بدقة عالية (1024px)!', 'success');
  };

  const handleDownloadPoster = async () => {
    try {
      setIsExporting(true);
      showToast('جاري إنشاء البوستر بدقة طباعة فائقة (High-DPI)...', 'info');

      // Create high-res export canvas (300 DPI ready: 1600 x 2200 for poster, 1600 x 1600 for sticker)
      const canvas = document.createElement('canvas');
      const isSticker = layout === 'sticker';
      const width = 1600;
      const height = isSticker ? 1600 : 2200;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('تعذر تشغيل محرك الرسوم');

      // 1. Draw Background
      if (theme === 'dark') {
        ctx.fillStyle = '#090D16';
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'emerald') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#064E3B');
        bgGrad.addColorStop(1, '#022C22');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Light clean paper print
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw Decorative Outer Border
      ctx.lineWidth = 14;
      ctx.strokeStyle =
        theme === 'light'
          ? '#E2E8F0'
          : theme === 'emerald'
          ? '#F59E0B'
          : '#3B82F6';
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Inner thin border
      ctx.lineWidth = 3;
      ctx.strokeStyle =
        theme === 'light'
          ? '#CBD5E1'
          : theme === 'emerald'
          ? '#FCD34D'
          : '#1E293B';
      ctx.strokeRect(70, 70, width - 140, height - 140);

      ctx.textAlign = 'center';
      ctx.direction = 'rtl';

      // 3. Draw Header Store Title
      ctx.fillStyle =
        theme === 'light'
          ? '#0F172A'
          : '#FFFFFF';
      ctx.font = 'bold 75px "Cairo", "Segoe UI", sans-serif';
      ctx.fillText('مكتبة ومتجر أنوار الواحة 📚', width / 2, isSticker ? 180 : 200);

      // Tagline
      ctx.fillStyle =
        theme === 'light'
          ? '#64748B'
          : theme === 'emerald'
          ? '#FDE68A'
          : '#94A3B8';
      ctx.font = 'bold 36px "Cairo", sans-serif';
      ctx.fillText(
        'خميس مشيط • خدمات طباعة وقرطاسية وتوصيل فوري',
        width / 2,
        isSticker ? 240 : 270
      );

      // Headline
      ctx.fillStyle =
        theme === 'light'
          ? '#1E293B'
          : '#FFFFFF';
      ctx.font = 'black 58px "Cairo", sans-serif';
      ctx.fillText(titleText, width / 2, isSticker ? 330 : 380);

      // Subtitle
      if (!isSticker) {
        ctx.fillStyle =
          theme === 'light'
            ? '#64748B'
            : '#E2E8F0';
        ctx.font = '500 32px "Cairo", sans-serif';
        ctx.fillText(subtitleText, width / 2, 440);
      }

      // 4. Draw White Container for QR
      const qrBoxSize = isSticker ? 900 : 960;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = isSticker ? 400 : 520;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 40);
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = theme === 'light' ? '#E2E8F0' : '#F59E0B';
      ctx.stroke();

      // 5. Draw High-Res QR Code into Box
      if (highResQrRef.current) {
        const qrPadding = 60;
        ctx.drawImage(
          highResQrRef.current,
          qrBoxX + qrPadding,
          qrBoxY + qrPadding,
          qrBoxSize - qrPadding * 2,
          qrBoxSize - qrPadding * 2
        );
      }

      // 6. Draw URL pill below QR
      const urlPillY = isSticker ? 1380 : 1560;
      ctx.fillStyle = theme === 'light' ? '#F8FAFC' : '#111827';
      const pillW = 1000;
      const pillH = 90;
      ctx.beginPath();
      ctx.roundRect((width - pillW) / 2, urlPillY, pillW, pillH, 45);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = theme === 'light' ? '#CBD5E1' : '#374151';
      ctx.stroke();

      ctx.fillStyle = theme === 'light' ? '#0F172A' : '#F3F4F6';
      ctx.font = 'bold 38px monospace';
      ctx.direction = 'ltr';
      const displayDomain = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      ctx.fillText(displayDomain, width / 2, urlPillY + 58);
      ctx.direction = 'rtl';

      // 7. Value Badges (if poster layout)
      if (!isSticker) {
        const badgesY = 1750;
        const badges = [
          '⚡ استلام فوري أو توصيل',
          '💳 سداد إلكتروني (مدى • فيزا • Pay)',
          '🖨️ طباعة مستندات وبحوث',
        ];

        badges.forEach((b, idx) => {
          const bx = 320 + idx * 480;
          ctx.fillStyle =
            theme === 'light' ? '#F1F5F9' : 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.roundRect(bx - 210, badgesY, 420, 90, 24);
          ctx.fill();

          ctx.fillStyle = theme === 'light' ? '#1E293B' : '#FFFFFF';
          ctx.font = 'bold 30px "Cairo", sans-serif';
          ctx.fillText(b, bx, badgesY + 56);
        });

        // Bottom footer guarantee
        ctx.fillStyle = theme === 'light' ? '#94A3B8' : '#A7F3D0';
        ctx.font = '600 28px "Cairo", sans-serif';
        ctx.fillText(
          'نسعد بخدمتكم وتلبية طلباتكم دائماً • اطلب من متصفحك مباشرة دون تحميل تطبيق',
          width / 2,
          1980
        );

        ctx.fillStyle = '#D97706';
        ctx.font = 'bold 32px "Cairo", sans-serif';
        ctx.fillText('www.anwaralwaha.com', width / 2, 2060);
      } else {
        ctx.fillStyle = theme === 'light' ? '#64748B' : '#94A3B8';
        ctx.font = 'bold 28px "Cairo", sans-serif';
        ctx.fillText('امسح الكود عبر كاميرا الجوال للطلب مباشرة', width / 2, 1515);
      }

      // Convert to high-quality PNG and trigger download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('فشل تصدير الصورة');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `anwar-alwaha-poster-${layout}-${theme}-${Date.now()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setIsExporting(false);
        showToast('تم تحميل البوستر بنجاح بدقة طباعة 300 DPI!', 'success');
      }, 'image/png', 1.0);
    } catch (err: any) {
      setIsExporting(false);
      showToast(err.message || 'حدث خطأ أثناء تصدير البوستر', 'error');
    }
  };

  return (
    <>
      {/* Print Specific CSS to isolate poster on printed sheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #store-qr-printable-poster, #store-qr-printable-poster * {
            visibility: visible !important;
          }
          #store-qr-printable-poster {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 90% !important;
            max-width: 600px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            page-break-inside: avoid !important;
            background: #fff !important;
            color: #000 !important;
          }
          #store-qr-printable-poster .print-hide {
            display: none !important;
          }
        }
      `}</style>

      {/* Hidden 1024px High-Res Canvas used as the crisp source image */}
      <div className="hidden" aria-hidden="true">
        <QRCodeCanvas
          ref={highResQrRef}
          value={targetUrl}
          size={1024}
          level="H"
          includeMargin={true}
        />
      </div>

      {/* Modal Backdrop & Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <div className="w-full max-w-5xl bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>مولّد باركود وبوستر المتجر للطباعة</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    HQ 300 DPI
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  صمم واطبع ملصق أو بوستر QR للمتجر لتعليقه في الكاشير أو على الأكياس لزيادة المبيعات.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body: Controls & Live Preview Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 5 Columns: Customization Controls */}
            <div className="lg:col-span-5 space-y-5 text-xs text-gray-200">
              
              {/* Target URL */}
              <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800 space-y-3">
                <label className="font-bold text-gray-300 block">
                  رابط المتجر المستهدف (QR Target URL):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    dir="ltr"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-100 font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-bold transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUrl(defaultUrl)}
                    className="px-2 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 text-[10px]"
                  >
                    الرئيسية
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUrl(`${defaultUrl}/services`)}
                    className="px-2 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 text-[10px]"
                  >
                    الخدمات والطباعة
                  </button>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800 space-y-3">
                <label className="font-bold text-gray-300 flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-400" />
                  <span>طابع ولون البوستر (Theme):</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('emerald')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      theme === 'emerald'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold shadow-sm'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-emerald-600 border border-emerald-400" />
                    <span>زمردي رسمي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-950/30 text-blue-300 font-bold shadow-sm'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-white border border-gray-400" />
                    <span>ورقي ناصع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      theme === 'dark'
                        ? 'border-purple-500 bg-purple-950/30 text-purple-300 font-bold shadow-sm'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-gray-950 border border-gray-700" />
                    <span>فاخر داكن</span>
                  </button>
                </div>
              </div>

              {/* Layout Presets */}
              <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800 space-y-3">
                <label className="font-bold text-gray-300 flex items-center gap-1.5">
                  <Layers size={14} className="text-amber-400" />
                  <span>نوع ومقاس التصميم (Layout):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayout('poster')}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      layout === 'poster'
                        ? 'border-amber-500/80 bg-amber-950/30 text-amber-300 font-bold'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="font-bold text-xs mb-0.5">📄 بوستر حائطي / استاند (A4/A5)</div>
                    <div className="text-[10px] text-gray-400">كامل مع الشعار والمميزات وروابط السداد</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayout('sticker')}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      layout === 'sticker'
                        ? 'border-amber-500/80 bg-amber-950/30 text-amber-300 font-bold'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="font-bold text-xs mb-0.5">🏷️ ملصق كاشير وأكياس (Square)</div>
                    <div className="text-[10px] text-gray-400">تصميم مدمج سريع يركز على الرمز والشعار</div>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle Customization */}
              <div className="bg-gray-950/50 p-4 rounded-2xl border border-gray-800 space-y-3">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">العنوان الرئيسي للبوستر:</label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                {layout === 'poster' && (
                  <div>
                    <label className="font-bold text-gray-300 block mb-1">العنوان الفرعي:</label>
                    <input
                      type="text"
                      value={subtitleText}
                      onChange={(e) => setSubtitleText(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Right 7 Columns: Live Print Preview & Action Buttons */}
            <div className="lg:col-span-7 flex flex-col items-center justify-between gap-5">
              
              {/* THE PRINTABLE POSTER CARD CONTAINER */}
              <div className="w-full flex items-center justify-center p-2 sm:p-4 bg-gray-950/80 rounded-3xl border border-gray-800/80">
                <div
                  id="store-qr-printable-poster"
                  className={`w-full max-w-[380px] p-6 rounded-3xl border-4 text-center transition-all shadow-2xl relative ${
                    theme === 'emerald'
                      ? 'bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 border-amber-400 text-white shadow-emerald-950/50'
                      : theme === 'dark'
                      ? 'bg-slate-950 border-blue-500 text-white shadow-slate-950'
                      : 'bg-white border-slate-300 text-slate-900 shadow-xl'
                  }`}
                >
                  {/* Inner golden/clean accent border */}
                  <div className={`absolute inset-2 rounded-2xl border pointer-events-none ${
                    theme === 'light' ? 'border-slate-200' : 'border-amber-400/30'
                  }`} />

                  {/* Header: Store Identity */}
                  <div className="space-y-1 mb-4 relative z-10">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 text-2xl mb-1 shadow-inner">
                      📚
                    </div>
                    <h2 className="text-xl font-black tracking-tight">
                      مكتبة ومتجر أنوار الواحة
                    </h2>
                    <p className={`text-[11px] font-bold ${
                      theme === 'light' ? 'text-slate-500' : 'text-amber-300'
                    }`}>
                      خميس مشيط • خدمات طباعة وقرطاسية وتوصيل
                    </p>
                  </div>

                  {/* Headline */}
                  <div className="space-y-1 mb-4 relative z-10">
                    <h3 className="text-base font-black text-amber-400">
                      {titleText}
                    </h3>
                    {layout === 'poster' && (
                      <p className={`text-[10px] leading-relaxed ${
                        theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                      }`}>
                        {subtitleText}
                      </p>
                    )}
                  </div>

                  {/* QR Code Container with High-Contrast White Background */}
                  <div className="my-3 p-3 bg-white rounded-2xl inline-block shadow-md border-2 border-amber-400/40 relative z-10">
                    <QRCodeCanvas
                      value={targetUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Store Link Pill */}
                  <div className="my-2 relative z-10">
                    <span className={`inline-block font-mono text-[11px] font-black px-3 py-1 rounded-xl border ${
                      theme === 'light'
                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                        : 'bg-black/50 text-amber-300 border-amber-400/30'
                    }`} dir="ltr">
                      {targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  </div>

                  {/* Poster Selling Points (Only in Poster Layout) */}
                  {layout === 'poster' && (
                    <div className="grid grid-cols-3 gap-1.5 my-3 text-[9px] font-bold relative z-10">
                      <div className={`p-1.5 rounded-lg border ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/10 border-white/10 text-white'
                      }`}>
                        ⚡ توصيل سريع
                      </div>
                      <div className={`p-1.5 rounded-lg border ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/10 border-white/10 text-white'
                      }`}>
                        💳 دفع إلكتروني
                      </div>
                      <div className={`p-1.5 rounded-lg border ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/10 border-white/10 text-white'
                      }`}>
                        🖨️ طباعة فورية
                      </div>
                    </div>
                  )}

                  {/* Footer note */}
                  <div className="mt-3 pt-2 border-t border-gray-700/40 text-[9px] font-medium relative z-10">
                    <p className={theme === 'light' ? 'text-slate-500' : 'text-emerald-300'}>
                      افتح كاميرا هاتفك وامسح الرمز لفتح المتجر مباشرة
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: High-Res Export & Print */}
              <div className="w-full flex flex-wrap items-center justify-center gap-3">
                {/* 1. Direct Print */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-black text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Printer size={16} />
                  <span>طباعة البوستر مباشرة (A4 / A5)</span>
                </button>

                {/* 2. Download High-Res PNG */}
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  disabled={isExporting}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>{isExporting ? 'جاري التصدير...' : 'تحميل البوستر كصورة فائقة الدقة (PNG 300DPI)'}</span>
                </button>

                {/* 3. Download QR Only */}
                <button
                  type="button"
                  onClick={handleDownloadQrOnly}
                  className="px-4 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs flex items-center gap-2 border border-gray-700 transition-all cursor-pointer"
                  title="تحميل رمز الاستجابة السريعة بدقة 1024x1024 بكسل"
                >
                  <FileImage size={15} />
                  <span>تحميل رمز QR فقط</span>
                </button>
              </div>

            </div>

          </div>

          {/* Footer Info */}
          <div className="p-3 bg-gray-950 border-t border-gray-800 text-center text-[11px] text-gray-500">
            💡 نصيحة: يمكنك طباعة البوستر وتعليقه عند مدخل المتجر أو بجانب نقطة البيع (الكاشير) لتسهيل تصفح الزبائن وطلب خدمات الطباعة مباشرة.
          </div>

        </div>
      </div>
    </>
  );
};
