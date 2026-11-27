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
} from 'lucide-react';
import { playBarcodeBeep } from '../../../utils/audioBeep';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'anwar-barcode-reader-view';
  const lastScannedTimeRef = useRef<number>(0);

  // USB Barcode Scanner hardware listener (PC keyboard wedge)
  const usbBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  const handleBarcodeSuccess = useCallback(
    (decodedText: string) => {
      const now = Date.now();
      // Debounce detections (at least 1.5 seconds between repeated hits)
      if (now - lastScannedTimeRef.current < 1500) return;
      lastScannedTimeRef.current = now;

      const cleanBarcode = decodedText.trim();
      if (!cleanBarcode) return;

      playBarcodeBeep();
      onBarcodeDetected(cleanBarcode);
    },
    [onBarcodeDetected]
  );

  // Stop camera cleanly
  const stopCamera = useCallback(async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch {
      // Ignore stop failure
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!isOpen) return;
    setIsStarting(true);
    setScannerError(null);

    try {
      await stopCamera();

      // Ensure DOM element is mounted
      const element = document.getElementById(scannerContainerId);
      if (!element) return;

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
      ];

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport,
        verbose: false,
      });
      scannerRef.current = html5QrCode;

      // Enumerate available cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if not set
          if (!selectedCameraId) {
            const backCam = devices.find(
              (d) =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('rear') ||
                d.label.toLowerCase().includes('environment')
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        }
      } catch {
        // Ignore enumeration errors
      }

      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleBarcodeSuccess(decodedText);
        },
        () => {
          // Frame decode misses are normal while searching
        }
      );

      // Check if camera has torch (flashlight) support
      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities();
        if (capabilities && (capabilities as any).torch) {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
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

  useEffect(() => {
    if (isOpen) {
      // Delay slightly to ensure modal DOM container is fully mounted
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  // USB Barcode Scanner hardware listener (captures rapid keystrokes from USB scanner)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on an input element, do not hijack
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

      // Hardware scanners typically send keys with < 50ms intervals
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

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState } as any],
      });
      setTorchOn(nextState);
    } catch {
      // Torch apply failed
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCode.trim();
    if (!clean) return;
    handleBarcodeSuccess(clean);
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>مسح باركود الصنف بالكاميرا</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  مباشر
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                وجه كاميرا الجوال نحو باركود الصنف الموجود على الرف
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
          {/* HTML5 QR Code Container */}
          <div
            id={scannerContainerId}
            className="w-full h-full min-h-[300px] object-cover"
          />

          {/* Visual Reticle Laser Line Overlay */}
          {!scannerError && !isStarting && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-44 border-2 border-emerald-500/70 rounded-2xl relative shadow-2xl">
                {/* Corner Accents */}
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-emerald-400 rounded-tr" />
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-emerald-400 rounded-tl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-emerald-400 rounded-br" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-emerald-400 rounded-bl" />

                {/* Animated Red Laser Scan Line */}
                <div className="absolute inset-x-2 h-0.5 bg-red-500/80 shadow-[0_0_8px_#ef4444] animate-pulse top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Loading or Starting State */}
          {isStarting && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-2 text-gray-400">
              <RefreshCw size={24} className="animate-spin text-brand-400" />
              <span className="text-xs font-bold">جاري تشغيل عدسة الكاميرا...</span>
            </div>
          )}

          {/* Error State */}
          {scannerError && (
            <div className="absolute inset-0 bg-black/95 p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                <Scan size={24} />
              </div>
              <p className="text-xs text-red-300 leading-relaxed max-w-xs">{scannerError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          )}

          {/* In-view Camera Toolbar (Flashlight & Camera Switch) */}
          <div className="absolute bottom-3 inset-x-4 flex items-center justify-between pointer-events-auto">
            {hasTorch ? (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2.5 rounded-2xl backdrop-blur-md border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  torchOn
                    ? 'bg-amber-500 text-black border-amber-400 shadow-lg'
                    : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                }`}
                title="تشغيل إضاءة الفلاش"
              >
                {torchOn ? <Flashlight size={16} /> : <FlashlightOff size={16} />}
                <span>{torchOn ? 'إطفاء الفلاش' : 'تشغيل الفلاش'}</span>
              </button>
            ) : (
              <div />
            )}

            {cameras.length > 1 && (
              <select
                value={selectedCameraId || ''}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="bg-black/70 backdrop-blur-md text-white text-[11px] px-2.5 py-1.5 rounded-xl border border-white/20 focus:outline-none"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `كاميرا ${c.id.slice(0, 4)}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Footer: Manual Barcode Entry Fallback + USB Barcode Notification */}
        <div className="p-4 bg-gray-900/90 border-t border-gray-800 space-y-3">
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Keyboard
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                dir="ltr"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="أو أدخل رقم الباركود يدوياً / بجهاز USB..."
                className="w-full bg-gray-950 border border-gray-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0"
            >
              <span>بحث</span>
              <ArrowRight size={13} />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
            <span>⚡ يدعم قارئ الباركود اللاسلكي USB تلقائياً</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Volume2 size={11} />
              <span>نغمة تأكيد عند المسح</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
