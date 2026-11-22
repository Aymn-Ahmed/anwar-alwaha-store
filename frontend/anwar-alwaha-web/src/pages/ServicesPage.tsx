import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { servicesApi } from '../api/servicesApi';
import { ServiceItem } from '../types/service.types';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { UniversalMediaEmbedder } from '../components/common/UniversalMediaEmbedder';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [columnsCount, setColumnsCount] = useState<2 | 3>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 3
  );

  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    servicesApi
      .getAll()
      .then(setServices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Track responsive columns count (< 768px => 2 cols, >= 768px => 3 cols)
  useEffect(() => {
    const updateCols = () => {
      setColumnsCount(window.innerWidth < 768 ? 2 : 3);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Smooth scroll when preview opens/changes
  useEffect(() => {
    if (selectedServiceId && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedServiceId]);

  // Slice services into dynamic rows of `columnsCount`
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

  // Compute RTL horizontal position (`right` %) of the upward pointer arrow for the active column index
  const getArrowRightPercent = (colIndex: number, cols: 2 | 3): string => {
    // In RTL grid, colIndex 0 is rightmost column, colIndex (cols-1) is leftmost column.
    // Center of column `colIndex` from the right edge is `((colIndex + 0.5) / cols) * 100%`.
    const pct = ((colIndex + 0.5) / cols) * 100;
    return `${pct.toFixed(2)}%`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 lg:pb-16 space-y-8">
      {/* Top Pill & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-black px-4 py-1.5 rounded-full shadow-sm">
          <span>⚡</span>
          <span>خدمات مكتبة أنوار الواحة</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-zinc-900">
          اضغط على الخدمة لمعاينة تفاصيلها
        </h1>
      </div>

      {/* Dynamic Rows of Circular Service Buttons + Inline Row Preview Box */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-zinc-200 animate-pulse" />
              <div className="w-24 h-3 bg-zinc-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-7 max-w-2xl mx-auto">
          {serviceRows.map((row, rowIdx) => {
            const activeColIndex = row.findIndex((s) => s.id === selectedServiceId);
            const activeServiceInRow = activeColIndex !== -1 ? row[activeColIndex] : null;

            return (
              <div key={rowIdx} className="space-y-5">
                {/* Row of 2 (mobile) or 3 (md+) circular buttons */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-7">
                  {row.map((service) => {
                    const isSelected = selectedServiceId === service.id;
                    const color = service.accentColor || '#0284c7';

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() =>
                          setSelectedServiceId((prev) => (prev === service.id ? null : service.id))
                        }
                        className="group flex flex-col items-center text-center gap-2.5 focus:outline-none"
                      >
                        <div className="relative">
                          <div
                            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'scale-105 shadow-lg ring-4 ring-zinc-900/10'
                                : 'group-hover:scale-105 group-hover:shadow-md'
                            }`}
                            style={{
                              backgroundColor: `${color}15`,
                              border: `2px solid ${isSelected ? color : `${color}66`}`,
                            }}
                          >
                            <ServiceIcon iconName={service.iconName} size={30} color={color} />
                          </div>

                          {/* Active indicator red dot */}
                          {isSelected && (
                            <span className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-[#fa2c19] border-2 border-white shadow-sm" />
                          )}
                        </div>

                        <span
                          className={`text-xs sm:text-sm font-black leading-snug max-w-[140px] transition-colors ${
                            isSelected ? 'text-black' : 'text-zinc-800 group-hover:text-black'
                          }`}
                        >
                          {service.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Inline Preview Box rendered directly below the active row */}
                {activeServiceInRow && (
                  <div
                    ref={previewRef}
                    className="relative w-full bg-white rounded-3xl border border-zinc-200 shadow-lg p-5 sm:p-6 space-y-5 animate-in fade-in"
                  >
                    {/* Upward Pointer Arrow aligned horizontally to the clicked circle's column in RTL */}
                    <div
                      className="absolute -top-2.5 w-5 h-5 bg-white border-t border-l border-zinc-200 rotate-45 translate-x-1/2 transition-all duration-300"
                      style={{
                        right: getArrowRightPercent(activeColIndex, columnsCount),
                      }}
                    />

                    {/* Preview Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: activeServiceInRow.accentColor || '#0284c7' }}
                        />
                        <h2 className="text-base sm:text-lg font-black text-zinc-900">
                          {activeServiceInRow.title}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedServiceId(null)}
                        className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors shrink-0"
                        title="إغلاق المعاينة"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Universal Media Embedder */}
                    {activeServiceInRow.mediaType !== 'none' && activeServiceInRow.mediaUrl && (
                      <UniversalMediaEmbedder
                        mediaType={activeServiceInRow.mediaType}
                        mediaUrl={activeServiceInRow.mediaUrl}
                        title={activeServiceInRow.title}
                      />
                    )}

                    {/* Description */}
                    {activeServiceInRow.description && (
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        {activeServiceInRow.description}
                      </p>
                    )}

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => openWhatsApp(activeServiceInRow)}
                        className="w-full sm:flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-500/20 active:scale-[0.99]"
                      >
                        <MessageCircle size={18} />
                        <span>اطلب هذه الخدمة الآن عبر واتساب</span>
                      </button>

                      {activeServiceInRow.linkedCategoryId && (
                        <Link
                          to={`/categories?cat=${encodeURIComponent(activeServiceInRow.linkedCategoryId)}`}
                          className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs py-3.5 px-5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>تصفح منتجات القسم</span>
                          <ArrowLeft size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
