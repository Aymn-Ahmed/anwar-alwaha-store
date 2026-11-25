import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PenLine,
  Monitor,
  FileText,
  Mail,
  CreditCard,
  GraduationCap,
  X,
  MessageCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export interface ShowcaseOption {
  id: string;
  title: string;
  shortTitle: string;
  badge: string;
  image: string;
  description: string;
  whatsappText: string;
}

export interface ShowcaseService {
  id: string;
  title: string;
  headerTitle: string;
  iconType: 'pen-line' | 'monitor' | 'file-text' | 'mail' | 'credit-card' | 'graduation-cap';
  arcColor: string;
  iconColor: string;
  bgColor: string;
  selectedBgColor: string;
  activeRingColor: string;
  categorySearchQuery: string;
  options: ShowcaseOption[];
}

export const SHOWCASE_SERVICES: ShowcaseService[] = [
  // ROW 1 in RTL: Right is "ابحث عن وظيفة", Center is "تصميم مواقع", Left is "تدقيق و Turnitin"
  {
    id: 'cv-job-search',
    title: 'ابحث عن وظيفة',
    headerTitle: 'خدمات السيرة الذاتية الاحترافية والتقديم على الوظائف',
    iconType: 'file-text',
    arcColor: '#64748B',
    iconColor: '#475569',
    bgColor: '#F8FAFC',
    selectedBgColor: '#F1F5F9',
    activeRingColor: '#1E293B',
    categorySearchQuery: 'سيرة',
    options: [
      {
        id: 'cv-ats',
        title: 'تصميم سيرة ذاتية احترافية متوافقة مع أنظمة ATS',
        shortTitle: 'سيرة ذاتية متوافقة مع ATS',
        badge: 'متوافق مع أنظمة ATS',
        image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
        description: 'صياغة وتنسيق سيرة ذاتية حديثة باللغتين العربية والإنجليزية تجتاز خوارزميات الفرز الآلي (ATS) وتبرز خبراتك وإنجازاتك المهنية بدقة.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: تصميم سيرة ذاتية احترافية متوافقة مع أنظمة ATS',
      },
      {
        id: 'cv-linkedin',
        title: 'تطوير وتحسين ملف لينكد إن (LinkedIn Optimization)',
        shortTitle: 'تطوير ملف لينكد إن',
        badge: 'زيادة فرص الظهور',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        description: 'إعادة هيكلة ملفك الشخصي في لينكد إن، كتابة النبذة المهنية والعناوين، وإضافة الكلمات المفتاحية لجذب مسؤولي التوظيف والشركات الكبرى.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: تطوير وتحسين ملف لينكد إن الاحترافي',
      },
      {
        id: 'cv-cover-letter',
        title: 'كتابة خطاب التقديم والدافع الوظيفي (Cover Letter)',
        shortTitle: 'خطاب التقديم (Cover Letter)',
        badge: 'مخصص لكل وظيفة',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        description: 'صياغة خطاب رسمي مقنع وموجه للجهة المراد التقديم عليها يبرز شغفك وتوافق مهاراتك مع متطلبات الشاغر الوظيفي.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: كتابة خطاب التقديم الرسمي (Cover Letter)',
      },
      {
        id: 'cv-vip-bundle',
        title: 'باقة التقديم الوظيفي الشاملة (سيرة + لينكد إن + خطاب)',
        shortTitle: 'باقة التقديم الشاملة VIP',
        badge: 'الباقة الأكثر طلباً',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
        description: 'حل متكامل يشمل السيرة الذاتية ثنائية اللغة، تجهيز وتطوير حساب لينكد إن، خطاب تقديم مخصص، ونصائح اجتياز المقابلات الشخصية.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: باقة التقديم الوظيفي الشاملة VIP',
      },
    ],
  },
  {
    id: 'web-design',
    title: 'تصميم مواقع',
    headerTitle: 'تصميم وبرمجة المواقع والبورتفوليو الرقمي',
    iconType: 'monitor',
    arcColor: '#0EA5E9',
    iconColor: '#0284C7',
    bgColor: '#F0F9FF',
    selectedBgColor: '#E0F2FE',
    activeRingColor: '#0369A1',
    categorySearchQuery: 'مواقع',
    options: [
      {
        id: 'web-corporate',
        title: 'موقع تعريفي للشركات والمؤسسات',
        shortTitle: 'موقع تعريفي للشركات',
        badge: 'مؤسسي واحترافي',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        description: 'تصميم وبرمجة موقع رسمي جذاب يعكس هوية شركتك، سريع التصفح، متوافق مع كافة مقاسات الهواتف ومعايير محركات البحث SEO.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: موقع تعريفي للشركات والمؤسسات',
      },
      {
        id: 'web-ecommerce',
        title: 'متجر إلكتروني متكامل (سلة / زد / نظام خاص)',
        shortTitle: 'متجر إلكتروني متكامل',
        badge: 'دفع وشحن تلقائي',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        description: 'إنشاء وتجهيز متجرك الإلكتروني بالكامل، ربط بوابات الدفع الإلكتروني (مدى، Apple Pay)، وربط شركات الشحن والتوصيل المعتمدة.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: متجر إلكتروني متكامل',
      },
      {
        id: 'web-landing',
        title: 'صفحة هبوط (Landing Page) تسويقية',
        shortTitle: 'صفحة هبوط (Landing Page)',
        badge: 'رفع المبيعات والتحويل',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        description: 'صفحة هبوط واحدة ذات سرعة فائقة وتصميم جذاب مخصص للحملات الإعلانية ومعدل تحويل عالٍ للعملاء والطلبات.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: صفحة هبوط تسويقية Landing Page',
      },
      {
        id: 'web-portfolio',
        title: 'بورتفوليو شخصي لمعرض الأعمال',
        shortTitle: 'بورتفوليو شخصي لمعرض الأعمال',
        badge: 'للمبدعين والمهنيين',
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
        description: 'معرض أعمال رقمي فاخر للمصممين، المهندسين، والأطباء لعرض إنجازاتهم وسيرتهم المهنية بطريقة عصرية تفتح أبواب التعاقدات.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: بورتفوليو شخصي لمعرض الأعمال',
      },
    ],
  },
  {
    id: 'turnitin-proofreading',
    title: 'تدقيق و Turnitin',
    headerTitle: 'الفحص الأكاديمي والتدقيق اللغوي وتقارير Turnitin',
    iconType: 'pen-line',
    arcColor: '#10B981',
    iconColor: '#059669',
    bgColor: '#ECFDF5',
    selectedBgColor: '#D1FAE5',
    activeRingColor: '#047857',
    categorySearchQuery: 'تدقيق',
    options: [
      {
        id: 'turnitin-check',
        title: 'فحص نسبة الاقتباس عبر Turnitin بدون حفظ في المستودع',
        shortTitle: 'فحص نسبة الاقتباس Turnitin',
        badge: 'تقرير رسمي معتمد',
        image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        description: 'فحص فوري ودقيق لنسبة الاقتباس والسرقة العلمية بحساب رسمي مع تقرير PDF تفصيلي ملون، مع ضمان عدم حفظ الملف نهائياً في المستودع (No Repository).',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود فحص بحثي عبر برنامج Turnitin بدون حفظ في المستودع',
      },
      {
        id: 'proofreading-full',
        title: 'تدقيق لغوي ونحوي أكاديمي كامل للأبحاث والرسائل',
        shortTitle: 'تدقيق لغوي ونحوي أكاديمي',
        badge: 'دكاترة ولغويين معتمدين',
        image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
        description: 'مراجعة وتصحيح لغوي ونحوي وإملائي شامل للأبحاث العلمية ورسائل الماجستير والدكتوراه بأسلوب علمي رصين وخالٍ من الأخطاء.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب خدمة التدقيق اللغوي والنحوي لبحثي',
      },
      {
        id: 'paraphrasing-reduction',
        title: 'إعادة صياغة وتقليل نسبة الاقتباس (Paraphrasing)',
        shortTitle: 'إعادة صياغة وتقليل الاقتباس',
        badge: 'صياغة علمية احترافية',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        description: 'إعادة صياغة الفقرات المقتبسة بأسلوب أكاديمي بديل لخفض نسبة الاقتباس إلى الحد المقبول في الجامعات دون المساس بالمعنى العلمي.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود إعادة صياغة وتقليل نسبة الاقتباس لبحثي',
      },
      {
        id: 'thesis-formatting',
        title: 'تنسيق وترقيم الأبحاث والرسائل حسب دليل الجامعة',
        shortTitle: 'تنسيق وترقيم الرسائل (APA)',
        badge: 'معايير الجامعة الرسمية',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
        description: 'تنسيق الجداول، الرسوم البيانية، الهوامش، الفهارس، وتوثيق المراجع بدقة وفق الدليل الرسمي لجامعتك (معايير APA / Harvard وغيرها).',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب تنسيق رسالتي العلمية وفق دليل الجامعة',
      },
    ],
  },

  // ROW 2 in RTL: Right is "مشاريع تخرج", Center is "بطاقة NFC الذكية", Left is "دعوات أفراح"
  {
    id: 'graduation-projects',
    title: 'مشاريع تخرج',
    headerTitle: 'تجليد وطباعة أبحاث ومشاريع التخرج الفاخرة',
    iconType: 'graduation-cap',
    arcColor: '#F59E0B',
    iconColor: '#D97706',
    bgColor: '#FFFBEB',
    selectedBgColor: '#FEF3C7',
    activeRingColor: '#92400E',
    categorySearchQuery: 'تخرج',
    options: [
      {
        id: 'grad-hardcover-gold',
        title: 'تجليد جلد مقوى مذهب (بكالوريوس)',
        shortTitle: 'تجليد جلد مقوى مذهب (بكالوريوس)',
        badge: 'حفر ذهبي حراري',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
        description: 'تجليد فاخر بغلاف مقوى (Hardcover) مع حفر الاسم والشعار بالذهب الحراري وطباعة ليزر ملونة عالية الدقة.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: تجليد جلد مقوى مذهب لبحث التخرج (بكالوريوس)',
      },
      {
        id: 'grad-master-poster',
        title: 'تجليد ملكي مع بوستر A1 (ماجستير)',
        shortTitle: 'تجليد ملكي مع بوستر A1 (ماجستير)',
        badge: 'مواصفات الماجستير',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
        description: 'تجليد فاخر مطابق لمعايير الجامعات السعودية مع طباعة بوستر مناقشة مقاس A1 لمّاع مع الحامل.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: تجليد ملكي مع بوستر A1 لمناقشة الماجستير',
      },
      {
        id: 'grad-phd-box',
        title: 'تجليد دكتوراه فاخر مع درع تذكاري',
        shortTitle: 'تجليد دكتوراه فاخر مع درع تذكاري',
        badge: 'فاخر ومميز',
        image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
        description: 'طقم كامل لرسائل الدكتوراه: تجليد جلدي مع صندوق إهداء مخمل ودرع تذكاري مذهب بالاسم.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: باقة تجليد الدكتوراه مع الصندوق المخمل والدرع التذكاري',
      },
      {
        id: 'grad-sash-embroidery',
        title: 'روب ووشاح تخرج بتطريز الاسم',
        shortTitle: 'روب ووشاح تخرج بتطريز الاسم',
        badge: 'تطريز يدوي فاخر',
        image: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80',
        description: 'تفصيل روب تخرج ملكي مع وشاح قصب مذهب أو فضي مطرز باسم الخريج وسنة التخرج بأعلى جودة.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: روب ووشاح تخرج مطرز بالاسم',
      },
    ],
  },
  {
    id: 'nfc-smart-card',
    title: 'بطاقة NFC الذكية',
    headerTitle: 'بطاقات الأعمال الذكية وحلول التواصل الرقمي NFC',
    iconType: 'credit-card',
    arcColor: '#8B5CF6',
    iconColor: '#7C3AED',
    bgColor: '#F5F3FF',
    selectedBgColor: '#EDE9FE',
    activeRingColor: '#5B21B6',
    categorySearchQuery: 'nfc',
    options: [
      {
        id: 'nfc-metal-card',
        title: 'بطاقة أعمال ذكية NFC معدنية فاخرة',
        shortTitle: 'بطاقة NFC معدنية فاخرة',
        badge: 'برمجة فورية',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        description: 'بطاقة معدنية سوداء فاخرة بنقش ليزر وشريحة NFC لمشاركة بياناتك وحساباتك بلمسة واحدة على الجوال.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: بطاقة أعمال ذكية NFC معدنية فاخرة',
      },
      {
        id: 'nfc-pvc-custom',
        title: 'بطاقة NFC بلاستيكية بهوية مخصصة',
        shortTitle: 'بطاقة NFC بهوية مخصصة',
        badge: 'تصميم مخصص',
        image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
        description: 'بطاقة PVC مضادة للماء مطبوعة بالكامل بألوان هويتك مع صفحة بروفايل تفاعلية قابلة للتحديث دائماً.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: بطاقة NFC بلاستيكية بهوية خاصة',
      },
      {
        id: 'nfc-table-stand',
        title: 'ستاند طاولة NFC وكاشير لتقييم جوجل والمنيو',
        shortTitle: 'ستاند طاولة NFC لتقييم جوجل',
        badge: 'للمحلات والكافيهات',
        image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80',
        description: 'ستاند أكريليك للمطاعم والمتاجر يتيح للعملاء تقييم متجرك في خرائط جوجل أو فتح المنيو فوراً بملامسة الجوال.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: ستاند طاولة NFC لتقييم جوجل والمنيو للمحلات',
      },
      {
        id: 'nfc-keychain',
        title: 'ميدالية مفاتيح ذكية بتقنية NFC',
        shortTitle: 'ميدالية مفاتيح NFC ذكية',
        badge: 'عملية ومحمولة',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        description: 'ميدالية جلدية أو إيبوكسي ذكية لمشاركة الروابط والبيانات أثناء التنقل دون الحاجة لحمل بطاقات.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: ميدالية مفاتيح ذكية NFC',
      },
    ],
  },
  {
    id: 'wedding-invitations',
    title: 'دعوات أفراح',
    headerTitle: 'كروت ودعوات الأفراح والمناسبات الفاخرة',
    iconType: 'mail',
    arcColor: '#FB7185',
    iconColor: '#E11D48',
    bgColor: '#FFF1F2',
    selectedBgColor: '#FFE4E6',
    activeRingColor: '#9F1239',
    categorySearchQuery: 'دعوات',
    options: [
      {
        id: 'wedding-wax-seal',
        title: 'كروت ودعوات زفاف فاخرة مع ختم شمعي',
        shortTitle: 'كروت زفاف فاخرة بختم شمعي',
        badge: 'طباعة حرارية بارزة',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        description: 'ورق قطني ثقيل (Cotton Cardstock) بلمسات ذهبية بارزة مع أظرف ملونة وختم شمعي مخصص بأسماء العرسان.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب: كروت ودعوات زفاف فاخرة مع ختم شمعي',
      },
      {
        id: 'wedding-digital-rsvp',
        title: 'دعوة إلكترونية ذكية تفاعلية عبر واتساب',
        shortTitle: 'دعوة إلكترونية تفاعلية WhatsApp',
        badge: 'موقع تفاعلي مع باركود',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        description: 'رابط دعوة VIP خاص بضيوفك مع عداد تنازلي، تأكيد الحضور (RSVP)، وخريطة قاعة الفرح المباشرة.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: دعوة إلكترونية تفاعلية ذكية عبر واتساب',
      },
      {
        id: 'wedding-table-cards',
        title: 'بطاقات طاولات واستقبال وتوزيعات المعازيم',
        shortTitle: 'بطاقات طاولات وتوزيعات',
        badge: 'تصاميم حصرية متناسقة',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
        description: 'كروت طاولات مرقمة، بطاقات شكر للمعازيم، وثيمات متناسقة مع كوشة وديكور الحفل.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: بطاقات طاولات وتوزيعات أفراح متناسقة',
      },
      {
        id: 'wedding-acrylic-stand',
        title: 'لوحة استقبال ستاند أكريليك مذهب',
        shortTitle: 'لوحة استقبال ستاند أكريليك',
        badge: 'ستاند ترحيبي فاخر',
        image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
        description: 'لوح أكريليك شفاف فاخر بعبارات الترحيب وأسماء العرسان بحروف ذهبية مع حامل خشبي أنيق للمدخل.',
        whatsappText: 'مرحباً مكتبة أنوار الواحة 👋 أود طلب: لوحة استقبال ستاند أكريليك مذهب للمناسبات',
      },
    ],
  },
];

interface ServicesShowcaseProps {
  className?: string;
  showTitle?: boolean;
}

export const ServicesShowcase: React.FC<ServicesShowcaseProps> = ({
  className = '',
  showTitle = true,
}) => {
  const navigate = useNavigate();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Split the 6 services into 2 rows of 3 columns each (for exact RTL layout)
  const rows: ShowcaseService[][] = [
    SHOWCASE_SERVICES.slice(0, 3), // Row 1: ابحث عن وظيفة | تصميم مواقع | تدقيق و Turnitin
    SHOWCASE_SERVICES.slice(3, 6), // Row 2: مشاريع تخرج | بطاقة NFC الذكية | دعوات أفراح
  ];

  const activeService = SHOWCASE_SERVICES.find((s) => s.id === selectedServiceId) || null;

  // Whenever active service changes, select its first option
  useEffect(() => {
    if (activeService) {
      setSelectedOptionId(activeService.options[0]?.id || null);
    }
  }, [selectedServiceId]);

  // Smooth scroll drawer into view when opened
  useEffect(() => {
    if (selectedServiceId && drawerRef.current) {
      drawerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedServiceId]);

  const handleSelectService = (id: string) => {
    setSelectedServiceId((prev) => (prev === id ? null : id));
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    // Find option index and scroll carousel card into view
    if (activeService && carouselRef.current) {
      const idx = activeService.options.findIndex((o) => o.id === optionId);
      if (idx !== -1) {
        const targetCard = carouselRef.current.children[idx] as HTMLElement;
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }
  };

  const activeOption =
    activeService?.options.find((o) => o.id === selectedOptionId) ||
    activeService?.options[0] ||
    null;

  const handleOpenWhatsApp = (option: ShowcaseOption | null) => {
    if (!activeService) return;
    const text =
      option?.whatsappText ||
      `مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمة: ${activeService.title}`;
    window.open(`https://wa.me/966572350050?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNavigateToCategory = (service: ShowcaseService) => {
    navigate(`/categories?search=${encodeURIComponent(service.categorySearchQuery)}`);
  };

  // Helper to render matching icon component
  const renderIcon = (type: ShowcaseService['iconType'], color: string) => {
    switch (type) {
      case 'pen-line':
        return <PenLine size={32} style={{ color }} />;
      case 'monitor':
        return <Monitor size={32} style={{ color }} />;
      case 'file-text':
        return <FileText size={32} style={{ color }} />;
      case 'mail':
        return <Mail size={32} style={{ color }} />;
      case 'credit-card':
        return <CreditCard size={32} style={{ color }} />;
      case 'graduation-cap':
        return <GraduationCap size={32} style={{ color }} />;
      default:
        return <Sparkles size={32} style={{ color }} />;
    }
  };

  // Compute RTL arrow position percent
  // In RTL: col 0 is right (16.66%), col 1 is center (50%), col 2 is left (83.33%)
  const getArrowRightPosition = (colIdx: number) => {
    const pct = ((colIdx + 0.5) / 3) * 100;
    return `${pct.toFixed(2)}%`;
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-6 ${className}`}>
      {/* ===== HEADER BADGE & TITLE ===== */}
      {showTitle && (
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xs">
            <span className="text-[#F59E0B]">⚡</span>
            <span>خدمات بلس الأكاديمية والمهنية</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight">
            اضغط على الخدمة لمعاينة تفاصيلها
          </h2>
        </div>
      )}

      {/* ===== ROWS OF CIRCLES WITH IN-PLACE EXPANDABLE DRAWER ===== */}
      <div className="space-y-6 max-w-xl mx-auto">
        {rows.map((rowServices, rowIdx) => {
          const activeColIdx = rowServices.findIndex((s) => s.id === selectedServiceId);
          const isRowActive = activeColIdx !== -1;

          return (
            <div key={rowIdx} className="space-y-4">
              {/* 3 Columns Grid for this Row */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                {rowServices.map((service, colIdx) => {
                  const isSelected = selectedServiceId === service.id;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelectService(service.id)}
                      className="group flex flex-col items-center text-center gap-2.5 focus:outline-none transition-transform"
                    >
                      {/* Circle Outer Frame */}
                      <div className="relative">
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 relative select-none ${
                            isSelected
                              ? 'scale-105 shadow-lg ring-2 ring-offset-2'
                              : 'hover:scale-105 hover:shadow-md'
                          }`}
                          style={{
                            backgroundColor: isSelected ? service.selectedBgColor : service.bgColor,
                            boxShadow: isSelected
                              ? `0 0 0 2px ${service.activeRingColor}`
                              : undefined,
                          }}
                        >
                          {/* Colored Bottom Arc SVG Overlay */}
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 100 100"
                          >
                            {/* Subtle full circumference guide */}
                            <circle
                              cx="50"
                              cy="50"
                              r="44"
                              fill="none"
                              stroke={isSelected ? service.activeRingColor : '#E2E8F0'}
                              strokeWidth={isSelected ? '2' : '1.5'}
                              strokeOpacity={isSelected ? 0.3 : 0.6}
                            />
                            {/* Distinct Colored Bottom Arc */}
                            <path
                              d="M 14 68 A 44 44 0 0 0 86 68"
                              fill="none"
                              stroke={service.arcColor}
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </svg>

                          {/* The Clean Centered Icon */}
                          <div className="relative z-10 transition-transform duration-200 group-hover:scale-110">
                            {renderIcon(
                              service.iconType,
                              isSelected ? service.activeRingColor : service.iconColor
                            )}
                          </div>
                        </div>

                        {/* Active Red Dot on Top-Right Corner */}
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FA2C19] border-2 border-white shadow-sm animate-in zoom-in" />
                        )}
                      </div>

                      {/* Label under circle */}
                      <span
                        className={`text-xs sm:text-sm leading-snug max-w-[110px] transition-colors ${
                          isSelected
                            ? 'text-zinc-950 font-black'
                            : 'text-zinc-700 font-bold group-hover:text-black'
                        }`}
                      >
                        {service.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ===== IN-PLACE EXPANDABLE DRAWER CARD (Directly below this active row) ===== */}
              {isRowActive && activeService && (
                <div
                  ref={drawerRef}
                  className="relative w-full bg-white rounded-3xl border border-zinc-200 shadow-xl p-4 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
                >
                  {/* Upward Pointer Caret aligned horizontally to the clicked circle */}
                  <div
                    className="absolute -top-2 w-4 h-4 bg-white border-t border-l border-zinc-200 rotate-45 translate-x-1/2 transition-all duration-300 z-10"
                    style={{
                      right: getArrowRightPosition(activeColIdx),
                    }}
                  />

                  {/* Drawer Header: Title with dot + Close Button */}
                  <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                      <h3 className="text-sm sm:text-base font-black text-zinc-900 truncate">
                        {activeService.headerTitle}
                      </h3>
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

                  {/* Carousel Subtitle Bar */}
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-600 pt-0.5">
                    <span>الخدمات المتاحة في هذا القسم:</span>
                    <span className="bg-zinc-100 text-zinc-500 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                      اسحب للتصفح ←
                    </span>
                  </div>

                  {/* Horizontal Visual Cards Carousel */}
                  <div
                    ref={carouselRef}
                    className="flex gap-3.5 overflow-x-auto no-scrollbar pb-2 pt-1 scroll-smooth"
                  >
                    {activeService.options.map((option) => {
                      const isOptionSelected = option.id === (selectedOptionId || activeService.options[0]?.id);

                      return (
                        <div
                          key={option.id}
                          onClick={() => handleSelectOption(option.id)}
                          className={`w-64 sm:w-72 shrink-0 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden bg-white shadow-xs ${
                            isOptionSelected
                              ? 'border-black ring-1 ring-black shadow-md'
                              : 'border-zinc-200 hover:border-zinc-300 opacity-90 hover:opacity-100'
                          }`}
                        >
                          {/* Card Photo Area */}
                          <div className="h-36 sm:h-40 w-full relative overflow-hidden bg-zinc-100">
                            <img
                              src={option.image}
                              alt={option.title}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              loading="lazy"
                            />
                            {/* Top Badges */}
                            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1">
                              {/* Selected Badge */}
                              {isOptionSelected ? (
                                <span className="bg-[#059669] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                                  محدد ✓
                                </span>
                              ) : (
                                <span />
                              )}
                              {/* Feature Badge */}
                              <span className="bg-black/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                                {option.badge}
                              </span>
                            </div>
                          </div>

                          {/* Card Bottom Title Bar */}
                          <div className="p-3 bg-white border-t border-zinc-100">
                            <h4 className="text-xs sm:text-sm font-black text-zinc-900 text-center line-clamp-1">
                              {option.title}
                            </h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* One-Touch Option Selector Pills */}
                  <div className="space-y-2 pt-2 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-zinc-800">
                        حدد نوع طلبك بلمسة واحدة:
                      </span>
                      <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        تم التحديد ✓
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeService.options.map((option) => {
                        const isOptionSelected =
                          option.id === (selectedOptionId || activeService.options[0]?.id);

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelectOption(option.id)}
                            className={`text-xs sm:text-sm px-3.5 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                              isOptionSelected
                                ? 'bg-black text-white font-black shadow-xs'
                                : 'bg-white hover:bg-zinc-50 text-zinc-700 hover:text-black border border-zinc-200 font-bold'
                            }`}
                          >
                            {isOptionSelected && (
                              <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
                            )}
                            <span>{option.shortTitle || option.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Option Description Snippet */}
                  {activeOption && (
                    <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100 text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {activeOption.description}
                    </div>
                  )}

                  {/* Drawer Bottom Actions: Primary Button + WhatsApp & Navigate */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    {/* Primary Button ("المزيد ←" matching screenshot & entering the section) */}
                    <button
                      type="button"
                      onClick={() => handleNavigateToCategory(activeService)}
                      className="w-full sm:flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
                    >
                      <span>المزيد والدخول للقسم</span>
                      <ArrowLeft size={16} />
                    </button>

                    {/* WhatsApp Fast Order Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(activeOption)}
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-xs sm:text-sm py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      title="طلب فوري عبر واتساب"
                    >
                      <MessageCircle size={17} />
                      <span>اطلب الخدمة الآن</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
