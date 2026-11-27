import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, MessageCircle, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { servicesApi } from '../api/servicesApi';
import { ServiceItem } from '../types/service.types';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { UniversalMediaEmbedder } from '../components/common/UniversalMediaEmbedder';

interface ServiceSubOption {
  id: string;
  title: string;
  tag?: string;
  badge?: string;
  imageUrl?: string;
}

// Curated default sub-options matching real store offerings for each department
const DEFAULT_DEPARTMENT_OFFERINGS: Record<string, ServiceSubOption[]> = {
  dept_print: [
    {
      id: 'print_rollup',
      title: 'رول أب ستاند (85×200 سم)',
      tag: 'مواصفات فاخرة',
      badge: 'الأكثر طلباً',
      imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'print_banners',
      title: 'بنرات إعلانية وتجارية ومدرسية',
      tag: 'مقاوم للرطوبة والشمس',
      badge: 'مكائن عريضة',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'print_stickers',
      title: 'قص استكرات إلكتروني (Plotter)',
      tag: 'قص دقيق ليزري',
      badge: 'لاصق ألماني',
      imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'print_boards',
      title: 'لوحات فلين وفوركس وباركود QR',
      tag: 'سماكات متعددة',
      imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
    },
  ],
  dept_school: [
    {
      id: 'school_boards',
      title: 'لوحات الفصول والقوانين الصفية',
      tag: 'تصميم تربوي مميز',
      badge: 'جاهز للتركيب',
      imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'school_booths',
      title: 'مجسمات المتاجر والأكشاك (3D Booths)',
      tag: 'أبعاد ومجسمات واقعية',
      badge: 'فلين مقوى',
      imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'school_models',
      title: 'مجسمات ومطويات الأنشطة المدرسية',
      tag: 'إبداع فني متقن',
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'school_portfolios',
      title: 'ملفات إنجاز المعلمين والطلاب',
      tag: 'تجليد وطباعة ليزرية',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    },
  ],
  dept_art: [
    {
      id: 'art_murals',
      title: 'جداريات المدارس والأسوار الخارجية',
      tag: 'رسم ميداني احترافي',
      badge: 'ألوان ثابتة',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'art_calligraphy',
      title: 'لوحات الخط العربي الأصيل والتكريم',
      tag: 'حبر وأصالة يدوية',
      badge: 'خطاطون محترفون',
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'art_tracks',
      title: 'رسم مسارات الألعاب الحركية للروضات',
      tag: 'ألعاب أرضية تفاعلية',
      imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=600&q=80',
    },
  ],
  dept_themes: [
    {
      id: 'themes_sleeves',
      title: 'أكمام أكواب القهوة (Cup Sleeves)',
      tag: 'طباعة حرارية وفاخرة',
      badge: 'للمقاهي والفعاليات',
      imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'themes_occasions',
      title: 'ثيمات المواليد والأعراس والمناسبات',
      tag: 'تنسيق متكامل للألوان',
      badge: 'تصميم خاص',
      imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'themes_water',
      title: 'تغليف وتاقات علب المياه والعصائر',
      tag: 'قص احترافي بأسماء المناسبة',
      imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'themes_letters',
      title: 'توزيعات تفعيل الحروف المدرسية للأطفال',
      tag: 'مجسمات وهدايا محبوبة',
      imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    },
  ],
  dept_grad: [
    {
      id: 'grad_binding',
      title: 'تجليد جلد مقوى مذهب (بكالوريوس)',
      tag: 'حفر ذهبي حراري',
      badge: 'مواصفات فاخرة',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'grad_master',
      title: 'تجليد ملكي مع بوستر A1 (ماجستير)',
      tag: 'تجليد جلدي وبوستر ملون',
      imageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'grad_phd',
      title: 'تجليد دكتوراه فاخر مع درع تذكاري',
      tag: 'طقم التخرج الأكاديمي الشامل',
      imageUrl: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'grad_sash',
      title: 'روب ووشاح تخرج بتطريز الاسم',
      tag: 'قماش ملكي وتطريز كمبيوتري',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
    },
  ],
  dept_stationery: [
    {
      id: 'stat_laser',
      title: 'تصوير وتجليد المذكرات والبحوث ليزرياً',
      tag: 'دقة عالية وسرعة تسليم',
      badge: 'أبيض وأسود وملون',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'stat_supplies',
      title: 'حقائب ودفاتر وأدوات مدرسية متكاملة',
      tag: 'أفضل الماركات المعتمدة',
      imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'stat_art',
      title: 'ألوان فنية وأقمشة كانفس وفرش رسم',
      tag: 'للهواة والمحترفين',
      imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    },
  ],
};

// Official store services fallback (identical to DbInitializer seed data)
const OFFICIAL_STORE_SERVICES: ServiceItem[] = [
  {
    id: 'dept_print',
    title: 'الطباعة الإعلانية والاستكرات',
    description:
      'طباعة بنرات إعلانية وتجارية ومدرسية، رول أب ستاند (85×200 سم)، قص استكرات إلكتروني (Plotter)، استكرات جدارية، ولوحات فلين وفوركس وباركود QR.',
    iconName: 'printer',
    accentColor: '#0284c7', // Bright blue
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
    accentColor: '#10b981', // Mint emerald
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
    accentColor: '#d97706', // Golden amber
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
    accentColor: '#f43f5e', // Pink rose
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
    accentColor: '#78350f', // Deep graduation brown/gold
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
    accentColor: '#64748b', // Slate gray
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
  const [selectedOptionTitle, setSelectedOptionTitle] = useState<string>('');

  const previewRef = useRef<HTMLDivElement | null>(null);

  // Load real store services directly from backend database API
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

  // Smooth scroll into view when preview drawer opens
  useEffect(() => {
    if (selectedServiceId && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedServiceId]);

  // Keep 3 columns grid matching user screenshots
  const columnsCount = 3;

  // Slice services into 3-column rows
  const serviceRows = useMemo(() => {
    const rows: ServiceItem[][] = [];
    for (let i = 0; i < services.length; i += columnsCount) {
      rows.push(services.slice(i, i + columnsCount));
    }
    return rows;
  }, [services, columnsCount]);

  // Active selected service
  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  // Get options for active service
  const activeOptions = useMemo((): ServiceSubOption[] => {
    if (!activeService) return [];

    // 1. If admin provided AvailableOptionsOrSizes in database, parse it
    if (activeService.availableOptionsOrSizes?.trim()) {
      const parsed = activeService.availableOptionsOrSizes
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: `opt_${idx}`,
          title: item,
          tag: 'خيار متاح',
          imageUrl:
            activeService.mediaType === 'image' && activeService.mediaUrl
              ? activeService.mediaUrl
              : undefined,
        }));
      }
    }

    // 2. Fallback to curated default offerings for this department
    const key = activeService.linkedCategoryId || activeService.id;
    if (DEFAULT_DEPARTMENT_OFFERINGS[key]) {
      return DEFAULT_DEPARTMENT_OFFERINGS[key];
    }

    // 3. Generic fallback
    return [
      { id: '1', title: activeService.title, tag: 'خدمة أساسية' },
      { id: '2', title: 'طلب مخصص بمواصفات خاصة', tag: 'تنفيذ فوري' },
    ];
  }, [activeService]);

  // Automatically select the first option when active service changes
  useEffect(() => {
    if (activeOptions.length > 0) {
      setSelectedOptionTitle(activeOptions[0].title);
    } else {
      setSelectedOptionTitle('');
    }
  }, [activeOptions]);

  const openWhatsApp = (service: ServiceItem, option?: string) => {
    let text =
      service.whatsAppTemplate ||
      `مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: *${service.title}*`;
    if (option) {
      text += `\n🎯 الخيار المحدد: *${option}*`;
    }
    window.open(`https://wa.me/966572350050?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Mathematically exact RTL alignment for the speech bubble upward arrow
  const getArrowRight = (colIndex: number): string => {
    if (colIndex === 0) return 'calc(16.67% - 10px)';
    if (colIndex === 1) return 'calc(50% - 10px)';
    return 'calc(83.33% - 10px)';
  };

  const handleNavigateToServiceDetail = (service: ServiceItem) => {
    const slug = service.linkedCategoryId || service.id;
    const query = selectedOptionTitle ? `?option=${encodeURIComponent(selectedOptionTitle)}` : '';
    navigate(`/services/${encodeURIComponent(slug)}${query}`);
  };

  return (
    <div className="min-h-screen bg-white sm:bg-[#fafafa] pt-6 sm:pt-10 pb-28 lg:pb-16 px-4">
      <div className="max-w-md mx-auto space-y-6 sm:space-y-7">
        {/* Top Header Badge & Headline (Exact UI from user screenshots) */}
        <div className="text-center space-y-2.5 pt-1">
          <div className="inline-flex items-center gap-1.5 bg-black text-white text-[11px] sm:text-xs font-black px-4 py-1.5 rounded-full shadow-xs select-none">
            <span className="text-[#F59E0B]">⚡</span>
            <span>خدمات بلس الأكاديمية والمهنية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight select-none">
            اضغط على الخدمة لمعاينة تفاصيلها
          </h1>
        </div>

        {/* 3-Column Circular Services Grid (Pure circles, zero rectangular outer card) */}
        {loading ? (
          <div className="grid grid-cols-3 gap-y-6 gap-x-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-[74px] h-[74px] rounded-full bg-zinc-200" />
                <div className="w-16 h-3 bg-zinc-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {serviceRows.map((row, rowIdx) => {
              const activeColIndex = row.findIndex((s) => s.id === selectedServiceId);
              const activeServiceInRow = activeColIndex !== -1 ? row[activeColIndex] : null;

              return (
                <div key={rowIdx} className="space-y-4">
                  {/* Grid of 3 Pure Circular Services */}
                  <div className="grid grid-cols-3 gap-y-6 gap-x-2 sm:gap-x-4">
                    {row.map((service, colIdx) => {
                      const isSelected = selectedServiceId === service.id;
                      const color = service.accentColor || '#0284c7';

                      return (
                        <div
                          key={service.id}
                          onClick={() =>
                            setSelectedServiceId((prev) =>
                              prev === service.id ? null : service.id
                            )
                          }
                          className="flex flex-col items-center text-center cursor-pointer select-none group"
                        >
                          {/* Pure Circular Button (Clear, Elegant, Clean) */}
                          <div className="relative">
                            <div
                              className="w-[74px] h-[74px] sm:w-[86px] sm:h-[86px] rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-105 relative"
                              style={{
                                backgroundColor: isSelected ? `${color}14` : '#FFFFFF',
                                boxShadow: isSelected
                                  ? `0 0 0 3px ${color}, 0 6px 16px -2px ${color}40`
                                  : '0 2px 8px rgba(0,0,0,0.04)',
                              }}
                            >
                              {/* Sleek SVG Ring with Bottom Colored Arc */}
                              <svg
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                viewBox="0 0 100 100"
                              >
                                {/* Full circular outline */}
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="44"
                                  fill="none"
                                  stroke={isSelected ? color : '#E2E8F0'}
                                  strokeWidth={isSelected ? '3.5' : '2'}
                                  strokeOpacity={isSelected ? 1 : 0.85}
                                />
                                {/* Bottom colored arc (Only in idle state to accentuate the circle) */}
                                {!isSelected && (
                                  <path
                                    d="M 13.5 75 A 44 44 0 0 0 86.5 75"
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                  />
                                )}
                              </svg>

                              {/* Centered Clean Contextual Icon */}
                              <div className="relative z-10 text-zinc-800 transition-transform duration-200 group-hover:scale-110">
                                <ServiceIcon
                                  iconName={service.iconName}
                                  size={28}
                                  color={isSelected ? color : '#1e293b'}
                                />
                              </div>
                            </div>

                            {/* Active Red Indicator Dot on Top-Right corner (as shown in user screenshots) */}
                            {isSelected && (
                              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#EF4444] border-2 border-white shadow-xs z-20 animate-in zoom-in-75 duration-150" />
                            )}
                          </div>

                          {/* Concise Clean Title directly under the circle */}
                          <span
                            className={`mt-2.5 text-xs sm:text-[13px] font-bold leading-tight max-w-[95px] sm:max-w-[110px] line-clamp-2 transition-colors ${
                              isSelected ? 'text-zinc-950 font-black' : 'text-zinc-700 group-hover:text-black'
                            }`}
                          >
                            {service.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* ===== IN-PLACE EXPANDABLE DRAWER CARD (Directly below active row) ===== */}
                  {activeServiceInRow && (
                    <div
                      ref={previewRef}
                      className="relative w-full bg-white rounded-[26px] sm:rounded-[30px] border border-zinc-200/90 shadow-2xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200"
                    >
                      {/* Upward Pointer Caret aligned directly to clicked circle in RTL */}
                      <div
                        className="absolute -top-2.5 w-5 h-5 bg-white border-t border-r border-zinc-200/90 rotate-[-45deg] transition-all duration-300 z-10"
                        style={{
                          right: getArrowRight(activeColIndex),
                        }}
                      />

                      {/* Header: Title with dot + Close Button (Matches Screenshot) */}
                      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor: activeServiceInRow.accentColor || '#10b981',
                            }}
                          />
                          <h2 className="text-xs sm:text-sm font-black text-zinc-900 truncate">
                            {activeServiceInRow.title}
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedServiceId(null)}
                          className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                          title="إغلاق المعاينة"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {/* Horizontal Carousel of Available Services in this Department */}
                      {activeOptions.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold px-0.5">
                            <span>الخدمات المتاحة في هذا القسم:</span>
                            <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                              اسحب للتصفح ←
                            </span>
                          </div>

                          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none snap-x">
                            {activeOptions.map((opt) => {
                              const isCurrentSelected = selectedOptionTitle === opt.title;

                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => setSelectedOptionTitle(opt.title)}
                                  className={`shrink-0 w-44 sm:w-52 rounded-2xl overflow-hidden border cursor-pointer transition-all snap-start flex flex-col justify-between bg-white ${
                                    isCurrentSelected
                                      ? 'border-2 border-black shadow-md'
                                      : 'border-zinc-200 hover:border-zinc-300'
                                  }`}
                                >
                                  {/* Media Image / Visual Container */}
                                  <div className="relative h-24 sm:h-28 bg-zinc-100 overflow-hidden">
                                    {opt.imageUrl ? (
                                      <img
                                        src={opt.imageUrl}
                                        alt={opt.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-400">
                                        <ServiceIcon
                                          iconName={activeServiceInRow.iconName}
                                          size={32}
                                          color={activeServiceInRow.accentColor || '#059669'}
                                        />
                                      </div>
                                    )}

                                    {/* Top-Right Tag Badge */}
                                    {opt.tag && (
                                      <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                                        {opt.tag}
                                      </span>
                                    )}

                                    {/* Top-Left 'Selected' Pill Badge */}
                                    {isCurrentSelected && (
                                      <span className="absolute top-2 left-2 bg-[#059669] text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                                        <Check size={10} strokeWidth={3} />
                                        <span>محدد</span>
                                      </span>
                                    )}
                                  </div>

                                  {/* Bottom Title Bar */}
                                  <div className="p-2 sm:p-2.5">
                                    <h4 className="text-[11px] sm:text-xs font-black text-zinc-900 line-clamp-1 leading-snug">
                                      {opt.title}
                                    </h4>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Video Embedder (if active service has TikTok/Video and no carousel cards) */}
                      {activeServiceInRow.mediaType !== 'none' &&
                        activeServiceInRow.mediaUrl &&
                        activeOptions.length === 0 && (
                          <div className="rounded-2xl overflow-hidden border border-zinc-100 shadow-xs">
                            <UniversalMediaEmbedder
                              mediaType={activeServiceInRow.mediaType}
                              mediaUrl={activeServiceInRow.mediaUrl}
                              title={activeServiceInRow.title}
                            />
                          </div>
                        )}

                      {/* Quick Pill Selection (حدد نوع طلبك بلمسة واحدة) */}
                      {activeOptions.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                            <span>حدد نوع طلبك بلمسة واحدة:</span>
                            {selectedOptionTitle && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-black">
                                <Check size={10} />
                                <span>تم التحديد</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {activeOptions.map((opt) => {
                              const isCurrent = selectedOptionTitle === opt.title;

                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setSelectedOptionTitle(opt.title)}
                                  className={`text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isCurrent
                                      ? 'bg-black text-white border-black shadow-xs font-black'
                                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                                  }`}
                                >
                                  {isCurrent && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                  )}
                                  <span>{opt.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Primary Button: 'المزيد ←' (Matching Screenshot) */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleNavigateToServiceDetail(activeServiceInRow)}
                          className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black text-xs sm:text-sm py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 active:scale-[0.99] cursor-pointer"
                        >
                          <span>المزيد</span>
                          <ArrowLeft size={15} />
                        </button>

                        {/* WhatsApp Fast CTA */}
                        <button
                          type="button"
                          onClick={() =>
                            openWhatsApp(activeServiceInRow, selectedOptionTitle)
                          }
                          className="bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.99] cursor-pointer"
                          title="طلب سريع عبر واتساب"
                        >
                          <MessageCircle size={16} />
                          <span>طلب سريع</span>
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
