import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  Send,
  Phone,
  User,
  FileText,
  ShoppingBag,
  Palette,
  CheckCircle,
  Layers,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { productsApi } from '../api/productsApi';
import { ServiceItem } from '../types/service.types';
import { Product } from '../types/product.types';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { UniversalMediaEmbedder } from '../components/common/UniversalMediaEmbedder';
import { ProductCard } from '../components/products/ProductCard';
import { ProductModal } from '../components/products/ProductModal';
import { useCustomer } from '../context/CustomerContext';

export const ServiceDetailPage: React.FC = () => {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customer, firstName, isLoggedIn } = useCustomer();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Interactive Request Configurator State
  const initialOptionParam = searchParams.get('option') || '';
  const [selectedOption, setSelectedOption] = useState<string>(initialOptionParam);
  const [designStatus, setDesignStatus] = useState<'ready' | 'need_design'>('ready');
  const [quantityOrDimensions, setQuantityOrDimensions] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Pre-fill customer name and phone when available
  useEffect(() => {
    if (customer?.name) {
      setCustomerName(customer.name);
    } else if (firstName) {
      setCustomerName(firstName);
    }
    if (customer?.phone) {
      setCustomerPhone(customer.phone);
    }
  }, [customer, firstName]);

  // Sync initial option param if it arrives or changes
  useEffect(() => {
    if (initialOptionParam && !selectedOption) {
      setSelectedOption(initialOptionParam);
    }
  }, [initialOptionParam]);

  useEffect(() => {
    if (!serviceSlug) return;
    let isMounted = true;
    setLoading(true);

    // 1. Try to fetch service by id or slug from API
    servicesApi
      .getById(serviceSlug)
      .then((res) => {
        if (!isMounted) return;
        if (res) {
          setService(res);
          return res;
        }
        // Fallback: search in getAll()
        return servicesApi.getAll().then((all) => {
          if (!isMounted) return null;
          const found = all.find(
            (s) =>
              s.id.toLowerCase() === serviceSlug.toLowerCase() ||
              (s.linkedCategoryId &&
                s.linkedCategoryId.toLowerCase() === serviceSlug.toLowerCase()) ||
              s.title.toLowerCase().includes(serviceSlug.toLowerCase())
          );
          if (found) setService(found);
          return found || null;
        });
      })
      .then((srv) => {
        // 2. If service has a linkedCategoryId, fetch real products from DB
        if (srv && srv.linkedCategoryId && isMounted) {
          return productsApi
            .getAll({
              categoryId: srv.linkedCategoryId,
              pageSize: 24,
              sortBy: 'newest',
            })
            .then((pRes) => {
              if (isMounted) {
                setLinkedProducts(pRes.items || []);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [serviceSlug]);

  // Parse available options or sizes from database if populated
  const optionsList = useMemo(() => {
    if (!service?.availableOptionsOrSizes?.trim()) return [];
    return service.availableOptionsOrSizes
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [service]);

  // Parse gallery image URLs from database if populated
  const galleryUrls = useMemo(() => {
    if (!service?.galleryImageUrls?.trim()) return [];
    return service.galleryImageUrls
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/'));
  }, [service]);

  // Set default selected option if available in list and not yet set
  useEffect(() => {
    if (optionsList.length > 0 && !selectedOption) {
      setSelectedOption(optionsList[0]);
    }
  }, [optionsList, selectedOption]);

  const handleSendConfiguredRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    let text = `مرحباً مكتبة أنوار الواحة 👋\nأود طلب وتفصيل خدمة: *${service.title}*`;
    if (selectedOption) text += `\n🎯 الخيار / المواصفة: *${selectedOption}*`;
    if (quantityOrDimensions.trim())
      text += `\n📐 الكمية / المقاس: ${quantityOrDimensions.trim()}`;
    text += `\n🎨 حالة التصميم: ${
      designStatus === 'ready' ? 'لدي تصميم جاهز للطباعة ✔' : 'أحتاج تصميم جديد من المكتبة ✨'
    }`;
    if (customerName.trim()) text += `\n👤 اسم العميل: ${customerName.trim()}`;
    if (customerPhone.trim()) text += `\n📱 رقم الجوال: ${customerPhone.trim()}`;
    if (orderNotes.trim()) text += `\n📝 ملاحظات إضافية:\n${orderNotes.trim()}`;

    window.open(`https://wa.me/966572350050?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDirectWhatsApp = () => {
    if (!service) return;
    const text =
      service.whatsAppTemplate ||
      `مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: ${service.title}`;
    window.open(`https://wa.me/966572350050?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-600">جاري تحميل تفاصيل الخدمة...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-400">
          <FileText size={32} />
        </div>
        <h2 className="text-lg font-black text-zinc-900 mb-2">الخدمة غير موجودة</h2>
        <p className="text-xs text-zinc-600 mb-6 max-w-sm">
          لم نتمكن من العثور على الخدمة المطلوبة، ربما تم تعديل الرابط أو تحديث الأقسام.
        </p>
        <Link
          to="/services"
          className="bg-black hover:bg-zinc-800 text-white text-xs font-black py-3 px-6 rounded-xl transition-colors"
        >
          العودة لكافة الخدمات
        </Link>
      </div>
    );
  }

  const color = service.accentColor || '#059669';

  return (
    <div className="min-h-screen bg-[#f8fafc] py-5 sm:py-8 px-3 sm:px-4 pb-28 lg:pb-16">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-black transition-colors bg-white px-3.5 py-2 rounded-xl border border-zinc-200 shadow-xs cursor-pointer"
          >
            <ArrowRight size={15} />
            <span>العودة لكافة الخدمات</span>
          </button>

          <span
            className="text-[11px] font-black px-3 py-1 rounded-full text-white shadow-xs"
            style={{ backgroundColor: color }}
          >
            خدمة معتمدة لدى أنوار الواحة
          </span>
        </div>

        {/* Hero Header Card */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-right">
            {/* Service Icon with Colored Arc */}
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center relative select-none shadow-sm"
                style={{
                  backgroundColor: `${color}15`,
                  boxShadow: `0 0 0 2px ${color}33`,
                }}
              >
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
                    strokeWidth="1.5"
                    strokeOpacity={0.3}
                  />
                  <path
                    d="M 14 68 A 44 44 0 0 0 86 68"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>

                <ServiceIcon iconName={service.iconName} size={32} color={color} />
              </div>
            </div>

            {/* Service Title & Description */}
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-bold text-zinc-500">
                  {service.linkedCategoryTitle || 'خدمات مكتبة أنوار الواحة'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-zinc-900 leading-tight">
                {service.title}
              </h1>
              {service.description && (
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-0.5">
                  {service.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick WhatsApp Fast CTA */}
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-green-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>⚡ اطلب هذه الخدمة الآن عبر واتساب مباشرة</span>
          </button>
        </div>

        {/* ELEVATED REAL PRODUCTS: Linked Products from Database (Immediately below Header) */}
        {linkedProducts.length > 0 && (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-zinc-900" />
                <h2 className="text-xs sm:text-sm font-black text-zinc-900">
                  منتجات وباقات متوفرة في هذا القسم
                </h2>
              </div>
              <span className="bg-zinc-100 text-zinc-800 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full">
                {linkedProducts.length} منتج
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {linkedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p: Product) => setSelectedProduct(p)}
                />
              ))}
            </div>
          </div>
        )}

        {/* INTERACTIVE SERVICE REQUEST CONFIGURATOR (High Converting) */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-5 sm:p-7 space-y-5">
          <div className="border-b border-zinc-100 pb-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h2 className="text-sm sm:text-base font-black text-zinc-900">
                تخصيص وطلب الخدمة بلمسة واحدة
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500">
              حدد خياراتك وسيتم تجهيز وتنسيق تفاصيل الطلب كاملة لنبدأ التنفيذ فوراً عبر واتساب:
            </p>
          </div>

          <form onSubmit={handleSendConfiguredRequest} className="space-y-4">
            {/* Options Chips (if available) */}
            {optionsList.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                  <span>نوع أو مقاس الخدمة المطلوب:</span>
                  {selectedOption && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      تم اختيار: {selectedOption}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {optionsList.map((opt, idx) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(opt)}
                        className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-xs font-black'
                            : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Design Status Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 block">
                حالة التصميم والملفات:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDesignStatus('ready')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    designStatus === 'ready'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <CheckCircle
                    size={16}
                    className={designStatus === 'ready' ? 'text-emerald-400' : 'text-zinc-400'}
                  />
                  <span className="text-xs font-black">لدي تصميم جاهز</span>
                  <span className="text-[10px] opacity-80">جاهز للطباعة مباشرة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDesignStatus('need_design')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    designStatus === 'need_design'
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <Palette
                    size={16}
                    className={designStatus === 'need_design' ? 'text-amber-400' : 'text-zinc-400'}
                  />
                  <span className="text-xs font-black">أحتاج تصميم من المكتبة</span>
                  <span className="text-[10px] opacity-80">نصمم لك باحترافية</span>
                </button>
              </div>
            </div>

            {/* Quantity or Dimensions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Layers size={14} className="text-zinc-400" />
                <span>الكمية أو المقاسات المطلوبة (اختياري)</span>
              </label>
              <input
                type="text"
                value={quantityOrDimensions}
                onChange={(e) => setQuantityOrDimensions(e.target.value)}
                placeholder="مثال: مقاس 85×200 سم، أو 5 حبات، أو مقاس A4..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>

            {/* Customer Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <User size={14} className="text-zinc-400" />
                  <span>اسمك الكريم</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد الغامدي"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Phone size={14} className="text-zinc-400" />
                  <span>رقم الجوال</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 text-right focus:outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Notes / Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <FileText size={14} className="text-zinc-400" />
                <span>ملاحظات إضافية</span>
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="اكتب أي ملاحظات إضافية بخصوص الألوان، موعد الاستلام، أو نوع المواد..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-black text-xs sm:text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Send size={16} />
              <span>⚡ إرسال تفاصيل الطلب جاهزة إلى واتساب</span>
            </button>
          </form>
        </div>

        {/* REAL ADMIN-ENTERED DETAILED OVERVIEW (Rendered strictly if in database) */}
        {service.detailedOverview && (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-5 sm:p-6 space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>مواصفات وتفاصيل الخدمة</span>
            </h3>
            <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              {service.detailedOverview}
            </div>
          </div>
        )}

        {/* REAL ADMIN-ENTERED GALLERY IMAGES (Rendered strictly if in database) */}
        {galleryUrls.length > 0 && (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-5 sm:p-6 space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-zinc-900 flex items-center gap-2">
              <ImageIcon size={16} className="text-emerald-600" />
              <span>معرض صور الأعمال المنفذة</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {galleryUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-100"
                >
                  <img
                    src={url}
                    alt={`عمل ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Media Showcase (Only rendered if media exists in database) */}
        {service.mediaType !== 'none' && service.mediaUrl && (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-4 sm:p-5 space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-zinc-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>فيديو توضيحي لأعمال الخدمة</span>
            </h3>
            <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-xs max-w-lg mx-auto">
              <UniversalMediaEmbedder
                mediaType={service.mediaType}
                mediaUrl={service.mediaUrl}
                title={service.title}
              />
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          productId={selectedProduct.id}
          initialProduct={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
