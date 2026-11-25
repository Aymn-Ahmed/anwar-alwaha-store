import React, { useState, useEffect } from 'react';
import { servicesApi } from '../api/servicesApi';
import { ServiceItem } from '../types/service.types';
import { ServicesShowcase } from '../components/services/ServicesShowcase';
import { ServiceIcon } from '../components/common/ServiceIcon';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServicesPage: React.FC = () => {
  const [customServices, setCustomServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    servicesApi
      .getAll()
      .then((srvs) => setCustomServices(srvs || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 pb-24 lg:pb-16">
      {/* The Exact Services Showcase Requested by User */}
      <ServicesShowcase showTitle={true} />

      {/* Additional Store Custom Services (If created by admin in dashboard) */}
      {customServices.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-12 pt-8 border-t border-zinc-200">
          <h3 className="text-lg font-black text-zinc-900 mb-6 text-center">
            خدمات إضافية متوفرة في الفرع
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customServices.map((cs) => (
              <div
                key={cs.id}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cs.accentColor || '#059669'}15` }}
                  >
                    <ServiceIcon
                      iconName={cs.iconName}
                      size={24}
                      color={cs.accentColor || '#059669'}
                    />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-zinc-900">{cs.title}</h4>
                    <p className="text-xs text-zinc-600 line-clamp-2 mt-1">{cs.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      const text =
                        cs.whatsAppTemplate || `مرحباً مكتبة أنوار الواحة 👋 أود طلب خدمة: ${cs.title}`;
                      window.open(
                        `https://wa.me/966572350050?text=${encodeURIComponent(text)}`,
                        '_blank'
                      );
                    }}
                    className="flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>طلب عبر واتساب</span>
                  </button>
                  {cs.linkedCategoryId && (
                    <Link
                      to={`/categories?cat=${encodeURIComponent(cs.linkedCategoryId)}`}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>القسم</span>
                      <ArrowLeft size={13} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
