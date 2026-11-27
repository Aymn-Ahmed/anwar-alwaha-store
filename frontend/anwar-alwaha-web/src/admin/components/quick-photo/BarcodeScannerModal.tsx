import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  X,
  Camera,
  Scan,
  Volume2,
  RefreshCw,
  Flashlight,
  FlashlightOff,
  Keyboard,
  ArrowRight,
  SwitchCamera,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { playBarcodeBeep } from '../../../utils/audioBeep';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  isDetectionPaused?: boolean;
  sessionCount?: number;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

const BARCODE_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'qr_code',
  'data_matrix',
];

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  isDetectionPaused = false,
  sessionCount = 0,
  onClose,
  onBarcodeDetected,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [usingNativeDetector, setUsingNativeDetector] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const html5ScannerRef = useRef<Html5Qrcode | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isDetectionPausedRef = useRef(isDetectionPaused);
  const lastScannedTimeRef = useRef<number>(0);
  const html5ContainerId = 'anwar-fallback-barcode-reader';

  // Keep isDetectionPausedRef in sync
  useEffect(() => {
    isDetectionPausedRef.current = isDetectionPaused;
  }, [isDetectionPaused]);

  // USB Barcode Scanner hardware listener (PC / Bluetooth keyboard wedge)
  const usbBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  // Successful Barcode Decode Handler
  const handleBarcodeSuccess = useCallback(
    (decodedText: string) => {
      if (isDetectionPausedRef.current) return;

      const now = Date.now();
      // Debounce detections: at least 1200ms between scans of the same code
      if (now - lastScannedTimeRef.current < 1200) return;
      lastScannedTimeRef.current = now;

      const cleanBarcode = decodedText.trim();
      if (!cleanBarcode) return;

      // 1. Play sound confirmation immediately
      playBarcodeBeep();

      // 2. Pause detection instantly to prevent duplicate triggers
      isDetectionPausedRef.current = true;

      // 3. Notify parent component to open the focused card
      onBarcodeDetected(cleanBarcode);
    },
    [onBarcodeDetected]
  );

  // Stop camera tracks cleanly
  const stopCamera = useCallback(async () => {
    // 1. Stop animation frame loop
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // 2. Turn off torch if active
    if (mediaStreamRef.current && torchOn) {
      try {
        const track = mediaStreamRef.current.getVideoTracks()[0];
        if (track && (track as any).applyConstraints) {
          await (track as any).applyConstraints({ advanced: [{ torch: false }] });
        }
      } catch {}
      setTorchOn(false);
    }

    // 3. Stop HTML5 fallback scanner if running
    if (html5ScannerRef.current && html5ScannerRef.current.isScanning) {
      try {
        await html5ScannerRef.current.stop();
        html5ScannerRef.current.clear();
      } catch {}
      html5ScannerRef.current = null;
    }

    // 4. Stop direct MediaStream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [torchOn]);

  // Start Camera with Hardware-accelerated BarcodeDetector (or HTML5 fallback)
  const startCamera = useCallback(async () => {
    if (!isOpen) return;
    setIsStarting(true);
    setScannerError(null);
    setHasTorch(false);
    setTorchOn(false);

    try {
      await stopCamera();

      // Enumerate video devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 0) {
          // Sort rear/back/environment cameras first
          const sorted = [...videoDevices].sort((a, b) => {
            const aLabel = (a.label || '').toLowerCase();
            const bLabel = (b.label || '').toLowerCase();
            const aIsBack = aLabel.includes('back') || aLabel.includes('rear') || aLabel.includes('environment');
            const bIsBack = bLabel.includes('back') || bLabel.includes('rear') || bLabel.includes('environment');
            if (aIsBack && !bIsBack) return -1;
            if (!aIsBack && bIsBack) return 1;
            return 0;
          });
          setCameras(sorted);
        }
      } catch {
        // Device enumeration is non-fatal
      }

      const hasNativeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

      if (hasNativeDetector) {
        // ==========================================
        // 1. ULTRA-FAST NATIVE BarcodeDetector PATH (<50ms hardware decode)
        // ==========================================
        setUsingNativeDetector(true);

        const constraints: MediaStreamConstraints = {
          audio: false,
          video: selectedCameraId
            ? {
                deviceId: { exact: selectedCameraId },
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
              }
            : {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
              },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;

        // Check torch capabilities on the active video track
        const track = stream.getVideoTracks()[0];
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities() as any;
          if (caps && caps.torch) {
            setHasTorch(true);
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Initialize Native BarcodeDetector
        const detector = new (window as any).BarcodeDetector({
          formats: BARCODE_FORMATS,
        });

        let lastCheck = 0;
        const scanFrame = async (time: number) => {
          if (!isMountedRef.current || !isOpen) return;

          if (
            !isDetectionPausedRef.current &&
            videoRef.current &&
            videoRef.current.readyState >= 2
          ) {
            // Check frame every ~50ms (20fps hardware detection)
            if (time - lastCheck > 50) {
              lastCheck = time;
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0 && !isDetectionPausedRef.current) {
                  const raw = barcodes[0].rawValue?.trim();
                  if (raw) {
                    handleBarcodeSuccess(raw);
                  }
                }
              } catch {
                // Frame miss is normal while user is aiming
              }
            }
          }

          rafIdRef.current = requestAnimationFrame(scanFrame);
        };

        rafIdRef.current = requestAnimationFrame(scanFrame);
      } else {
        // ==========================================
        // 2. HTML5-QRCODE FALLBACK PATH (e.g., iOS Safari)
        // ==========================================
        setUsingNativeDetector(false);

        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];

        const html5Qr = new Html5Qrcode(html5ContainerId, {
          formatsToSupport,
          verbose: false,
        });
        html5ScannerRef.current = html5Qr;

        const cameraConfig = selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: 'environment' };

        await html5Qr.start(
          cameraConfig,
          {
            fps: 20,
            qrbox: { width: 340, height: 160 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isDetectionPausedRef.current) {
              handleBarcodeSuccess(decodedText);
            }
          },
          () => {}
        );

        try {
          const capabilities = html5Qr.getRunningTrackCapabilities();
          if (capabilities && (capabilities as any).torch) {
            setHasTorch(true);
          }
        } catch {
          setHasTorch(false);
        }
      }
    } catch (err: any) {
      setScannerError(
        err?.message ||
          'تعذر فتح الكاميرا. يرجى التأكد من منح الإذن لاستخدام الكاميرا في المتصفح.'
      );
    } finally {
      setIsStarting(false);
    }
  }, [isOpen, selectedCameraId, handleBarcodeSuccess, stopCamera]);

  // Mount / Unmount lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Flashlight / Torch toggle reliably using active MediaStreamTrack
  const toggleTorch = async () => {
    if (!hasTorch) return;
    try {
      const nextState = !torchOn;

      if (mediaStreamRef.current) {
        const track = mediaStreamRef.current.getVideoTracks()[0];
        if (track && (track as any).applyConstraints) {
          await (track as any).applyConstraints({
            advanced: [{ torch: nextState }],
          });
          setTorchOn(nextState);
        }
      } else if (html5ScannerRef.current) {
        await html5ScannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextState } as any],
        });
        setTorchOn(nextState);
      }
    } catch (err) {
      console.warn('Torch toggle not supported on this track', err);
    }
  };

  // 1-Tap Switch Camera Lens (Cycle between rear lenses)
  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const nextIdx = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIdx);
    setSelectedCameraId(cameras[nextIdx].deviceId);
  };

  // USB Barcode Scanner hardware listener (captures rapid keystrokes from USB scanner)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        if (usbBufferRef.current.length >= 3) {
          const barcode = usbBufferRef.current.trim();
          usbBufferRef.current = '';
          handleBarcodeSuccess(barcode);
        }
        usbBufferRef.current = '';
        return;
      }

      if (timeDiff > 120) {
        usbBufferRef.current = '';
      }

      if (e.key.length === 1) {
        usbBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleBarcodeSuccess]);

  // Manual barcode form submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim();
    if (!clean) return;
    handleBarcodeSuccess(clean);
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* 1. HIGH-CONTRAST TOP HEADER (Light Theme) */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex items-center justify-between shadow-xs z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Camera size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                ماسح باركود الرفوف السريع
              </h2>
              {sessionCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-black animate-in zoom-in-75">
                  <CheckCircle size={12} className="text-emerald-600" />
                  <span>تم تحديث {sessionCount.toLocaleString('ar-SA')} أصناف</span>
                </span>
              ) : (
                <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-full font-bold">
                  {usingNativeDetector ? '⚡ عتاد فائق السرعة' : 'مباشر'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              وجّه الكاميرا نحو باركود الصنف لمسح فوري بدون تأخير
            </p>
          </div>
        </div>

        {/* Crisp Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
          title="إغلاق الماسح"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. FULL-SCREEN CAMERA VIEWPORT & VIEWFINDER */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {/* Direct Native Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${usingNativeDetector ? 'block' : 'hidden'}`}
        />

        {/* HTML5 QR Fallback Container (for iOS Safari) */}
        <div
          id={html5ContainerId}
          className={`w-full h-full object-cover ${!usingNativeDetector ? 'block' : 'hidden'}`}
        />

        {/* WIDE HORIZONTAL RETICLE FOR RETAIL LINEAR BARCODES */}
        {!scannerError && !isStarting && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            <div className="w-[86vw] max-w-sm h-36 sm:h-40 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_35px_rgba(16,185,129,0.35)]">
              {/* Crisp Corner Accents */}
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
              <span className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
              <span className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />

              {/* Animated Red Laser Scan Line across the center */}
              <div className="absolute inset-x-3 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse top-1/2 -translate-y-1/2" />
            </div>

            <p className="mt-4 text-xs font-bold text-white bg-black/60 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
              ضع خطوط الباركود داخل المستطيل الأخضر
            </p>
          </div>
        )}

        {/* Camera Starting Spinner */}
        {isStarting && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 text-white">
            <RefreshCw size={28} className="animate-spin text-emerald-400" />
            <span className="text-xs font-bold">جاري تشغيل العدسة والحساسات...</span>
          </div>
        )}

        {/* Detection Paused Indicator (When editing product) */}
        {isDetectionPaused && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-2xs flex items-center justify-center pointer-events-none z-10 animate-in fade-in">
            <div className="bg-emerald-600/95 text-white text-xs font-black px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
              <CheckCircle size={16} />
              <span>تم التقاط الباركود ✓ الكاميرا جاهزة للمسح التالي فور الحفظ</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {scannerError && (
          <div className="absolute inset-0 bg-black/95 p-6 flex flex-col items-center justify-center text-center gap-3 text-white">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <Scan size={26} />
            </div>
            <p className="text-xs text-red-300 leading-relaxed max-w-xs">{scannerError}</p>
            <button
              type="button"
              onClick={startCamera}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>إعادة تشغيل الكاميرا</span>
            </button>
          </div>
        )}

        {/* HIGH-CONTRAST FLOATING CONTROLS (Torch & Lens Switcher) */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-auto z-20">
          {/* Flashlight / Torch Button */}
          {hasTorch ? (
            <button
              type="button"
              onClick={toggleTorch}
              className={`px-3.5 py-2 rounded-2xl backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                torchOn
                  ? 'bg-amber-400 text-slate-950 border border-amber-300 font-black'
                  : 'bg-white/95 text-slate-900 border border-slate-200 hover:bg-white'
              }`}
              title="تشغيل إضاءة الفلاش"
            >
              {torchOn ? <Flashlight size={15} /> : <FlashlightOff size={15} />}
              <span>{torchOn ? 'إطفاء الفلاش 💡' : 'تشغيل الفلاش 🔦'}</span>
            </button>
          ) : (
            <div />
          )}

          {/* 1-Tap Switch Camera Lens Button */}
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white text-slate-900 border border-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all cursor-pointer"
              title="تبديل عدسة الكاميرا"
            >
              <SwitchCamera size={15} className="text-emerald-700" />
              <span>تبديل العدسة ({currentCameraIndex + 1}/{cameras.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. HIGH-CONTRAST BOTTOM BAR (Manual Entry + USB Scanner Support) */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-2.5 shrink-0 z-20 shadow-lg">
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Keyboard
              size={15}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              dir="ltr"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="أو أدخل رقم الباركود يدوياً / بجهاز قارئ USB..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9.5 pl-3 py-2 text-xs text-slate-900 font-mono placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCode.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <span>بحث</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" />
            <span>يدعم قارئ الباركود اللاسلكي USB تلقائياً</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <Volume2 size={12} />
            <span>نغمة تأكيد فورية 🔔</span>
          </span>
        </div>
      </div>
    </div>
  );
};
