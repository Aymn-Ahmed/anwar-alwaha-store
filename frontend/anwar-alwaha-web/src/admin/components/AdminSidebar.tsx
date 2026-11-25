import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Star,
  Gift,
  Zap,
  Link2,
  Tag,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Store,
  QrCode,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQrModal?: () => void;
}

const NAV_ITEMS = [
  { to: '/admin', label: 'لوحة الإحصائيات', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'إدارة المنتجات', icon: Package },
  { to: '/admin/categories', label: 'إدارة الأقسام', icon: Layers },
  { to: '/admin/complements', label: 'التكميل والربط 🔗', icon: Link2 },
  { to: '/admin/services', label: 'إدارة الخدمات', icon: Zap },
  { to: '/admin/orders', label: 'إدارة الطلبات', icon: ShoppingBag },
  { to: '/admin/coupons', label: 'إدارة الكوبونات 🏷️', icon: Tag },
  { to: '/admin/reviews', label: 'تقييمات العملاء', icon: Star },
  { to: '/admin/bundles', label: 'باقات التوفير', icon: Gift },
  { to: '/admin/error-logs', label: 'سجل الأخطاء ⚠️', icon: AlertTriangle },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  onOpenQrModal,
}) => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-64 bg-gray-900 border-l border-gray-800 text-gray-300 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-brand-600/30">
                📚
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white">إدارة المتجر</h2>
                <p className="text-[10px] text-gray-400">أنوار الواحة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Profile Snippet */}
          <div className="px-5 py-4 border-b border-gray-800/60 bg-gray-950/40">
            <div className="text-xs font-bold text-white truncate">{user?.fullName || 'المشرف العام'}</div>
            <div className="text-[10px] text-gray-400 truncate">{user?.email}</div>
            <span className="inline-block mt-1 bg-brand-900/60 text-brand-300 border border-brand-700/50 text-[9px] font-bold px-1.5 py-0.2 rounded">
              مدير النظام
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`
                }
              >
                <item.icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          {onOpenQrModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenQrModal();
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-800/40 hover:bg-amber-900/40 rounded-xl transition-all font-bold"
            >
              <div className="flex items-center gap-2">
                <QrCode size={15} className="text-amber-400" />
                <span>باركود المتجر للطباعة 🏷️</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                HQ
              </span>
            </button>
          )}

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition-colors font-semibold"
          >
            <div className="flex items-center gap-2">
              <Store size={15} />
              <span>معاينة المتجر</span>
            </div>
            <ExternalLink size={13} />
          </Link>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl transition-colors font-bold"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
};
