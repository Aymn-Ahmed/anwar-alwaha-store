import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, MessageCircle, ArrowLeft, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { servicesApi } from '../api/servicesApi';
import { ServiceItem } from '../types/service.types';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { UniversalMediaEmbedder } from '../components/common/UniversalMediaEmbedder';

// Official store services fallback (identical to DbInitializer seed data)
const OFFICIAL_STORE_SERVICES: ServiceItem[] = [
  {
    id: 'dept_print',
    title: 'الطباعة الإعلانية والاستكرات',
    description:
      'طباعة بنرات إعلانية وتجارية ومدرسية، رول أب ستاند (85×200 سم)، قص استكرات إلكتروني (Plotter)، استكرات جدارية، ولوحات فلين وفوركس وباركود QR.',
    iconName: 'printer',
    accentColor: '#0284c7',
    mediaType: 'tiktok',
    mediaUrl: 'https://www.tiktok.com/@anwaralwaha_1/video/7578203989804633351',
    linkedCategoryId: 'dept_print',
    linkedCategoryTitle: 'الطباعة الإعلانية والاستكرات',
    whatsAppTemplate: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمات الطباعة الإعلانية والاستكرات.',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'dept_school',
    title: 'الوسائل التعليمية ولوحات المدارس',
    description:
      'تصميم وطباعة وتركيب اللوحات المدرسية، لوحات الفصول والأنشطة، لوحات المواد، مجسمات الأكشاك (3D Booths)، مجسمات فلين ومطويات، وملفات إنجاز المعلمين.',
    iconName: 'graduation-cap',
    accentColor: '#059669',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    linkedCategoryId: 'dept_school',
    linkedCategoryTitle: 'الوسائل التعليمية ولوحات المدارس',
    whatsAppTemplate: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب وسائل تعليمية ومجسمات مدرسية.',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'dept_art',
    title: 'الخطاط والرسام والجداريات الميدانية',
    description:
      'رسم جداريات المدارس والروضات الميدانية، خط عربي أصيل للوحات التكريم والشواهد، رسم مسارات الألعاب الحركية التفاعلية بساحات المدارس والحدائق.',
    iconName: 'palette',
    accentColor: '#d97706',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    linkedCategoryId: 'dept_art',
    linkedCategoryTitle: 'الخطاط والرسام والجداريات',
    whatsAppTemplate: 'مرحباً مكتبة أنوار الواحة 👋 أود حجز فنان/خطاط لرسم جداريات أو كتابة لوحات.',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'dept_themes',
    title: 'التوزيعات والثيمات والأكواب',
    description:
      'طباعة أكمام أكواب القهوة والمشروبات (Cup Sleeves)، ثيمات المواليد والأعراس والمناسبات الوطنية، تغليف وتنسيق علب المياه، وتوزيعات تفعيل الحروف المدرسية للأطفال.',
    iconName: 'coffee',
    accentColor: '#9333ea',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    linkedCategoryId: 'dept_themes',
    linkedCategoryTitle: 'التوزيعات والثيمات والأكواب',
    whatsAppTemplate: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب ثيمات وتوزيعات مخصصة لمناسبة.',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'dept_grad',
    title: 'حفلات التخرج والأعياد والهدايا',
    description:
      'بنرات التخرج الكبيرة للتصوير واستقبال الضيوف، تصاميم فلين مفرغة بصورة واسم الخريج، دروع تكريمية فاخرة محفورة، أوشحة وقبعات ملكية، وأطقم هدايا حصرية.',
    iconName: 'award',
    accentColor: '#c40d00',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    linkedCategoryId: 'dept_grad',
    linkedCategoryTitle: 'حفلات التخرج والهدايا',
    whatsAppTemplate: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب تجهيزات حفلة تخرج / هدايا.',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'dept_stationery',
    title: 'القرطاسية والأدوات المدرسية والفنية',
    description:
      'توفير كافة مستلزمات الطلاب والمعلمين، حقائب مدرسية، دفاتر وملازم، ألوان فنية وأقمشة كانفس، وتصوير وتجليد المذكرات والبحوث المدرسية والجامعية بجودة ليزرية فائقة.',
    iconName: 'file-text',
    accentColor: '#4f46e5',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    linkedCategoryId: 'dept_stationery',
    linkedCategoryTitle: 'القرطاسية والأدوات المدرسية',
    whatsAppTemplate: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار عن الأدوات القرطاسية وتصوير المذكرات.',
    sortOrder: 6,
    isActive: true,
  },
];

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>(OFFICIAL_STORE_SERVICES);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [columnsCount, setColumnsCount] = useState<2 | 3>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 3
  );

  const previewRef = useRef<HTMLDivElement | null>(null);

  // Load store services from API (fallback to official store services if empty or offline)
  useEffect(() => {
    servicesApi
      .getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setServices(data);
        } else {
          setServices(OFFICIAL_STORE_SERVICES);
        }
      })
      .catch(() => {
        setServices(OFFICIAL_STORE_SERVICES);
      })
      .finally(() => setLoading(false));
  }, []);

  // Track responsive columns (< 640px => 2 cols on very small screens or 3 cols on tablet/desktop)
  useEffect(() => {
    const updateCols = () => {
      setColumnsCount(window.innerWidth < 640 ? 2 : 3);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Smooth scroll when in-place drawer opens
  useEffect(() => {
    if (selectedServiceId && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedServiceId]);

  // Slice services dynamically into rows of `columnsCount`
  const serviceRows = useMemo(() => {
    const rows: ServiceItem[][] = [];
    for (let i = 0; i < services.length; i += columnsCount) {
      rows.push(services.slice(i, i + columnsCount));
    }
    return rows;
  }, [services, columnsCount]);

  const openWhatsApp = (service: ServiceItem) => {
    const text =
      service.whatsAppTemplate ||
      `مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: ${service.title}`;
    window.open(`https://wa.me/966572350050?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Compute RTL horizontal position (`right` %) for upward pointer arrow
  const getArrowRightPercent = (colIndex: number, cols: 2 | 3): string => {
    const pct = ((colIndex + 0.5) / cols) * 100;
    return `${pct.toFixed(2)}%`;
  };

  const handleNavigateToSection = (service: ServiceItem) => {
    if (service.linkedCategoryId) {
      navigate(`/categories?cat=${encodeURIComponent(service.linkedCategoryId)}`);
    } else {
      navigate(`/categories?search=${encodeURIComponent(service.title)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 px-4 pb-24 lg:pb-16">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Header Badge & Headline */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xs">
            <span className="text-[#F59E0B]">⚡</span>
            <span>خدمات وأقسام مكتبة أنوار الواحة</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            اضغط على الخدمة لمعاينة تفاصيلها
          </h1>
        </div>

        {/* Dynamic Rows of Services with In-Place Expandable Drawer */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-200 animate-pulse" />
                <div className="w-20 h-3 bg-zinc-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 max-w-xl mx-auto">
            {serviceRows.map((row, rowIdx) => {
              const activeColIndex = row.findIndex((s) => s.id === selectedServiceId);
              const activeServiceInRow = activeColIndex !== -1 ? row[activeColIndex] : null;

              return (
                <div key={rowIdx} className="space-y-4">
                  {/* Row of Circles (2 or 3 columns) */}
                  <div
                    className={`grid gap-4 sm:gap-6 ${
                      columnsCount === 2 ? 'grid-cols-2' : 'grid-cols-3'
                    }`}
                  >
                    {row.map((service) => {
                      const isSelected = selectedServiceId === service.id;
                      const color = service.accentColor || '#0284c7';

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() =>
                            setSelectedServiceId((prev) =>
                              prev === service.id ? null : service.id
                            )
                          }
                          className="group flex flex-col items-center text-center gap-2.5 focus:outline-none transition-transform"
                        >
                          {/* Circular Container with Colored Bottom Arc */}
                          <div className="relative">
                            <div
                              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 relative select-none ${
                                isSelected
                                  ? 'scale-105 shadow-lg ring-2 ring-offset-2'
                                  : 'hover:scale-105 hover:shadow-md'
                              }`}
                              style={{
                                backgroundColor: isSelected ? `${color}18` : `${color}0c`,
                                boxShadow: isSelected ? `0 0 0 2px ${color}` : undefined,
                              }}
                            >
                              {/* Colored Bottom Arc SVG Overlay */}
                              <svg
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                viewBox="0 0 100 100"
                              >
                                {/* Full circle perimeter guide */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="44"
                                  fill="none"
                                  stroke={isSelected ? color : '#E2E8F0'}
                                  strokeWidth={isSelected ? '2' : '1.5'}
                                  strokeOpacity={isSelected ? 0.4 : 0.6}
                                />
                                {/* Distinct Colored Bottom Arc */}
                                <path
                                  d="M 14 68 A 44 44 0 0 0 86 68"
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                />
                              </svg>

                              {/* Centered Clean Service Icon */}
                              <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                                <ServiceIcon
                                  iconName={service.iconName}
                                  size={30}
                                  color={color}
                                />
                              </div>
                            </div>

                            {/* Active Red Indicator Dot on Top-Right */}
                            {isSelected && (
                              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FA2C19] border-2 border-white shadow-sm animate-in zoom-in" />
                            )}
                          </div>

                          {/* Service Title Under Circle */}
                          <span
                            className={`text-xs sm:text-sm leading-snug max-w-[120px] transition-colors ${
                              isSelected
                                ? 'text-zinc-950 font-black'
                                : 'text-zinc-700 font-bold group-hover:text-black'
                            }`}
                          >
                            {service.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ===== IN-PLACE EXPANDABLE DRAWER CARD (Directly below active row) ===== */}
                  {activeServiceInRow && (
                    <div
                      ref={previewRef}
                      className="relative w-full bg-white rounded-3xl border border-zinc-200 shadow-xl p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
                    >
                      {/* Upward Pointer Caret aligned directly to clicked circle */}
                      <div
                        className="absolute -top-2 w-4 h-4 bg-white border-t border-l border-zinc-200 rotate-45 translate-x-1/2 transition-all duration-300 z-10"
                        style={{
                          right: getArrowRightPercent(activeColIndex, columnsCount),
                        }}
                      />

                      {/* Header: Title with dot + Close Button */}
                      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: activeServiceInRow.accentColor || '#0284c7',
                            }}
                          />
                          <h2 className="text-base sm:text-lg font-black text-zinc-900 truncate">
                            {activeServiceInRow.title}
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedServiceId(null)}
                          className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                          title="إغلاق المعاينة"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Media / Video / Image Embed */}
                      {activeServiceInRow.mediaType !== 'none' &&
                        activeServiceInRow.mediaUrl && (
                          <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-xs">
                            <UniversalMediaEmbedder
                              mediaType={activeServiceInRow.mediaType}
                              mediaUrl={activeServiceInRow.mediaUrl}
                              title={activeServiceInRow.title}
                            />
                          </div>
                        )}

                      {/* Service Description Box */}
                      {activeServiceInRow.description && (
                        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                          {activeServiceInRow.description}
                        </p>
                      )}

                      {/* Action & Navigation Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        {/* Primary Button: Enter Section / Department ("يمكن الدخول الى الشاشه الخاصه للقسم") */}
                        <button
                          type="button"
                          onClick={() => handleNavigateToSection(activeServiceInRow)}
                          className="w-full sm:flex-1 bg-zinc-900 hover:bg-black text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer active:scale-[0.99]"
                        >
                          <Layers size={16} />
                          <span>الدخول وتصفح منتجات القسم</span>
                          <ArrowLeft size={14} />
                        </button>

                        {/* WhatsApp Order Button */}
                        <button
                          type="button"
                          onClick={() => openWhatsApp(activeServiceInRow)}
                          className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-500/20 active:scale-[0.99] cursor-pointer"
                        >
                          <MessageCircle size={18} />
                          <span>طلب عبر واتساب ⚡</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
