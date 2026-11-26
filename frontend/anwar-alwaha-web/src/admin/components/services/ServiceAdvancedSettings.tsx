import React, { useState } from 'react';
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Palette,
  MessageCircle,
  FolderTree,
  Check,
  CheckCheck,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';
import { Category } from '../../../types/category.types';
import { ServiceIcon, SERVICE_ICON_OPTIONS } from '../../../components/common/ServiceIcon';

export const ACCENT_PRESETS = [
  '#0284c7', // Sky
  '#059669', // Emerald
  '#d97706', // Amber
  '#9333ea', // Purple
  '#c40d00', // Red
  '#4f46e5', // Indigo
  '#e11d48', // Rose
  '#111111', // Black
];

interface ServiceAdvancedSettingsProps {
  iconName: string;
  onChangeIconName: (icon: string) => void;
  accentColor: string;
  onChangeAccentColor: (color: string) => void;
  linkedCategoryId: string;
  onChangeLinkedCategoryId: (catId: string) => void;
  categories: Category[];
  sortOrder: number;
  onChangeSortOrder: (order: number) => void;
  isActive: boolean;
  onChangeIsActive: (active: boolean) => void;
  detailedOverview: string;
  onChangeDetailedOverview: (val: string) => void;
  availableOptionsOrSizes: string;
  onChangeAvailableOptionsOrSizes: (val: string) => void;
  whatsAppTemplate: string;
  onChangeWhatsAppTemplate: (val: string) => void;
  serviceTitle: string;
}

export const ServiceAdvancedSettings: React.FC<ServiceAdvancedSettingsProps> = ({
  iconName,
  onChangeIconName,
  accentColor,
  onChangeAccentColor,
  linkedCategoryId,
  onChangeLinkedCategoryId,
  categories,
  sortOrder,
  onChangeSortOrder,
  isActive,
  onChangeIsActive,
  detailedOverview,
  onChangeDetailedOverview,
  availableOptionsOrSizes,
  onChangeAvailableOptionsOrSizes,
  whatsAppTemplate,
  onChangeWhatsAppTemplate,
  serviceTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Compute realistic evaluated WhatsApp text
  const evaluatedWhatsAppMessage = (
    whatsAppTemplate || 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: {اسم_الخدمة}'
  ).replace(/\{اسم_الخدمة\}|\{service_title\}/g, serviceTitle || 'الخدمة');

  const handleInsertTag = (tag: string) => {
    const current = whatsAppTemplate || '';
    if (current.includes(tag)) return;
    onChangeWhatsAppTemplate(current ? `${current} ${tag}` : tag);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden transition-all">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-right hover:bg-gray-850 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>إعدادات متقدمة للخدمة</span>
              <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-bold">
                الأيقونة، اللون، الربط، والواتساب
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              تخصيص الهوية البصرية، الربط بقسم المنتجات، رسالة الواتساب التلقائية، والمواصفات
            </p>
          </div>
        </div>

        <div className="text-gray-400 hover:text-white transition-colors">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-gray-800 space-y-6 animate-in fade-in text-xs">
          {/* 1. Icon & Accent Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Accent Color */}
            <div className="space-y-2">
              <label className="font-bold text-gray-300 flex items-center gap-1.5">
                <Palette size={14} className="text-brand-400" />
                <span>لون الدائرة والهوية:</span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChangeAccentColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                      accentColor === c
                        ? 'border-white scale-110 shadow-md ring-2 ring-white/20'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {accentColor === c && <Check size={12} className="text-white drop-shadow" />}
                  </button>
                ))}
                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => onChangeAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-xl bg-transparent cursor-pointer border border-gray-700"
                    title="اختر لوناً مخصصاً"
                  />
                </div>
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-2">
              <label className="font-bold text-gray-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-400" />
                <span>رمز وأيقونة الخدمة:</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-gray-950 border border-gray-800 rounded-2xl">
                {SERVICE_ICON_OPTIONS.map((opt) => {
                  const isSelected = iconName === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onChangeIconName(opt.value)}
                      className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-500 font-bold shadow-sm'
                          : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <ServiceIcon iconName={opt.value} size={14} color={isSelected ? '#ffffff' : accentColor} />
                      <span className="text-[11px]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Linked Category & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-800/80">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-300 flex items-center gap-1.5">
                <FolderTree size={14} className="text-brand-400" />
                <span>الربط بقسم المنتجات (لجلب منتجات القسم تلقائياً):</span>
              </label>
              <select
                value={linkedCategoryId}
                onChange={(e) => onChangeLinkedCategoryId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="">بدون ربط بقسم محدد</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-300 block">
                ترتيب الظهور بين الخدمات:
              </label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => onChangeSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-gray-950 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {/* 3. Active Toggle */}
          <div className="p-3 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">حالة تفعيل الخدمة في المتجر</span>
              <span className="text-[11px] text-gray-400">
                عند التعطيل لن تظهر الخدمة للزوار في واجهة المتجر العامة
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => onChangeIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* 4. Options & Sizes Chips (Quick Configurator Source) */}
          <div className="space-y-1.5 pt-2 border-t border-gray-800/80">
            <label className="font-bold text-gray-300 flex items-center gap-1.5">
              <Layers size={14} className="text-brand-400" />
              <span>خيارات ومقاسات جاهزة بلمسة واحدة (مفصولة بفاصلة أو سطر جديد):</span>
            </label>
            <textarea
              rows={2}
              value={availableOptionsOrSizes}
              onChange={(e) => onChangeAvailableOptionsOrSizes(e.target.value)}
              placeholder="مثال: رول أب مقاس 85×200 سم، بنر إعلاني، استكر لاصق لامع، وجه واحد، وجهين..."
              className="w-full bg-gray-950 border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-brand-500 transition-colors leading-relaxed"
            />
            <p className="text-[11px] text-gray-400">
              تتحول هذه الكلمات إلى أزرار خيارات تفاعلية بنقرة واحدة في كرت الخدمة وشاشة الطلب.
            </p>
          </div>

          {/* 5. Detailed Overview */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-300 flex items-center gap-1.5">
              <FileText size={14} className="text-brand-400" />
              <span>شرح تفصيلي ومواصفات المواد والتنفيذ (اختياري):</span>
            </label>
            <textarea
              rows={3}
              value={detailedOverview}
              onChange={(e) => onChangeDetailedOverview(e.target.value)}
              placeholder="اكتب مواصفات المواد، نوع الطباعة والورق، مدة التنفيذ والتجهيز، وأي تعليمات للعملاء..."
              className="w-full bg-gray-950 border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-brand-500 transition-colors leading-relaxed"
            />
          </div>

          {/* 6. WhatsApp Template with Realistic Chat Bubble Preview */}
          <div className="space-y-3 pt-2 border-t border-gray-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="font-bold text-gray-300 flex items-center gap-1.5">
                <MessageCircle size={14} className="text-emerald-400" />
                <span>رسالة الواتساب المجهزة مسبقاً (WhatsApp Template):</span>
              </label>
              <button
                type="button"
                onClick={() => handleInsertTag('{اسم_الخدمة}')}
                className="self-start sm:self-auto text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 cursor-pointer"
              >
                + إدراج {'{اسم_الخدمة}'}
              </button>
            </div>

            <input
              type="text"
              value={whatsAppTemplate}
              onChange={(e) => onChangeWhatsAppTemplate(e.target.value)}
              placeholder="مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: {اسم_الخدمة}"
              className="w-full bg-gray-950 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
            />

            {/* Realistic WhatsApp Chat Bubble Preview */}
            <div className="rounded-2xl bg-[#0b141a] p-4 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1 border-b border-gray-800/60">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <MessageCircle size={13} />
                  <span>معاينة رسالة الواتساب كما ستصلك من العميل:</span>
                </span>
                <span className="text-[10px]">واتساب المتجر</span>
              </div>

              {/* Message Bubble Container */}
              <div className="flex justify-end pt-1">
                <div className="max-w-sm bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-3 shadow-md space-y-1 relative">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {evaluatedWhatsAppMessage}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 pt-0.5">
                    <span>10:45 ص</span>
                    <CheckCheck size={13} className="text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
