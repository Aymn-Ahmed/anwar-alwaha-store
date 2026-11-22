import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, BarcodeImageStats } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';

interface BarcodeImageFetcherModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const BATCH_SIZE = 25;
const SERPER_KEY_STORAGE = 'anwar_alwaha_serper_api_key';

export const BarcodeImageFetcherModal: React.FC<BarcodeImageFetcherModalProps> = ({
  open,
  onClose,
  onUpdated,
}) => {
  const [stats, setStats] = useState<BarcodeImageStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Serper API Key persisted in localStorage
  const [serperApiKey, setSerperApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(SERPER_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });

  const wasRunningRef = useRef(false);
  const { showToast } = useToast();

  const handleApiKeyChange = (val: string) => {
    setSerperApiKey(val);
    try {
      localStorage.setItem(SERPER_KEY_STORAGE, val.trim());
    } catch {
      // ignore storage errors
    }
  };

  const loadStats = async (silent = false) => {
    try {
      if (!silent) setLoadingStats(true);
      const data = await adminApi.products.getBarcodeImageStats();
      setStats(data);

      if (wasRunningRef.current && !data.isRunning) {
        onUpdated();
      }
      wasRunningRef.current = Boolean(data.isRunning);
    } catch (err: any) {
      if (!silent) {
        showToast(err.message || 'تعذر جلب إحصائيات الصور', 'error');
      }
    } finally {
      if (!silent) setLoadingStats(false);
    }
  };

  // Poll server background status every 3 seconds while modal is open
  useEffect(() => {
    if (!open) return;

    loadStats(false);

    const timer = setInterval(() => {
      loadStats(true);
    }, 3000);

    return () => clearInterval(timer);
  }, [open]);

  const handleStartAutoFetch = async () => {
    const cleanKey = serperApiKey.trim();
    if (!cleanKey) {
      showToast('يرجى إدخال مفتاح Serper API Key أولاً في الحقل المخصص', 'error');
      return;
    }

    try {
      setStarting(true);
      const updated = await adminApi.products.startBarcodeImagesFetch(cleanKey, BATCH_SIZE);
      setStats(updated);
      wasRunningRef.current = Boolean(updated.isRunning);
      showToast('بدأ السحب الآلي للصور في خلفية السيرفر (يستمر حتى لو أغلقت التبويب)', 'success');
    } catch (err: any) {
      showToast(err.message || 'تعذر بدء السحب التلقائي', 'error');
    } finally {
      setStarting(false);
    }
  };

  const handlePause = async () => {
    try {
      setStopping(true);
      const updated = await adminApi.products.stopBarcodeImagesFetch();
      setStats(updated);
      onUpdated();
      showToast('تم إرسال أمر الإيقاف المؤقت — سيتوقف بعد الصنف الحالي', 'info');
    } catch (err: any) {
      showToast(err.message || 'تعذر إيقاف السحب', 'error');
    } finally {
      setStopping(false);
    }
  };

  const handleResetAttempts = async () => {
    if (stats?.isRunning) return;
    if (
      !window.confirm(
        'هل تريد إعادة تعيين المحاولات للأصناف التي لم يُعثر لها على صورة لإعادة فحصها؟'
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      const count = await adminApi.products.resetBarcodeImageAttempts();
      showToast(`تمت إعادة تعيين ${count} صنف لإعادة المحاولة`, 'success');
      await loadStats(false);
    } catch (err: any) {
      showToast(err.message || 'فشل إعادة تعيين المحاولات', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (!open) return null;

  const isRunning = Boolean(stats?.isRunning);
  const sessionProcessed = stats?.sessionProcessed || 0;
  const sessionUploaded = stats?.sessionUploaded || 0;
  const sessionNotFound = stats?.sessionNotFound || 0;
  const eligible = stats?.eligibleForFetchCount || 0;
  const totalSessionScope = sessionProcessed + eligible;
  const progressPercent =
    totalSessionScope > 0
      ? Math.min(100, Math.round((sessionProcessed / totalSessionScope) * 100))
      : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-xl p-6 text-white text-xs space-y-5 shadow-2xl animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/40 text-brand-400 flex items-center justify-center">
              <ImageIcon size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black">
                السحب الآلي لصور المنتجات عبر Google Images (Serper)
              </h2>
              <p className="text-[11px] text-gray-400">
                يعمل في خلفية السيرفر دون توقف حتى عند إغلاق النافذة أو الانتقال لتطبيق آخر
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onUpdated();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg"
            title="إغلاق النافذة (يستمر السحب في الخلفية)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Serper API Key Input */}
        <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-gray-200 flex items-center gap-1.5">
              <KeyRound size={14} className="text-amber-400" />
              <span>مفتاح Serper API Key (يُحفظ تلقائياً ويمكن تبديله عند انتهاء الرصيد)</span>
            </label>
            <a
              href="https://serper.dev/api-key"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-sky-400 hover:underline font-bold"
            >
              الحصول على مفتاح (2,500 بحث مجاني) ↗
            </a>
          </div>
          <input
            type="text"
            dir="ltr"
            value={serperApiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="الصق مفتاح Serper.dev API Key هنا..."
            className="w-full bg-gray-900 border border-gray-700 focus:border-brand-500 text-white font-mono text-xs px-3 py-2.5 rounded-xl focus:outline-none"
          />
        </div>

        {/* Quota Exceeded Alert Banner */}
        {stats?.quotaExceeded && (
          <div className="bg-amber-950/60 border border-amber-500/60 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-200">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-black text-amber-300">توقف الجلب لتبديل المفتاح</div>
              <p className="text-[11px] leading-relaxed">
                {stats.lastMessage ||
                  'انتهى رصيد المفتاح الحالي (2,500 بحث) أو المفتاح غير صالح — الصق المفتاح التالي أعلاه واضغط متابعة الجلب.'}
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {loadingStats && !stats ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 size={28} className="animate-spin text-brand-500" />
            <span>جاري جلب حالة السيرفر وإحصائيات الصور...</span>
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-950/70 border border-gray-800 rounded-2xl p-3.5 text-center space-y-1">
                <span className="text-[11px] text-gray-400 block">إجمالي الأصناف</span>
                <span className="text-lg font-black text-white font-mono">
                  {stats.totalProducts}
                </span>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-2xl p-3.5 text-center space-y-1">
                <span className="text-[11px] text-emerald-300 block">تملك صورة حالياً</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {stats.withImageCount}
                </span>
              </div>

              <div className="bg-sky-950/30 border border-sky-800/50 rounded-2xl p-3.5 text-center space-y-1">
                <span className="text-[11px] text-sky-300 block">المتبقية للجلب</span>
                <span className="text-lg font-black text-sky-400 font-mono">
                  {stats.eligibleForFetchCount}
                </span>
              </div>

              <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-3.5 text-center space-y-1">
                <span className="text-[11px] text-amber-300 block">لم يُعثر لها على صورة</span>
                <span className="text-lg font-black text-amber-400 font-mono">
                  {stats.notFoundCount}
                </span>
              </div>
            </div>

            {/* Live Progress Bar & Session Counters */}
            <div className="bg-gray-950/80 border border-gray-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-gray-300 flex items-center gap-2">
                  {isRunning ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-brand-400" />
                      <span>
                        {stats.lastMessage ||
                          'جاري سحب الصور في خلفية السيرفر (تحديث تلقائي كل 3 ثوانٍ)...'}
                      </span>
                    </>
                  ) : sessionProcessed > 0 ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>{stats.lastMessage || 'متوقف / جاهز للمتابعة'}</span>
                    </>
                  ) : (
                    <span>جاهز لبدء الجلب التلقائي في خلفية السيرفر</span>
                  )}
                </span>
                <span className="font-mono font-black text-brand-400">{progressPercent}%</span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-center">
                <div className="bg-gray-900 rounded-xl py-2 px-2 border border-gray-800">
                  <span className="text-gray-400">تم فحصها بالجلسة: </span>
                  <span className="font-black text-white font-mono">{sessionProcessed}</span>
                </div>
                <div className="bg-gray-900 rounded-xl py-2 px-2 border border-gray-800">
                  <span className="text-gray-400">تم رفع صورها: </span>
                  <span className="font-black text-emerald-400 font-mono">{sessionUploaded}</span>
                </div>
                <div className="bg-gray-900 rounded-xl py-2 px-2 border border-gray-800">
                  <span className="text-gray-400">غير متوفرة: </span>
                  <span className="font-black text-amber-400 font-mono">{sessionNotFound}</span>
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-800">
              <button
                type="button"
                disabled={isRunning || resetting || stats.notFoundCount === 0}
                onClick={handleResetAttempts}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
                <span>إعادة تعيين المحاولات ({stats.notFoundCount})</span>
              </button>

              <div className="flex items-center gap-2">
                {isRunning ? (
                  <button
                    type="button"
                    disabled={stopping}
                    onClick={handlePause}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <Pause size={15} />
                    <span>{stopping ? 'جاري الإيقاف...' : 'إيقاف مؤقت'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={starting || stats.eligibleForFetchCount === 0}
                    onClick={handleStartAutoFetch}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-black px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-brand-600/20 transition-all active:scale-95"
                  >
                    {starting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Play size={15} />
                    )}
                    <span>
                      {sessionProcessed > 0
                        ? `متابعة الجلب التلقائي (${stats.eligibleForFetchCount})`
                        : `بدء الجلب التلقائي (${stats.eligibleForFetchCount})`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
