import React from 'react';
import { Phone, MapPin, Clock, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-24 lg:pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <span className="font-extrabold text-xl text-white">مكتبة أنوار الواحة</span>
          </div>
          <p className="text-xs leading-relaxed text-gray-400 mb-4">
            وجهتكم الأولى لكل مستلزمات القرطاسية، المدرسية، والمكتبية، مع أحدث تقنيات الطباعة الإعلانية والخدمات الطلابية المتكاملة في نجران.
          </p>
          <div className="flex items-center gap-2 text-xs text-brand-400 bg-brand-950/60 p-2.5 rounded-lg border border-brand-800/50">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>متجر رسمي معتمد وموثق بسجل تجاري مرخص</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">روابط سريعة</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/" className="hover:text-brand-400 transition-colors">الصفحة الرئيسية</Link></li>
            <li><Link to="/categories" className="hover:text-brand-400 transition-colors">جميع الأقسام والأصناف</Link></li>
            <li><Link to="/services" className="hover:text-brand-400 transition-colors">خدمات الطباعة والتصاميم</Link></li>
            <li><Link to="/track" className="hover:text-brand-400 transition-colors">تتبع حالة طلبك</Link></li>
          </ul>
        </div>

        {/* Working Hours */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">أوقات العمل</h4>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-200">السبت - الخميس:</p>
                <p>الفترة الصباحية: 8:00 ص - 12:30 م</p>
                <p>الفترة المسائية: 4:00 م - 11:30 م</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">يوم الجمعة: 4:00 م - 11:30 م</p>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-bold text-white text-sm mb-4">تواصل معنا</h4>
          <ul className="space-y-3 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>المملكة العربية السعودية، نجران - طريق الملك سعود، حي الواحة</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400 shrink-0" />
              <span dir="ltr">057 235 0050</span>
            </li>
            <li>
              <a
                href="https://wa.me/966572350050"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg font-bold transition-colors text-xs"
              >
                <MessageCircle size={15} />
                <span>محادثة واتساب مباشرة</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span>جميع الحقوق محفوظة © {new Date().getFullYear()} لمكتبة أنوار الواحة</span>
        <span className="text-[11px]">بُني بأعلى معايير الأداء والسرعة والأمان</span>
      </div>
    </footer>
  );
};
