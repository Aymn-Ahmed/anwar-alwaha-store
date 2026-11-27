import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  BellOff,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { AdminSidebar } from './components/AdminSidebar';
import { StoreQrPosterModal } from './components/StoreQrPosterModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../api/adminApi';

const ADMIN_THEME_KEY = 'anwar_admin_theme';
const ADMIN_SOUND_KEY = 'anwar_admin_sound_enabled';

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.16);
    playTone(1174.66, now + 0.16, 0.25);
  } catch {
    // ignore audio autoplay restriction if not interacted yet
  }
}

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  // Default to high-contrast Light Mode ('light')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_THEME_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SOUND_KEY);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const lastKnownOrderCountRef = useRef<number | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(ADMIN_THEME_KEY, next);
      } catch {}
      return next;
    });
  };

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ADMIN_SOUND_KEY, String(next));
      } catch {}
      if (next) {
        playNotificationChime();
        showToast('تم تفعيل صوت التنبيهات للطلبات الجديدة 🔔', 'success');
      } else {
        showToast('تم كتم صوت التنبيهات 🔕', 'info');
      }
      return next;
    });
  }, [showToast]);

  // Poll order count in background to play chime when a new order arrives
  useEffect(() => {
    let isMounted = true;

    const checkNewOrders = async () => {
      try {
        const stats = await adminApi.dashboard.getStats();
        if (!isMounted || !stats) return;

        if (
          lastKnownOrderCountRef.current !== null &&
          stats.totalOrders > lastKnownOrderCountRef.current
        ) {
          if (soundEnabled) {
            playNotificationChime();
          }
          showToast('🔔 وصل طلب جديد إلى المتجر الآن!', 'success');
        }
        lastKnownOrderCountRef.current = stats.totalOrders;
      } catch {
        // ignore polling errors
      }
    };

    checkNewOrders();
    const timer = setInterval(checkNewOrders, 25000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [soundEnabled, showToast]);

  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex font-cairo transition-colors duration-200 ${
        isLight
          ? 'admin-light-theme bg-[#F8FAFC] text-slate-900'
          : 'admin-dark-theme bg-gray-950 text-gray-100'
      }`}
    >
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenQrModal={() => setQrModalOpen(true)}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 lg:pr-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-gray-200">
                لوحة إدارة مكتبة أنوار الواحة
              </span>
            </div>
          </div>

          {/* Practical Top Toolbar Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Light / Dark Mode Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="تبديل المظهر بين النهاري والليلي"
            >
              {isLight ? (
                <>
                  <Sun size={14} className="text-amber-500" />
                  <span>الوضع النهاري ☀️</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-sky-400" />
                  <span>الوضع الليلي 🌙</span>
                </>
              )}
            </button>

            {/* 2. Sound Alert Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-400'
                  : 'border-gray-700 bg-gray-800 text-gray-400'
              }`}
              title="تفعيل أو كتم صوت التنبيهات عند وصول طلب جديد"
            >
              {soundEnabled ? <Bell size={14} /> : <BellOff size={14} />}
              <span className="hidden sm:inline">
                {soundEnabled ? 'صوت التنبيهات مفعّل 🔔' : 'التنبيهات مكتومة 🔕'}
              </span>
            </button>

            {/* 3. Store QR Code & Printable Poster */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="إنشاء وتحميل أو طباعة باركود وبوستر المتجر"
            >
              <QrCode size={14} className="text-amber-400" />
              <span>باركود المتجر للطباعة 🏷️</span>
            </button>

            {/* 4. Preview Storefront in New Tab */}
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="فتح واجهة المتجر في تبويب جديد"
            >
              <span>معاينة المتجر ↗️</span>
              <ExternalLink size={13} />
            </Link>

            {/* Admin Profile Pill */}
            <div className="hidden md:flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700/60 text-xs text-gray-300">
              <ShieldCheck size={14} className="text-brand-400" />
              <span className="font-bold">{user?.fullName || 'المشرف'}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Store QR & Printable Poster Generator Modal */}
      <StoreQrPosterModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
};
