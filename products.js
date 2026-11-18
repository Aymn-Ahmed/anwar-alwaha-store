// ==========================================================================
// MAKTABAH - Products & Categories Database
// ==========================================================================

    var FALLBACK_IMG = window.FALLBACK_IMG || "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%23f3f4f6%22%20stroke%3D%22%23e5e7eb%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2257%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%3E%F0%9F%93%9A%3C%2Ftext%3E%3C%2Fsvg%3E";

    // --- تبويبات الرأس العلوية في الهوم ---
    var TABS = window.TABS || [
      { id: 'all', title: 'الكل' },
      { id: 'cat_printing', title: 'طباعة وبحوث' },
      { id: 'cat_grad', title: 'مشاريع تخرج' },
      { id: 'cat_events', title: 'دعوات ومناسبات' },
      { id: 'cat_art', title: 'أدوات رسم وفنون' },
    ];

    // --- بنرات العروض العلوية ---
    var HERO_SLIDES = window.HERO_SLIDES || [
      {
        id: 0,
        gradient: 'from-[#800000] via-[#be0b00] to-[#6b0000]',
        badge: 'موسم التخرج والبحوث 🎓',
        mainTitle: 'تجليد فاخر وطباعة ليزر',
        subTitle: 'طباعة رسائل الماجستير وبحوث التخرج بأعلى جودة مع كروت المناسبات',
        buttonText: 'تصفح خدمات التخرج',
        categoryTarget: 'cat_grad',
        bgImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80',
        floatingItems: [
          { name: 'تجليد فاخر مذهب', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80' },
          { name: 'دعوات أفراح ليزرية', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 1,
        gradient: 'from-[#5096be] via-[#74b3d7] to-[#4085ac]',
        badge: 'باقات طلبة الهندسة والجامعات 📐',
        mainTitle: 'استوديو أدوات العمارة والرسم',
        subTitle: 'مساطر ليزر، حاسبات علمية معتمدة، وكراسات ورق قطني ثقيل',
        buttonText: 'استكشف أدوات الهندسة',
        categoryTarget: 'cat_geometry',
        bgImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=80',
        floatingItems: [
          { name: 'طقم هندسة ألمنيوم', img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80' }
        ]
      },
      {
        id: 2,
        gradient: 'from-[#2e947e] via-[#48bfa3] to-[#267c69]',
        badge: 'عروض مستلزمات المدارس 🎒',
        mainTitle: 'أطقم أقلام ومفكرات باستيل',
        subTitle: 'كل ما تحتاجه للترم الجديد بأسعار تبدأ من 5 ريال فقط',
        buttonText: 'تجهيز الحقيبة المدرسية',
        categoryTarget: 'cat_pens',
        bgImage: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=1400&q=80',
        floatingItems: [
          { name: 'أقلام باستيل سريعة الجفاف', img: 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=400&q=80' }
        ]
      }
    ];

    // =========================================================================
    // الـ 15 دائرة مع روابط صور صالحة ومعبرة بنسبة 100% + معرّف الفلترة categoryKey
    // =========================================================================
    var MAKTABAH_15_CATEGORIES = window.MAKTABAH_15_CATEGORIES || [
      // الصف الأول
      { 
        id: '1', 
        categoryKey: 'cat_printing', 
        name: 'طباعة وبحوث', 
        desc: 'مذكرات وملازم PDF', 
        img: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '2', 
        categoryKey: 'cat_grad', 
        name: 'مشاريع التخرج', 
        desc: 'تجليد فاخر وبوسترات', 
        img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '3', 
        categoryKey: 'cat_events', 
        name: 'دعوات وأعراس', 
        desc: 'كروت زواج وتخرج', 
        img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '4', 
        categoryKey: 'cat_school_kits', 
        name: 'أطقم مدرسية', 
        desc: 'حقائب ودفاتر طلاب', 
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '5', 
        categoryKey: 'cat_college', 
        name: 'مستلزمات جامعية', 
        desc: 'دفاتر سلك ومفكرات', 
        img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80' 
      },

      // الصف الثاني
      { 
        id: '6', 
        categoryKey: 'cat_pens', 
        name: 'أقلام وحبر فاخر', 
        desc: 'جيل، حبر سائل، رصاص', 
        img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '7', 
        categoryKey: 'cat_notebooks', 
        name: 'دفاتر ومذكرات', 
        desc: 'أجندات جلدية ومنقطة', 
        img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '8', 
        categoryKey: 'cat_highlight', 
        name: 'تظليل وتصحيح', 
        desc: 'هايلايتر وممحاة عجين', 
        img: 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '9', 
        categoryKey: 'cat_art', 
        name: 'أدوات رسم وفنون', 
        desc: 'ألوان مائية، كانفس، فراشي', 
        img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '10', 
        categoryKey: 'cat_geometry', 
        name: 'هندسة وحاسبات', 
        desc: 'حاسبات علمية ومساطر ليزر', 
        img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=300&q=80' 
      },

      // الصف الثالث
      { 
        id: '11', 
        categoryKey: 'cat_binding', 
        name: 'تغليف وتجليد', 
        desc: 'سلك، حراري، تغليف هدايا', 
        img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '12', 
        categoryKey: 'cat_stamps', 
        name: 'أختام وهوية بصرية', 
        desc: 'أختام شخصية وبطاقات عمل', 
        img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '13', 
        categoryKey: 'cat_cases', 
        name: 'حقائب ومقالم', 
        desc: 'مقالم كورية ومنظمات مكاتب', 
        img: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '14', 
        categoryKey: 'cat_stickers', 
        name: 'ستيكرات وتوزيعات', 
        desc: 'ملصقات أسماء وتوزيعات تخرج', 
        img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=300&q=80' 
      },
      { 
        id: '15', 
        categoryKey: 'cat_bundles', 
        name: 'تصفية وباقات 150', 
        desc: 'باقات توفير وخصم 25%', 
        img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80' 
      },
    ];

    // --- قاعدة بيانات المنتجات مع ربط كل منتج بقسمه المحدد (categoryKey) ---
    var PRODUCTS = window.PRODUCTS || [
      // 1. مشاريع التخرج (cat_grad)
      {
        id: 101,
        categoryKey: 'cat_grad',
        name: 'تجليد بحث التخرج الفاخر (جلد مقوى مذهب مع سلك حراري داخلي)',
        categoryName: 'مشاريع التخرج',
        price: 35.00,
        origPrice: 50.00,
        discount: '-30%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [102, 109],
        soldCount: '1.2k+ طلب',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1590412701565-55de7fad7cab?auto=format&fit=crop&w=700&q=80',
        badge: 'الأكثر طلباً للتخرج 🎓',
        desc: 'تجليد فاخر معتمد من جميع الجامعات، ورق مقوى مقاوم للماء مع حفر مذهب باسم الطالب والمشرف وتدقيق للمواصفات.'
      },
      {
        id: 108,
        categoryKey: 'cat_grad',
        name: 'روب وقبعة تخرج فاخرة مع وشاح وتطريز الاسم وسنة التخرج',
        categoryName: 'مشاريع التخرج',
        price: 85.00,
        origPrice: 130.00,
        discount: '-35%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [101, 110],
        soldCount: '620+ حجز',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=700&q=80',
        badge: 'باقة التخرج الأنيقة 🎓',
        desc: 'قماش فاخر مقاوم للتجعد مع سحاب أمامي مخفي وتطريز كمبيوتري دقيق للاسم وشعار الجامعة.'
      },
      {
        id: 109,
        categoryKey: 'cat_grad',
        name: 'كروت إهداء وشكر للدكاترة ولجنة مناقشة البحث (باكيت 10 كروت مذهبة)',
        categoryName: 'مشاريع التخرج',
        price: 20.00,
        origPrice: 35.00,
        discount: '-42%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [101, 102],
        soldCount: '1.4k+ طلب',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1577201867491-47644a49dcab?auto=format&fit=crop&w=700&q=80',
        badge: 'إهداء فاخر للدكاترة ✨',
        desc: 'كروت شكر فاخرة بعبارات امتنان راقية مخصصة لمناقشة رسائل الماجستير وبحوث التخرج.'
      },
      {
        id: 110,
        categoryKey: 'cat_grad',
        name: 'وشاح تخرج كلاسيكي شيفون مطرز بالخيوط الذهبية الملكية',
        categoryName: 'مشاريع التخرج',
        price: 35.00,
        origPrice: 55.00,
        discount: '-36%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [108],
        soldCount: '780+ طلب',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1779753795022-70eeeb7d5075?auto=format&fit=crop&w=700&q=80',
        badge: 'كشخة حفل التخرج 🎓',
        desc: 'وشاح مميز بخامات حريرية فاخرة يضفي لمسة ملكية ساحرة في صور تخرجك وتكريمك.'
      },

      // 2. طباعة وبحوث (cat_printing)
      {
        id: 102,
        categoryKey: 'cat_printing',
        name: 'بوستر مناقشة البحث مقاس A1 طباعة ليزرية ملونة عالية الدقة',
        categoryName: 'طباعة وبحوث',
        price: 25.00,
        origPrice: 40.00,
        discount: '-38%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [101],
        soldCount: '890+ طلب',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=700&q=80',
        badge: 'مكمل بحث التخرج 📊',
        desc: 'طباعة ملونة فاخرة على ورق جلوسي 220g سميك لا يعكس إضاءة قاعة المناقشة ويثبت بسهولة على الستاند.'
      },
      {
        id: 106,
        categoryKey: 'cat_printing',
        name: 'طباعة وتجليد أبحاث ومذكرات جامعية PDF ورق 80g فاخر أبيض ناصع',
        categoryName: 'طباعة وبحوث',
        price: 15.00,
        origPrice: 25.00,
        discount: '-40%',
        palette: 'stealth',
        paletteName: 'الطباعة السريعة',
        complements: [102, 107],
        soldCount: '3.8k+ ملف',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1598620616337-cb8f766489bd?auto=format&fit=crop&w=700&q=80',
        badge: 'طباعة فورية في نفس اليوم ⚡',
        desc: 'اطبع ملفك بدقة 1200 DPI مع ورق ياباني عالي البياض وتغليف حراري أو سلك حلزوني فوري.'
      },
      {
        id: 107,
        categoryKey: 'cat_printing',
        name: 'طباعة ملازم ومقررات ملونة مع تغليف شفاف وسلك حلزوني متين',
        categoryName: 'طباعة وبحوث',
        price: 18.00,
        origPrice: 30.00,
        discount: '-40%',
        palette: 'lavender',
        paletteName: 'الطباعة السريعة',
        complements: [106],
        soldCount: '2.1k+ ملزمة',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
        badge: 'ملازم ومقررات 📚',
        desc: 'ألوان زاهية وواضحة جداً للرسومات والمخططات الطبية والهندسية مع حماية بلاستيكية مزدوجة.'
      },

      // 3. دعوات وأعراس (cat_events)
      {
        id: 103,
        categoryKey: 'cat_events',
        name: 'طقم دعوات زواج وأفراح ليزرية مذهبة (باكيت 50 كرت فاخر)',
        categoryName: 'دعوات وأعراس',
        price: 75.00,
        origPrice: 120.00,
        discount: '-37%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [104, 105],
        soldCount: '480+ حجز',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1548838906-c58e48fdb10c?auto=format&fit=crop&w=700&q=80',
        badge: 'أفراح ومناسبات 💍',
        desc: 'ورق لؤلؤي مقوى 350g مع نقش ليزري مذهب وأظرف مطابقة لإبراز فخامة مناسبتك.'
      },
      {
        id: 111,
        categoryKey: 'cat_events',
        name: 'كروت استقبال وتوزيعات شوكولاتة مخصصة بأسماء العروسين (طقم 50)',
        categoryName: 'دعوات وأعراس',
        price: 45.00,
        origPrice: 70.00,
        discount: '-35%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [103, 104],
        soldCount: '630+ طلب',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80',
        badge: 'توزيعات الأفراح 🍫',
        desc: 'تصميم راقٍ ومقاسات مثالية لعلب الشوكولاتة والتوزيعات مع ختم بصمة ذهبية بارزة.'
      },
      {
        id: 112,
        categoryKey: 'cat_events',
        name: 'دفتر توقيع العروسين وذكريات الضيوف الفاخر جلد لؤلؤي مذهب',
        categoryName: 'دعوات وأعراس',
        price: 65.00,
        origPrice: 95.00,
        discount: '-31%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [105, 103],
        soldCount: '310+ طلب',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
        badge: 'ذكريات لا تنسى 📖',
        desc: 'دفتر ضيوف ملكي بغلاف جلدي مطرز لحفظ تهاني وكلمات الأحباب في ليلة العمر.'
      },

      // 4. أطقم مدرسية (cat_school_kits)
      {
        id: 204,
        categoryKey: 'cat_school_kits',
        name: 'حقيبة ظهر مدرسية طبية مضادة للماء خفيفة الوزن مع دعامة ظهر',
        categoryName: 'أطقم مدرسية',
        price: 65.00,
        origPrice: 95.00,
        discount: '-32%',
        palette: 'stealth',
        paletteName: 'الأسود الرياضي',
        complements: [203, 205],
        soldCount: '780+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80',
        badge: 'راحة الظهر 🎒',
        desc: 'حقيبة مدرسية متطورة مصممة لتوزيع ثقل الكتب على كامل الظهر دون إجهاد الفقرات.'
      },
      {
        id: 205,
        categoryKey: 'cat_school_kits',
        name: 'باقة قرطاسية العودة للمدرسة المتكاملة (12 قطعة مجمعة وفر 40%)',
        categoryName: 'أطقم مدرسية',
        price: 45.00,
        origPrice: 75.00,
        discount: '-40%',
        palette: 'lavender',
        paletteName: 'طقم المدرسة',
        complements: [204, 206],
        soldCount: '1.5k+ باقة',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80',
        badge: 'توفير العودة للمدارس ✏️',
        desc: 'تشمل دفاتر مسطرة، أقلام جيل، براية، ممحاة، مسطرة، ومقص أطفال آمن في حقيبة واحدة.'
      },
      {
        id: 206,
        categoryKey: 'cat_school_kits',
        name: 'لانش بوكس ومطارة ماء مدرسية حرارية ستانلس ستيل مانعة للتسريب',
        categoryName: 'أطقم مدرسية',
        price: 35.00,
        origPrice: 55.00,
        discount: '-36%',
        palette: 'stealth',
        paletteName: 'طقم المدرسة',
        complements: [204],
        soldCount: '920+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1726726192151-6d4139ff229d?auto=format&fit=crop&w=700&q=80',
        badge: 'صحي ومقاوم للحرارة 🍱',
        desc: 'مواد آمنة غذائياً 100% خالية من BPA تحافظ على حرارة الطعام وبرودة الماء طوال اليوم الدراسي.'
      },

      // 5. مستلزمات جامعية (cat_college)
      {
        id: 202,
        categoryKey: 'cat_college',
        name: 'دفتر سلك لافندر مقسم 5 مواد جامعي مع فواصل ملونة وجيوب',
        categoryName: 'مستلزمات جامعية',
        price: 32.00,
        origPrice: 48.00,
        discount: '-33%',
        palette: 'lavender',
        paletteName: 'اللافندر الهادئ',
        complements: [201, 203],
        soldCount: '2.1k+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80',
        badge: 'ورق ناعم 100g 📓',
        desc: 'دفتر سلك حلزوني مزدوج 200 صفحة، مقسم لـ 5 مواد مع فواصل بلاستيكية مرنة وجيوب داخلية لحفظ الملخصات.'
      },
      {
        id: 207,
        categoryKey: 'cat_college',
        name: 'مجلد حفظ المستندات والمحاضرات A4 كليب معدني مزدوج متين',
        categoryName: 'مستلزمات جامعية',
        price: 18.00,
        origPrice: 28.00,
        discount: '-35%',
        palette: 'stealth',
        paletteName: 'تنظيم المواد',
        complements: [202],
        soldCount: '1.2k+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80',
        badge: 'حفظ المذكرات الجامعية 📁',
        desc: 'يحمي ملازمك وملاحظات المحاضرات من التلف والتمزق مع كليب قوي يتسع لـ 150 ورقة.'
      },
      {
        id: 208,
        categoryKey: 'cat_college',
        name: 'بلانر أسبوعي لتنظيم مواعيد المحاضرات والاختبارات النصفية',
        categoryName: 'مستلزمات جامعية',
        price: 22.00,
        origPrice: 35.00,
        discount: '-37%',
        palette: 'lavender',
        paletteName: 'اللافندر الهادئ',
        complements: [201, 202],
        soldCount: '840+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=80',
        badge: 'جدول المحاضرات والـ GPA 🗓️',
        desc: 'تقسيم ذكي للمهام الأسبوعية وتتبع الغيابات ومواعيد تسليم التكاليف والمشاريع.'
      },

      // 6. أقلام وحبر فاخر (cat_pens)
      {
        id: 105,
        categoryKey: 'cat_pens',
        name: 'قلم حبر سائل ذهبي وفضي لكتابة أسماء ضيوف المناسبات',
        categoryName: 'أقلام وحبر فاخر',
        price: 15.00,
        origPrice: 25.00,
        discount: '-40%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [103],
        soldCount: '810+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80',
        badge: 'خط عربي مذهب ✍️',
        desc: 'حبر معدني لامع يظهر بوضوح حتى على الأوراق السوداء والغامقة وسريع الجفاف.'
      },
      {
        id: 209,
        categoryKey: 'cat_pens',
        name: 'طقم أقلام جيل يابانية سريعة الجفاف 0.5mm (12 لون باستيل)',
        categoryName: 'أقلام وحبر فاخر',
        price: 28.00,
        origPrice: 45.00,
        discount: '-38%',
        palette: 'lavender',
        paletteName: 'اللافندر الهادئ',
        complements: [201, 202],
        soldCount: '3.1k+ مبيع',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1567855354833-ac2c4f967b0c?auto=format&fit=crop&w=700&q=80',
        badge: 'سلاسة فائقة في الكتابة 🖊️',
        desc: 'رأس كروي دقيق لا يسرب الحبر ولا يلطخ اليد، مثالية للمذاكرة وتلخيص المواد الطويلة.'
      },
      {
        id: 210,
        categoryKey: 'cat_pens',
        name: 'قلم حبر جاف فاخر معدني ثقيل مع علبة إهداء مخملية سوداء',
        categoryName: 'أقلام وحبر فاخر',
        price: 38.00,
        origPrice: 65.00,
        discount: '-41%',
        palette: 'stealth',
        paletteName: 'الأسود الفاخر',
        complements: [601],
        soldCount: '520+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80',
        badge: 'إهداء رسمي راقٍ 🎁',
        desc: 'جسم من التيتانيوم المصقول مع توازن وزني مريح جداً للكتابة والتوقيع الرسمي.'
      },

      // 7. دفاتر ومذكرات (cat_notebooks)
      {
        id: 601,
        categoryKey: 'cat_notebooks',
        name: 'مفكرة جلدية كلاسيكية A5 مع شريط إغلاق وورق منقط 100g',
        categoryName: 'دفاتر ومذكرات',
        price: 38.00,
        origPrice: 60.00,
        discount: '-36%',
        palette: 'stealth',
        paletteName: 'الأسود الفاخر',
        complements: [105, 210],
        soldCount: '1.4k+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80',
        badge: 'فخامة الملاحظات 📓',
        desc: 'غلاف جلد صناعي فاخر مع ورق منقط ومسطر مناسب للتخطيط اليومي وتدوين الأفكار.'
      },
      {
        id: 602,
        categoryKey: 'cat_notebooks',
        name: 'دفتر بوليت جورنال منقط 160g مخصص للإبداع وتتبع العادات',
        categoryName: 'دفاتر ومذكرات',
        price: 42.00,
        origPrice: 65.00,
        discount: '-35%',
        palette: 'lavender',
        paletteName: 'اللافندر الهادئ',
        complements: [201, 209],
        soldCount: '980+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=700&q=80',
        badge: 'ورق ثقيل لا ينفذ الحبر 📝',
        desc: 'صفحات سميكة 160 GSM تتحمل أقلام الحبر والألوان المائية والتظليل دون أي تسريب خلفي.'
      },
      {
        id: 603,
        categoryKey: 'cat_notebooks',
        name: 'كشكول جامعي سلك كرافت طبيعي صديق للبيئة (باكيت 3 دفاتر)',
        categoryName: 'دفاتر ومذكرات',
        price: 24.00,
        origPrice: 38.00,
        discount: '-37%',
        palette: 'stealth',
        paletteName: 'كرافت طبيعي',
        complements: [209],
        soldCount: '1.8k+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
        badge: 'خيار الطلاب الاقتصادي 🌿',
        desc: 'أوراق مسطرة ناعمة وغلاف كرافت مقوى مع سلك معدني مزدوج لا ينفك بالحقيبة.'
      },

      // 8. تظليل وتصحيح (cat_highlight)
      {
        id: 201,
        categoryKey: 'cat_highlight',
        name: 'طقم أقلام تظليل باستيل ناعمة لا تنفذ من صفحات الكتب (6 ألوان)',
        categoryName: 'تظليل وتصحيح',
        price: 24.00,
        origPrice: 42.00,
        discount: '-43%',
        palette: 'lavender',
        paletteName: 'اللافندر الهادئ',
        complements: [202, 203],
        soldCount: '3.4k+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80',
        badge: 'ترند تيك توك 💜',
        desc: 'أقلام تظليل يابانية بألوان هادئة للعين لا تسبب فوضى بصرية ومثالية للمذاكرة الطويلة.'
      },
      {
        id: 211,
        categoryKey: 'cat_highlight',
        name: 'طقم شريط تصحيح وممحاة ناعمة للأوراق الرسمية والمذكرات (4 قطع)',
        categoryName: 'تظليل وتصحيح',
        price: 14.00,
        origPrice: 22.00,
        discount: '-36%',
        palette: 'lavender',
        paletteName: 'اللافندر الهادئ',
        complements: [201, 209],
        soldCount: '1.6k+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=700&q=80',
        badge: 'تصحيح نظيف فوري 🩹',
        desc: 'شريط تصحيح أبيض جاف يمكن الكتابة فوقه فوراً بدون انتظار جفاف الحبر.'
      },
      {
        id: 212,
        categoryKey: 'cat_highlight',
        name: 'أقلام هايلايتر فوسفورية مزدوجة الرأس عريضة ودقيقة (طقم 5 ألوان)',
        categoryName: 'تظليل وتصحيح',
        price: 19.00,
        origPrice: 30.00,
        discount: '-37%',
        palette: 'artistic',
        paletteName: 'الألوان المضيئة',
        complements: [201],
        soldCount: '1.1k+ مبيع',
        rating: 4.7,
        img: 'https://images.unsplash.com/photo-1567855354833-ac2c4f967b0c?auto=format&fit=crop&w=700&q=80',
        badge: 'تحديد بارز وسريع 🖍️',
        desc: 'ألوان ساطعة للتركيز على النقاط الهامة في ملخصات الاختبارات النهائية.'
      },

      // 9. أدوات رسم وفنون (cat_art)
      {
        id: 301,
        categoryKey: 'cat_art',
        name: 'طقم ألوان مائية احترافية 36 لون مع فرشاة خزان ماء مدمجة',
        categoryName: 'أدوات رسم وفنون',
        price: 48.00,
        origPrice: 75.00,
        discount: '-36%',
        palette: 'artistic',
        paletteName: 'استوديو الفنانين',
        complements: [302, 303],
        soldCount: '890+ مبيع',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1511980725567-b9b7f0358905?auto=format&fit=crop&w=700&q=80',
        badge: 'اختيار الرسامين 🎨',
        desc: 'صبغات حيوية عالية التركيز قابلة للدمج، مع علبة معدنية صلبة ولوحة خلط ألوان مدمجة وفرشاة مائية ذكية.'
      },
      {
        id: 302,
        categoryKey: 'cat_art',
        name: 'كراسة رسم ورق قطني 300g مضاد لامتصاص وتموج الماء',
        categoryName: 'أدوات رسم وفنون',
        price: 28.00,
        origPrice: 45.00,
        discount: '-38%',
        palette: 'artistic',
        paletteName: 'استوديو الفنانين',
        complements: [301],
        soldCount: '720+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80',
        badge: 'ورق قطن ثقيل 📄',
        desc: 'ورق مائي مخصص ملمس ناعم يتحمل طبقات الماء المتكررة والتقنيات الرطبة دون أن يتمزق أو ينثني.'
      },
      {
        id: 303,
        categoryKey: 'cat_art',
        name: 'طقم ألوان أكريليك وفرش كانفس احترافية (12 لون + 5 فراشي)',
        categoryName: 'أدوات رسم وفنون',
        price: 45.00,
        origPrice: 70.00,
        discount: '-35%',
        palette: 'artistic',
        paletteName: 'استوديو الفنانين',
        complements: [301, 302],
        soldCount: '610+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80',
        badge: 'أكريليك عالي الكثافة 🖌️',
        desc: 'ألوان سريعة الجفاف ومقاومة للماء بعد الجفاف، مناسبة للرسم على الكانفس والخشب والورق.'
      },

      // 10. هندسة وحاسبات (cat_geometry)
      {
        id: 501,
        categoryKey: 'cat_geometry',
        name: 'حاسبة علمية متطورة 417 دالة برمجية معتمدة للاختبارات الرسمية',
        categoryName: 'هندسة وحاسبات',
        price: 58.00,
        origPrice: 90.00,
        discount: '-35%',
        palette: 'stealth',
        paletteName: 'الأسود الهندسي',
        complements: [502, 503],
        soldCount: '2.1k+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=700&q=80',
        badge: 'للمهندسين 📐',
        desc: 'شاشة عرض طبيعية ثنائية السطر، معتمدة لاختبارات الثانوية والجامعة والقدرات والتحصيلي.'
      },
      {
        id: 502,
        categoryKey: 'cat_geometry',
        name: 'طقم مساطر وفرجار ألمنيوم ليزري لطلبة الهندسة المعمارية',
        categoryName: 'هندسة وحاسبات',
        price: 28.00,
        origPrice: 45.00,
        discount: '-38%',
        palette: 'stealth',
        paletteName: 'الأسود الهندسي',
        complements: [501],
        soldCount: '940+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
        badge: 'دقة هندسية 📏',
        desc: 'مصنوع من الألمنيوم الصلب المقاوم للكسر، تدريج ليزري عالي الدقة لا يمحى مع الاستخدام.'
      },
      {
        id: 503,
        categoryKey: 'cat_geometry',
        name: 'مسطرة حرف T احترافية 80cm مع حقيبة حمل لطلبة العمارة والتصميم',
        categoryName: 'هندسة وحاسبات',
        price: 45.00,
        origPrice: 70.00,
        discount: '-35%',
        palette: 'stealth',
        paletteName: 'الأسود الهندسي',
        complements: [501, 502],
        soldCount: '430+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80',
        badge: 'رسم معماري دقيق 📐',
        desc: 'حواف أكريليك شفافة تمنع تسرب الحبر وتضمن رسم خطوط أفقية مستقيمة بدون أي انحراف.'
      },

      // 11. تغليف وتجليد (cat_binding)
      {
        id: 701,
        categoryKey: 'cat_binding',
        name: 'باكيت تجليد سلك حلزوني معدني مقاسات متعددة (طقم 25 سلك)',
        categoryName: 'تغليف وتجليد',
        price: 22.00,
        origPrice: 35.00,
        discount: '-37%',
        palette: 'stealth',
        paletteName: 'أساسي',
        complements: [101, 702],
        soldCount: '450+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80',
        badge: 'تجليد متين 📑',
        desc: 'أسلاك حلزونية متينة مقاومة للصدأ مخصصة للمذكرات والملفات المدرسية.'
      },
      {
        id: 702,
        categoryKey: 'cat_binding',
        name: 'رول تغليف حراري شفاف غير لامع للمذكرات والكتب (عرض 45 سم)',
        categoryName: 'تغليف وتجليد',
        price: 25.00,
        origPrice: 40.00,
        discount: '-38%',
        palette: 'stealth',
        paletteName: 'أساسي',
        complements: [701, 703],
        soldCount: '860+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80',
        badge: 'حماية الكتب والمذكرات 🛡️',
        desc: 'تغليف مات مانع للبصمات يحافظ على كتبك وأبحاثك نظيفة وجديدة طوال العام.'
      },
      {
        id: 703,
        categoryKey: 'cat_binding',
        name: 'أغطية تجليد مقواة شفافة وملونة مقاس A4 (باكيت 100 غلاف)',
        categoryName: 'تغليف وتجليد',
        price: 29.00,
        origPrice: 45.00,
        discount: '-35%',
        palette: 'stealth',
        paletteName: 'أساسي',
        complements: [701],
        soldCount: '580+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=700&q=80',
        badge: 'أغلفة تقارير فاخرة 📂',
        desc: 'بلاستيك شفاف مرن ومقاوم للخدش لإعطاء تقاريرك الجامعية مظهراً احترافياً.'
      },

      // 12. أختام وهوية بصرية (cat_stamps)
      {
        id: 104,
        categoryKey: 'cat_stamps',
        name: 'طقم أختام شمعية ملكية مع شمع ذهبي وأحمر لإغلاق كروت الدعوة',
        categoryName: 'أختام وهوية بصرية',
        price: 30.00,
        origPrice: 48.00,
        discount: '-38%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [103, 704],
        soldCount: '390+ مبيع',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80',
        badge: 'فخامة التقديم 🕯️',
        desc: 'ختم نحاسي مصقول مع ملعقة إذابة وشمع يضفي لمسة أرستقراطية على كل دعوة.'
      },
      {
        id: 704,
        categoryKey: 'cat_stamps',
        name: 'ختم شخصي أوتوماتيكي سريع باسم الطالب أو التوقيع الرسمي المعتمد',
        categoryName: 'أختام وهوية بصرية',
        price: 35.00,
        origPrice: 55.00,
        discount: '-36%',
        palette: 'stealth',
        paletteName: 'الهوية الرسمية',
        complements: [705],
        soldCount: '1.2k+ طلب',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1619418602850-35ad20aa1700?auto=format&fit=crop&w=700&q=80',
        badge: 'ختم فوري معتمد 🖋️',
        desc: 'حبر مدمج يكفي لـ 5,000 بصمة واضحة بدون الحاجة لحبارة خارجية، تفصيل حسب الطلب.'
      },
      {
        id: 705,
        categoryKey: 'cat_stamps',
        name: 'طباعة بطاقات عمل شخصية فاخرة بزنس كارد (100 كرت مع علبة)',
        categoryName: 'أختام وهوية بصرية',
        price: 45.00,
        origPrice: 70.00,
        discount: '-35%',
        palette: 'gold_luxury',
        paletteName: 'الهوية الرسمية',
        complements: [704, 104],
        soldCount: '870+ طلب',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1623305463957-df17547327cb?auto=format&fit=crop&w=700&q=80',
        badge: 'بزنس كارد احترافي 💼',
        desc: 'ورق مقوى 400g مع طبقة سولوفان مخملية ونقش بارز يعكس هوية عملك الراقية.'
      },

      // 13. حقائب ومقالم (cat_cases)
      {
        id: 203,
        categoryKey: 'cat_cases',
        name: 'مقلمة كورية قماشية متعددة الطبقات تتسع لـ 50 قلماً وملحقاتها',
        categoryName: 'حقائب ومقالم',
        price: 22.00,
        origPrice: 35.00,
        discount: '-37%',
        palette: 'lavender',
        paletteName: 'اللافندر الهادئ',
        complements: [201, 202],
        soldCount: '1.9k+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1574944558125-f8d12f23be89?auto=format&fit=crop&w=700&q=80',
        badge: 'سعة ضخمة 👝',
        desc: 'مقلمة كورية قابلة للتوسعة مع جيوب شبكية وسحابات معدنية ناعمة، تتسع لجميع أدواتك ومسطرتك وحاسبتك.'
      },
      {
        id: 706,
        categoryKey: 'cat_cases',
        name: 'حقيبة لابتوب وملفات جامعية مبطنة مضادة للصدمات 14-15 بوصة',
        categoryName: 'حقائب ومقالم',
        price: 48.00,
        origPrice: 75.00,
        discount: '-36%',
        palette: 'stealth',
        paletteName: 'الأسود الهندسي',
        complements: [203, 707],
        soldCount: '950+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80',
        badge: 'حماية الأجهزة والملفات 💻',
        desc: 'بطانة مخملية سميكة مقاومة للصدمات والماء مع جيوب للشاحن والفأرة وأوراق الاختبار.'
      },
      {
        id: 707,
        categoryKey: 'cat_cases',
        name: 'منظم مكاتب وستاند أقلام وأوراق خشبي فاخر متعدد الرفوف',
        categoryName: 'حقائب ومقالم',
        price: 34.00,
        origPrice: 55.00,
        discount: '-38%',
        palette: 'stealth',
        paletteName: 'ترتيب المكتب',
        complements: [203],
        soldCount: '670+ مبيع',
        rating: 4.8,
        img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
        badge: 'مكتب مرتب وأنيق 🗄️',
        desc: 'رتب مكتب مذاكرتك واجعل أقلامك ودفاترك في متناول يدك دائماً.'
      },

      // 14. ستيكرات وتوزيعات (cat_stickers)
      {
        id: 801,
        categoryKey: 'cat_stickers',
        name: 'باكيت ستيكرات وتوزيعات تخرج مذهبة ومقاومة للماء (طقم 50 ملصق)',
        categoryName: 'ستيكرات وتوزيعات',
        price: 18.00,
        origPrice: 30.00,
        discount: '-40%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [101, 802],
        soldCount: '1.6k+ مبيع',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
        badge: 'توزيعات أنيقة ✨',
        desc: 'ملصقات دائرية مذهبة بعبارات مبروك التخرج لتزيين الهدايا والتوزيعات.'
      },
      {
        id: 802,
        categoryKey: 'cat_stickers',
        name: 'ملصقات فينيل لتسمية الكتب والدفاتر مقاومة للماء والتمزق (طقم 60)',
        categoryName: 'ستيكرات وتوزيعات',
        price: 15.00,
        origPrice: 25.00,
        discount: '-40%',
        palette: 'lavender',
        paletteName: 'ستيكرات الدراسة',
        complements: [801, 803],
        soldCount: '2.4k+ طلب',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80',
        badge: 'تسمية الكتب المدرسية 🏷️',
        desc: 'كتابة واضحة ومقاومة للمسح بالماء، تدوم طوال العام الدراسي على الكتب والدفاتر.'
      },
      {
        id: 803,
        categoryKey: 'cat_stickers',
        name: 'ستيكرات تحفيزية للمذاكرة والتخطيط الدراسي (100 ملصق كرتوني)',
        categoryName: 'ستيكرات وتوزيعات',
        price: 16.00,
        origPrice: 26.00,
        discount: '-38%',
        palette: 'artistic',
        paletteName: 'ستيكرات الدراسة',
        complements: [208, 602],
        soldCount: '1.8k+ مبيع',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80',
        badge: 'حماس المذاكرة 🌟',
        desc: 'ملصقات ملونة ومرحة لتزيين البلانر والدفاتر وأجهزة الآيباد واللابتوب.'
      },

      // 15. تصفية وباقات 150 (cat_bundles)
      {
        id: 901,
        categoryKey: 'cat_bundles',
        name: 'باقة الموسم الدراسي الشاملة (حقيبة + 4 دفاتر + طقم أقلام + مقلمة)',
        categoryName: 'تصفية وباقات 150',
        price: 150.00,
        origPrice: 220.00,
        discount: '-32%',
        palette: 'lavender',
        paletteName: 'الباقة الشاملة',
        complements: [201, 202, 203],
        soldCount: '920+ مبيع',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=700&q=80',
        badge: 'تفتح خصم 25% فوري 🌟',
        desc: 'الباقة الأكثر توفيراً: تفتح الشحن المجاني والتجليد المجاني فوراً عند شرائها.'
      },
      {
        id: 902,
        categoryKey: 'cat_bundles',
        name: 'باقة التخرج الفاخرة المتكاملة (تجليد مذهب + بوستر مناقشة + وشاح تخرج)',
        categoryName: 'تصفية وباقات 150',
        price: 155.00,
        origPrice: 235.00,
        discount: '-34%',
        palette: 'gold_luxury',
        paletteName: 'الملكي المذهب',
        complements: [101, 102, 108],
        soldCount: '480+ حجز',
        rating: 5.0,
        img: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=700&q=80',
        badge: 'باقة التخرج الشاملة 🎓',
        desc: 'كل ما يحتاجه طالب التخرج: التجليد المذهب + بوستر A1 ملون + وشاح التطريز الملكي.'
      },
      {
        id: 903,
        categoryKey: 'cat_bundles',
        name: 'باقة طالب الهندسة والعمارة الشاملة (حاسبة علمية + طقم مساطر + كشكول A3)',
        categoryName: 'تصفية وباقات 150',
        price: 150.00,
        origPrice: 225.00,
        discount: '-33%',
        palette: 'stealth',
        paletteName: 'الأسود الهندسي',
        complements: [501, 502, 503],
        soldCount: '390+ باقة',
        rating: 4.9,
        img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
        badge: 'عدة المهندس المتكاملة 📐',
        desc: 'الحاسبة المعتمدة مع أدوات الرسم الدقيقة لطلبة كليات الهندسة والعمارة والتصميم.'
      }
    ];


// Attach to global window for browser compatibility
window.FALLBACK_IMG = typeof FALLBACK_IMG !== 'undefined' ? FALLBACK_IMG : null;
window.TABS = typeof TABS !== 'undefined' ? TABS : [];
window.HERO_SLIDES = typeof HERO_SLIDES !== 'undefined' ? HERO_SLIDES : [];
window.MAKTABAH_15_CATEGORIES = typeof MAKTABAH_15_CATEGORIES !== 'undefined' ? MAKTABAH_15_CATEGORIES : [];
window.PRODUCTS = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
