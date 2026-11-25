import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  Palette,
  Layers,
  FileImage,
  Sparkles,
  Truck,
  CreditCard,
  Printer as PrintIcon,
  Store,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface StoreQrPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PosterTheme = 'light' | 'emerald' | 'dark';
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
  // Default to Clean Crisp White & Gold for optimal printing
  const [theme, setTheme] = useState<PosterTheme>('light');
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
    showToast('تم تحميل رمز QR بدقة فائقة (1024x1024px)!', 'success');
  };

  const handleDownloadPoster = async () => {
    try {
      setIsExporting(true);
      showToast('جاري تصدير البوستر بدقة طباعة 300 DPI...', 'info');

      // Create high-res export canvas (300 DPI ready: 1600 x 2260 for poster, 1600 x 1600 for sticker)
      const canvas = document.createElement('canvas');
      const isSticker = layout === 'sticker';
      const width = 1600;
      const height = isSticker ? 1600 : 2260;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('تعذر تشغيل محرك الرسوم');

      // 1. Draw Background
      if (theme === 'dark') {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'emerald') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#064E3B');
        bgGrad.addColorStop(1, '#022C22');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Light clean paper print (Pure White)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Draw Subtle Outer Border
      ctx.lineWidth = 10;
      ctx.strokeStyle =
        theme === 'light'
          ? '#D97706' // Warm Gold
          : theme === 'emerald'
          ? '#F59E0B' // Royal Gold
          : '#334155'; // Muted Platinum
      ctx.strokeRect(50, 50, width - 100, height - 100);

      // Inner thin hairline
      ctx.lineWidth = 2;
      ctx.strokeStyle =
        theme === 'light'
          ? '#E5E7EB'
          : theme === 'emerald'
          ? 'rgba(253, 230, 138, 0.4)'
          : 'rgba(255, 255, 255, 0.15)';
      ctx.strokeRect(66, 66, width - 132, height - 132);

      ctx.textAlign = 'center';
      ctx.direction = 'rtl';

      // 3. Header: Store Emblem & Title
      ctx.fillStyle =
        theme === 'light'
          ? '#111827' // Pitch Charcoal/Black
          : '#FFFFFF'; // Pure High-Contrast White
      ctx.font = '900 74px "Cairo", "Segoe UI", sans-serif';
      ctx.fillText('مكتبة ومتجر أنوار الواحة', width / 2, isSticker ? 180 : 210);

      // Subtitle
      ctx.fillStyle =
        theme === 'light'
          ? '#D97706' // Warm Gold
          : theme === 'emerald'
          ? '#FBBF24' // Soft Gold
          : '#94A3B8'; // Crisp Light Slate
      ctx.font = 'bold 36px "Cairo", sans-serif';
      ctx.fillText(
        'خميس مشيط • قرطاسية • طباعة • توصيل فوري',
        width / 2,
        isSticker ? 245 : 285
      );

      // Call to action Headline
      ctx.fillStyle =
        theme === 'light'
          ? '#111827'
          : '#FFFFFF';
      ctx.font = '900 62px "Cairo", sans-serif';
      ctx.fillText(titleText, width / 2, isSticker ? 340 : 400);

      // Sub-headline explanation
      if (!isSticker) {
        ctx.fillStyle =
          theme === 'light'
            ? '#6B7280'
            : theme === 'emerald'
            ? '#E2E8F0'
            : '#CBD5E1';
        ctx.font = '500 32px "Cairo", sans-serif';
        ctx.fillText(subtitleText, width / 2, 465);
      }

      // 4. Draw White Container for QR
      const qrBoxSize = isSticker ? 880 : 960;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = isSticker ? 410 : 540;

      // Card background
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 44);
      ctx.fill();

      // Card border
      ctx.lineWidth = 6;
      ctx.strokeStyle =
        theme === 'light'
          ? '#F3F4F6'
          : theme === 'emerald'
          ? '#F59E0B'
          : '#E2E8F0';
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
      const urlPillY = isSticker ? 1360 : 1580;
      ctx.fillStyle =
        theme === 'light'
          ? '#F9FAFB'
          : theme === 'emerald'
          ? 'rgba(0, 0, 0, 0.45)'
          : '#1E293B';
      const pillW = 1040;
      const pillH = 92;
      ctx.beginPath();
      ctx.roundRect((width - pillW) / 2, urlPillY, pillW, pillH, 46);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle =
        theme === 'light'
          ? '#E5E7EB'
          : theme === 'emerald'
          ? 'rgba(245, 158, 11, 0.4)'
          : '#334155';
      ctx.stroke();

      ctx.fillStyle =
        theme === 'light'
          ? '#111827'
          : theme === 'emerald'
          ? '#FDE68A'
          : '#F8FAFC';
      ctx.font = 'bold 36px monospace';
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
            theme === 'light'
              ? '#F9FAFB'
              : 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.roundRect(bx - 215, badgesY, 430, 96, 26);
          ctx.fill();

          ctx.lineWidth = 2;
          ctx.strokeStyle =
            theme === 'light'
              ? '#E5E7EB'
              : 'rgba(255, 255, 255, 0.2)';
          ctx.stroke();

          ctx.fillStyle =
            theme === 'light'
              ? '#111827'
              : '#FFFFFF';
          ctx.font = 'bold 30px "Cairo", sans-serif';
          ctx.fillText(b, bx, badgesY + 60);
        });

        // Bottom footer instructions
        ctx.fillStyle =
          theme === 'light'
            ? '#6B7280'
            : theme === 'emerald'
            ? '#A7F3D0'
            : '#94A3B8';
        ctx.font = '600 30px "Cairo", sans-serif';
        ctx.fillText(
          'افتح كاميرا جوالك وامسح الكود للطلب المباشر من المتصفح بدون تحميل تطبيق',
          width / 2,
          1980
        );

        ctx.fillStyle = '#D97706';
        ctx.font = '900 34px "Cairo", sans-serif';
        ctx.fillText('مكتبة ومتجر أنوار الواحة • فرع خميس مشيط', width / 2, 2060);
      } else {
        ctx.fillStyle =
          theme === 'light'
            ? '#6B7280'
            : '#E2E8F0';
        ctx.font = 'bold 30px "Cairo", sans-serif';
        ctx.fillText('افتح كاميرا الجوال وامسح الكود للطلب مباشرة', width / 2, 1500);
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
            width: 88% !important;
            max-width: 580px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 2px solid #D97706 !important;
            page-break-inside: avoid !important;
            background: #ffffff !important;
            color: #111827 !important;
          }
          #store-qr-printable-poster .print-hide {
            display: none !important;
          }
        }
      `}</style>

      {/* Hidden 1024px High-Res Canvas used as crisp source */}
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <div className="w-full max-w-5xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>بوستر وباركود المتجر للطباعة</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    جاهز للطباعة 300 DPI
                  </span>
                </h3>
                <p className="text-xs text-gray-500">
                  صمم واطبع بوستر أو ملصق QR لمتجرك لعرضه في الفرع أو على الأكياس والمطبوعات.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body: Controls & Live Preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 5 Columns: Modern Clean Control Cards */}
            <div className="lg:col-span-5 space-y-4 text-xs text-gray-800">
              
              {/* Target URL */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5">
                <label className="font-bold text-gray-900 block">
                  رابط المتجر المستهدف (QR URL):
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  dir="ltr"
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono focus:outline-none focus:border-black transition-colors"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-[11px] font-bold transition-colors shadow-xs"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUrl(defaultUrl)}
                    className="px-2 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 text-[10px]"
                  >
                    الرئيسية
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetUrl(`${defaultUrl}/services`)}
                    className="px-2 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 text-[10px]"
                  >
                    الخدمات والطباعة
                  </button>
                </div>
              </div>

              {/* Theme Selector (3 High-Contrast Modern Palettes) */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5">
                <label className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-600" />
                  <span>طابع وألوان التصميم (Theme):</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Theme 1: Light White & Gold (Default) */}
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      theme === 'light'
                        ? 'border-amber-500 bg-amber-50/60 text-amber-900 font-black shadow-xs ring-2 ring-amber-500/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-white border-2 border-amber-500 shadow-xs" />
                    <span className="text-[11px]">أبيض وذهبي</span>
                  </button>

                  {/* Theme 2: Emerald Luxury */}
                  <button
                    type="button"
                    onClick={() => setTheme('emerald')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      theme === 'emerald'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-600/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-emerald-800 border border-emerald-600" />
                    <span className="text-[11px]">زمردي ملكي</span>
                  </button>

                  {/* Theme 3: Royal Dark */}
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      theme === 'dark'
                        ? 'border-zinc-900 bg-zinc-100 text-zinc-950 font-black shadow-xs ring-2 ring-zinc-900/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-zinc-900 border border-zinc-700" />
                    <span className="text-[11px]">أسود ملكي</span>
                  </button>
                </div>
              </div>

              {/* Layout Presets */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5">
                <label className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Layers size={14} className="text-amber-600" />
                  <span>نوع التصميم والمقاس (Layout):</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLayout('poster')}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      layout === 'poster'
                        ? 'border-zinc-900 bg-white text-zinc-950 font-black shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-black text-xs mb-0.5">📄 بوستر واستند (A4 / A5)</div>
                    <div className="text-[10px] text-gray-500">شامل العنوان والمميزات الكاملة</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayout('sticker')}
                    className={`p-3 rounded-xl border text-right transition-all ${
                      layout === 'sticker'
                        ? 'border-zinc-900 bg-white text-zinc-950 font-black shadow-xs'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-black text-xs mb-0.5">🏷️ ملصق كاشير وأكياس (مربع)</div>
                    <div className="text-[10px] text-gray-500">تصميم مدمج سريع يركز على الرمز</div>
                  </button>
                </div>
              </div>

              {/* Custom Headline & Subtitle */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div>
                  <label className="font-bold text-gray-900 block mb-1">عبارة الحث على الطلب:</label>
                  <input
                    type="text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                {layout === 'poster' && (
                  <div>
                    <label className="font-bold text-gray-900 block mb-1">السطر التوضيحي:</label>
                    <input
                      type="text"
                      value={subtitleText}
                      onChange={(e) => setSubtitleText(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Right 7 Columns: Live Luxury Preview & Action Buttons */}
            <div className="lg:col-span-7 flex flex-col items-center justify-start gap-4">
              
              {/* STUDIO BACKGROUND FOR PREVIEW */}
              <div className="w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-gray-100 to-gray-200/80 rounded-3xl border border-gray-200 shadow-inner">
                
                {/* THE PRINTABLE POSTER CARD CONTAINER */}
                <div
                  id="store-qr-printable-poster"
                  className={`w-full max-w-[360px] p-6 rounded-3xl border-2 text-center transition-all shadow-xl relative ${
                    theme === 'light'
                      ? 'theme-light bg-white border-amber-500/80 text-gray-900 shadow-amber-900/5'
                      : theme === 'emerald'
                      ? 'theme-emerald bg-gradient-to-b from-emerald-900 via-emerald-950 to-[#022c22] border-amber-400 text-white keep-white shadow-emerald-950/40'
                      : 'theme-dark bg-slate-900 border-slate-700 text-white keep-white shadow-slate-950/40'
                  }`}
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : theme === 'emerald' ? '#064e3b' : '#0f172a',
                    color: theme === 'light' ? '#111827' : '#ffffff',
                  }}
                >
                  {/* Subtle inner hairline accent */}
                  <div
                    className={`absolute inset-2.5 rounded-2xl border pointer-events-none ${
                      theme === 'light'
                        ? 'border-gray-200'
                        : theme === 'emerald'
                        ? 'border-amber-400/30'
                        : 'border-white/10'
                    }`}
                  />

                  {/* Store Identity */}
                  <div className="space-y-1 mb-3.5 relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl text-xl mb-1 shadow-xs border ${
                        theme === 'light'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : theme === 'emerald'
                          ? 'bg-emerald-800/80 border-amber-400/40 text-amber-300'
                          : 'bg-white/10 border-white/10 text-white'
                      }`}
                    >
                      📚
                    </div>
                    <h2
                      className="text-lg font-black tracking-tight"
                      style={{ color: theme === 'light' ? '#111827' : '#ffffff' }}
                    >
                      مكتبة ومتجر أنوار الواحة
                    </h2>
                    <p
                      className="text-[10px] font-bold"
                      style={{
                        color: theme === 'light' ? '#b45309' : theme === 'emerald' ? '#fde68a' : '#e2e8f0',
                      }}
                    >
                      خميس مشيط • قرطاسية • طباعة • توصيل
                    </p>
                  </div>

                  {/* Headline */}
                  <div className="space-y-1 mb-3 relative z-10">
                    <h3
                      className="text-sm sm:text-base font-black"
                      style={{
                        color: theme === 'light' ? '#111827' : theme === 'emerald' ? '#fde68a' : '#ffffff',
                      }}
                    >
                      {titleText}
                    </h3>
                    {layout === 'poster' && (
                      <p
                        className="text-[10px] leading-relaxed font-medium"
                        style={{
                          color: theme === 'light' ? '#4b5563' : theme === 'emerald' ? '#e2e8f0' : '#cbd5e1',
                        }}
                      >
                        {subtitleText}
                      </p>
                    )}
                  </div>

                  {/* QR Code Container with High-Contrast White Background */}
                  <div className="my-2 p-3 bg-white rounded-2xl inline-block shadow-sm border border-gray-200 relative z-10">
                    <QRCodeCanvas
                      value={targetUrl}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Store Link Pill */}
                  <div className="my-2 relative z-10">
                    <span
                      className="inline-block font-mono text-[10px] font-bold px-3 py-1 rounded-xl border"
                      style={{
                        backgroundColor: theme === 'light' ? '#f9fafb' : 'rgba(0, 0, 0, 0.45)',
                        color: theme === 'light' ? '#111827' : theme === 'emerald' ? '#fde68a' : '#ffffff',
                        borderColor: theme === 'light' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)',
                      }}
                      dir="ltr"
                    >
                      {targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  </div>

                  {/* Poster Selling Points (Only in Poster Layout) */}
                  {layout === 'poster' && (
                    <div className="grid grid-cols-3 gap-1.5 my-2.5 text-[9px] font-bold relative z-10">
                      <div
                        className="p-1.5 rounded-xl border font-bold"
                        style={{
                          backgroundColor: theme === 'light' ? '#f9fafb' : 'rgba(255, 255, 255, 0.12)',
                          color: theme === 'light' ? '#111827' : '#ffffff',
                          borderColor: theme === 'light' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        ⚡ توصيل سريع
                      </div>
                      <div
                        className="p-1.5 rounded-xl border font-bold"
                        style={{
                          backgroundColor: theme === 'light' ? '#f9fafb' : 'rgba(255, 255, 255, 0.12)',
                          color: theme === 'light' ? '#111827' : '#ffffff',
                          borderColor: theme === 'light' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        💳 دفع إلكتروني
                      </div>
                      <div
                        className="p-1.5 rounded-xl border font-bold"
                        style={{
                          backgroundColor: theme === 'light' ? '#f9fafb' : 'rgba(255, 255, 255, 0.12)',
                          color: theme === 'light' ? '#111827' : '#ffffff',
                          borderColor: theme === 'light' ? '#e5e7eb' : 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        🖨️ طباعة فورية
                      </div>
                    </div>
                  )}

                  {/* Footer note */}
                  <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-[9px] font-medium relative z-10">
                    <p
                      className="text-[9px] font-medium"
                      style={{
                        color: theme === 'light' ? '#6b7280' : theme === 'emerald' ? '#a7f3d0' : '#cbd5e1',
                      }}
                    >
                      افتح كاميرا جوالك وامسح الرمز لطلب خدماتنا مباشرة
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: ALL 3 VISIBLE DIRECTLY UNDER THE POSTER PREVIEW WITHOUT SCROLLING */}
              <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-1">
                {/* 1. Download High-Res PNG (Primary Action) */}
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  disabled={isExporting}
                  style={{ backgroundColor: '#09090b', color: '#ffffff' }}
                  className="btn-dark-export flex-1 px-4 py-3 rounded-2xl bg-zinc-950 hover:bg-black !text-white keep-white font-black text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download size={15} className="!text-white" style={{ color: '#ffffff' }} />
                  <span className="keep-white !text-white font-black" style={{ color: '#ffffff' }}>
                    {isExporting ? 'جاري التصدير...' : 'تحميل البوستر كصورة (PNG)'}
                  </span>
                </button>

                {/* 2. Direct Print */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-900 font-black text-xs flex items-center justify-center gap-2 border border-gray-300 shadow-xs active:scale-98 transition-all cursor-pointer"
                >
                  <Printer size={15} />
                  <span>طباعة مباشرة (A4 / A5)</span>
                </button>

                {/* 3. Download QR Only */}
                <button
                  type="button"
                  onClick={handleDownloadQrOnly}
                  className="px-3.5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-200 transition-all cursor-pointer"
                  title="تحميل رمز الاستجابة السريعة QR فقط بدقة 1024x1024px"
                >
                  <FileImage size={14} />
                  <span>رمز QR فقط</span>
                </button>
              </div>

            </div>

          </div>

          {/* Clean Footer Note */}
          <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-500">
            💡 نصيحة للطباعة: للحصول على أفضل دقة، اختر خيار «أبيض وذهبي» واطبع على ورق مقوى (Glossy أو Cardstock) بقياس A4 أو A5.
          </div>

        </div>
      </div>
    </>
  );
};
