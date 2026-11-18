// =========================================================================
// MAKTABAH - Services View Component (js/ServicesView.js)
// =========================================================================

    // إعدادات الخدمات: الألوان، الأنماط، معرض النماذج المصغر، وأزرار تحديد الاحتياج
    var SERVICE_THEMES = {
      // 1. الطباعة الإعلانية والاستكرات (المكائن الكبيرة)
      dept_print: {
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        borderBottom: 'border-b-sky-400',
        borderSelected: 'border-sky-700 border-b-sky-900',
        text: 'text-sky-700',
        badgeText: 'طباعة كبرى ودعاية واستكرات إلكترونية',
        miniFeatures: [
          { icon: '📐', text: 'مقاسات كبرى مخصصة' },
          { icon: '🎨', text: 'ألوان حيوية لا تبهت' },
          { icon: '⚡', text: 'قص بلوتر ليزري دقيق' },
          { icon: '🚚', text: 'تسليم سريع واستلام فوري' }
        ],
        chips: [
          'بنرات إعلانية وتجارية ومدرسية',
          'رول أب ستاند (85×200 سم)',
          'استكرات مقصوصة إلكترونياً (Plotter)',
          'استكرات جدارية للمدارس والروضات',
          'لوحات فلين وفوركس للمحلات',
          'مطبوعات وقواعد باركود QR Code'
        ],
        cards: [
          {
            title: 'بنرات إعلانية وتجارية كبرى',
            img: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80',
            badge: 'مقاسات مخصصة'
          },
          {
            title: 'رول أب ستاند 85×200 سم',
            img: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80',
            badge: 'شاسيه ألومنيوم'
          },
          {
            title: 'استكرات منتجات وقص بلوتر',
            img: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80',
            badge: 'مقاوم للماء'
          },
          {
            title: 'لوحات فلين وفوركس جدارية',
            img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
            badge: 'تشطيب احترافي'
          }
        ]
      },

      // 2. الوسائل التعليمية ولوحات المدارس
      dept_school: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        borderBottom: 'border-b-amber-400',
        borderSelected: 'border-amber-700 border-b-amber-900',
        text: 'text-amber-800',
        badgeText: 'لوحات فصول ووسائل تعليمية ومجسمات',
        miniFeatures: [
          { icon: '🏫', text: 'تركيب مدرسي في الموقع' },
          { icon: '📐', text: 'مجسمات 3D تفاعلية' },
          { icon: '📄', text: 'مطويات مقصوصة مخصصة' },
          { icon: '📁', text: 'ملفات إنجاز وتجليد سلك' }
        ],
        chips: [
          'لوحات الفصول (قوانين صفية وتعزيز)',
          'لوحات المواد (لغتي، علوم، ورياضيات)',
          'مجسمات أكشاك ومتاجر (3D Booths)',
          'مجسمات علمية وفلين مقصوص',
          'مطويات مدرسية مقصوصة ومخصصة',
          'ملفات إنجاز المعلمين والطلاب (سلك)'
        ],
        cards: [
          {
            title: 'لوحات الفصول والقوانين الصفية',
            img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80',
            badge: 'تصميم مدرسي معتمد'
          },
          {
            title: 'مجسمات أكشاك ومتاجر 3D',
            img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80',
            badge: 'مجسمات ثلاثية الأبعاد'
          },
          {
            title: 'مجسمات علمية وفلين مقصوص',
            img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80',
            badge: 'مشاريع الطلاب'
          },
          {
            title: 'ملفات إنجاز المعلمين والمعلمات',
            img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80',
            badge: 'تجليد سلك أنيق'
          }
        ]
      },

      // 3. الخطاط والرسام والجداريات الميدانية
      dept_art: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        borderBottom: 'border-b-indigo-400',
        borderSelected: 'border-indigo-700 border-b-indigo-900',
        text: 'text-indigo-700',
        badgeText: 'جداريات مدارس وخط عربي وألعاب أرضية',
        miniFeatures: [
          { icon: '🖌️', text: 'رسم جداريات ميداني' },
          { icon: '🏃', text: 'ألعاب حركية أرضية' },
          { icon: '✒️', text: 'خط عربي أصيل محترف' },
          { icon: '🛡️', text: 'ألوان مقاومة للشمس' }
        ],
        chips: [
          'رسم جداريات المدارس والأسوار',
          'تخطيط الألعاب الحركية الأرضية',
          'لوحات الخط العربي والديواني',
          'لوحات إرشادية وتوعوية ميدانية',
          'تزيين وتجميل ساحات الروضات'
        ],
        cards: [
          {
            title: 'جداريات فنية على أسوار المدارس',
            img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80',
            badge: 'تنفيذ ميداني'
          },
          {
            title: 'ألعاب حركية ومسارات أرضية',
            img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80',
            badge: 'ألوان مقاومة للاحتكاك'
          },
          {
            title: 'لوحات الخط العربي الأصيل',
            img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80',
            badge: 'خط يدوي متقن'
          },
          {
            title: 'لوحات إرشادية للمسارات والمرافق',
            img: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80',
            badge: 'توعوية وتنظيمية'
          }
        ]
      },

      // 4. التوزيعات والثيمات والأكواب
      dept_themes: {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        borderBottom: 'border-b-rose-400',
        borderSelected: 'border-rose-700 border-b-rose-900',
        text: 'text-rose-700',
        badgeText: 'أكمام أكواب وتوزيعات وثيمات مناسبات',
        miniFeatures: [
          { icon: '☕', text: 'أكمام وأكواب ورقية' },
          { icon: '💧', text: 'استكرات مياه مقاومة' },
          { icon: '🎉', text: 'توزيعات مواليد وزواج' },
          { icon: '🖊️', text: 'أقلام مطبوعة بالاسم' }
        ],
        chips: [
          'أكواب ورقية وأكمام أكواب (Sleeves)',
          'تغليف وتاقات علب مياه المناسبات',
          'ثيمات وتوزيعات المواليد والزواج',
          'توزيعات تفعيل الحروف واليوم الوطني',
          'أقلام مطبوعة بالاسم أو الشعار',
          'ثيم الوردة وجواز السفر وتاقات الهدايا'
        ],
        cards: [
          {
            title: 'أكمام وأكواب ورقية مخصصة',
            img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80',
            badge: 'طباعة أنيقة'
          },
          {
            title: 'تاقات واستكرات علب المياه',
            img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
            badge: 'مقاومة للرطوبة'
          },
          {
            title: 'ثيمات توزيعات مواليد وزواج',
            img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80',
            badge: 'تصاميم حصرية'
          },
          {
            title: 'توزيعات تفعيل الحروف والمدارس',
            img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80',
            badge: 'تفاعلية ومحببة'
          }
        ]
      },

      // 5. حفلات التخرج والأعياد والهدايا
      dept_grad: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        borderBottom: 'border-b-emerald-400',
        borderSelected: 'border-emerald-700 border-b-emerald-900',
        text: 'text-emerald-700',
        badgeText: 'بنرات تصوير تخرج ودروع وكتب العيد',
        miniFeatures: [
          { icon: '📸', text: 'بنرات Senior للتصوير' },
          { icon: '✂️', text: 'فلين مقصوص بالصورة' },
          { icon: '🏆', text: 'دروع أكريليك وخشب' },
          { icon: '🎁', text: 'مجسمات وكتب العيد' }
        ],
        chips: [
          'بنرات تخرج كبيرة للتصوير (Senior)',
          'فلين تخرج مقصوص بالصورة والاسم',
          'دروع تكريمية أكريليك وخشب محفورة',
          'قبعات وأوشحة تخرج وبوكسات هدايا',
          'مجسمات وكتب تهنئة العيد الفخمة',
          'براويز ذكريات مجسمة للمناسبات'
        ],
        cards: [
          {
            title: 'بنرات التخرج الكبيرة للتصوير',
            img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80',
            badge: 'Senior Banners'
          },
          {
            title: 'فلين تخرج مقصوص بالصورة',
            img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80',
            badge: 'قص ليزري دقيق'
          },
          {
            title: 'دروع تكريمية أكريليك وخشب',
            img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80',
            badge: 'حفر ليزري فاخر'
          },
          {
            title: 'مجسمات وكتب استقبال العيد',
            img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
            badge: 'كتب تهنئة فخمة'
          }
        ]
      },

      // 6. القرطاسية والأدوات المدرسية والفنية
      dept_stationery: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        borderBottom: 'border-b-orange-400',
        borderSelected: 'border-orange-700 border-b-orange-900',
        text: 'text-orange-700',
        badgeText: 'حقائب وألوان فنية وأقلام وتصوير مذكرات',
        miniFeatures: [
          { icon: '🎒', text: 'حقائب مدرسية متينة' },
          { icon: '🎨', text: 'ألوان كانفس وأكريليك' },
          { icon: '🖊️', text: 'أقلام ماركات SMOOZ' },
          { icon: '📄', text: 'تصوير ليزري سريع' }
        ],
        chips: [
          'حقائب مدرسية متينة لجميع المراحل',
          'دفاتر وكراسات وملازم مدرسية',
          'ألوان فنية (أكريليك وبوستر وكانفس)',
          'أقلام متنوعة وماركات (SMOOZ)',
          'أدوات ومستلزمات مكتبية وتنظيمية',
          'تصوير وطباعة مذكرات وسجلات وبحوث'
        ],
        cards: [
          {
            title: 'تشكيلة الحقائب المدرسية المتينة',
            img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80',
            badge: 'ماركات مختارة'
          },
          {
            title: 'أدوات وألوان الرسم والفنون',
            img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80',
            badge: 'كانفس وأكريليك'
          },
          {
            title: 'أقلام فاخرة ومدرسية متنوعة',
            img: 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80',
            badge: 'براندات SMOOZ'
          },
          {
            title: 'تصوير وطباعة المذكرات والسجلات',
            img: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80',
            badge: 'طباعة ليزرية سريعة'
          }
        ]
      }
    };

    // مشاريع وأعمال سابقة حقيقية لكل قسم
    var SERVICE_PROJECTS = {
      dept_print: [
        {
          title: 'طباعة بنرات ورول أب ستاند لمعارض ومطاعم كبرى',
          desc: 'طباعة رقمية كبرى بألوان بيجمنت حية لا تبهت مع شاسيه ألومنيوم متحرك وقابل للطي.',
          img: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=600&q=80',
          tag: 'بنرات ورول أب'
        },
        {
          title: 'استكرات منتجات تجارية مع قص ليزري بلوتر دقيق',
          desc: 'طباعة فينيل لاصق مقاوم للماء والحرارة مع تشطيب مطفي أو لامع حسب الطلب.',
          img: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=600&q=80',
          tag: 'استكرات وقص ليزر'
        },
        {
          title: 'لوحات فلين وفوركس إرشادية للمحلات والمساجد والمدارس',
          desc: 'لوحات تشجيعية وإرشادية مع قواعد تثبيت خفية وتشطيب حواف احترافي.',
          img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
          tag: 'لوحات فوركس'
        }
      ],
      dept_school: [
        {
          title: 'تجهيز وتركيب لوحات مدرسية متكاملة لفصول ومعامل تعليمية',
          desc: 'تصميم وطباعة وتركيب لوحات القوانين الصفية والتعزيز والحروف للمدارس بالموقع.',
          img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80',
          tag: 'لوحات مدرسية'
        },
        {
          title: 'تصميم مجسم متجر وكشك ثلاثي الأبعاد (3D Booth) للأنشطة',
          desc: 'مجسمات تفاعلية للمدارس ورياض الأطفال تشمل المتاجر وصناديق المفاجآت.',
          img: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
          tag: 'مجسمات 3D'
        },
        {
          title: 'إعداد ملفات إنجاز ومطويات تعليمية مقصوصة بإتقان',
          desc: 'تجليد سلك متين وتنسيق مطويات دراسية مخرجة بأشكال فنية مخصصة للطلاب والمعلمات.',
          img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
          tag: 'ملفات إنجاز ومطويات'
        }
      ],
      dept_art: [
        {
          title: 'رسم جدارية تعليمية ووطنية كبرى على سور مجمع مدرسي',
          desc: 'تنفيذ ميداني بألوان زيتية وأكريليك مقاومة للشمس والعوامل الجوية بأيدي رسامين محترفين.',
          img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
          tag: 'جداريات مدارس'
        },
        {
          title: 'تخطيط ورسم ألعاب حركية ومسارات رياضية بساحات الروضات',
          desc: 'ألعاب قفز ومسارات أرقام وأشكال هندسية أرضية بألوان مبهجة ومقاومة للاحتكاك.',
          img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&q=80',
          tag: 'ألعاب حركية أرضية'
        },
        {
          title: 'لوحات خط عربي جدارية فاخرة لمداخل ومكاتب رسمية',
          desc: 'كتابة يدوية بخط الثلث والديواني مع براويز راقية وتذهيب فاخر.',
          img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
          tag: 'خط عربي أصيل'
        }
      ],
      dept_themes: [
        {
          title: 'تجهيز أكمام أكواب مخصصة واستكرات مياه لفعاليات واحتفالات',
          desc: 'طباعة سليفز أكواب قهوة واستكرات قوارير مياه مقاومة للرطوبة بتصاميم حصرية.',
          img: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80',
          tag: 'أكمام أكواب ومياه'
        },
        {
          title: 'باقات توزيعات مدرسية مبتكرة لتفعيل الحروف الهجائية',
          desc: 'توزيعات مجسمة لحرف النون والخاء وغيرها متضمنة هدايا وبطاقات تعليمية محببة.',
          img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
          tag: 'توزيعات تفعيل الحروف'
        },
        {
          title: 'طباعة أقلام مخصصة وتاقات هدايا مقصوصة لليوم الوطني والمناسبات',
          desc: 'حفر ليزري على الأقلام وتاقات كرتونية مقصوصة (Die-Cut) بشكل الوردة وجواز السفر.',
          img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
          tag: 'أقلام وتاقات هدايا'
        }
      ],
      dept_grad: [
        {
          title: 'تجهيز بنرات تخرج جدارية كبرى (Senior Banners) للتصوير والاستقبال',
          desc: 'طباعة كبرى بألوان فائقة الوضوح مع تصميم فوتوغرافي راقٍ مخصص للخريج أو الدفعة.',
          img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
          tag: 'بنرات Senior للتصوير'
        },
        {
          title: 'مجسمات فلين تخرج مقصوصة ليزرياً بالصورة والاسم',
          desc: 'قص ليزري دقيق على فلين عالي الكثافة مع قاعدة خشبية وثبات فائق للاحتفال.',
          img: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
          tag: 'فلين تخرج مقصوص'
        },
        {
          title: 'دروع تكريمية أكريليك وخشب وكتب تهنئة العيد الفخمة',
          desc: 'حفر ليزر فاخر للشعارات والأسماء مع استاندات وكتب تهنئة كبيرة فاخرة للعيد.',
          img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
          tag: 'دروع وهدايا العيد'
        }
      ],
      dept_stationery: [
        {
          title: 'تجهيز حقائب وسلات مدرسية متكاملة لجميع المراحل الدراسية',
          desc: 'شنط مدرسية متينة مع دفاتر، مقالم، ألوان، ومستلزمات دراسية كاملة.',
          img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=80',
          tag: 'حقائب وقرطاسية'
        },
        {
          title: 'أطقم أدوات فنية ورسم متكاملة لمعارض المدارس والجامعات',
          desc: 'تشكيلة كانفس، ألوان أكريليك، بوستر، مائية، وفراشي رسم للمبدعين والفنانين.',
          img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
          tag: 'أدوات رسم وفنون'
        },
        {
          title: 'طباعة وتصوير حزم مذكرات وسجلات دراسية ليزرية سريعة',
          desc: 'تصوير ملون وأبيض وأسود بدقة ليزرية فائقة وسرعة تسليم للملازم والبحوث.',
          img: 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=600&q=80',
          tag: 'طباعة مذكرات وبحوث'
        }
      ]
    };

    // =========================================================================
    // مكون بطاقة المنتج (ProductCard Molecule)

const FALLBACK_IMG = window.FALLBACK_IMG || '';
const extractTikTokVideoId = window.extractTikTokVideoId;

function ServicesView(props) {
  const {
    activeServices = [],
    selectedService,
    setSelectedService,
    popoverServiceId,
    setPopoverServiceId,
    selectedServiceChip = {},
    setSelectedServiceChip,
    modalPreviewCard,
    setModalPreviewCard,
    activeProducts = [],
    handleSelectCategory,
    onSelectCategory = handleSelectCategory,
    showToast
  } = props;

  return (
                  <div className="pb-28 animate-fade-in bg-white min-h-screen">

                    {/* ========================================================================= */}
                    {/* أ) إذا تم اختيار خدمة معينة: عرض "صفحة تفاصيل القسم المخصصة" (Category Detail) */}
                    {/* ========================================================================= */}
                    {selectedService ? (() => {
                      const theme = SERVICE_THEMES[selectedService.id] || {
                        chips: ['طلب مخصص', 'استفسار عام'],
                        cards: [],
                        badgeText: 'خدمة معتمدة واحترافية',
                        miniFeatures: [
                          { icon: '⚡', text: 'سرعة في الإنجاز' },
                          { icon: '⭐', text: 'جودة واحترافية' },
                          { icon: '🛡️', text: 'ضمان كامل' },
                          { icon: '💬', text: 'دعم ومتابعة' }
                        ]
                      };
                      const activeChip = selectedServiceChip[selectedService.id] || theme.chips[0];
                      const cards = theme.cards || [];

                      return (
                        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-2 animate-fade-in pb-32">

                          {/* 1) شريط علوي (Header) نظيف مع زر رجوع وإلغاء أيقونة السلة */}
                          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md flex items-center justify-between pb-3.5 pt-2 border-b border-zinc-200 mb-6">
                            <button
                              onClick={() => {
                                setSelectedService(null);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
                            >
                              <span className="text-sm">→</span>
                              <span>رجوع</span>
                            </button>

                            <div className="text-center px-2 flex-1">
                              <h2 className="text-sm sm:text-base font-black text-black leading-snug">
                                {selectedService.name}
                              </h2>
                            </div>

                            {/* مساحة موازية فارغة لموازنة زر الرجوع وجعل العنوان في المنتصف تماماً */}
                            <div className="w-16 shrink-0"></div>
                          </div>

                          {/* 2) شارة تعريفية ديناميكية مرتبطة بالقسم */}
                          <div className="text-right mb-6">
                            <div className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full mb-2.5 shadow-2xs">
                              <span>{selectedService.icon}</span>
                              <span>{theme.badgeText}</span>
                            </div>
                            <h1 className="text-lg sm:text-2xl font-black text-black tracking-tight leading-snug">
                              {selectedService.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed max-w-2xl">
                              {selectedService.shortDesc}
                            </p>
                          </div>

                          {/* 3) معرض نماذج بصرية حية داخل إطار شاشة جوال (Visual Showcase Carousel) */}
                          <div className="mb-7">
                            <div className="flex items-center justify-between mb-3 px-1">
                              <div>
                                <h3 className="text-sm sm:text-base font-black text-black flex items-center gap-2">
                                  <span>📱</span>
                                  <span>معرض النماذج الحية للأعمال</span>
                                </h3>
                                <p className="text-[11px] text-zinc-500 mt-0.5">
                                  اسحب أفقياً لتصفح نماذج حقيقية نفذت في هذا القسم واضغط معاينة
                                </p>
                              </div>
                              <span className="text-[11px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full">
                                {cards.length} نماذج
                              </span>
                            </div>

                            <div className="overflow-x-auto snap-x snap-mandatory flex gap-4 pb-3 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                              {cards.map((card, idx) => (
                                <div
                                  key={idx}
                                  className="w-[200px] sm:w-[230px] shrink-0 snap-center bg-zinc-950 p-2.5 rounded-[2.2rem] border-4 border-zinc-800 shadow-lg flex flex-col items-center"
                                >
                                  {/* Dynamic Island / Notch */}
                                  <div className="w-14 h-3 bg-black rounded-full mb-2 flex items-center justify-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                                    <div className="w-1 h-1 rounded-full bg-sky-900/60"></div>
                                  </div>

                                  {/* Mobile Screen Mockup */}
                                  <div
                                    onClick={() => setModalPreviewCard(card)}
                                    className="w-full aspect-[9/16] rounded-[1.6rem] overflow-hidden bg-zinc-900 relative group cursor-pointer"
                                  >
                                    <img
                                      src={card.img}
                                      alt={card.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                                    />
                                    <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                                      {card.badge}
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-2.5 pt-6 text-right">
                                      <h5 className="text-white text-[11px] font-bold leading-tight">
                                        {card.title}
                                      </h5>
                                    </div>
                                  </div>

                                  {/* Preview Model Button */}
                                  <button
                                    onClick={() => setModalPreviewCard(card)}
                                    className="mt-2.5 w-full py-1.5 px-2 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-900 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                  >
                                    <span>👁️</span>
                                    <span>معاينة النموذج</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 4) تلخيص المميزات في شبكة أيقونات مصغرة (2x2 Icon Grid) */}
                          <div className="mb-7">
                            <h4 className="text-xs sm:text-sm font-black text-zinc-900 mb-3 px-1 flex items-center gap-1.5">
                              <span>⚡</span>
                              <span>أبرز مواصفات ومميزات التنفيذ:</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-2.5">
                              {(theme.miniFeatures || [
                                { icon: '⚡', text: 'سرعة في الإنجاز' },
                                { icon: '⭐', text: 'جودة واحترافية' },
                                { icon: '🛡️', text: 'ضمان كامل' },
                                { icon: '💬', text: 'دعم ومتابعة' }
                              ]).map((feat, idx) => (
                                <div
                                  key={idx}
                                  className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs hover:bg-zinc-100/70 transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-sm shrink-0 shadow-2xs">
                                    {feat.icon}
                                  </div>
                                  <span className="text-xs font-bold text-zinc-800 leading-snug">
                                    {feat.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 5) تحديد نوع الاحتياج بلمسة واحدة (Selectable Chips) */}
                          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 mb-8 shadow-2xs">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-black text-zinc-900">
                                اختر نوع طلبك للاستفسار المباشر:
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                                محدد: {activeChip} ✓
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {theme.chips.map((chip, idx) => {
                                const isSelected = activeChip === chip;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedServiceChip(prev => ({ ...prev, [selectedService.id]: chip }))}
                                    className={`text-xs font-bold py-2 px-3.5 rounded-xl transition-all cursor-pointer border ${isSelected
                                      ? 'bg-black text-white border-black shadow-xs scale-102 ring-2 ring-black/10'
                                      : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300'
                                      }`}
                                  >
                                    {isSelected && <span className="ml-1 text-[#fa2c19]">●</span>}
                                    {chip}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 6) شريط سفلي نظيف وثابت (Sticky Bottom Footer) */}
                          <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                            <div className="max-w-md sm:max-w-xl md:max-w-3xl mx-auto flex items-center justify-between gap-3">
                              <div className="text-right min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-zinc-400 block">
                                  طلبك المحدد:
                                </span>
                                <span className="text-xs sm:text-sm font-black text-black block leading-tight">
                                  {activeChip}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  const msg = `مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وتحديد تفاصيل طلبي:\n• القسم: ${selectedService.name}\n• نوع الطلب المحدد: ${activeChip}\n\nأرجو تزويدي بالنماذج المتاحة والتفاصيل للمتابعة معكم.`;
                                  window.open(`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm py-3 px-5 sm:px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0"
                              >
                                <span className="text-base sm:text-lg">💬</span>
                                <span>استفسر عن طلبك الآن</span>
                                <span className="text-sm font-bold">←</span>
                              </button>
                            </div>
                          </div>

                          {/* 7) نافذة المعاينة المكبرة للنموذج (Modal Preview Lightbox) */}
                          {modalPreviewCard && (
                            <div
                              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                              onClick={() => setModalPreviewCard(null)}
                            >
                              <div
                                className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative animate-scale-up"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="relative aspect-[9/16] max-h-[60vh] w-full bg-zinc-900 overflow-hidden">
                                  <img
                                    src={modalPreviewCard.img}
                                    alt={modalPreviewCard.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                                  />
                                  <button
                                    onClick={() => setModalPreviewCard(null)}
                                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                  <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full">
                                    {modalPreviewCard.badge}
                                  </span>
                                </div>
                                <div className="p-4 text-right">
                                  <h4 className="text-sm font-black text-black mb-1">
                                    {modalPreviewCard.title}
                                  </h4>
                                  <p className="text-xs text-zinc-500 mb-3.5 leading-relaxed">
                                    نموذج واقعي منفذ بدقة واحترافية. يمكنك اعتماده كنمط مفضل لطلبك.
                                  </p>
                                  <button
                                    onClick={() => {
                                      const chosen = modalPreviewCard.title;
                                      setSelectedServiceChip(prev => ({ ...prev, [selectedService.id]: chosen }));
                                      setModalPreviewCard(null);
                                    }}
                                    className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
                                  >
                                    اعتماد هذا النموذج لطلبي ✓
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })() : (

                      /* ========================================================================= */
                      /* ========================================================================= */
                      /* ب) العرض التفاعلي الذكي بنمط دولينجو (Duolingo-style Popover Hub)           */
                      /* ========================================================================= */
                      <div
                        onClick={() => setPopoverServiceId(null)}
                        className="max-w-2xl mx-auto px-4 py-4 animate-fade-in select-none"
                      >

                        {/* رأس القسم البسيط */}
                        <div className="text-center pt-2 pb-5">
                          <div className="inline-flex items-center gap-1.5 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full mb-2 shadow-2xs">
                            <span className="text-[#fa2c19]">⚡</span> خدمات مكتبة أنوار الواحة
                          </div>
                          <h2 className="text-base md:text-xl font-black text-black tracking-tight">
                            اضغط على الخدمة لمعاينة تفاصيلها
                          </h2>
                        </div>

                        {(() => {
                          const activeService = activeServices.find(s => s.id === popoverServiceId);

                          // دالة تحديد الألوان والهوية البصرية الحيوية لكل خدمة (تطابق التصميم الأصلي الملون 100%)
                          const getServiceVisualTheme = (service) => {
                            const iconKey = service.icon_name || service.id || '';
                            const hex = (service.accent_color || '').toLowerCase();
                            const title = service.title || service.name || service.keyword || '';

                            // 1. الطباعة الإعلانية والاستكرات (أزرق سماوي حيوي)
                            if (iconKey === 'printer' || iconKey === 'dept_print' || hex === '#0284c7' || title.includes('الطباعة') || title.includes('استكرات')) {
                              return {
                                bgHex: '#f0f9ff',
                                borderHex: '#38bdf8',
                                iconColor: '#0284c7',
                                bgClass: 'bg-sky-50',
                                borderClass: 'border-sky-400',
                                textClass: 'text-sky-600',
                                accent: '#0284c7'
                              };
                            }

                            // 2. الوسائل التعليمية ولوحات المدارس (عنبري / ذهبي دافئ)
                            if (iconKey === 'book' || iconKey === 'dept_school' || hex === '#d97706' || title.includes('الوسائل') || title.includes('المدارس')) {
                              return {
                                bgHex: '#fffbeb',
                                borderHex: '#fbbf24',
                                iconColor: '#d97706',
                                bgClass: 'bg-amber-50',
                                borderClass: 'border-amber-400',
                                textClass: 'text-amber-600',
                                accent: '#d97706'
                              };
                            }

                            // 3. الخطاط والرسام والجداريات الميدانية (نيلي / بنفسجي هادئ)
                            if (iconKey === 'palette' || iconKey === 'dept_art' || hex === '#4f46e5' || title.includes('الخطاط') || title.includes('الجداريات') || title.includes('الرسام')) {
                              return {
                                bgHex: '#eef2ff',
                                borderHex: '#818cf8',
                                iconColor: '#4f46e5',
                                bgClass: 'bg-indigo-50',
                                borderClass: 'border-indigo-400',
                                textClass: 'text-indigo-600',
                                accent: '#4f46e5'
                              };
                            }

                            // 4. التوزيعات والثيمات والأكواب (وردي / ياقوتي جذاب)
                            if (iconKey === 'coffee' || iconKey === 'dept_themes' || hex === '#e11d48' || title.includes('التوزيعات') || title.includes('الأكواب') || title.includes('الثيمات')) {
                              return {
                                bgHex: '#fff1f2',
                                borderHex: '#fb7185',
                                iconColor: '#e11d48',
                                bgClass: 'bg-rose-50',
                                borderClass: 'border-rose-400',
                                textClass: 'text-rose-600',
                                accent: '#e11d48'
                              };
                            }

                            // 5. حفلات التخرج والأعياد والهدايا (زمردي / أخضر راقي)
                            if (iconKey === 'graduation' || iconKey === 'dept_grad' || hex === '#059669' || title.includes('التخرج') || title.includes('الهدايا') || title.includes('الأعياد')) {
                              return {
                                bgHex: '#ecfdf5',
                                borderHex: '#34d399',
                                iconColor: '#059669',
                                bgClass: 'bg-emerald-50',
                                borderClass: 'border-emerald-400',
                                textClass: 'text-emerald-600',
                                accent: '#059669'
                              };
                            }

                            // 6. القرطاسية والأدوات المدرسية والفنية أو طباعة وتجليد (برتقالي مشرق)
                            if (iconKey === 'backpack' || iconKey === 'dept_stationery' || iconKey === 'file-text' || hex === '#ea580c' || title.includes('القرطاسية') || title.includes('تجليد') || title.includes('البحوث') || title.includes('المذكرات')) {
                              return {
                                bgHex: '#fff7ed',
                                borderHex: '#fb923c',
                                iconColor: '#ea580c',
                                bgClass: 'bg-orange-50',
                                borderClass: 'border-orange-400',
                                textClass: 'text-orange-600',
                                accent: '#ea580c'
                              };
                            }

                            // ألوان مسبقة إضافية للخدمات المضافة من لوحة التحكم
                            if (hex === '#7c3aed') {
                              return {
                                bgHex: '#f5f3ff',
                                borderHex: '#a78bfa',
                                iconColor: '#7c3aed',
                                bgClass: 'bg-purple-50',
                                borderClass: 'border-purple-400',
                                textClass: 'text-purple-600',
                                accent: '#7c3aed'
                              };
                            }
                            if (hex === '#0891b2') {
                              return {
                                bgHex: '#ecfeff',
                                borderHex: '#22d3ee',
                                iconColor: '#0891b2',
                                bgClass: 'bg-cyan-50',
                                borderClass: 'border-cyan-400',
                                textClass: 'text-cyan-600',
                                accent: '#0891b2'
                              };
                            }
                            if (hex === '#c40d00') {
                              return {
                                bgHex: '#fef2f2',
                                borderHex: '#f87171',
                                iconColor: '#c40d00',
                                bgClass: 'bg-red-50',
                                borderClass: 'border-red-400',
                                textClass: 'text-red-600',
                                accent: '#c40d00'
                              };
                            }

                            // لون مخصص تم اختياره يدوياً في لوحة التحكم
                            const customHex = service.accent_color || '#0284c7';
                            return {
                              bgHex: (customHex + '15'),
                              borderHex: customHex,
                              iconColor: customHex,
                              bgClass: '',
                              borderClass: '',
                              textClass: '',
                              accent: customHex
                            };
                          };

                          // دالة رسم الأيقونات المتجهة الأنيقة مع ضمان اللون الحيوي المطابق
                          const renderServiceSvgIcon = (service, colorClass, customStyle = null) => {
                            const iconCls = 'w-7 h-7 sm:w-8 sm:h-8 ' + (colorClass || '') + ' transition-transform duration-200 group-hover:scale-110';
                            const iconKey = service.icon_name || service.id;
                            const mergedStyle = customStyle || {};
                            switch (iconKey) {
                              case 'printer':
                              case 'dept_print':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="6 9 6 2 18 2 18 9" />
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                    <rect x="6" y="14" width="12" height="8" />
                                  </svg>
                                );
                              case 'book':
                              case 'dept_school':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                    <line x1="9" y1="7" x2="15" y2="7" />
                                    <line x1="9" y1="11" x2="15" y2="11" />
                                  </svg>
                                );
                              case 'palette':
                              case 'dept_art':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="13.5" cy="6.5" r="1" fill="currentColor" />
                                    <circle cx="17.5" cy="10.5" r="1" fill="currentColor" />
                                    <circle cx="8.5" cy="7.5" r="1" fill="currentColor" />
                                    <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                                  </svg>
                                );
                              case 'coffee':
                              case 'dept_themes':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                                    <line x1="6" y1="1" x2="6" y2="4" />
                                    <line x1="10" y1="1" x2="10" y2="4" />
                                    <line x1="14" y1="1" x2="14" y2="4" />
                                  </svg>
                                );
                              case 'graduation':
                              case 'dept_grad':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                  </svg>
                                );
                              case 'backpack':
                              case 'dept_stationery':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z" />
                                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                    <line x1="8" y1="14" x2="16" y2="14" />
                                    <line x1="8" y1="18" x2="16" y2="18" />
                                  </svg>
                                );
                              case 'file-text':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                  </svg>
                                );
                              case 'scissors':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="6" cy="6" r="3" />
                                    <circle cx="6" cy="18" r="3" />
                                    <line x1="20" y1="4" x2="8.12" y2="15.88" />
                                    <line x1="14.47" y1="14.48" x2="20" y2="20" />
                                    <line x1="8.12" y1="8.12" x2="12" y2="12" />
                                  </svg>
                                );
                              case 'camera':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                  </svg>
                                );
                              case 'gift':
                                return (
                                  <svg style={mergedStyle} className={iconCls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 12 20 22 4 22 4 12" />
                                    <rect x="2" y="7" width="20" height="5" />
                                    <line x1="12" y1="22" x2="12" y2="7" />
                                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                                  </svg>
                                );
                              default:
                                return <span style={mergedStyle} className={"text-2xl sm:text-3xl " + (colorClass || "")}>{service.icon || "⚡"}</span>;
                            }
                          };

                          // دالة رسم الزر الدائري البارز الملون (مطابق تماماً لتصميم الصورة السابقة)
                          const renderTactileButton = (service) => {
                            const isSelected = popoverServiceId === service.id;
                            const theme = getServiceVisualTheme(service);
                            const title = service.title || service.keyword || service.name;

                            return (
                              <div
                                key={service.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPopoverServiceId(prev => prev === service.id ? null : service.id);
                                }}
                                className="flex flex-col items-center cursor-pointer group select-none"
                              >
                                {/* الزر الدائري البارز الملون بهوية بصرية حيوية وحد دائري ملون وواضح */}
                                <div
                                  className={"relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full aspect-square flex items-center justify-center transition-all duration-200 border-2 " + (theme.bgClass || "") + " " + (theme.borderClass || "") + " " + (isSelected ? "ring-4 ring-black/15 scale-105 shadow-md" : "group-hover:scale-105 active:scale-95 shadow-2xs hover:shadow-md")}
                                  style={{
                                    backgroundColor: theme.bgHex,
                                    borderColor: isSelected ? theme.iconColor : theme.borderHex
                                  }}
                                >
                                  {/* الأيقونة الملونة بوضوح بلون القسم المبهج */}
                                  {renderServiceSvgIcon(service, theme.textClass, { color: theme.iconColor, stroke: theme.iconColor })}

                                  {/* نقطة التفعيل عند الاختيار */}
                                  {isSelected && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#fa2c19] ring-2 ring-white animate-pulse"></span>
                                  )}
                                </div>

                                {/* اسم الخدمة فقط بخط واضح وبدون سعر أسفل الدائرة */}
                                <div className="mt-2.5 text-center max-w-[95px] sm:max-w-[110px]">
                                  <span className={"text-xs sm:text-[13px] font-bold block leading-snug transition-colors " + (isSelected ? "text-black font-black" : "text-zinc-800 group-hover:text-black")}>
                                    {title}
                                  </span>
                                </div>
                              </div>
                            );
                          };

                          // دالة رسم الفقاعة المنبثقة التفاعلية المخصصة للاستفسار وتحديد الطلب
                          const renderPopoverCard = (service, colIdx = 0) => {
                            const title = service.title || service.name;
                            const description = service.description || service.shortDesc;
                            const mediaType = service.media_type || (service.img ? 'image' : 'none');
                            const mediaUrl = service.media_url || service.img;
                            const tiktokId = mediaType === 'tiktok' ? extractTikTokVideoId(mediaUrl) : '';
                            const whatsappMsg = service.whatsapp_template ||
                              `مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة (${title}).`;

                            return (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="w-full my-4 relative bg-white rounded-3xl border-2 border-zinc-200 p-4 sm:p-5 shadow-lg animate-slide-up transition-all"
                              >
                                {/* السهم العلوي الصغير للفقاعة يشير بدقة لمنتصف الدائرة المختارة */}
                                <div
                                  className={`absolute -top-2.5 w-5 h-5 bg-white border-t-2 border-r-2 border-zinc-200 rotate-[-45deg] z-20 transition-all duration-300 ${colIdx === 0 ? 'right-[16.666%] translate-x-1/2' : colIdx === 1 ? 'right-1/2 translate-x-1/2' : 'right-[83.333%] translate-x-1/2'
                                    }`}
                                />

                                {/* 1) الرأس: اسم الخدمة وزر الإغلاق */}
                                <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className="w-3 h-3 rounded-full shrink-0"
                                      style={{ backgroundColor: service.accent_color || '#0284c7' }}
                                    ></span>
                                    <h3 className="text-sm sm:text-base font-black text-black leading-snug truncate">
                                      {title}
                                    </h3>
                                  </div>
                                  <button
                                    onClick={() => setPopoverServiceId(null)}
                                    className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shrink-0"
                                    title="إغلاق"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* 2) عرض الوسائط حسب اختيار المدير في لوحة التحكم */}
                                {mediaType === 'image' && mediaUrl ? (
                                  <div className="mt-3.5 rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-2xs">
                                    <img
                                      src={mediaUrl}
                                      alt={title}
                                      className="w-full max-h-72 object-cover"
                                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                                    />
                                  </div>
                                ) : mediaType === 'video' && mediaUrl ? (
                                  <div className="mt-3.5 rounded-2xl overflow-hidden border border-zinc-200 bg-black shadow-2xs">
                                    <video
                                      src={mediaUrl}
                                      controls
                                      playsInline
                                      className="w-full max-h-80 mx-auto"
                                    />
                                  </div>
                                ) : mediaType === 'tiktok' && mediaUrl ? (
                                  <div className="mt-3.5 space-y-2">
                                    {tiktokId ? (
                                      <div className="relative w-full aspect-[9/16] max-h-[460px] mx-auto rounded-2xl overflow-hidden border border-zinc-200 bg-black shadow-2xs">
                                        <iframe
                                          src={`https://www.tiktok.com/embed/v2/${tiktokId}`}
                                          className="w-full h-full border-0"
                                          allow="encrypted-media;"
                                        />
                                      </div>
                                    ) : null}
                                    <a
                                      href={mediaUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                    >
                                      <span>مشاهدة على تيك توك 🎵</span>
                                      <span className="text-[10px]">↗</span>
                                    </a>
                                  </div>
                                ) : null}

                                {/* 3) الوصف الكامل للخدمة */}
                                <div className="mt-3">
                                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                                    {description}
                                  </p>
                                </div>

                                {/* 4) أزرار الإجراءات (واتساب مخصص + تصفح نماذج القسم) */}
                                <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-col gap-2">
                                  <a
                                    href={`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(whatsappMsg)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <span className="text-base sm:text-lg">💬</span>
                                    <span>اطلب الخدمة عبر واتساب</span>
                                    <span className="text-xs font-bold">←</span>
                                  </a>

                                  {service.linked_category_id && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectCategory(service.linked_category_id);
                                        setPopoverServiceId(null);
                                      }}
                                      className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.99] text-zinc-900 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-200/80"
                                    >
                                      <span>👁️</span>
                                      <span>تصفح نماذج وأصناف القسم</span>
                                      <span className="text-xs">←</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          };

                          // تقسيم الخدمات تلقائياً إلى صفوف من 3 دوائر لكل صف
                          const rows = [];
                          for (let i = 0; i < activeServices.length; i += 3) {
                            rows.push(activeServices.slice(i, i + 3));
                          }

                          return (
                            <div className="space-y-5">
                              {rows.map((row, rIdx) => {
                                const rowContainsActive = row.some(s => s.id === popoverServiceId);
                                const activeInThisRow = row.find(s => s.id === popoverServiceId);
                                const colInThisRow = activeInThisRow ? row.indexOf(activeInThisRow) : 0;

                                return (
                                  <div key={rIdx}>
                                    <div className="grid grid-cols-3 gap-3 sm:gap-6 justify-items-center">
                                      {row.map(service => renderTactileButton(service))}
                                    </div>
                                    {rowContainsActive && activeInThisRow && renderPopoverCard(activeInThisRow, colInThisRow)}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}

                      </div>
                    )}

                  </div>
  );
}

// Make available globally on window
window.SERVICE_THEMES = SERVICE_THEMES;
window.SERVICE_PROJECTS = SERVICE_PROJECTS;
window.ServicesView = ServicesView;