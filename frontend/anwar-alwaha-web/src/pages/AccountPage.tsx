import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Search,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  RefreshCw,
  ShoppingCart,
  Star,
  Phone,
  Mail,
  X,
  LucideIcon,
} from 'lucide-react';
import {
  useCustomer,
  CustomerAddress,
  CustomerSavedOrder,
  CustomerOrderItemSnapshot,
} from '../context/CustomerContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../api/ordersApi';
import { productsApi } from '../api/productsApi';
import { OrderResponse } from '../types/order.types';
import { PriceTag } from '../components/common/PriceTag';

type PortalTab = 'orders' | 'wishlist' | 'addresses' | 'profile' | 'track';

const ORDER_STAGES = [
  { key: 'pending', label: 'قيد المراجعة', icon: Clock },
  { key: 'processing', label: 'قيد التجهيز', icon: Package },
  { key: 'shipping', label: 'خرج للتوصيل', icon: Truck },
  { key: 'delivered', label: 'مكتمل', icon: CheckCircle2 },
];

function getStageIndex(status: string): number {
  const s = (status || '').toLowerCase();
  if (s === 'delivered' || s === 'completed') return 3;
  if (s === 'shipping' || s === 'ready') return 2;
  if (s === 'processing' || s === 'paid') return 1;
  return 0;
}

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    customer,
    isLoggedIn,
    loginCustomer,
    updateProfile,
    logoutCustomer,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    toggleWishlist,
    linkExternalOrderToAccount,
    refreshAccountOrders,
  } = useCustomer();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Guest Mode toggle ('login' vs 'quick-track')
  const [guestTab, setGuestTab] = useState<'login' | 'quick-track'>(
    searchParams.get('code') ? 'quick-track' : 'login'
  );
  const [loginName, setLoginName] = useState(customer.name || '');
  const [loginPhone, setLoginPhone] = useState(customer.phone || '');
  const [loginEmail, setLoginEmail] = useState(customer.email || '');
  const [loggingIn, setLoggingIn] = useState(false);

  // Logged-in active tab
  const initialTab = (searchParams.get('tab') as PortalTab) || 'orders';
  const [activeTab, setActiveTab] = useState<PortalTab>(
    ['orders', 'wishlist', 'addresses', 'profile', 'track'].includes(initialTab)
      ? initialTab
      : 'orders'
  );

  // Quick Track state
  const [trackCode, setTrackCode] = useState(searchParams.get('code') || '');
  const [trackPhoneLast4, setTrackPhoneLast4] = useState(
    sessionStorage.getItem('last_order_phone_last4') ||
      (customer.phone.length >= 4 ? customer.phone.slice(-4) : '')
  );
  const [trackedOrder, setTrackedOrder] = useState<OrderResponse | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Link order by code inside "My Orders"
  const [linkOrderCode, setLinkOrderCode] = useState('');
  const [linkingOrder, setLinkingOrder] = useState(false);
  const [refreshingOrders, setRefreshingOrders] = useState(false);

  // Address Form Modal State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addrLabel, setAddrLabel] = useState('المنزل');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrDetails, setAddrDetails] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // Profile Edit State
  const [profName, setProfName] = useState(customer.name);
  const [profPhone, setProfPhone] = useState(customer.phone);
  const [profEmail, setProfEmail] = useState(customer.email);

  useEffect(() => {
    setProfName(customer.name);
    setProfPhone(customer.phone);
    setProfEmail(customer.email);
    if (customer.phone.length >= 4 && !trackPhoneLast4) {
      setTrackPhoneLast4(customer.phone.slice(-4));
    }
  }, [customer.name, customer.phone, customer.email]);

  const isCancelledStatus = (status: string) =>
    ['cancelled', 'canceled', 'ملغي'].includes((status || '').toLowerCase());

  useEffect(() => {
    if (isLoggedIn) {
      refreshAccountOrders();
    }
  }, [isLoggedIn, activeTab]);

  const handleTabChange = (tab: PortalTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Guest Login Submit
  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim()) {
      showToast('يرجى إدخال الاسم الكريم', 'error');
      return;
    }
    const cleanPhone = loginPhone.trim();
    if (!/^05\d{8}$/.test(cleanPhone)) {
      showToast('رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام (مثال: 0512345678)', 'error');
      return;
    }

    try {
      setLoggingIn(true);
      await loginCustomer(loginName.trim(), cleanPhone, loginEmail.trim());
    } finally {
      setLoggingIn(false);
    }
  };

  // Quick Track Submit
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim()) {
      showToast('يرجى إدخال رمز الطلب (مثال: AW-...)', 'error');
      return;
    }
    const last4 = trackPhoneLast4.trim();
    if (last4.length !== 4) {
      showToast('يرجى إدخال آخر 4 أرقام من رقم الجوال المسجل في الطلب', 'error');
      return;
    }

    try {
      setTrackingLoading(true);
      const res = await ordersApi.getByCode(trackCode.trim().toUpperCase(), last4);
      setTrackedOrder(res);
      if (res && isLoggedIn) {
        linkExternalOrderToAccount(res);
      }
      if (!res) {
        showToast('لم يتم العثور على طلب مطابق', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر العثور على الطلب، تأكد من الرمز وآخر 4 أرقام من الجوال', 'error');
      setTrackedOrder(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  // Link an order by code in My Orders
  const handleLinkOrderCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkOrderCode.trim() || customer.phone.length < 4) return;
    try {
      setLinkingOrder(true);
      const res = await ordersApi.getByCode(
        linkOrderCode.trim().toUpperCase(),
        customer.phone.slice(-4)
      );
      if (res) {
        linkExternalOrderToAccount(res);
        setLinkOrderCode('');
        showToast(`تم ربط الطلب ${res.orderCode} بحسابك بنجاح!`, 'success');
      } else {
        showToast('لم يتم العثور على هذا الطلب مرتبطاً برقم جوالك', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'لم يتم العثور على الطلب', 'error');
    } finally {
      setLinkingOrder(false);
    }
  };

  // Re-order all items from a previous order
  const handleReorder = async (ord: CustomerSavedOrder) => {
    let addedCount = 0;

    for (const item of ord.items) {
      if (item.productSnapshot) {
        addToCart(item.productSnapshot, item.quantity, item.itemNotes);
        addedCount++;
      } else if (item.productId) {
        try {
          const prod = await productsApi.getById(item.productId);
          if (prod) {
            addToCart(prod, item.quantity, item.itemNotes);
            addedCount++;
            continue;
          }
        } catch {}
        // Fallback synthetic product so re-order always works
        addToCart(
          {
            id: item.productId,
            categoryId: 'dept_stationery',
            categoryTitle: 'إعادة طلب',
            name: item.productName,
            price: item.unitPrice,
            sortOrder: 0,
            stockQuantity: 100,
            isActive: true,
            averageRating: 5,
            reviewsCount: 0,
          },
          item.quantity,
          item.itemNotes
        );
        addedCount++;
      }
    }

    if (addedCount > 0) {
      showToast(`تمت إضافة ${addedCount} أصناف من الطلب السابق إلى حقيبتك!`, 'success');
      navigate('/checkout');
    }
  };

  const openNewAddressModal = () => {
    setEditingAddress(null);
    setAddrLabel('المنزل');
    setAddrDistrict('');
    setAddrDetails('');
    setAddrPhone(customer.phone || '');
    setAddrDefault(customer.addresses.length === 0);
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrDistrict(addr.district);
    setAddrDetails(addr.details);
    setAddrPhone(addr.phone || customer.phone);
    setAddrDefault(addr.isDefault);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrDistrict.trim() || !addrDetails.trim()) {
      showToast('يرجى إدخال الحي ووصف العنوان', 'error');
      return;
    }

    const payload = {
      label: addrLabel.trim() || 'المنزل',
      district: addrDistrict.trim(),
      details: addrDetails.trim(),
      phone: addrPhone.trim() || customer.phone,
      isDefault: addrDefault,
    };

    if (editingAddress) {
      updateAddress(editingAddress.id, payload);
    } else {
      addAddress(payload);
    }
    setAddressModalOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) {
      showToast('الاسم مطلوب', 'error');
      return;
    }
    if (!/^05\d{8}$/.test(profPhone.trim())) {
      showToast('رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام', 'error');
      return;
    }
    updateProfile({
      name: profName,
      phone: profPhone,
      email: profEmail,
    });
  };

  // ============================================================================
  // 1. GUEST VIEW (Not Logged In Yet)
  // ============================================================================
  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 pb-24 lg:pb-14 space-y-6">
        {/* Top Switcher: Login vs Quick Track */}
        <div className="bg-white p-1.5 rounded-2xl border border-[#ebebeb] grid grid-cols-2 gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setGuestTab('login')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              guestTab === 'login'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <User size={15} />
            <span>دخول / تفعيل حسابي</span>
          </button>

          <button
            type="button"
            onClick={() => setGuestTab('quick-track')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              guestTab === 'quick-track'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Search size={15} />
            <span>تتبع سريع برقم الطلب فقط</span>
          </button>
        </div>

        {guestTab === 'login' ? (
          <form
            onSubmit={handleGuestLogin}
            className="bg-white rounded-3xl border border-[#ebebeb] p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md">
                👤
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-900">
                الملف الشخصي لعملاء أنوار الواحة
              </h1>
              <p className="text-xs text-zinc-500 leading-relaxed">
                سجّل دخولك السريع برقم جوالك واسمك لإدارة طلباتك، عناوينك، قائمة المفضلة، وإعادة الطلب بضغطة زر
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  الاسم الكريم / الجهة <span className="text-[#c40d00]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="مثال: أيمن القحطاني"
                  className="w-full text-xs p-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  رقم الجوال السعودي <span className="text-[#c40d00]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  maxLength={10}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full text-xs p-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-left font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  dir="ltr"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs p-3.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-left"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-black hover:bg-[#c40d00] text-white font-black text-xs sm:text-sm py-4 px-6 rounded-2xl transition-colors shadow-md active:scale-[0.99]"
            >
              {loggingIn ? 'جاري التفعيل...' : 'الدخول إلى ملفي الشخصي ←'}
            </button>
          </form>
        ) : (
          /* Quick Track Without Login */
          <div className="bg-white rounded-3xl border border-[#ebebeb] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-zinc-900">تتبع سريع برقم الطلب</h2>
              <p className="text-xs text-zinc-500">
                أدخل رمز الطلب (AW-...) وآخر 4 أرقام من الجوال للاستعلام الفوري
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">رمز الطلب</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                    placeholder="AW-K8M4X9P2"
                    className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">آخر 4 أرقام من الجوال</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    maxLength={4}
                    value={trackPhoneLast4}
                    onChange={(e) => setTrackPhoneLast4(e.target.value.replace(/\D/g, ''))}
                    placeholder="5678"
                    className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={trackingLoading}
                className="w-full bg-black hover:bg-[#c40d00] text-white font-black text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Search size={15} />
                <span>{trackingLoading ? 'جاري البحث...' : 'استعلام عن حالة الشحنة'}</span>
              </button>
            </form>

            {trackedOrder && renderTrackedOrderCard(trackedOrder)}
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // Helper: Render Tracked Order Card
  // ============================================================================
  function renderTrackedOrderCard(ord: OrderResponse) {
    const isCancelled = isCancelledStatus(ord.status);
    const stageIdx = getStageIndex(ord.status);
    return (
      <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-5 space-y-5 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3">
          <div className="flex items-center gap-2">
            <div>
              <span className="text-[10px] text-zinc-400 font-bold block">رمز الطلب</span>
              <span className="font-mono font-black text-base text-zinc-900">{ord.orderCode}</span>
            </div>
            {isCancelled && (
              <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-black px-2 py-0.5 rounded-full mr-2">
                ✕ تم إلغاء الطلب
              </span>
            )}
          </div>
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 font-bold block">تاريخ الطلب</span>
            <span className="text-xs font-bold text-zinc-700">
              {new Date(ord.createdAt).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>

        {/* Status Display: Cancellation Banner OR 4-Stage Stepper */}
        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-900">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 font-bold text-lg">
              ✕
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-sm">تم إلغاء هذا الطلب</h4>
              <p className="text-xs text-red-700">
                تم إلغاء الطلب من قبل الإدارة.
                {ord.adminNotes ? ` (سبب الإلغاء: ${ord.adminNotes})` : ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 text-center">
            {ORDER_STAGES.map((st, idx) => {
              const passed = idx <= stageIdx;
              const current = idx === stageIdx;
              const Icon = st.icon;
              return (
                <div key={st.key} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      current
                        ? 'bg-black text-white ring-4 ring-zinc-900/10 scale-110'
                        : passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 text-zinc-400'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      current ? 'text-black font-black' : passed ? 'text-zinc-800' : 'text-zinc-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2 border-t border-zinc-200 pt-3">
          {ord.items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-zinc-200/70"
            >
              <div>
                <p className="font-bold text-zinc-900">{it.productName}</p>
                <p className="text-[10px] text-zinc-400">
                  {it.quantity} × {it.unitPrice.toFixed(2)} ر.س
                </p>
              </div>
              <span className="font-black text-[#c40d00]">{it.lineTotal.toFixed(2)} ر.س</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 font-black text-sm text-zinc-900">
            <span>إجمالي الطلب</span>
            <span className="text-[#c40d00]">{ord.totalAmount.toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. LOGGED-IN CUSTOMER DASHBOARD (5 TABS)
  // ============================================================================
  const TABS: { id: PortalTab; label: string; icon: LucideIcon; badge?: number }[] = [
    { id: 'orders', label: 'طلباتي', icon: ShoppingBag, badge: customer.orders.length },
    { id: 'wishlist', label: 'المفضلة', icon: Heart, badge: customer.wishlistProducts.length },
    { id: 'addresses', label: 'عناويني', icon: MapPin, badge: customer.addresses.length },
    { id: 'profile', label: 'البيانات الشخصية', icon: User },
    { id: 'track', label: 'تتبع شحنة برقم الطلب', icon: Search },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-14 space-y-6">
      {/* Top Customer Welcome Header */}
      <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
            {customer.name.trim()[0] || '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-zinc-900">{customer.name}</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                عميل موثق
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5" dir="ltr">
              {customer.phone}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logoutCustomer}
          className="text-xs font-bold text-zinc-600 hover:text-[#c40d00] bg-zinc-100 hover:bg-red-50 px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <LogOut size={14} />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* 5 Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`shrink-0 text-xs font-black px-4 py-3 rounded-2xl flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-[#ebebeb]'
              }`}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-[#fa2c19] text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: MY ORDERS ==================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Top bar: Link order by code + Refresh */}
          <div className="bg-white rounded-2xl border border-[#ebebeb] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-sm text-zinc-900">سجل طلباتي ({customer.orders.length})</h2>
              <p className="text-[11px] text-zinc-400">
                تظهر هنا جميع طلباتك تلقائياً، ويمكنك أيضاً ربط أي طلب سابق برمزه
              </p>
            </div>

            <div className="flex items-center gap-2">
              <form onSubmit={handleLinkOrderCode} className="flex items-center gap-1.5">
                <input
                  type="text"
                  dir="ltr"
                  value={linkOrderCode}
                  onChange={(e) => setLinkOrderCode(e.target.value.toUpperCase())}
                  placeholder="أضف رمز طلب AW-..."
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono w-36 focus:outline-none focus:border-zinc-900"
                />
                <button
                  type="submit"
                  disabled={linkingOrder || !linkOrderCode.trim()}
                  className="bg-zinc-900 hover:bg-black disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-xl"
                >
                  ربط
                </button>
              </form>

              <button
                type="button"
                onClick={async () => {
                  setRefreshingOrders(true);
                  await refreshAccountOrders();
                  setRefreshingOrders(false);
                  showToast('تم تحديث ومزامنة حالة الطلبات من قاعدة البيانات', 'success');
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-black rounded-xl transition-colors"
                title="تحديث حالة الطلبات"
              >
                <RefreshCw size={14} className={refreshingOrders ? 'animate-spin' : ''} />
                <span>تحديث حالة الطلبات 🔄</span>
              </button>
            </div>
          </div>

          {customer.orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#ebebeb] p-14 text-center space-y-3">
              <div className="text-4xl">📦</div>
              <h3 className="font-black text-base text-zinc-800">لا توجد طلبات مسجلة بعد</h3>
              <p className="text-xs text-zinc-400">
                بمجرد إرسال أي طلب من الحقيبة سيظهر هنا تلقائياً مع ميزة إعادة الطلب الفوري
              </p>
              <button
                onClick={() => navigate('/categories')}
                className="bg-black hover:bg-[#c40d00] text-white font-black text-xs py-2.5 px-6 rounded-xl transition-colors"
              >
                تصفح المنتجات الآن
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customer.orders.map((ord) => {
                const isCancelled = isCancelledStatus(ord.status);
                const stageIdx = getStageIndex(ord.status);
                return (
                  <div
                    key={ord.orderCode}
                    className="bg-white rounded-3xl border border-[#ebebeb] p-5 space-y-4 shadow-sm"
                  >
                    {/* Order Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-black text-sm sm:text-base bg-zinc-100 px-3 py-1 rounded-xl text-zinc-900">
                          فاتورة #{ord.orderCode}
                        </span>
                        {isCancelled ? (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            ✕ تم إلغاء الطلب
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              ord.paymentStatus === 'paid' ||
                              ['paid', 'processing', 'ready', 'shipping', 'delivered'].includes(
                                (ord.status || '').toLowerCase()
                              )
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {ord.paymentStatus === 'paid' ||
                            ['paid', 'processing', 'ready', 'shipping', 'delivered'].includes(
                              (ord.status || '').toLowerCase()
                            )
                              ? '✓ مدفوع / مؤكد'
                              : 'بانتظار التأكيد'}
                          </span>
                        )}
                        <span className="text-xs text-zinc-400">
                          {new Date(ord.createdAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isCancelled && ord.items.some((i) => i.productId || i.productSnapshot?.id) && (
                          <button
                            type="button"
                            onClick={() => {
                              const first = ord.items.find((i) => i.productId || i.productSnapshot?.id);
                              const targetId = first?.productId || first?.productSnapshot?.id;
                              if (targetId) {
                                navigate(`/review/${targetId}`, {
                                  state: {
                                    orderCode: ord.orderCode,
                                    productName: first?.productName,
                                    productImage: first?.productSnapshot?.imageUrl,
                                    unitPrice: first?.unitPrice,
                                  },
                                });
                              }
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors active:scale-95"
                          >
                            <Star size={13} className="fill-amber-400 text-amber-500" />
                            <span>قيّم المنتجات ⭐</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleReorder(ord)}
                          className="bg-black hover:bg-[#c40d00] text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors active:scale-95"
                        >
                          <RefreshCw size={13} />
                          <span>إعادة الطلب</span>
                        </button>
                      </div>
                    </div>

                    {/* Status Display: Cancellation Banner OR 4-Stage Stepper */}
                    {isCancelled ? (
                      <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-2xl flex items-center gap-3 text-red-900">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 font-bold text-base">
                          ✕
                        </div>
                        <div>
                          <p className="font-black text-xs text-red-800">الطلب ملغي من قبل الإدارة</p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">
                            تم إلغاء هذا الطلب.
                            {ord.adminNotes ? ` ملاحظة الإدارة: "${ord.adminNotes}"` : ' يرجى التواصل معنا عبر واتساب لمزيد من التفاصيل.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 text-center py-2">
                        {ORDER_STAGES.map((st, idx) => {
                          const passed = idx <= stageIdx;
                          const current = idx === stageIdx;
                          const Icon = st.icon;
                          return (
                            <div key={st.key} className="flex flex-col items-center gap-1.5">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                  current
                                    ? 'bg-black text-white ring-4 ring-zinc-900/10 scale-110'
                                    : passed
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-zinc-100 text-zinc-400'
                                }`}
                              >
                                <Icon size={15} />
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs font-bold ${
                                  current
                                    ? 'text-black font-black'
                                    : passed
                                    ? 'text-zinc-800'
                                    : 'text-zinc-400'
                                }`}
                              >
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="space-y-2 border-t border-zinc-100 pt-3">
                      {ord.items.map((it: CustomerOrderItemSnapshot, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-zinc-50 p-2.5 rounded-xl"
                        >
                          <div>
                            <p className="font-bold text-zinc-900">{it.productName}</p>
                            <p className="text-[10px] text-zinc-400">
                              الكمية: {it.quantity} × {it.unitPrice.toFixed(2)} ر.س
                              {it.itemNotes ? ` • ملاحظة: ${it.itemNotes}` : ''}
                            </p>
                          </div>
                            <div className="flex items-center gap-2">
                            <span className="font-black text-zinc-900">
                              {it.lineTotal.toFixed(2)} ر.س
                            </span>
                            {ord.status.toLowerCase() !== 'cancelled' && (it.productId || it.productSnapshot?.id) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const targetId = it.productId || it.productSnapshot?.id;
                                  if (targetId) {
                                    navigate(`/review/${targetId}`, {
                                      state: {
                                        orderCode: ord.orderCode,
                                        productName: it.productName,
                                        productImage: it.productSnapshot?.imageUrl,
                                        unitPrice: it.unitPrice,
                                      },
                                    });
                                  }
                                }}
                                className="mr-2 text-[10px] font-black text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                              >
                                <Star size={11} className="fill-amber-400 text-amber-500" />
                                <span>قيّم المنتج ⭐</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                      <span className="text-zinc-500 font-bold">
                        طريقة الاستلام:{' '}
                        {ord.deliveryMethod === 'branch' ? 'استلام من الفرع' : 'توصيل للموقع'}
                      </span>
                      <div className="font-black text-sm text-zinc-900">
                        الإجمالي:{' '}
                        <span className="text-[#c40d00] text-base">
                          {ord.totalAmount.toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: WISHLIST ==================== */}
      {activeTab === 'wishlist' && (
        <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="font-black text-base text-zinc-900">
                قائمة المفضلة ({customer.wishlistProducts.length})
              </h2>
              <p className="text-xs text-zinc-400">
                الأصناف التي حفظتها للرجوع إليها أو إضافتها السريعة للحقيبة
              </p>
            </div>
          </div>

          {customer.wishlistProducts.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="text-4xl">❤️</div>
              <h3 className="font-black text-sm text-zinc-800">قائمة المفضلة فارغة حالياً</h3>
              <p className="text-xs text-zinc-400">
                اضغط على أيقونة القلب أعلى أي منتج في المتجر لحفظه هنا
              </p>
              <button
                onClick={() => navigate('/categories')}
                className="bg-black hover:bg-[#c40d00] text-white font-black text-xs py-2.5 px-6 rounded-xl transition-colors"
              >
                استكشف المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {customer.wishlistProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-900 overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div className="relative aspect-square bg-zinc-50 flex items-center justify-center overflow-hidden">
                    {prod.imageUrl ? (
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-5xl">{prod.categoryIcon || '📦'}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(prod)}
                      className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-[#fa2c19] flex items-center justify-center shadow-sm"
                      title="إزالة من المفضلة"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">
                      {prod.name}
                    </h3>

                    <div className="space-y-2 pt-1">
                      <PriceTag price={prod.price} oldPrice={prod.oldPrice} size="sm" />
                      <button
                        type="button"
                        onClick={() => addToCart(prod, 1)}
                        className="w-full bg-zinc-900 hover:bg-[#c40d00] text-white text-xs font-black py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingCart size={13} />
                        <span>إضافة للحقيبة</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 3: ADDRESSES ==================== */}
      {activeTab === 'addresses' && (
        <div className="bg-white rounded-3xl border border-[#ebebeb] p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <h2 className="font-black text-base text-zinc-900">
                دفتر عناويني ({customer.addresses.length})
              </h2>
              <p className="text-xs text-zinc-400">
                يُملأ العنوان الافتراضي تلقائياً في صفحة إتمام الطلب لتوفير وقتك
              </p>
            </div>

            <button
              type="button"
              onClick={openNewAddressModal}
              className="bg-black hover:bg-[#c40d00] text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus size={15} />
              <span>إضافة عنوان جديد</span>
            </button>
          </div>

          {customer.addresses.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="text-4xl">📍</div>
              <h3 className="font-black text-sm text-zinc-800">لا توجد عناوين محفوظة</h3>
              <p className="text-xs text-zinc-400">
                أضف عنوان منزلك أو عملك أو مدرستك ليتم ملؤه تلقائياً عند الطلب
              </p>
              <button
                type="button"
                onClick={openNewAddressModal}
                className="bg-black hover:bg-[#c40d00] text-white font-black text-xs py-2.5 px-6 rounded-xl transition-colors"
              >
                + إضافة أول عنوان
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                    addr.isDefault
                      ? 'border-black bg-zinc-50/70'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#c40d00]" />
                        <span className="font-black text-sm text-zinc-900">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            الافتراضي
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditAddressModal(addr)}
                          className="p-1.5 text-zinc-500 hover:text-black rounded-lg hover:bg-zinc-100"
                          title="تعديل"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAddress(addr.id)}
                          className="p-1.5 text-zinc-500 hover:text-[#c40d00] rounded-lg hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-zinc-700">الحي / المنطقة: {addr.district}</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{addr.details}</p>
                    <p className="text-[11px] text-zinc-400 font-mono" dir="ltr">
                      📱 {addr.phone}
                    </p>
                  </div>

                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      className="self-start text-[11px] font-black text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      تعيين كعنوان افتراضي
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 4: PROFILE ==================== */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="max-w-xl bg-white rounded-3xl border border-[#ebebeb] p-6 space-y-5 shadow-sm"
        >
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="font-black text-base text-zinc-900">البيانات الشخصية</h2>
            <p className="text-xs text-zinc-400">
              تُستخدم هذه البيانات لملء طلباتك وفواتيرك تلقائياً
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <User size={14} />
                <span>الاسم الكريم / الجهة *</span>
              </label>
              <input
                type="text"
                required
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Phone size={14} />
                <span>رقم الجوال *</span>
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                maxLength={10}
                value={profPhone}
                onChange={(e) => setProfPhone(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-left font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Mail size={14} />
                <span>البريد الإلكتروني (اختياري)</span>
              </label>
              <input
                type="email"
                dir="ltr"
                value={profEmail}
                onChange={(e) => setProfEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-left"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={logoutCustomer}
              className="text-xs font-bold text-[#c40d00] hover:bg-red-50 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <LogOut size={14} />
              <span>تسجيل الخروج</span>
            </button>

            <button
              type="submit"
              className="bg-black hover:bg-[#c40d00] text-white font-black text-xs px-6 py-3 rounded-xl transition-colors"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      )}

      {/* ==================== TAB 5: QUICK TRACK BY ORDER CODE ==================== */}
      {activeTab === 'track' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-[#ebebeb] p-6 space-y-5 shadow-sm">
          <div>
            <h2 className="font-black text-base text-zinc-900">تتبع شحنة برقم الطلب</h2>
            <p className="text-xs text-zinc-400">
              استعلم عن أي رمز طلب خارجي (AW-...) وسيتم ربطه تلقائياً بسجل طلباتك
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">رمز الطلب (AW-...)</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                  placeholder="AW-K8M4X9P2"
                  className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700">آخر 4 أرقام من الجوال</label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  maxLength={4}
                  value={trackPhoneLast4}
                  onChange={(e) => setTrackPhoneLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="5678"
                  className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-center"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={trackingLoading}
              className="bg-black hover:bg-[#c40d00] text-white font-black text-xs py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Search size={15} />
              <span>{trackingLoading ? 'جاري البحث...' : 'استعلام عن حالة الطلب'}</span>
            </button>
          </form>

          {trackedOrder && renderTrackedOrderCard(trackedOrder)}
        </div>
      )}

      {/* ==================== ADDRESS MODAL ==================== */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#ebebeb] w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-black text-sm text-zinc-900">
                {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان توصيل جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="text-zinc-400 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-700">تسمية العنوان</label>
                <div className="flex gap-2">
                  {['المنزل', 'العمل', 'المدرسة / الجامعة'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddrLabel(preset)}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition-colors ${
                        addrLabel === preset
                          ? 'bg-black text-white border-black'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">المدينة والحي *</label>
                <input
                  type="text"
                  required
                  value={addrDistrict}
                  onChange={(e) => setAddrDistrict(e.target.value)}
                  placeholder="مثال: خميس مشيط - حي الراقي"
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">وصف العنوان التفصيلي / المعلم القريب *</label>
                <textarea
                  rows={2}
                  required
                  value={addrDetails}
                  onChange={(e) => setAddrDetails(e.target.value)}
                  placeholder="اسم الشارع، رقم المبنى، أو أقرب معلم..."
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-700">رقم الجوال للتوصيل</label>
                <input
                  type="tel"
                  dir="ltr"
                  maxLength={10}
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-900 text-left font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddrCheck"
                  checked={addrDefault}
                  onChange={(e) => setAddrDefault(e.target.checked)}
                  className="w-4 h-4 accent-black rounded"
                />
                <label htmlFor="defaultAddrCheck" className="font-bold text-zinc-700 cursor-pointer">
                  تعيين كعنوان افتراضي للطلبات القادمة
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-[#c40d00] text-white font-black"
                >
                  حفظ العنوان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
