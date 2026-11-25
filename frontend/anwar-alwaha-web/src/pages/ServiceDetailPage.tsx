import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  Send,
  Phone,
  User,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { servicesApi } from '../api/servicesApi';
import { productsApi } from '../api/productsApi';
import { ServiceItem } from '../types/service.types';
import { Product } from '../types/product.types';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { UniversalMediaEmbedder } from '../components/common/UniversalMediaEmbedder';
import { ProductCard } from '../components/products/ProductCard';
import { ProductModal } from '../components/products/ProductModal';

export const ServiceDetailPage: React.FC = () => {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceItem | null>(null);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick WhatsApp Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

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

  const handleSendCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    let text = `مرحباً مكتبة أنوار الواحة 👋\nأود طلب خدمة: *${service.title}*`;
    if (customerName.trim()) text += `\n👤 اسم العميل: ${customerName.trim()}`;
    if (customerPhone.trim()) text += `\n📱 رقم الجوال: ${customerPhone.trim()}`;
    if (orderNotes.trim()) text += `\n📝 تفاصيل ومواصفات الطلب:\n${orderNotes.trim()}`;

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
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 px-4 pb-28 lg:pb-16">
      <div className="max-w-4xl mx-auto space-y-6">
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
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
            {/* Service Icon with Colored Arc */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center relative select-none shadow-sm"
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

                <ServiceIcon iconName={service.iconName} size={36} color={color} />
              </div>
            </div>

            {/* Service Title & Description */}
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-bold text-zinc-500">
                  {service.linkedCategoryTitle || 'خدمات مكتبة أنوار الواحة'}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-zinc-900 leading-tight">
                {service.title}
              </h1>
              {service.description && (
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed pt-1">
                  {service.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Features Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-zinc-100 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 text-zinc-700">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-bold">تنفيذ سريع واحترافي</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 text-zinc-700">
              <Clock size={16} className="text-emerald-600 shrink-0" />
              <span className="font-bold">جاهزية خلال نفس اليوم</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 text-zinc-700 col-span-2 sm:col-span-1">
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <span className="font-bold">ضمان جودة الطباعة</span>
            </div>
          </div>

          {/* Main Direct WhatsApp Order Button */}
          <button
            type="button"
            onClick={handleDirectWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-sm py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-green-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <MessageCircle size={20} />
            <span>⚡ اطلب هذه الخدمة الآن عبر واتساب</span>
          </button>
        </div>

        {/* Media Showcase (Only rendered if media exists in database) */}
        {service.mediaType !== 'none' && service.mediaUrl && (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-5 sm:p-6 space-y-3">
            <h2 className="text-sm sm:text-base font-black text-zinc-900 flex items-center gap-2">
              <span>معاينة أعمال الخدمة</span>
            </h2>
            <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-xs">
              <UniversalMediaEmbedder
                mediaType={service.mediaType}
                mediaUrl={service.mediaUrl}
                title={service.title}
              />
            </div>
          </div>
        )}

        {/* Linked Products / Sub-Items from Database (Strictly DB-driven, omitted if empty) */}
        {linkedProducts.length > 0 && (
          <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-zinc-900" />
                <h2 className="text-sm sm:text-base font-black text-zinc-900">
                  منتجات وباقات متوفرة في هذا القسم
                </h2>
              </div>
              <span className="bg-zinc-100 text-zinc-800 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                {linkedProducts.length} منتج
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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

        {/* Inline Custom Request Form */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-zinc-900">
              طلب مخصص أو استفسار سريع
            </h2>
            <p className="text-xs text-zinc-500">
              أدخل بياناتك وملاحظاتك وسيتم تحويل طلبك مباشرة لموظف الخدمة المختص عبر واتساب:
            </p>
          </div>

          <form onSubmit={handleSendCustomRequest} className="space-y-4">
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
                <span>مواصفات وتفاصيل الطلب أو الاستفسار</span>
              </label>
              <textarea
                rows={3}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="اكتب هنا المقاسات، الكمية، أو أي تفاصيل خاصة تريدها..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-black focus:bg-white transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-black text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <Send size={16} />
              <span>إرسال الطلب والتفاصيل للمكتبة عبر واتساب</span>
            </button>
          </form>
        </div>
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
