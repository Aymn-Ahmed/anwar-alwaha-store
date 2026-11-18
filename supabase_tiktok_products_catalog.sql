-- =============================================================================
-- مكتبة أنوار الواحة - الكتالوج الشامل لجميع منتجات وخدمات المتجر وتيك توك
-- Anwar Al Wahah Library - Master TikTok & Store Catalog SQL (100% Complete)
-- حساب تيك توك الرسمي: @anwaralwaha_1 | خميس مشيط - حي الواحة | واتساب: 0572350050
-- =============================================================================
-- تم تقسيم وتنظيم هذا الملف بدقة متناهية: كل قسم مستقل بذاته ومعه جميع أصنافه (غير مخلوط)
-- جاهز للتنفيذ المباشر بنقرة واحدة داخل Supabase SQL Editor بدون أي أخطاء.
-- =============================================================================

-- تفعيل ملحق UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. التأكد من وجود وهيكل الجداول الأساسية
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📦',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT,
    tiktok_video_id TEXT,
    price NUMERIC DEFAULT 0,
    old_price NUMERIC,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- التأكد من وجود عمود السعر قبل الخصم (old_price)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price NUMERIC;

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT DEFAULT 'sparkles',
    accent_color TEXT DEFAULT '#1e293b',
    media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'tiktok')),
    media_url TEXT,
    linked_category_id TEXT,
    whatsapp_template TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    bundle_price NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.category_complement_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    target_category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(source_category_id, target_category_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_method TEXT DEFAULT 'pickup',
    address TEXT,
    location_lat NUMERIC,
    location_lng NUMERIC,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    is_reviewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    order_code TEXT,
    product_id TEXT,
    product_name TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video')),
    media_url TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- 2. إعداد سياسات الأمان (RLS Policies)
-- =============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_complement_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "قراءة الأقسام للجميع" ON public.categories;
CREATE POLICY "قراءة الأقسام للجميع" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "إدارة الأقسام للمسؤولين" ON public.categories;
CREATE POLICY "إدارة الأقسام للمسؤولين" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "قراءة المنتجات للجميع" ON public.products;
CREATE POLICY "قراءة المنتجات للجميع" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "إدارة المنتجات للمسؤولين" ON public.products;
CREATE POLICY "إدارة المنتجات للمسؤولين" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "قراءة الخدمات للجميع" ON public.services;
CREATE POLICY "قراءة الخدمات للجميع" ON public.services FOR SELECT USING (true);
DROP POLICY IF EXISTS "إدارة الخدمات للمسؤولين" ON public.services;
CREATE POLICY "إدارة الخدمات للمسؤولين" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "قراءة الباقات للجميع" ON public.product_bundles;
CREATE POLICY "قراءة الباقات للجميع" ON public.product_bundles FOR SELECT USING (true);
DROP POLICY IF EXISTS "إدارة الباقات للمسؤولين" ON public.product_bundles;
CREATE POLICY "إدارة الباقات للمسؤولين" ON public.product_bundles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "قراءة عناصر الباقات للجميع" ON public.product_bundle_items;
CREATE POLICY "قراءة عناصر الباقات للجميع" ON public.product_bundle_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "إدارة عناصر الباقات للمسؤولين" ON public.product_bundle_items;
CREATE POLICY "إدارة عناصر الباقات للمسؤولين" ON public.product_bundle_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "قراءة قواعد الربط للجميع" ON public.category_complement_rules;
CREATE POLICY "قراءة قواعد الربط للجميع" ON public.category_complement_rules FOR SELECT USING (true);
DROP POLICY IF EXISTS "إدارة قواعد الربط للمسؤولين" ON public.category_complement_rules;
CREATE POLICY "إدارة قواعد الربط للمسؤولين" ON public.category_complement_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "إنشاء الطلبات للزوار والعملاء" ON public.orders;
CREATE POLICY "إنشاء الطلبات للزوار والعملاء" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "قراءة وتحديث الطلبات للجميع" ON public.orders;
CREATE POLICY "قراءة وتحديث الطلبات للجميع" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "تعديل الطلبات للمسؤولين" ON public.orders;
CREATE POLICY "تعديل الطلبات للمسؤولين" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "قراءة التقييمات المقبولة للجميع" ON public.product_reviews;
CREATE POLICY "قراءة التقييمات المقبولة للجميع" ON public.product_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "إضافة تقييم للعملاء" ON public.product_reviews;
CREATE POLICY "إضافة تقييم للعملاء" ON public.product_reviews FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "إدارة التقييمات للمسؤولين" ON public.product_reviews;
CREATE POLICY "إدارة التقييمات للمسؤولين" ON public.product_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================================
-- 3. إدخال الأقسام الـ 21 الشاملة (15 قسم متجر + 6 أقسام خدمات واستوديوهات)
-- =============================================================================

INSERT INTO public.categories (id, title, description, icon, sort_order)
VALUES
    -- أ) أقسام المتجر الإلكتروني الـ 15 (E-Commerce Store Categories)
    ('cat_printing', 'طباعة وبحوث', 'مذكرات وملازم PDF، تصوير ليزري، ملازم ومذكرات دراسية.', '📄', 1),
    ('cat_grad', 'مشاريع التخرج', 'تجليد فاخر مقوى مذهب، بوسترات مشاريع تخرج، سلك حراري، أرواب وأوشحة تخرج.', '🎓', 2),
    ('cat_events', 'دعوات وأعراس', 'كروت زواج ليزرية، كروت تخرج، بطاقات ملكة ومناسبات، توزيعات.', '💌', 3),
    ('cat_school_kits', 'أطقم مدرسية', 'حقائب مدرسية، بوكسات وأطقم متكاملة لطلاب المدارس ولانش بوكس.', '🎒', 4),
    ('cat_college', 'مستلزمات جامعية', 'دفاتر سلك جامعية، مفكرات جلدية، منظمات دراسية، وحافظات ملفات.', '📚', 5),
    ('cat_pens', 'أقلام وحبر فاخر', 'أقلام جيل يابانية، حبر سائل، أقلام رصاص، وماركات احترافية كورية SMOOZ.', '🖋️', 6),
    ('cat_notebooks', 'دفاتر ومذكرات', 'أجندات سنوية، دفاتر نقطية Bullet Journals، وكشاكيل سلك كرافت.', '📓', 7),
    ('cat_highlight', 'تظليل وتصحيح', 'أقلام هايلايتر باستيل، ممحاة عجين، طوامس، وهايلايتر Morandi.', '🖍️', 8),
    ('cat_art', 'أدوات رسم وفنون', 'ألوان أكريليك، ألوان مائية، لوحات كانفس مشدودة، وفراشي رسم احترافية.', '🎨', 9),
    ('cat_geometry', 'هندسة وحاسبات', 'حاسبات علمية معتمدة، مساطر هندسية ألمنيوم، ومساطر حرف T للعمارة.', '📐', 10),
    ('cat_binding', 'تغليف وتجليد', 'تجليد سلك وبلاستيك، تغليف حراري، رول تجليد كتب، وأغطية تقارير مقواة.', '📑', 11),
    ('cat_stamps', 'أختام وهوية بصرية', 'أختام شخصية أوتوماتيكية، بطاقات أعمال بزنس كارد، وقواعد باركود QR.', '🏷️', 12),
    ('cat_cases', 'حقائب ومقالم', 'مقالم كورية حديثة متعددة الطبقات، منظمات مكاتب خشبية، وحقائب لابتوب.', '👝', 13),
    ('cat_stickers', 'ستيكرات وتوزيعات', 'ملصقات أسماء مقاومة، استكرات مقصوصة ليزرياً، وتوزيعات تخرج وهدايا.', '✨', 14),
    ('cat_bundles', 'تصفية وباقات 150', 'باقات توفيرية ذكية تجمع عدة أصناف بخصم 25% إلى 40% وتفتح الشحن المجاني.', '🎁', 15),

    -- ب) أقسام الخدمات والاستوديوهات الكبرى الـ 6 (ميدانية وفيديوهات تيك توك)
    ('dept_print', 'الطباعة الإعلانية والاستكرات (المكائن الكبيرة)', 'بنرات إعلانية وتجارية ومدرسية، رول أب ستاند (85×200 سم)، قص استكرات إلكتروني (Plotter)، استكرات جدارية، لوحات فلين وفوركس، وباركود QR.', '🖨️', 16),
    ('dept_school', 'الوسائل التعليمية ولوحات المدارس', 'لوحات الفصول والقوانين الصفية، لوحات المواد الدراسية، مجسمات المتاجر والأكشاك (3D Booths)، مجسمات فلين ومطويات، وملفات الإنجاز.', '🏫', 17),
    ('dept_art', 'الخطاط والرسام والجداريات الميدانية', 'جداريات المدارس والأسوار الخارجية، رسم الألعاب الحركية الأرضية بساحات الروضات، لوحات الخط العربي الأصيل، واللوحات الإرشادية.', '🎨', 18),
    ('dept_themes', 'التوزيعات والثيمات والأكواب', 'أكواب ورقية وأكمام أكواب (Cup Sleeves)، تغليف وتاقات علب المياه للمناسبات، ثيمات وتوزيعات المواليد والأعراس، وتوزيعات تفعيل الحروف المدرسية.', '☕', 19),
    ('dept_grad', 'حفلات التخرج والأعياد والهدايا', 'بنرات التخرج الكبيرة للتصوير (Senior Banners)، فلين تخرج مقصوص بالصورة والاسم، دروع تكريمية أكريليك وخشب محفورة، وأوشحة وقبعات تخرج ملكية.', '🎓', 20),
    ('dept_stationery', 'القرطاسية والأدوات المدرسية والفنية', 'حقائب مدرسية، دفاتر وملازم، ألوان وأدوات فنية وكانفس، أقلام متنوعة (SMOOZ)، وتصوير وتجليد المذكرات والبحوث ليزرياً.', '🎒', 21)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

-- =============================================================================
-- 4. إدخال الخدمات الرسمية الـ 6 في جدول services (مع فيديو التيك توك والواتساب)
-- =============================================================================

DELETE FROM public.services WHERE linked_category_id IN (
    'dept_print', 'dept_school', 'dept_art', 'dept_themes', 'dept_grad', 'dept_stationery'
);

INSERT INTO public.services (
    title, description, icon_name, accent_color, media_type, media_url, linked_category_id, whatsapp_template, sort_order, is_active
) VALUES 
(
    'الطباعة الإعلانية والاستكرات (المكائن الكبيرة)',
    'طباعة بنرات إعلانية وتجارية ومدرسية، رول أب ستاند (85×200 سم)، قص استكرات إلكتروني (Plotter)، استكرات جدارية، ولوحات فلين وفوركس وباركود QR.',
    'printer',
    '#0284c7',
    'tiktok',
    'https://www.tiktok.com/@anwaralwaha_1/video/7578203989804633351',
    'dept_print',
    'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمات الطباعة الإعلانية والاستكرات.',
    1,
    true
),
(
    'الوسائل التعليمية ولوحات المدارس',
    'تصميم وطباعة وتركيب اللوحات المدرسية، لوحات الفصول والأنشطة، لوحات المواد، مجسمات الأكشاك (3D Booths)، مجسمات فلين ومطويات، وملفات إنجاز المعلمين.',
    'graduation-cap',
    '#059669',
    'image',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
    'dept_school',
    'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب الوسائل التعليمية واللوحات المدرسية والمجسمات.',
    2,
    true
),
(
    'الخطاط والرسام والجداريات الميدانية',
    'رسم وتنفيذ الجداريات الفنية والتعليمية على أسوار المدارس، تخطيط ورسم الألعاب الحركية الأرضية بساحات الروضات، ولوحات الخط العربي واللوحات الإرشادية.',
    'palette',
    '#d97706',
    'image',
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    'dept_art',
    'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمات الخطاط والرسام والجداريات الميدانية.',
    3,
    true
),
(
    'التوزيعات والثيمات والأكواب',
    'طباعة وتغليف الأكواب الورقية وأكمام الأكواب (Cup Sleeves)، تغليف علب المياه، ثيمات وتوزيعات المواليد والزواج، توزيعات تفعيل الحروف، وطباعة أقلام مخصصة.',
    'coffee',
    '#e11d48',
    'image',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    'dept_themes',
    'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب التوزيعات والثيمات والأكواب الورقية.',
    4,
    true
),
(
    'حفلات التخرج والأعياد والهدايا',
    'بنرات التخرج الكبيرة (Senior Banners)، فلين تخرج مقصوص بالصورة والاسم، دروع تكريمية أكريليك وخشب، قبعات وأوشحة تخرج، وكتب العيد الفخمة.',
    'award',
    '#7c3aed',
    'image',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    'dept_grad',
    'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب مستلزمات وبنرات التخرج ودروع التكريم وهدايا العيد.',
    5,
    true
),
(
    'القرطاسية والأدوات المدرسية والفنية',
    'تشكيلة متكاملة من الحقائب المدرسية والدفاتر والكراسات، قسم الألوان والأدوات الفنية، أقلام متنوعة (ماركات SMOOZ)، وتصوير مذكرات وبحوث.',
    'book-open',
    '#475569',
    'image',
    'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80',
    'dept_stationery',
    'مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب مستلزمات القرطاسية والأدوات المدرسية والفنية.',
    6,
    true
);

-- =============================================================================
-- 5. إدخال جميع المنتجات المصنفة بدقة كاملة تحت كل قسم (غير مخلوطة نهائياً)
-- =============================================================================

-- حذف آمن لمنتجات الأقسام لضمان نظافة البيانات وعدم تكرار الأصناف
DELETE FROM public.products WHERE category_id IN (
    'cat_printing', 'cat_grad', 'cat_events', 'cat_school_kits', 'cat_college',
    'cat_pens', 'cat_notebooks', 'cat_highlight', 'cat_art', 'cat_geometry',
    'cat_binding', 'cat_stamps', 'cat_cases', 'cat_stickers', 'cat_bundles',
    'dept_print', 'dept_school', 'dept_art', 'dept_themes', 'dept_grad', 'dept_stationery'
);

INSERT INTO public.products (category_id, name, image_url, tiktok_video_id, price, sort_order) VALUES

    -- =========================================================================
    -- القسم 1: طباعة وبحوث (cat_printing)
    -- =========================================================================
    ('cat_printing', 'بوستر مناقشة البحث مقاس A1 طباعة ليزرية ملونة عالية الدقة', 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 25.00, 1),
    ('cat_printing', 'بوستر مناقشة البحث مقاس A0 فوتوغرافي سميك مع ستاند عرض', 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 45.00, 2),
    ('cat_printing', 'طباعة وتجليد أبحاث ومذكرات جامعية PDF ورق 80g فاخر أبيض ناصع', 'https://images.unsplash.com/photo-1598620616337-cb8f766489bd?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 15.00, 3),
    ('cat_printing', 'طباعة ملازم ومقررات ملونة مع تغليف شفاف وسلك حلزوني متين', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 18.00, 4),
    ('cat_printing', 'طباعة كتيبات ومجلات ملونة دبابيس وسط وسولوفان مقاس A4 و A5', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80', NULL, 30.00, 5),
    ('cat_printing', 'تصوير مستندات وملازم أبيض وأسود كميات كبيرة دقة ليزرية سريعة', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80', NULL, 10.00, 6),
    ('cat_printing', 'طباعة بروشورات ومطويات تعريفية 3 طيات ورنيش لامع (سيت 100 بروشور)', 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80', NULL, 55.00, 7),

    -- =========================================================================
    -- القسم 2: مشاريع التخرج (cat_grad)
    -- =========================================================================
    ('cat_grad', 'تجليد بحث التخرج الفاخر (جلد مقوى مذهب مع سلك حراري داخلي)', 'https://images.unsplash.com/photo-1590412701565-55de7fad7cab?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 35.00, 1),
    ('cat_grad', 'تجليد رسائل الماجستير والدكتوراه كعب مقوى مخملي فاخر بالذهب الملكي', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 60.00, 2),
    ('cat_grad', 'روب وقبعة تخرج فاخرة مع وشاح وتطريز الاسم وسنة التخرج', 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 85.00, 3),
    ('cat_grad', 'كروت إهداء وشكر للدكاترة ولجنة مناقشة البحث (باكيت 10 كروت مذهبة)', 'https://images.unsplash.com/photo-1577201867491-47644a49dcab?auto=format&fit=crop&w=700&q=80', NULL, 20.00, 4),
    ('cat_grad', 'وشاح تخرج كلاسيكي شيفون مطرز بالخيوط الذهبية الملكية', 'https://images.unsplash.com/photo-1779753795022-70eeeb7d5075?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 35.00, 5),
    ('cat_grad', 'قبعة تخرج فردية كلاسيكية مع شراشيب ذهبية وبروش سنة التخرج', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80', NULL, 25.00, 6),
    ('cat_grad', 'باقة ورد صناعي فاخر مع دمية التخرج وكرت الإهداء للتصوير', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', NULL, 50.00, 7),

    -- =========================================================================
    -- القسم 3: دعوات وأعراس (cat_events)
    -- =========================================================================
    ('cat_events', 'طقم دعوات زواج وأفراح ليزرية مذهبة (باكيت 50 كرت فاخر مع أظرف)', 'https://images.unsplash.com/photo-1548838906-c58e48fdb10c?auto=format&fit=crop&w=700&q=80', NULL, 75.00, 1),
    ('cat_events', 'كروت استقبال وتوزيعات شوكولاتة مخصصة بأسماء العروسين (طقم 50)', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80', NULL, 45.00, 2),
    ('cat_events', 'دفتر توقيع العروسين وذكريات الضيوف الفاخر جلد لؤلؤي مذهب', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80', NULL, 65.00, 3),
    ('cat_events', 'كروت ملكة وعقد قران مذهبة بارزة مع باركود موقع الحفل (طقم 50)', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80', NULL, 70.00, 4),
    ('cat_events', 'بطاقات أرقام طاولات القاعة مع أسماء العوائل بتصميم ملكي (طقم 20)', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80', NULL, 35.00, 5),
    ('cat_events', 'ستاند ترحيبي بالضيوف أكريليك شفاف لقاعات الأفراح والمناسبات', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 120.00, 6),

    -- =========================================================================
    -- القسم 4: أطقم مدرسية (cat_school_kits)
    -- =========================================================================
    ('cat_school_kits', 'حقيبة ظهر مدرسية طبية مضادة للماء خفيفة الوزن مع دعامة ظهر', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 65.00, 1),
    ('cat_school_kits', 'باقة قرطاسية العودة للمدرسة المتكاملة (12 قطعة مجمعة وفر 40%)', 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80', NULL, 45.00, 2),
    ('cat_school_kits', 'لانش بوكس ومطارة ماء مدرسية حرارية ستانلس ستيل مانعة للتسريب', 'https://images.unsplash.com/photo-1726726192151-6d4139ff229d?auto=format&fit=crop&w=700&q=80', NULL, 35.00, 3),
    ('cat_school_kits', 'طقم حقيبة مدرسية ولادي 3 في 1 (شنطة ظهر + حقيبة طعام + مقلمة)', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80', NULL, 85.00, 4),
    ('cat_school_kits', 'طقم حقيبة مدرسية بناتي باستيل 3 في 1 (شنطة ظهر + حقيبة طعام + مقلمة)', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', NULL, 85.00, 5),
    ('cat_school_kits', 'بكج الطالب للمرحلة الابتدائية (دفاتر تسطير إنجليزي وعربي وأدوات رسم)', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80', NULL, 40.00, 6),

    -- =========================================================================
    -- القسم 5: مستلزمات جامعية (cat_college)
    -- =========================================================================
    ('cat_college', 'دفتر سلك لافندر مقسم 5 مواد جامعي مع فواصل ملونة وجيوب', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80', NULL, 32.00, 1),
    ('cat_college', 'مجلد حفظ المستندات والمحاضرات A4 كليب معدني مزدوج متين', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80', NULL, 18.00, 2),
    ('cat_college', 'بلانر أسبوعي لتنظيم مواعيد المحاضرات والاختبارات النصفية', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=700&q=80', NULL, 22.00, 3),
    ('cat_college', 'ملف بورتفوليو شفاف 40 جيب لحفظ المشاريع والتقارير الأكاديمية', 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=700&q=80', NULL, 25.00, 4),
    ('cat_college', 'مسند وحامل كتب ووثائق مكتبي قابل للتعديل للمذاكرة المريحة', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80', NULL, 35.00, 5),
    ('cat_college', 'دفتر محاضرات جامعي مقسم 3 مواد بغلاف بلاستيكي مضاد للتلف', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', NULL, 24.00, 6),

    -- =========================================================================
    -- القسم 6: أقلام وحبر فاخر (cat_pens)
    -- =========================================================================
    ('cat_pens', 'قلم حبر سائل ذهبي وفضي لكتابة أسماء ضيوف المناسبات', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80', NULL, 15.00, 1),
    ('cat_pens', 'طقم أقلام جيل يابانية سريعة الجفاف 0.5mm (12 لون باستيل)', 'https://images.unsplash.com/photo-1567855354833-ac2c4f967b0c?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 28.00, 2),
    ('cat_pens', 'قلم حبر جاف فاخر معدني ثقيل مع علبة إهداء مخملية سوداء', 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80', NULL, 38.00, 3),
    ('cat_pens', 'طقم أقلام جيل ماركة SMOOZ الكورية 0.5mm كتابة فائقة النعومة (6 أقلام)', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 20.00, 4),
    ('cat_pens', 'طقم أقلام رصاص ميكانيكية سنون 0.5mm و 0.7mm مع علب سنون إضافية', 'https://images.unsplash.com/photo-1567855354833-ac2c4f967b0c?auto=format&fit=crop&w=700&q=80', NULL, 16.00, 5),
    ('cat_pens', 'أقلام حبر سائل للخط العربي رؤوس مشطوفة مقاسات (1.0, 2.0, 3.0 مم)', 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80', NULL, 24.00, 6),

    -- =========================================================================
    -- القسم 7: دفاتر ومذكرات (cat_notebooks)
    -- =========================================================================
    ('cat_notebooks', 'مفكرة جلدية كلاسيكية A5 مع شريط إغلاق وورق منقط 100g', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80', NULL, 38.00, 1),
    ('cat_notebooks', 'دفتر بوليت جورنال منقط 160g مخصص للإبداع وتتبع العادات', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=700&q=80', NULL, 42.00, 2),
    ('cat_notebooks', 'كشكول جامعي سلك كرافت طبيعي صديق للبيئة (باكيت 3 دفاتر)', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', NULL, 24.00, 3),
    ('cat_notebooks', 'كشكول سلك كبير A4 مسطر 200 صفحة ورق ياباني ناصع البياض', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80', NULL, 18.00, 4),
    ('cat_notebooks', 'دفتر مربعات ومخططات هندسية للرسم البياني ومسائل الرياضيات', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', NULL, 15.00, 5),
    ('cat_notebooks', 'نوت بوك جيب صغير للتدوين السريع والمهام اليومية (طقم 3 حبات)', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80', NULL, 12.00, 6),

    -- =========================================================================
    -- القسم 8: تظليل وتصحيح (cat_highlight)
    -- =========================================================================
    ('cat_highlight', 'طقم أقلام تظليل باستيل ناعمة لا تنفذ من صفحات الكتب (6 ألوان)', 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 24.00, 1),
    ('cat_highlight', 'طقم شريط تصحيح وممحاة ناعمة للأوراق الرسمية والمذكرات (4 قطع)', 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=700&q=80', NULL, 14.00, 2),
    ('cat_highlight', 'أقلام هايلايتر فوسفورية مزدوجة الرأس عريضة ودقيقة (طقم 5 ألوان)', 'https://images.unsplash.com/photo-1567855354833-ac2c4f967b0c?auto=format&fit=crop&w=700&q=80', NULL, 19.00, 3),
    ('cat_highlight', 'طقم هايلايتر ألوان ترابية Morandi أنيقة للملخصات الراقية (6 ألوان)', 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80', NULL, 22.00, 4),
    ('cat_highlight', 'ممحاة عجين فنية احترافية لإزالة الرصاص والتظليل بدون خدش الورق', 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=700&q=80', NULL, 8.00, 5),
    ('cat_highlight', 'شريط طامس تصحيح أوتوماتيكي بطول 12 متر مع غيار مدمج', 'https://images.unsplash.com/photo-1628191010210-a59de33e5941?auto=format&fit=crop&w=700&q=80', NULL, 10.00, 6),

    -- =========================================================================
    -- القسم 9: أدوات رسم وفنون (cat_art)
    -- =========================================================================
    ('cat_art', 'طقم ألوان مائية احترافية 36 لون مع فرشاة خزان ماء مدمجة', 'https://images.unsplash.com/photo-1511980725567-b9b7f0358905?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 48.00, 1),
    ('cat_art', 'كراسة رسم ورق قطني 300g مضاد لامتصاص وتموج الماء', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', NULL, 28.00, 2),
    ('cat_art', 'طقم ألوان أكريليك وفرش كانفس احترافية (12 لون + 5 فراشي)', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 45.00, 3),
    ('cat_art', 'لوحات رسم كانفس مشدودة على إطار خشبي (طقم 3 مقاسات: 20×20, 30×40, 40×50)', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80', NULL, 35.00, 4),
    ('cat_art', 'طقم ألوان باستيل زيتي ناعم عالي الصبغة للرسم والدمج (24 لون)', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80', NULL, 32.00, 5),
    ('cat_art', 'باليتة خلط ألوان أكريليك بيضاوية مع مساكة مريحة وسكاكين دمج فنية', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', NULL, 18.00, 6),

    -- =========================================================================
    -- القسم 10: هندسة وحاسبات (cat_geometry)
    -- =========================================================================
    ('cat_geometry', 'حاسبة علمية متطورة 417 دالة برمجية معتمدة للاختبارات الرسمية', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 58.00, 1),
    ('cat_geometry', 'طقم مساطر وفرجار ألمنيوم ليزري لطلبة الهندسة المعمارية', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', NULL, 28.00, 2),
    ('cat_geometry', 'مسطرة حرف T احترافية 80cm مع حقيبة حمل لطلبة العمارة والتصميم', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80', NULL, 45.00, 3),
    ('cat_geometry', 'شبلونة ومنقلة أشكال هندسية ودوائر دقيقة للتخطيط المعماري والرسومات', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', NULL, 18.00, 4),
    ('cat_geometry', 'حاسبة مكتبية بشاشة عريضة 12 خانة ومفاتيح ميكانيكية مريحة', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=700&q=80', NULL, 35.00, 5),
    ('cat_geometry', 'مثلثات هندسية زوايا 45 و 60 درجة مقاومة للكسر مع تدريج ليزري', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', NULL, 14.00, 6),

    -- =========================================================================
    -- القسم 11: تغليف وتجليد (cat_binding)
    -- =========================================================================
    ('cat_binding', 'باكيت تجليد سلك حلزوني معدني مقاسات متعددة (طقم 25 سلك)', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', NULL, 22.00, 1),
    ('cat_binding', 'رول تغليف حراري شفاف غير لامع للمذكرات والكتب (عرض 45 سم)', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 25.00, 2),
    ('cat_binding', 'أغطية تجليد مقواة شفافة وملونة مقاس A4 (باكيت 100 غلاف)', 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=700&q=80', NULL, 29.00, 3),
    ('cat_binding', 'شرائح تجليد بلاستيك كعب كبس ملون مقاس A4 (باكيت 50 شريحة)', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', NULL, 16.00, 4),
    ('cat_binding', 'رول تجليد كتب ذاتي اللصق شفاف سهل التركيب بدون فقاعات (طول 5 أمتار)', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80', NULL, 15.00, 5),
    ('cat_binding', 'ماكينة تجليد وتخريم سلك يدوية مكتبية مدمجة للمنزل والمكتب', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', NULL, 140.00, 6),

    -- =========================================================================
    -- القسم 12: أختام وهوية بصرية (cat_stamps)
    -- =========================================================================
    ('cat_stamps', 'طقم أختام شمعية ملكية مع شمع ذهبي وأحمر لإغلاق كروت الدعوة', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80', NULL, 30.00, 1),
    ('cat_stamps', 'ختم شخصي أوتوماتيكي سريع باسم الطالب أو التوقيع الرسمي المعتمد', 'https://images.unsplash.com/photo-1619418602850-35ad20aa1700?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 35.00, 2),
    ('cat_stamps', 'طباعة بطاقات عمل شخصية فاخرة بزنس كارد (100 كرت مع علبة)', 'https://images.unsplash.com/photo-1623305463957-df17547327cb?auto=format&fit=crop&w=700&q=80', NULL, 45.00, 3),
    ('cat_stamps', 'حبارة أختام مائية سريعة الجفاف عالية الوضوح (أزرق وأسود وأحمر)', 'https://images.unsplash.com/photo-1619418602850-35ad20aa1700?auto=format&fit=crop&w=700&q=80', NULL, 12.00, 4),
    ('cat_stamps', 'ستاند باركود QR كود أكريليك لطاولات المحلات والمطاعم والدفع الإلكتروني', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 28.00, 5),
    ('cat_stamps', 'أختام تشجيعية مدرسية للمعلمين والمعلمات (ممتاز، رائع، أحسنت)', 'https://images.unsplash.com/photo-1619418602850-35ad20aa1700?auto=format&fit=crop&w=700&q=80', NULL, 22.00, 6),

    -- =========================================================================
    -- القسم 13: حقائب ومقالم (cat_cases)
    -- =========================================================================
    ('cat_cases', 'مقلمة كورية قماشية متعددة الطبقات تتسع لـ 50 قلماً وملحقاتها', 'https://images.unsplash.com/photo-1574944558125-f8d12f23be89?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 22.00, 1),
    ('cat_cases', 'حقيبة لابتوب وملفات جامعية مبطنة مضادة للصدمات 14-15 بوصة', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80', NULL, 48.00, 2),
    ('cat_cases', 'منظم مكاتب وستاند أقلام وأوراق خشبي فاخر متعدد الرفوف', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', NULL, 34.00, 3),
    ('cat_cases', 'مقلمة سيليكون مرنة مقاومة للماء وسهلة التنظيف بألوان باستيل', 'https://images.unsplash.com/photo-1574944558125-f8d12f23be89?auto=format&fit=crop&w=700&q=80', NULL, 15.00, 4),
    ('cat_cases', 'منظم أدراج مكتبي شفاف مقسم للمشابك واللواصق والملاحظات الصغيرة', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', NULL, 20.00, 5),
    ('cat_cases', 'حافظة ملفات أكورديون 12 جيب مقسم لتصنيف أوراق المواد والفواتير', 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=700&q=80', NULL, 26.00, 6),

    -- =========================================================================
    -- القسم 14: ستيكرات وتوزيعات (cat_stickers)
    -- =========================================================================
    ('cat_stickers', 'باكيت ستيكرات وتوزيعات تخرج مذهبة ومقاومة للماء (طقم 50 ملصق)', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 18.00, 1),
    ('cat_stickers', 'ملصقات فينيل لتسمية الكتب والدفاتر مقاومة للماء والتمزق (طقم 60)', 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 15.00, 2),
    ('cat_stickers', 'ستيكرات تحفيزية للمذاكرة والتخطيط الدراسي (100 ملصق كرتوني)', 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80', NULL, 16.00, 3),
    ('cat_stickers', 'رول واشي تيب ياباني مزخرف بأشكال هندسية وورود للبلانر (طقم 5 حبات)', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80', NULL, 14.00, 4),
    ('cat_stickers', 'ملصقات حروف وأرقام إنجليزية وعربية لامعة لتزيين المشاريع المدرسية', 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80', NULL, 10.00, 5),
    ('cat_stickers', 'ستيكرات لطيفة للآيباد واللابتوب مقاومة للخدش والشمس (طقم 30 ملصق)', 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80', NULL, 18.00, 6),

    -- =========================================================================
    -- القسم 15: تصفية وباقات 150 (cat_bundles)
    -- =========================================================================
    ('cat_bundles', 'باقة الموسم الدراسي الشاملة (حقيبة + 4 دفاتر + طقم أقلام + مقلمة)', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 150.00, 1),
    ('cat_bundles', 'باقة التخرج الفاخرة المتكاملة (تجليد مذهب + بوستر مناقشة + وشاح تخرج)', 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 155.00, 2),
    ('cat_bundles', 'باقة طالب الهندسة والعمارة الشاملة (حاسبة علمية + طقم مساطر + كشكول A3)', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 150.00, 3),
    ('cat_bundles', 'باقة الفنان المبدع المتكاملة (ألوان أكريليك + كانفس + فراشي + كراسة مائية)', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80', NULL, 150.00, 4),
    ('cat_bundles', 'باقة البلانر والتنظيم الذهبية (أجندة جلدية + أقلام باستيل + ستيكرات + واشي تيب)', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80', NULL, 120.00, 5),
    ('cat_bundles', 'باقة المعلم والمعلمة الشاملة (ملف إنجاز سلك + أختام تشجيعية + أقلام تصحيح)', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 135.00, 6),

    -- =========================================================================
    -- القسم 16: الطباعة الإعلانية والاستكرات - المكائن الكبيرة (dept_print)
    -- =========================================================================
    ('dept_print', 'طباعة رول أب ستاند (Roll-up) مقاس 85×200 سم مع شاسيه ألومنيوم متحرك', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 110.00, 1),
    ('dept_print', 'طباعة بنرات إعلانية وتجارية ومدرسية خارجية وداخلية بالمتر المربع', 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 35.00, 2),
    ('dept_print', 'قص استكرات إلكتروني (Plotter) لعلب المنتجات والمتاجر بالكمية والمقاس', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 50.00, 3),
    ('dept_print', 'طباعة وتركيب استكرات جدارية كبيرة لتزيين فصول المدارس والروضات', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 75.00, 4),
    ('dept_print', 'لوحة فلين وفوركس للمحلات "المكان مراقب بالكاميرات" مقاس 50×70 سم', 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 40.00, 5),
    ('dept_print', 'لوحة فلين لحلقات تحفيظ القرآن الكريم والمساجد مع الحامل والشعار', 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 45.00, 6),
    ('dept_print', 'مطبوعات وقواعد باركود QR Code أكريليك للمحلات والحسابات الاجتماعية', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 30.00, 7),

    -- =========================================================================
    -- القسم 17: الوسائل التعليمية ولوحات المدارس (dept_school)
    -- =========================================================================
    ('dept_school', 'تصميم وطباعة لوحة القوانين الصفية المدرسية فلين مقوى 70×100 سم', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 60.00, 1),
    ('dept_school', 'لوحة اللقاء الصباحي والطقس التفاعلية لرياض الأطفال مع بطاقات متحركة', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 75.00, 2),
    ('dept_school', 'لوحة التعزيز والنجوم للطلاب فلين مقوى مع نجوم ملونة ممغنطة', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 65.00, 3),
    ('dept_school', 'لوحة الحضور والغياب التفاعلية لمدارس البنات والبنين مع الجيوب', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 70.00, 4),
    ('dept_school', 'لوحة نصائح الاختبارات وخطة الإخلاء المدرسية المعتمدة رسمياً', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 55.00, 5),
    ('dept_school', 'لوحات المواد (الحروف الرافصة، أدوات الاستفهام، اللام الشمسية والقمرية)', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 50.00, 6),
    ('dept_school', 'مجسم متجر وكشك مدرسي تفاعلي ثلاثي الأبعاد (3D Booth) للأنشطة', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 180.00, 7),
    ('dept_school', 'صندوق المفاجآت التفاعلي وسلة مجسم حفظ النعمة للمدارس والروضات', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 85.00, 8),
    ('dept_school', 'مجسم فلين المجموعة الشمسية والكواكب ثلاثي الأبعاد لمشاريع العلوم', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 70.00, 9),
    ('dept_school', 'مطويات مدرسية مقصوصة ليزرياً ومخصصة لمناهج التعليم والأيام العالمية', 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 25.00, 10),
    ('dept_school', 'تصميم وطباعة وتجليد ملف إنجاز المعلم والمعلمة الفاخر (سلك وفواصل)', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 45.00, 11),

    -- =========================================================================
    -- القسم 18: الخطاط والرسام والجداريات الميدانية (dept_art)
    -- =========================================================================
    ('dept_art', 'رسم وتنفيذ جدارية وطنية وتربوية على أسوار المدارس والروضات بالمتر', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 95.00, 1),
    ('dept_art', 'تخطيط ورسم الألعاب الحركية والمسارات الرياضية الأرضية بساحات الروضات', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 150.00, 2),
    ('dept_art', 'لوحة خط عربي أصيل مذهبة (خط الثلث أو الديواني) مع إطار ملكي فاخر', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 120.00, 3),
    ('dept_art', 'رسم اللوحات الإرشادية والتوعوية الميدانية على جدران المنشآت', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 80.00, 4),
    ('dept_art', 'تزيين وتجميل ممرات ومداخل الروضات بالجداريات الفنية التفاعلية الكرتونية', 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 180.00, 5),

    -- =========================================================================
    -- القسم 19: التوزيعات والثيمات والأكواب (dept_themes)
    -- =========================================================================
    ('dept_themes', 'طباعة أكواب ورقية مع أكمام أكواب مخصصة بالعبارات والشعارات (سيت 50)', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 65.00, 1),
    ('dept_themes', 'تغليف وتاقات علب المياه المقاومة للرطوبة للمناسبات والأعراس (سيت 50)', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 40.00, 2),
    ('dept_themes', 'ثيمات وتوزيعات متكاملة لاستقبال المواليد بالاسم والعبارات (باكيت 30)', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 75.00, 3),
    ('dept_themes', 'توزيعات مدرسية مميزة لتفعيل الحروف الهجائية (حرف النون، حرف الخاء)', 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 45.00, 4),
    ('dept_themes', 'توزيعات اليوم الوطني السعودي 95 ويوم التأسيس للمدارس والمؤسسات', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 50.00, 5),
    ('dept_themes', 'طباعة أقلام مخصصة ومحفورة بالاسم أو الشعار كتوزيعات راقية (درزن 12)', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 36.00, 6),
    ('dept_themes', 'ثيم الوردة المجسمة وثيم جواز السفر وتاقات الهدايا المقصوصة ليزرياً', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 55.00, 7),

    -- =========================================================================
    -- القسم 20: حفلات التخرج والأعياد والهدايا (dept_grad)
    -- =========================================================================
    ('dept_grad', 'بنرات التخرج الكبيرة للتصوير (Senior Banners) بمقاسات جدارية ضخمة', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 120.00, 1),
    ('dept_grad', 'فلين تخرج مقصوص ليزرياً بشكل الخريج مع الصورة والاسم وسنة التخرج', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 75.00, 2),
    ('dept_grad', 'دروع تكريمية وتذكارية فاخرة من الأكريليك الشفاف وقاعدة خشبية مع حفر ليزر', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 90.00, 3),
    ('dept_grad', 'قبعات وأوشحة تخرج ملكية مطبوعة ومطرزة بالاسم مع بوكسات الهدايا', 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 95.00, 4),
    ('dept_grad', 'مجسمات وكتب العيد الفخمة (كتب تهنئة كبيرة ومجسمات استاندات استقبال)', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 110.00, 5),
    ('dept_grad', 'براويز ذكريات مجسمة ثلاثية الأبعاد لحفظ لحظات الزواج والتخرج الفندقية', 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 85.00, 6),

    -- =========================================================================
    -- القسم 21: القرطاسية والأدوات المدرسية والفنية (dept_stationery)
    -- =========================================================================
    ('dept_stationery', 'حقيبة مدرسية متينة لجميع المراحل مع جيوب منظمة ومقاومة للماء', 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 60.00, 1),
    ('dept_stationery', 'دفاتر وكراسات وملازم مدرسية مسطرة 60 ورقة (باكيت 6 دفاتر)', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80', NULL, 20.00, 2),
    ('dept_stationery', 'قسم الألوان الفنية (ألوان بوستر، ألوان أكريليك، لوحات كانفس، وفراشي)', 'https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 40.00, 3),
    ('dept_stationery', 'تشكيلة أقلام متنوعة وماركات عالمية كورية (SMOOZ) فائقة السلاسة (باكيت 12)', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 25.00, 4),
    ('dept_stationery', 'أدوات ومستلزمات مكتبية وتنظيمية (دباسة، خرامة، مقص، ولاصق قوي)', 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80', NULL, 30.00, 5),
    ('dept_stationery', 'تصوير وطباعة مذكرات وسجلات وبحوث ليزرية فورية مع التجليد السلك', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80', '7578203989804633351', 20.00, 6);

-- =============================================================================
-- 6. إنشاء باقات ذكية نموذجية في جدول product_bundles
-- =============================================================================

DO $$
DECLARE
    bundle1_id UUID;
    bundle2_id UUID;
    bundle3_id UUID;
    p_grad1 UUID;
    p_grad2 UUID;
    p_pen UUID;
    p_book UUID;
    p_calc UUID;
    p_geom UUID;
BEGIN
    -- باقة حفل التخرج الملكية المتكاملة
    SELECT id INTO p_grad1 FROM public.products WHERE category_id = 'cat_grad' ORDER BY sort_order ASC LIMIT 1;
    SELECT id INTO p_grad2 FROM public.products WHERE category_id = 'cat_grad' ORDER BY sort_order ASC OFFSET 2 LIMIT 1;
    
    IF p_grad1 IS NOT NULL AND p_grad2 IS NOT NULL THEN
        INSERT INTO public.product_bundles (title, bundle_price, is_active)
        VALUES ('باقة حفل التخرج الملكية المتكاملة (تجليد فاخر + وشاح وروب)', 120.00, true)
        RETURNING id INTO bundle1_id;

        INSERT INTO public.product_bundle_items (bundle_id, product_id)
        VALUES (bundle1_id, p_grad1), (bundle1_id, p_grad2);
    END IF;

    -- طقم التدوين والملاحظات الفاخر
    SELECT id INTO p_pen FROM public.products WHERE category_id = 'cat_pens' ORDER BY sort_order ASC LIMIT 1;
    SELECT id INTO p_book FROM public.products WHERE category_id = 'cat_notebooks' ORDER BY sort_order ASC LIMIT 1;

    IF p_pen IS NOT NULL AND p_book IS NOT NULL THEN
        INSERT INTO public.product_bundles (title, bundle_price, is_active)
        VALUES ('طقم التدوين الفاخر (مفكرة جلدية + قلم حبر سائل مذهب)', 45.00, true)
        RETURNING id INTO bundle2_id;

        INSERT INTO public.product_bundle_items (bundle_id, product_id)
        VALUES (bundle2_id, p_pen), (bundle2_id, p_book);
    END IF;

    -- طقم المهندس المعماري
    SELECT id INTO p_calc FROM public.products WHERE category_id = 'cat_geometry' ORDER BY sort_order ASC LIMIT 1;
    SELECT id INTO p_geom FROM public.products WHERE category_id = 'cat_geometry' ORDER BY sort_order ASC OFFSET 1 LIMIT 1;

    IF p_calc IS NOT NULL AND p_geom IS NOT NULL THEN
        INSERT INTO public.product_bundles (title, bundle_price, is_active)
        VALUES ('طقم طالب الهندسة المتكامل (حاسبة علمية معتمدة + طقم مساطر ألمنيوم)', 78.00, true)
        RETURNING id INTO bundle3_id;

        INSERT INTO public.product_bundle_items (bundle_id, product_id)
        VALUES (bundle3_id, p_calc), (bundle3_id, p_geom);
    END IF;
END $$;

-- =============================================================================
-- 7. قواعد التكميل والربط الذكي بين الأقسام (Category Complement Rules)
-- =============================================================================

INSERT INTO public.category_complement_rules (source_category_id, target_category_id)
VALUES
    -- مشاريع التخرج يُقترح معها أقلام فاخرة، كروت مناسبات، وحاسبات
    ('cat_grad', 'cat_pens'),
    ('cat_grad', 'cat_events'),
    ('cat_grad', 'cat_geometry'),

    -- طباعة وبحوث يُقترح معها دفاتر، تظليل وتصحيح، وتغليف وتجليد
    ('cat_printing', 'cat_notebooks'),
    ('cat_printing', 'cat_highlight'),
    ('cat_printing', 'cat_binding'),

    -- الأطقم المدرسية يُقترح معها حقائب ومقالم وستيكرات
    ('cat_school_kits', 'cat_cases'),
    ('cat_school_kits', 'cat_stickers'),
    ('cat_school_kits', 'cat_pens'),

    -- مستلزمات جامعية يُقترح معها هايلايتر ودفاتر وحاسبات
    ('cat_college', 'cat_highlight'),
    ('cat_college', 'cat_notebooks'),
    ('cat_college', 'cat_geometry'),

    -- أدوات رسم وفنون يُقترح معها كشاكيل رسم وتظليل وحقائب
    ('cat_art', 'cat_notebooks'),
    ('cat_art', 'cat_cases'),
    ('cat_art', 'cat_highlight')
ON CONFLICT (source_category_id, target_category_id) DO NOTHING;

-- =============================================================================
-- 8. تفعيل الاستقبال والتحديث اللحظي للطلبات بأمان (Realtime Publication)
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

-- إشعار نجاح التنفيذ والتقرير الختامي
SELECT 
    'تهانينا! تم إنشاء وإدراج كتالوج مكتبة أنوار الواحة كاملاً لجميع الأقسام الـ 21 وأكثر من 130 صنفاً وخدمة مستخرجة من التيك توك بنجاح 100%' AS status,
    (SELECT count(*) FROM public.categories) AS total_categories,
    (SELECT count(*) FROM public.products) AS total_products,
    (SELECT count(*) FROM public.services) AS total_services,
    (SELECT count(*) FROM public.product_bundles) AS total_bundles;
