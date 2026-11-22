import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="text-6xl font-black text-brand-600">404</div>
      <h2 className="text-xl font-black text-gray-900">الصفحة المطلوبة غير موجودة</h2>
      <p className="text-xs text-gray-400">قد يكون الرابط غير صحيح أو تم نقل الصفحة</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-colors"
      >
        <Home size={15} />
        <span>العودة للرئيسية</span>
      </Link>
    </div>
  );
};
