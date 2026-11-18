import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PALETTES, SLOTS, PRODUCTS } from './data/stationeryData';

export default function App() {
  const [selectedPalette, setSelectedPalette] = useState('lavender');
  const [bagSlots, setBagSlots] = useState({
    writing: null,
    highlight: null,
    notebooks: null,
    geometry: null,
    accessories: null,
  });
  const [activeTabSlot, setActiveTabSlot] = useState('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // حساب عدد الجيوب المكتملة
  const filledSlotsCount = useMemo(() => {
    return Object.values(bagSlots).filter(Boolean).length;
  }, [bagSlots]);

  // حساب المجموع
  const subtotal = useMemo(() => {
    return Object.values(bagSlots).reduce((sum, item) => sum + (item ? item.price : 0), 0);
  }, [bagSlots]);

  const totalWeightGrams = useMemo(() => {
    let weight = 400; // وزن الحقيبة الفارغة
    Object.entries(bagSlots).forEach(([slotId, item]) => {
      if (item) {
        const slotDef = SLOTS.find(s => s.id === slotId);
        weight += (slotDef ? slotDef.weightGrams : 100);
      }
    });
    return weight;
  }, [bagSlots]);

  // عتبات مكافآت شي إن
  const TIER_1 = 50;  // شحن مجاني
  const TIER_2 = 100; // هدية مقلمة
  const TIER_3 = 150; // خصم 25% + تجليد مجاني

  const discountAmount = useMemo(() => {
    if (subtotal >= TIER_3) {
      return subtotal * 0.25;
    }
    return 0;
  }, [subtotal]);

  const finalPrice = Math.max(0, subtotal - discountAmount);
  const progressPercent = Math.min(100, Math.round((subtotal / TIER_3) * 100));

  // احتفال الـ 150 ريال
  useEffect(() => {
    if (subtotal >= TIER_3 && !hasCelebrated) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setHasCelebrated(true);
    } else if (subtotal < TIER_3) {
      setHasCelebrated(false);
    }
  }, [subtotal, hasCelebrated]);

  const handleAddItem = (product) => {
    setBagSlots(prev => ({
      ...prev,
      [product.slot]: product
    }));
  };

  const handleRemoveItem = (slotId) => {
    setBagSlots(prev => ({
      ...prev,
      [slotId]: null
    }));
  };

  const handleAddFullAestheticSet = () => {
    const newSlots = {};
    SLOTS.forEach(slot => {
      const match = PRODUCTS.find(p => p.slot === slot.id && p.palette === selectedPalette) ||
                    PRODUCTS.find(p => p.slot === slot.id);
      if (match) newSlots[slot.id] = match;
    });
    setBagSlots(newSlots);
    confetti({ particleCount: 50, spread: 60 });
  };

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesSlot = activeTabSlot === 'all' || p.slot === activeTabSlot;
      const matchesPalette = p.palette === selectedPalette || p.palette === 'all';
      return matchesSlot && matchesPalette;
    });
  }, [activeTabSlot, selectedPalette]);

  const gapCloserItem = useMemo(() => {
    const remaining = TIER_3 - subtotal;
    if (remaining > 0 && remaining <= 35 && subtotal >= 90) {
      return PRODUCTS.find(p => p.price <= remaining + 5 && !Object.values(bagSlots).some(item => item && item.id === p.id));
    }
    return null;
  }, [subtotal, bagSlots]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      
      {/* 1. شريط الضمان الاجتماعي */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white py-2 px-4 rounded-xl text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm mb-4">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>🔥 ترند اليوم: <strong>38 طالباً</strong> من مدارس الحي جهزوا حقيبتهم المدرسية بهذا الأسلوب اليوم!</span>
      </div>

      {/* 2. الترويسة + اختيار باليت الألوان */}
      <header className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
              <span>🎒 استوديو القرطاسية التفاعلي</span>
              <span className="text-slate-400">•</span>
              <span>طريقة جديدة للتسوق</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              جهّز حقيبتك المدرسية وطابق ستايلك!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              اختر لونك المفضل، املأ جيوب حقيبتك الخمسة، وافتح الهدايا والخصومات التراكمية.
            </p>
          </div>

          {/* أزرار الألوان */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-xs font-bold text-slate-500 block mb-2">🎨 اختر الستايل واللون الموحد:</span>
            <div className="flex flex-wrap gap-2">
              {PALETTES.map(pal => (
                <button
                  key={pal.id}
                  onClick={() => setSelectedPalette(pal.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPalette === pal.id 
                      ? `${pal.bgClass} ring-2 ring-purple-500 shadow-sm scale-105` 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.color }}></span>
                  <span>{pal.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. شريط مكافآت شي إن التراكمي */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">شريط المكافآت التراكمي:</span>
              {subtotal >= TIER_3 ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  🎉 مبروك! فتحت الخصم الأقصى والهدايا بالكامل!
                </span>
              ) : (
                <span className="text-purple-700 font-extrabold">
                  {subtotal < TIER_1 && `باقي ${(TIER_1 - subtotal).toFixed(0)} ر.س لفتح الشحن المجاني!`}
                  {subtotal >= TIER_1 && subtotal < TIER_2 && `باقي ${(TIER_2 - subtotal).toFixed(0)} ر.س لفتح الهدية المجانية!`}
                  {subtotal >= TIER_2 && subtotal < TIER_3 && `باقي ${(TIER_3 - subtotal).toFixed(0)} ر.س لفتح خصم الـ 25% + تجليد مجاني!`}
                </span>
              )}
            </div>
            <div className="text-slate-500">
              قيمة سلتك الحالية: <span className="text-slate-900 font-black text-base">{subtotal.toFixed(0)} ر.س</span>
            </div>
          </div>

          <div className="relative w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 text-center text-xs mt-2 font-bold text-slate-500">
            <div className={`flex flex-col items-center ${subtotal >= TIER_1 ? 'text-purple-700 font-extrabold' : ''}`}>
              <span>🚚 50 ر.س</span>
              <span className="text-[11px] font-normal">شحن مجاني</span>
            </div>
            <div className={`flex flex-col items-center ${subtotal >= TIER_2 ? 'text-purple-700 font-extrabold' : ''}`}>
              <span>🎁 100 ر.س</span>
              <span className="text-[11px] font-normal">هدية أداة فاخرة</span>
            </div>
            <div className={`flex flex-col items-center ${subtotal >= TIER_3 ? 'text-pink-600 font-extrabold scale-105' : ''}`}>
              <span>🌟 150 ر.س</span>
              <span className="text-[11px] font-normal">خصم 25% + تجليد مجاني</span>
            </div>
          </div>
        </div>
      </header>

      {/* 4. الحقيبة التفاعلية + الكتالوج */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* الحقيبة والجيوب الـ 5 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>🎒 حقيبتك الذكية</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {filledSlotsCount} من 5 جيوب ممتلئة
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  الوزن التقديري: <span className="font-bold text-slate-800">{(totalWeightGrams / 1000).toFixed(2)} كجم</span> (طبي وآمن للظهر)
                </p>
              </div>
              <button
                onClick={handleAddFullAestheticSet}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold px-3 py-1.5 rounded-xl border border-purple-200 transition-all hover:scale-105"
              >
                ✨ تجهيز الطقم كاملاً
              </button>
            </div>

            <div className="mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">نسبة اكتمال تجهيزك:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(filledSlotsCount / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-black text-emerald-700">{(filledSlotsCount / 5) * 100}%</span>
              </div>
            </div>

            <div className="space-y-3">
              {SLOTS.map(slot => {
                const item = bagSlots[slot.id];
                return (
                  <div 
                    key={slot.id}
                    className={`p-3 rounded-xl border transition-all ${
                      item 
                        ? 'bg-purple-50/50 border-purple-200 shadow-sm' 
                        : 'bg-slate-50/70 border-dashed border-slate-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1.5 bg-white rounded-lg border border-slate-100">
                          {item ? item.image : slot.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{slot.name}</span>
                            {item ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                                مكتمل ✓
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.2 rounded">
                                شاغر ⚠
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {item ? item.name : slot.hint}
                          </p>
                        </div>
                      </div>

                      {item ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-purple-700">{item.price} ر.س</span>
                          <button
                            onClick={() => handleRemoveItem(slot.id)}
                            className="w-6 h-6 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-500 text-xs flex items-center justify-center font-bold"
                            title="إزالة"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveTabSlot(slot.id)}
                          className="text-xs bg-white hover:bg-purple-600 hover:text-white text-purple-700 font-bold px-2.5 py-1 rounded-lg border border-purple-200 shadow-sm transition-all"
                        >
                          + اختر
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                <div className="flex justify-between">
                  <span>إجمالي المنتجات:</span>
                  <span className="font-bold text-slate-800">{subtotal.toFixed(0)} ر.س</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>خصم باقة الـ 150 (25%):</span>
                    <span>- {discountAmount.toFixed(0)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>المبلغ النهائي المطلوب:</span>
                  <span className="text-purple-700 text-lg">{finalPrice.toFixed(0)} ر.س</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>📲 أرسل لبابا بالواتساب</span>
                </button>
                <button
                  onClick={() => alert(`تم تأكيد الطلب بنجاح بقيمة ${finalPrice.toFixed(0)} ر.س!`)}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>⚡ تأكيد واستلام</span>
                </button>
              </div>
            </div>
          </div>

          {/* سد الفجوة الذكي */}
          {gapCloserItem && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{gapCloserItem.image}</span>
                <div className="flex-1">
                  <div className="inline-block bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1">
                    💡 نصيحة ذكية للتوفير!
                  </div>
                  <p className="text-xs text-slate-800 font-bold leading-relaxed">
                    باقي لك فقط <span className="text-rose-600 font-black">{(TIER_3 - subtotal).toFixed(0)} ر.س</span> وتفتح خصم 25% (يوفر لك 37.5 ر.س)!
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    أضف <strong>{gapCloserItem.name}</strong> بـ {gapCloserItem.price} ر.س فقط لتدخل ضمن العرض فوراً.
                  </p>
                  <button
                    onClick={() => handleAddItem(gapCloserItem)}
                    className="mt-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all"
                  >
                    + أضف هذا الصنف ووفر فوراً
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* كتالوج المنتجات */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-slate-100">
              <button
                onClick={() => setActiveTabSlot('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  activeTabSlot === 'all' 
                    ? 'bg-purple-700 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                الكل ({PRODUCTS.length})
              </button>
              {SLOTS.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setActiveTabSlot(slot.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeTabSlot === slot.id 
                      ? 'bg-purple-700 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {slot.icon} {slot.name.replace('جيب ', '')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredProducts.map(prod => {
                const isSelected = Object.values(bagSlots).some(item => item && item.id === prod.id);
                return (
                  <div 
                    key={prod.id}
                    className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-emerald-400 bg-emerald-50/30' 
                        : 'border-slate-200/90 hover:border-purple-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl p-2 bg-slate-50 rounded-xl border border-slate-100">
                        {prod.image}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {prod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-black text-purple-700">{prod.price} ر.س</span>
                        <span className="text-xs text-slate-400 line-through">{prod.origPrice} ر.س</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      {isSelected ? (
                        <button
                          onClick={() => handleRemoveItem(prod.slot)}
                          className="w-full text-xs font-bold py-1.5 px-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-700 transition-all flex items-center justify-center gap-1"
                        >
                          <span>في حقيبتك ✓ (انقر للإلغاء)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddItem(prod)}
                          className="w-full text-xs font-bold py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 transition-all flex items-center justify-center gap-1"
                        >
                          <span>+ ضعه في الحقيبة</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* نافذة المشاركة للوالد */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 text-right">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900">📲 مشاركة السلة للدفع السريع</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              انسخ هذه الرسالة وأرسلها لوالدك على الواتساب، وسيظهر له زر دفع إلكتروني مباشر:
            </p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 font-mono leading-relaxed mb-4 select-all">
              مرحباً يا أبي العزيز 👋<br/>
              اخترت مستلزمات دراستي للترم الجديد من مكتبة الإبداع بطقم متناسق أنيق.<br/>
              • عدد القطع: {filledSlotsCount} أدوات رئيسية<br/>
              • الإجمالي: <strong>{finalPrice.toFixed(0)} ر.س</strong> {discountAmount > 0 && `(وفرنا ${discountAmount.toFixed(0)} ر.س بخصم الباقة!)`}<br/>
              رابط الاطلاع والدفع مباشرة عبر مدى/أبل باي:<br/>
              <span className="text-emerald-700 font-bold underline">https://maktabah.app/pay/bag-9284</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`مرحباً يا أبي العزيز 👋 اخترت مستلزمات دراستي للترم الجديد من مكتبة الإبداع. الإجمالي: ${finalPrice.toFixed(0)} ر.س. رابط الدفع: https://maktabah.app/pay/bag-9284`);
                  alert("تم نسخ رسالة الواتساب بنجاح!");
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <span>📋 نسخ الرسالة</span>
              </button>
              <button
                onClick={() => {
                  const msg = encodeURIComponent(`مرحباً يا أبي العزيز 👋 اخترت مستلزمات دراستي للترم الجديد من مكتبة الإبداع. الإجمالي: ${finalPrice.toFixed(0)} ر.س. رابط الدفع: https://maktabah.app/pay/bag-9284`);
                  window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <span>💬 فتح واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

