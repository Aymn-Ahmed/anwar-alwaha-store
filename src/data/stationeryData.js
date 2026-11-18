export const PALETTES = [
  { id: 'lavender', name: 'خزامي هادئ', color: '#c084fc', bgClass: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'stealth', name: 'أسود مطفي VIP', color: '#334155', bgClass: 'bg-slate-200 text-slate-800 border-slate-400' },
  { id: 'mint', name: 'نعناع منعش', color: '#34d399', bgClass: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'sakura', name: 'وردي ساكورا', color: '#f472b6', bgClass: 'bg-pink-100 text-pink-700 border-pink-300' },
];

export const SLOTS = [
  { id: 'writing', name: 'جيب أقلام الكتابة', icon: '✏️', hint: 'أقلام جيل، رصاص، أو حبر فاخر', weightGrams: 90 },
  { id: 'highlight', name: 'جيب التحديد والتصحيح', icon: '🖍️', hint: 'هايلايتر باستيل، ممحاة عجين، شريط تصحيح', weightGrams: 80 },
  { id: 'notebooks', name: 'جيب الدفاتر والمذكرات', icon: '📓', hint: 'دفتر سلك مقسم، ستيكي نوتز، فواصل', weightGrams: 450 },
  { id: 'geometry', name: 'جيب الهندسة والرياضيات', icon: '📐', hint: 'طقم هندسي حديدي، حاسبة، مسطرة مرنة', weightGrams: 180 },
  { id: 'accessories', name: 'جيب الإكسسوارات والعناية', icon: '✨', hint: 'مقلمة، معقم، ملصقات شخصية، ميدالية', weightGrams: 120 },
];

export const PRODUCTS = [
  // أقلام الكتابة
  { id: 101, slot: 'writing', name: 'طقم أقلام جيل يابانية سريعة الجفاف (6 ألوان)', price: 28, origPrice: 38, palette: 'lavender', image: '🖊️', badge: 'الأكثر مبيعاً' },
  { id: 102, slot: 'writing', name: 'قلم ميكانيكي معدني أسود فاخر 0.5mm', price: 22, origPrice: 30, palette: 'stealth', image: '🖋️', badge: 'جودة يابانية' },
  { id: 103, slot: 'writing', name: 'مجموعة أقلام حبر ناعمة باللون النعناعي (5 قطع)', price: 24, origPrice: 32, palette: 'mint', image: '🖊️', badge: 'ستايل عصري' },
  { id: 104, slot: 'writing', name: 'أقلام حبر باستيل وردي مع قبضة مريحة لليد', price: 26, origPrice: 35, palette: 'sakura', image: '✍️', badge: 'تصميم مريح' },

  // التحديد والتصحيح
  { id: 201, slot: 'highlight', name: 'طقم هايلايتر ألوان باستيل ناعمة لا تنفذ من الورق', price: 22, origPrice: 30, palette: 'lavender', image: '🖍️', badge: 'ترند تيك توك' },
  { id: 202, slot: 'highlight', name: 'شريط تصحيح كوري مطفي + ممحاة مثلثة دقيقة', price: 18, origPrice: 25, palette: 'stealth', image: '🩹', badge: 'دقة عالية' },
  { id: 203, slot: 'highlight', name: 'هايلايتر نعناعي ذو رأسين (عريض ودقيق)', price: 19, origPrice: 26, palette: 'mint', image: '🖌️', badge: 'أصلي' },
  { id: 204, slot: 'highlight', name: 'مجموعة تظليل وتصحيح بلون الساكورا والزهور', price: 24, origPrice: 32, palette: 'sakura', image: '🖍️', badge: 'إصدار محدود' },

  // الدفاتر
  { id: 301, slot: 'notebooks', name: 'دفتر جامعي مقسم 5 مواد بغلاف لافندر مقاوم للماء', price: 36, origPrice: 48, palette: 'lavender', image: '📖', badge: 'ورق 100 جرام' },
  { id: 302, slot: 'notebooks', name: 'مفكرة جلدية سوداء فاخرة مع ورق منقط ومسطر', price: 42, origPrice: 55, palette: 'stealth', image: '📓', badge: 'غلاف جلدي' },
  { id: 303, slot: 'notebooks', name: 'دفتر سلك مزدوج أخضر نعناعي مع جيوب داخلية', price: 34, origPrice: 45, palette: 'mint', image: '📗', badge: 'عملي جداً' },
  { id: 304, slot: 'notebooks', name: 'دفتر ساكورا وردي بغلاف قماشي أنيق', price: 38, origPrice: 50, palette: 'sakura', image: '🌸', badge: 'تصميم ياباني' },

  // الهندسة والرياضيات
  { id: 401, slot: 'geometry', name: 'طقم هندسة معدني مقاوم للكسر في علبة متناسقة', price: 25, origPrice: 35, palette: 'lavender', image: '📐', badge: 'معدن متين' },
  { id: 402, slot: 'geometry', name: 'مسطرة ألمنيوم سوداء ليزرية + فرجار مهندسين', price: 30, origPrice: 42, palette: 'stealth', image: '📏', badge: 'للمهندسين' },
  { id: 403, slot: 'geometry', name: 'طقم مساطر وأدوات هندسية مرنة لا تنكسر أبداً', price: 20, origPrice: 28, palette: 'mint', image: '📐', badge: 'آمن للحقيبة' },
  { id: 404, slot: 'geometry', name: 'حاسبة علمية مدمجة باللون الوردي والأبيض', price: 45, origPrice: 60, palette: 'sakura', image: '🔢', badge: 'معتمدة للاختبارات' },

  // الإكسسوارات والملحقات
  { id: 501, slot: 'accessories', name: 'مقلمة لافندر متعددة الطبقات تتسع لـ 50 قلم', price: 35, origPrice: 48, palette: 'lavender', image: '👝', badge: 'سعة عملاقة' },
  { id: 502, slot: 'accessories', name: 'منظم مكتب كربوني مطفي ومقلمة حماية ضد الصدمات', price: 38, origPrice: 52, palette: 'stealth', image: '💼', badge: 'مقاوم للصدمات' },
  { id: 503, slot: 'accessories', name: 'ملصقات كورية مقاومة للماء مع ميدالية ومقص أمان', price: 16, origPrice: 24, palette: 'mint', image: '✂️', badge: 'كيوت وعملي' },
  { id: 504, slot: 'accessories', name: 'مقلمة ساكورا شفافة مع ستيكرات أسماء مخصصة', price: 28, origPrice: 38, palette: 'sakura', image: '👛', badge: 'الأكثر طلباً' },

  // أصناف سد الفجوة
  { id: 601, slot: 'accessories', name: 'باكيت ستيكرات كورية ثلاثية الأبعاد لتزيين الدفاتر', price: 12, origPrice: 18, palette: 'all', image: '🎨', badge: 'سعر مميز' },
  { id: 602, slot: 'writing', name: 'قلم جيل أسود بدقة 0.38mm مع حبر يدوم طويلاً', price: 10, origPrice: 15, palette: 'all', image: '🖊️', badge: 'إضافة سريعة' },
  { id: 603, slot: 'highlight', name: 'مجموعة أوراق ملاحظات شفافة لا تحجب الكلمات', price: 14, origPrice: 22, palette: 'all', image: '📑', badge: 'للمذاكرة السريعة' }
];

