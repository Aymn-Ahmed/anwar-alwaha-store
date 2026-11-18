-- =============================================================================
-- مكتبة أنوار الواحة - كود إعداد قاعدة البيانات والتخزين (Supabase Setup SQL)
-- =============================================================================
-- انسخ هذا الكود بالكامل، ثم توجه إلى لوحة تحكم سوبابيز:
-- 1. اضغط على أيقونة (SQL Editor) من القائمة الجانبية اليسرى.
-- 2. اضغط على (+ New Query) ثم الصق هذا الكود كاملاً.
-- 3. اضغط على زر (Run) الأخضر لتنفيذه دفعة واحدة.
-- =============================================================================

-- 1. إنشاء جدول الأقسام (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📦',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. إنشاء جدول المنتجات / الأصناف (products)
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

-- 2.1 إنشاء جدول المنتجات المكملة (product_complements)
CREATE TABLE IF NOT EXISTS public.product_complements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    complement_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, complement_id)
);

-- 3. تفعيل نظام حماية البيانات (Row Level Security - RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_complements ENABLE ROW LEVEL SECURITY;

-- 4. سياسات الوصول لجدول الأقسام (categories policies)
-- السماح لجميع الزوار بقراءة الأقسام
DROP POLICY IF EXISTS "قراءة الأقسام للجميع" ON public.categories;
CREATE POLICY "قراءة الأقسام للجميع" 
ON public.categories FOR SELECT 
USING (true);

-- السماح للمسؤولين المسجلين فقط (Authenticated) بإضافة وتعديل وحذف الأقسام
DROP POLICY IF EXISTS "إضافة الأقسام للمسؤولين" ON public.categories;
CREATE POLICY "إضافة الأقسام للمسؤولين" 
ON public.categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "تعديل الأقسام للمسؤولين" ON public.categories;
CREATE POLICY "تعديل الأقسام للمسؤولين" 
ON public.categories FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "حذف الأقسام للمسؤولين" ON public.categories;
CREATE POLICY "حذف الأقسام للمسؤولين" 
ON public.categories FOR DELETE 
TO authenticated 
USING (true);

-- 5. سياسات الوصول لجدول المنتجات (products policies)
-- السماح لجميع الزوار بقراءة المنتجات
DROP POLICY IF EXISTS "قراءة المنتجات للجميع" ON public.products;
CREATE POLICY "قراءة المنتجات للجميع" 
ON public.products FOR SELECT 
USING (true);

-- السماح للمسؤولين المسجلين فقط بإضافة وتعديل وحذف المنتجات
DROP POLICY IF EXISTS "إضافة المنتجات للمسؤولين" ON public.products;
CREATE POLICY "إضافة المنتجات للمسؤولين" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "تعديل المنتجات للمسؤولين" ON public.products;
CREATE POLICY "تعديل المنتجات للمسؤولين" 
ON public.products FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "حذف المنتجات للمسؤولين" ON public.products;
CREATE POLICY "حذف المنتجات للمسؤولين" 
ON public.products FOR DELETE 
TO authenticated 
USING (true);

-- 5.1 سياسات الوصول لجدول المنتجات المكملة (product_complements policies)
DROP POLICY IF EXISTS "قراءة المنتجات المكملة للجميع" ON public.product_complements;
CREATE POLICY "قراءة المنتجات المكملة للجميع" 
ON public.product_complements FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "إدارة المنتجات المكملة للمسؤولين" ON public.product_complements;
CREATE POLICY "إدارة المنتجات المكملة للمسؤولين" 
ON public.product_complements FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- =============================================================================
-- 6. إنشاء حاوية التخزين لصور المنتجات (Storage Bucket)
-- =============================================================================

-- إنشاء حاوية عامة للصور باسم "products-images"
INSERT INTO storage.buckets (id, name, public)
VALUES ('products-images', 'products-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- سياسة قراءة الصور للجميع (Public Read)
DROP POLICY IF EXISTS "قراءة صور المنتجات للجميع" ON storage.objects;
CREATE POLICY "قراءة صور المنتجات للجميع" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products-images');

-- سياسة رفع الصور للمسؤولين المسجلين فقط (Authenticated Upload)
DROP POLICY IF EXISTS "رفع صور المنتجات للمسؤولين" ON storage.objects;
CREATE POLICY "رفع صور المنتجات للمسؤولين" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products-images');

-- سياسة تعديل وحذف الصور للمسؤولين المسجلين فقط
DROP POLICY IF EXISTS "تعديل صور المنتجات للمسؤولين" ON storage.objects;
CREATE POLICY "تعديل صور المنتجات للمسؤولين" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'products-images');

DROP POLICY IF EXISTS "حذف صور المنتجات للمسؤولين" ON storage.objects;
CREATE POLICY "حذف صور المنتجات للمسؤولين" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'products-images');

-- =============================================================================
-- 7. بيانات مبدئية تلقائية (الأقسام الـ 6 الرسمية لمكتبة أنوار الواحة)
-- =============================================================================
INSERT INTO public.categories (id, title, description, icon, sort_order)
VALUES 
    ('dept_print', 'الطباعة الإعلانية والاستكرات', 'بنرات إعلانية وتجارية، رول أب، استكرات مقصوصة إلكترونياً، ولوحات فلين وفوركس وباركود QR.', '🖨️', 1),
    ('dept_school', 'الوسائل التعليمية ولوحات المدارس', 'تصميم وتركيب اللوحات المدرسية، القوانين الصفية، مجسمات الأكشاك والمطويات وملفات الإنجاز.', '🏫', 2),
    ('dept_art', 'الخطاط والرسام والجداريات الميدانية', 'رسم جداريات المدارس والمحلات، كتابة خط عربي يدوي فاخر، كروت مناسبات، وشعارات مخصصة.', '🎨', 3),
    ('dept_themes', 'التوزيعات والثيمات والأكواب', 'تصميم وطباعة ثيمات المناسبات، طباعة حرارية على الأكواب، باقات بالونات وتغليف هدايا.', '☕', 4),
    ('dept_grad', 'حفلات التخرج والأعياد والهدايا', 'أرواب وأوشحة تخرج مطرزة، دروع تكريمية كرستال وخشب، وهدايا تخرج وأعياد فاخرة.', '🎓', 5),
    ('dept_stationery', 'القرطاسية والأدوات المدرسية والفنية', 'حقائب مدرسية، دفاتر، أقلام ماركات، ألوان فنية وكانفس، وتصوير وتجليد مذكرات ليزري.', '🎒', 6)
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

-- بيانات مبدئية لبعض المنتجات النموذجية
INSERT INTO public.products (category_id, name, image_url, tiktok_video_id, price, sort_order)
VALUES 
    ('dept_print', 'بنر إعلاني تجاري ومدرسي فاخر بأي مقاس', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80', '7435123456789', 55, 1),
    ('dept_print', 'رول أب ستاند (Roll-up) مقاس 85×200 سم مع شاسيه ألومنيوم', 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80', '7435987654321', 120, 2),
    ('dept_school', 'لوحة القوانين الصفية والتعزيز المدرسي', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80', '', 45, 1),
    ('dept_school', 'مجسمات تعليمية للأكشاك المدرسية و 3D Booths', 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80', '', 180, 2),
    ('dept_art', 'تنفيذ جدارية مدرسية أو تجارية ملونة بألوان مقاومة', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80', '', 250, 1),
    ('dept_art', 'كتابة خط عربي يدوي لشهادات الشكر والدروع والمناسبات', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80', '', 35, 2),
    ('dept_themes', 'طباعة حرارية مخصصة على الأكواب السيراميك والمعدنية', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80', '', 25, 1),
    ('dept_themes', 'ثيمات وبطاقات هدايا وتوزيعات مواليد وتخرج', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80', '', 15, 2),
    ('dept_grad', 'روب وقبعة تخرج فاخرة مع وشاح وتطريز الاسم وسنة التخرج', 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=700&q=80', '', 85, 1),
    ('dept_grad', 'درع تكريمي فاخر من الكريستال والخشب مع عبارة مذهبة', 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=700&q=80', '', 95, 2),
    ('dept_stationery', 'حقيبة مدرسية متينة مع أطقم مقالم ودفاتر وألوان متكاملة', 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80', '', 110, 1),
    ('dept_stationery', 'طقم أقلام حبر وألوان رسم كانفس وأكريليك للمبدعين', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80', '', 40, 2)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. نظام المجموعات المترابطة وقواعد ربط الأقسام (Intelligent 3-Tier Complements)
-- =============================================================================

-- 8.1 جدول مجموعات التكميل المتبادلة (complement_groups)
CREATE TABLE IF NOT EXISTS public.complement_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8.2 جدول عناصر المجموعات المترابطة (complement_group_items)
CREATE TABLE IF NOT EXISTS public.complement_group_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.complement_groups(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(group_id, product_id)
);

-- 8.3 جدول قواعد الربط بين الأقسام (category_complement_rules)
CREATE TABLE IF NOT EXISTS public.category_complement_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    target_category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(source_category_id, target_category_id)
);

-- تفعيل حماية البيانات (Row Level Security - RLS)
ALTER TABLE public.complement_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complement_group_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_complement_rules ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة للجميع (Public Read)
DROP POLICY IF EXISTS "قراءة مجموعات التكميل للجميع" ON public.complement_groups;
CREATE POLICY "قراءة مجموعات التكميل للجميع" 
ON public.complement_groups FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "قراءة عناصر المجموعات للجميع" ON public.complement_group_items;
CREATE POLICY "قراءة عناصر المجموعات للجميع" 
ON public.complement_group_items FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "قراءة قواعد ربط الأقسام للجميع" ON public.category_complement_rules;
CREATE POLICY "قراءة قواعد ربط الأقسام للجميع" 
ON public.category_complement_rules FOR SELECT 
USING (true);

-- سياسات الإدارة الكاملة للمسؤولين المسجلين (Authenticated CRUD)
DROP POLICY IF EXISTS "إدارة مجموعات التكميل للمسؤولين" ON public.complement_groups;
CREATE POLICY "إدارة مجموعات التكميل للمسؤولين" 
ON public.complement_groups FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "إدارة عناصر المجموعات للمسؤولين" ON public.complement_group_items;
CREATE POLICY "إدارة عناصر المجموعات للمسؤولين" 
ON public.complement_group_items FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "إدارة قواعد الأقسام للمسؤولين" ON public.category_complement_rules;
CREATE POLICY "إدارة قواعد الأقسام للمسؤولين" 
ON public.category_complement_rules FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- =============================================================================
-- 9. جدول الطلبات وتتبع المراحل الخمس (orders)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    delivery_method TEXT DEFAULT 'branch',
    status TEXT DEFAULT 'pending', -- pending, processing, ready, shipping, delivered
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    customer_notes TEXT,
    admin_notes TEXT,
    is_reviewed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- إضافة عمود is_reviewed في حال كان الجدول موجوداً مسبقاً
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT false;

-- تفعيل حماية البيانات (RLS) لجدول الطلبات
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "قراءة الطلبات للجميع" ON public.orders;
CREATE POLICY "قراءة الطلبات للجميع" 
ON public.orders FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "إضافة طلب للجميع" ON public.orders;
CREATE POLICY "إضافة طلب للجميع" 
ON public.orders FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "تحديث حالة التقييم للجميع" ON public.orders;
CREATE POLICY "تحديث حالة التقييم للجميع" 
ON public.orders FOR UPDATE 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "إدارة الطلبات للمسؤولين" ON public.orders;
CREATE POLICY "إدارة الطلبات للمسؤولين" 
ON public.orders FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- تفعيل الاستماع اللحظي (Supabase Realtime) وتحديث السجلات الكامل لجدول الطلبات
ALTER TABLE public.orders REPLICA IDENTITY FULL;

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

-- =============================================================================
-- 10. إنشاء جدول تقييمات المنتجات بالوسائط المتعددة (product_reviews)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    order_code TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb, -- مصفوفة روابط الصور والفيديو
    is_approved BOOLEAN DEFAULT true, -- للتحكم من لوحة الإدارة
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(order_code, product_id) -- منع تكرار تقييم نفس المنتج في نفس الطلب
);

-- تفعيل الحماية RLS لجدول التقييمات
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "قراءة التقييمات المعتمدة للجميع" ON public.product_reviews;
CREATE POLICY "قراءة التقييمات المعتمدة للجميع" 
ON public.product_reviews FOR SELECT 
USING (is_approved = true);

DROP POLICY IF EXISTS "إضافة تقييم للجميع" ON public.product_reviews;
CREATE POLICY "إضافة تقييم للجميع" 
ON public.product_reviews FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "إدارة التقييمات للمسؤولين" ON public.product_reviews;
CREATE POLICY "إدارة التقييمات للمسؤولين" 
ON public.product_reviews FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- =============================================================================
-- 11. إنشاء Bucket لتخزين صور وفيديوهات تقييمات العملاء (reviews-media)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('reviews-media', 'reviews-media', true)
ON CONFLICT (id) DO NOTHING;

-- صلاحيات رفع وعرض وسائط التقييمات
DROP POLICY IF EXISTS "عرض وسائط التقييمات للجميع" ON storage.objects;
CREATE POLICY "عرض وسائط التقييمات للجميع"
ON storage.objects FOR SELECT 
USING (bucket_id = 'reviews-media');

DROP POLICY IF EXISTS "رفع وسائط التقييمات للجميع" ON storage.objects;
CREATE POLICY "رفع وسائط التقييمات للجميع"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'reviews-media');

-- =============================================================================
-- 12. نظام الباقات والأطقم الذكية (product_bundles & product_bundle_items)
-- =============================================================================

-- 1. جدول الباقات والأطقم (يتحكم فيه المدير بالكامل)
CREATE TABLE IF NOT EXISTS public.product_bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL, -- اسم الباقة مثل: طقم التخرج الملكي
    bundle_price NUMERIC NOT NULL, -- السعر النهائي للباقة بعد الخصم المعتمد من المدير
    is_active BOOLEAN DEFAULT true, -- لتفعيل أو إيقاف الباقة بضغطة زر
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. جدول المنتجات المشمولة داخل كل باقة
CREATE TABLE IF NOT EXISTS public.product_bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID REFERENCES public.product_bundles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(bundle_id, product_id)
);

-- 3. تفعيل الحماية RLS لجدول الباقات ومشتملاتها
ALTER TABLE public.product_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bundle_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "قراءة الباقات المفعلة للجميع" ON public.product_bundles;
CREATE POLICY "قراءة الباقات المفعلة للجميع" 
ON public.product_bundles FOR SELECT USING (true);

DROP POLICY IF EXISTS "قراءة عناصر الباقات للجميع" ON public.product_bundle_items;
CREATE POLICY "قراءة عناصر الباقات للجميع" 
ON public.product_bundle_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "إدارة الباقات للمسؤولين" ON public.product_bundles;
CREATE POLICY "إدارة الباقات للمسؤولين" 
ON public.product_bundles FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "إدارة عناصر الباقات للمسؤولين" ON public.product_bundle_items;
CREATE POLICY "إدارة عناصر الباقات للمسؤولين" 
ON public.product_bundle_items FOR ALL TO authenticated USING (true) WITH CHECK (true);





-- =============================================================================
-- 13. نظام إدارة الخدمات المتكاملة (services)
-- =============================================================================

-- 1. جدول الخدمات المدارة من لوحة التحكم
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL, -- اسم الخدمة
    description TEXT NOT NULL, -- وصف الخدمة ومميزاتها
    icon_name TEXT DEFAULT 'sparkles', -- أيقونة الخدمة
    accent_color TEXT DEFAULT '#1e293b', -- لون البطاقة/الأيقونة
    media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video', 'tiktok')),
    media_url TEXT, -- رابط الصورة المرفوعة أو الفيديو أو رابط تيك توك
    linked_category_id TEXT, -- ربط اختياري بأحد الأقسام
    whatsapp_template TEXT, -- نص رسالة الواتساب الجاهزة لهذه الخدمة
    sort_order INTEGER DEFAULT 0, -- ترتيب ظهور الخدمة
    is_active BOOLEAN DEFAULT true, -- إظهار أو إخفاء الخدمة
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. تفعيل الحماية RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "قراءة الخدمات المفعلة للجميع" ON public.services;
CREATE POLICY "قراءة الخدمات المفعلة للجميع" 
ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "إدارة الخدمات للمسؤولين" ON public.services;
CREATE POLICY "إدارة الخدمات للمسؤولين" 
ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. تعبئة الخدمات الـ 6 الأساسية كبيانات أولية قابلة للتعديل والحذف من لوحة التحكم
INSERT INTO public.services (title, description, icon_name, accent_color, sort_order) 
SELECT 'الطباعة الإعلانية والاستكرات', 'طباعة البنرات والاستكرات والرول أب للمحلات والمعارض، وقص الليزر على الأكريليك والخشب.', 'printer', '#0284c7', 1
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'الطباعة الإعلانية والاستكرات');

INSERT INTO public.services (title, description, icon_name, accent_color, sort_order) 
SELECT 'الوسائل التعليمية ولوحات المدارس', 'تصميم وتنفيذ اللوحات التعليمية، المجسمات العلمية، الخرائط، والتغليف الحراري بجميع المقاسات.', 'book', '#d97706', 2
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'الوسائل التعليمية ولوحات المدارس');

INSERT INTO public.services (title, description, icon_name, accent_color, sort_order) 
SELECT 'الخطاط والرسام والجداريات الميدانية', 'تنفيذ الجداريات المدرسية والتجارية في خميس مشيط والخط العربي اليدوي على اللوحات والشهادات.', 'palette', '#4f46e5', 3
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'الخطاط والرسام والجداريات الميدانية');

INSERT INTO public.services (title, description, icon_name, accent_color, sort_order) 
SELECT 'التوزيعات والثيمات والأكواب', 'الطباعة الحرارية على الأكواب والتيشيرتات وعلب التوزيعات وتصميم ثيمات المناسبات الخاصة.', 'coffee', '#e11d48', 4
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'التوزيعات والثيمات والأكواب');

INSERT INTO public.services (title, description, icon_name, accent_color, sort_order) 
SELECT 'حفلات التخرج والأعياد والهدايا', 'تطريز أوشحة وقبعات التخرج بالاسم للأفراد والدفعات، وتجهيز الدروع والهدايا التذكارية.', 'graduation', '#059669', 5
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE title = 'حفلات التخرج والأعياد والهدايا');

INSERT INTO public.services (title, description, icon_name, accent_color, sort_order) 
SELECT 'القرطاسية والأدوات المدرسية والفنية', 'تشكيلة متكاملة من الحقائب المدرسية والدفاتر والكراسات، وقسم الألوان والأدوات الفنية، وتصوير المذكرات.', 'backpack', '#ea580c', 6
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE title IN ('القرطاسية والأدوات المدرسية والفنية', 'طباعة وتجليد البحوث والمذكرات'));
