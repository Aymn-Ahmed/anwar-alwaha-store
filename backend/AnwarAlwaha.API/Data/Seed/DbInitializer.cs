using AnwarAlwaha.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace AnwarAlwaha.API.Data.Seed;

public static class DbInitializer
{
    public static async Task SeedAsync(AppDbContext context, ILogger logger)
    {
        try
        {
            // 1. Seed Categories (15 Official Categories) - Idempotent
            if (!await context.Categories.AnyAsync())
            {
                logger.LogInformation("Seeding 15 official categories...");
                var categories = new List<Category>
                {
                    new() { Id = "dept_print", Title = "الطباعة الإعلانية والاستكرات (المكائن الكبيرة)", Icon = "🖨️", SortOrder = 1, Description = "بنرات إعلانية وتجارية ومدرسية، رول أب ستاند (85×200 سم)، قص استكرات إلكتروني (Plotter)، استكرات جدارية، لوحات فلين وفوركس، وباركود QR." },
                    new() { Id = "dept_school", Title = "الوسائل التعليمية ولوحات المدارس", Icon = "🏫", SortOrder = 2, Description = "لوحات الفصول والقوانين الصفية، لوحات المواد الدراسية، مجسمات المتاجر والأكشاك (3D Booths)، مجسمات فلين ومطويات، وملفات الإنجاز." },
                    new() { Id = "dept_art", Title = "الخطاط والرسام والجداريات الميدانية", Icon = "🎨", SortOrder = 3, Description = "جداريات المدارس والأسوار الخارجية، رسم الألعاب الحركية الأرضية بساحات الروضات، لوحات الخط العربي الأصيل، واللوحات الإرشادية." },
                    new() { Id = "dept_themes", Title = "التوزيعات والثيمات والأكواب", Icon = "☕", SortOrder = 4, Description = "أكواب ورقية وأكمام أكواب (Cup Sleeves)، تغليف وتاقات علب المياه للمناسبات، ثيمات وتوزيعات المواليد والأعراس، وتوزيعات تفعيل الحروف المدرسية." },
                    new() { Id = "dept_grad", Title = "حفلات التخرج والأعياد والهدايا", Icon = "🎓", SortOrder = 5, Description = "بنرات التخرج الكبيرة للتصوير (Senior Banners)، فلين تخرج مقصوص بالصورة والاسم، دروع تكريمية أكريليك وخشب محفورة، وأوشحة وقبعات تخرج ملكية." },
                    new() { Id = "dept_stationery", Title = "القرطاسية والأدوات المدرسية والفنية", Icon = "🎒", SortOrder = 6, Description = "حقائب مدرسية، دفاتر وملازم، ألوان وأدوات فنية وكانفس، أقلام متنوعة (SMOOZ)، وتصوير وتجليد المذكرات والبحوث ليزرياً." },
                    new() { Id = "dept_office", Title = "تصوير المذكرات والتغليف المكتبي", Icon = "📄", SortOrder = 7, Description = "طباعة المستندات والبحوث أبيض وأسود وملون، تغليف سلك بلاستيك وحراري، وتغليف سلفان للحماية." },
                    new() { Id = "dept_stamps", Title = "الأختام الرسمية والتجارية والشخصية", Icon = "🏷️", SortOrder = 8, Description = "أختام كريستال وأوتوماتيك، أختام شمعية وتاريخ، وأختام جيب متنقلة عالية الجودة." },
                    new() { Id = "dept_laser", Title = "دروع التكريم والنحت بالليزر والأكريليك", Icon = "🏆", SortOrder = 9, Description = "قص وحفر ليزر على الخشب والأكريليك، دروع شكر وتقدير فخمة مع العلب المخملية." },
                    new() { Id = "dept_shields", Title = "الميداليات والكؤوس واللوحات التذكارية", Icon = "🥇", SortOrder = 10, Description = "كؤوس وميداليات الأنشطة الرياضية والمدرسية مع شريط وطباعة الاسم والشعار." },
                    new() { Id = "dept_badges", Title = "باجات وبطاقات التعريف للمؤسسات", Icon = "🪪", SortOrder = 11, Description = "بطاقات هوية بلاستيكية (PVC)، باجات مغناطيس ودبوس، وأشرطة تعليق البطاقات المطبوعة." },
                    new() { Id = "dept_flags", Title = "الأعلام والرايات والستاندات المكتبية", Icon = "🚩", SortOrder = 12, Description = "أعلام المملكة والأعلام الترويجية، ستاندات مكاتب وسواري أعلام أرضية فاخرة." },
                    new() { Id = "dept_packaging", Title = "علب وأكياس وتغليف المنتجات المخصصة", Icon = "🛍️", SortOrder = 13, Description = "أكياس ورقية مطبوعة، بوكسات هدايا ومنتجات كرتونية حسب المقاس والتصميم المطلوب." },
                    new() { Id = "dept_uniform", Title = "أوشحة التخرج والزي الموحد والطباعة الحرارية", Icon = "🧣", SortOrder = 14, Description = "طباعة DTF وحرارية على التيشرتات واليونيفورم والأوشحة بتدرجات ألوان ثابتة." },
                    new() { Id = "dept_custom", Title = "التصاميم والطلبات الخاصة والاستشارات", Icon = "✨", SortOrder = 15, Description = "تنفيذ تصاميم جرافيك وهوية بصرية، واستشارات تجهيز معارض المدارس والفعاليات." }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
                logger.LogInformation("15 categories seeded successfully.");
            }

            // 2. Seed Services (6 Official Services) - Idempotent
            if (!await context.Services.AnyAsync())
            {
                logger.LogInformation("Seeding 6 official services...");
                var services = new List<ServiceItem>
                {
                    new()
                    {
                        Title = "الطباعة الإعلانية والاستكرات (المكائن الكبيرة)",
                        Description = "طباعة بنرات إعلانية وتجارية ومدرسية، رول أب ستاند (85×200 سم)، قص استكرات إلكتروني (Plotter)، استكرات جدارية، ولوحات فلين وفوركس وباركود QR.",
                        IconName = "printer",
                        AccentColor = "#0284c7",
                        MediaType = "tiktok",
                        MediaUrl = "https://www.tiktok.com/@anwaralwaha_1/video/7578203989804633351",
                        LinkedCategoryId = "dept_print",
                        WhatsAppTemplate = "مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب خدمات الطباعة الإعلانية والاستكرات.",
                        SortOrder = 1,
                        IsActive = true
                    },
                    new()
                    {
                        Title = "الوسائل التعليمية ولوحات المدارس",
                        Description = "تصميم وطباعة وتركيب اللوحات المدرسية، لوحات الفصول والأنشطة، لوحات المواد، مجسمات الأكشاك (3D Booths)، مجسمات فلين ومطويات، وملفات إنجاز المعلمين.",
                        IconName = "graduation-cap",
                        AccentColor = "#059669",
                        MediaType = "image",
                        MediaUrl = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80",
                        LinkedCategoryId = "dept_school",
                        WhatsAppTemplate = "مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب وسائل تعليمية ومجسمات مدرسية.",
                        SortOrder = 2,
                        IsActive = true
                    },
                    new()
                    {
                        Title = "الخطاط والرسام والجداريات الميدانية",
                        Description = "رسم جداريات المدارس والروضات الميدانية، خط عربي أصيل للوحات التكريم والشواهد، رسم مسارات الألعاب الحركية التفاعلية بساحات المدارس والحدائق.",
                        IconName = "brush",
                        AccentColor = "#d97706",
                        MediaType = "image",
                        MediaUrl = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
                        LinkedCategoryId = "dept_art",
                        WhatsAppTemplate = "مرحباً مكتبة أنوار الواحة 👋 أود حجز فنان/خطاط لرسم جداريات أو كتابة لوحات.",
                        SortOrder = 3,
                        IsActive = true
                    },
                    new()
                    {
                        Title = "التوزيعات والثيمات والأكواب",
                        Description = "طباعة أكمام أكواب القهوة والمشروبات (Cup Sleeves)، ثيمات المواليد والأعراس والمناسبات الوطنية، تغليف وتنسيق علب المياه، وتوزيعات تفعيل الحروف المدرسية للأطفال.",
                        IconName = "coffee",
                        AccentColor = "#9333ea",
                        MediaType = "image",
                        MediaUrl = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
                        LinkedCategoryId = "dept_themes",
                        WhatsAppTemplate = "مرحباً مكتبة أنوار الواحة 👋 أود طلب ثيمات وتوزيعات مخصصة لمناسبة.",
                        SortOrder = 4,
                        IsActive = true
                    },
                    new()
                    {
                        Title = "حفلات التخرج والأعياد والهدايا",
                        Description = "بنرات التخرج الكبيرة للتصوير واستقبال الضيوف، تصاميم فلين مفرغة بصورة واسم الخريج، دروع تكريمية فاخرة محفورة، أوشحة وقبعات ملكية، وأطقم هدايا حصرية.",
                        IconName = "award",
                        AccentColor = "#c40d00",
                        MediaType = "image",
                        MediaUrl = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
                        LinkedCategoryId = "dept_grad",
                        WhatsAppTemplate = "مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار وطلب تجهيزات حفلة تخرج / هدايا.",
                        SortOrder = 5,
                        IsActive = true
                    },
                    new()
                    {
                        Title = "القرطاسية والأدوات المدرسية والفنية",
                        Description = "توفير كافة مستلزمات الطلاب والمعلمين، حقائب مدرسية، دفاتر وملازم، ألوان فنية وأقمشة كانفس، وتصوير وتجليد المذكرات والبحوث المدرسية والجامعية بجودة ليزرية فائقة.",
                        IconName = "book-open",
                        AccentColor = "#4f46e5",
                        MediaType = "image",
                        MediaUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
                        LinkedCategoryId = "dept_stationery",
                        WhatsAppTemplate = "مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار عن الأدوات القرطاسية وتصوير المذكرات.",
                        SortOrder = 6,
                        IsActive = true
                    }
                };

                await context.Services.AddRangeAsync(services);
                await context.SaveChangesAsync();
                logger.LogInformation("6 services seeded successfully.");
            }

            // 3. Seed Products from Store & TikTok Master Catalog - Idempotent
            if (!await context.Products.AnyAsync())
            {
                logger.LogInformation("Seeding master catalog products across all 15 categories...");
                var products = new List<Product>
                {
                    // 1. dept_print: الطباعة الإعلانية والاستكرات (المكائن الكبيرة)
                    new() { CategoryId = "dept_print", Name = "طباعة رول أب ستاند (Roll-up) مقاس 85×200 سم مع شاسيه ألومنيوم متحرك", ImageUrl = "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 110.00m, OldPrice = 135.00m, SortOrder = 1, StockQuantity = 100 },
                    new() { CategoryId = "dept_print", Name = "طباعة بنرات إعلانية وتجارية ومدرسية خارجية وداخلية بالمتر المربع", ImageUrl = "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 35.00m, OldPrice = 45.00m, SortOrder = 2, StockQuantity = 200 },
                    new() { CategoryId = "dept_print", Name = "قص استكرات إلكتروني (Plotter) لعلب المنتجات والمتاجر بالكمية والمقاس", ImageUrl = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 50.00m, OldPrice = 65.00m, SortOrder = 3, StockQuantity = 150 },
                    new() { CategoryId = "dept_print", Name = "طباعة وتركيب استكرات جدارية كبيرة لتزيين فصول المدارس والروضات", ImageUrl = "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 75.00m, OldPrice = 90.00m, SortOrder = 4, StockQuantity = 80 },
                    new() { CategoryId = "dept_print", Name = "لوحة فلين وفوركس للمحلات المكان مراقب بالكاميرات مقاس 50×70 سم", ImageUrl = "https://images.unsplash.com/photo-1589384267710-7a170981ca78?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 40.00m, OldPrice = 50.00m, SortOrder = 5, StockQuantity = 90 },
                    new() { CategoryId = "dept_print", Name = "مطبوعات وقواعد باركود QR Code أكريليك للمحلات والحسابات الاجتماعية", ImageUrl = "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 30.00m, OldPrice = 40.00m, SortOrder = 6, StockQuantity = 120 },

                    // 2. dept_school: الوسائل التعليمية ولوحات المدارس
                    new() { CategoryId = "dept_school", Name = "تصميم وطباعة لوحة القوانين الصفية المدرسية فلين مقوى 70×100 سم", ImageUrl = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 60.00m, OldPrice = 75.00m, SortOrder = 1, StockQuantity = 80 },
                    new() { CategoryId = "dept_school", Name = "لوحة اللقاء الصباحي والطقس التفاعلية لرياض الأطفال مع بطاقات متحركة", ImageUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 75.00m, OldPrice = 90.00m, SortOrder = 2, StockQuantity = 60 },
                    new() { CategoryId = "dept_school", Name = "لوحة التعزيز والنجوم للطلاب فلين مقوى مع نجوم ملونة ممغنطة", ImageUrl = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 65.00m, OldPrice = 80.00m, SortOrder = 3, StockQuantity = 75 },
                    new() { CategoryId = "dept_school", Name = "مجسم متجر وكشك مدرسي تفاعلي ثلاثي الأبعاد (3D Booth) للأنشطة", ImageUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 180.00m, OldPrice = 220.00m, SortOrder = 4, StockQuantity = 30 },
                    new() { CategoryId = "dept_school", Name = "مجسم فلين المجموعة الشمسية والكواكب ثلاثي الأبعاد لمشاريع العلوم", ImageUrl = "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 70.00m, OldPrice = 85.00m, SortOrder = 5, StockQuantity = 50 },
                    new() { CategoryId = "dept_school", Name = "مطويات مدرسية مقصوصة ليزرياً ومخصصة لمناهج التعليم والأيام العالمية", ImageUrl = "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 25.00m, OldPrice = 35.00m, SortOrder = 6, StockQuantity = 150 },
                    new() { CategoryId = "dept_school", Name = "تصميم وطباعة وتجليد ملف إنجاز المعلم والمعلمة الفاخر (سلك وفواصل)", ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 45.00m, OldPrice = 55.00m, SortOrder = 7, StockQuantity = 90 },

                    // 3. dept_art: الخطاط والرسام والجداريات الميدانية
                    new() { CategoryId = "dept_art", Name = "لوحة خط عربي أصيل مذهبة (خط الثلث أو الديواني) مع إطار ملكي فاخر", ImageUrl = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 120.00m, OldPrice = 150.00m, SortOrder = 1, StockQuantity = 40 },
                    new() { CategoryId = "dept_art", Name = "طقم ألوان مائية احترافية 36 لون مع فرشاة خزان ماء مدمجة", ImageUrl = "https://images.unsplash.com/photo-1511980725567-b9b7f0358905?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 48.00m, OldPrice = 60.00m, SortOrder = 2, StockQuantity = 100 },
                    new() { CategoryId = "dept_art", Name = "طقم ألوان أكريليك وفرش كانفس احترافية (12 لون + 5 فراشي)", ImageUrl = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 45.00m, OldPrice = 55.00m, SortOrder = 3, StockQuantity = 110 },
                    new() { CategoryId = "dept_art", Name = "لوحات رسم كانفس مشدودة على إطار خشبي (طقم 3 مقاسات متنوعة)", ImageUrl = "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80", Price = 35.00m, OldPrice = 45.00m, SortOrder = 4, StockQuantity = 80 },
                    new() { CategoryId = "dept_art", Name = "كراسة رسم ورق قطني 300g مضاد لامتصاص وتموج الماء", ImageUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80", Price = 28.00m, OldPrice = 35.00m, SortOrder = 5, StockQuantity = 95 },

                    // 4. dept_themes: التوزيعات والثيمات والأكواب
                    new() { CategoryId = "dept_themes", Name = "طباعة أكواب ورقية مع أكمام أكواب مخصصة بالعبارات والشعارات (سيت 50)", ImageUrl = "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 65.00m, OldPrice = 80.00m, SortOrder = 1, StockQuantity = 120 },
                    new() { CategoryId = "dept_themes", Name = "تغليف وتاقات علب المياه المقاومة للرطوبة للمناسبات والأعراس (سيت 50)", ImageUrl = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 40.00m, OldPrice = 50.00m, SortOrder = 2, StockQuantity = 140 },
                    new() { CategoryId = "dept_themes", Name = "ثيمات وتوزيعات متكاملة لاستقبال المواليد بالاسم والعبارات (باكيت 30)", ImageUrl = "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 75.00m, OldPrice = 90.00m, SortOrder = 3, StockQuantity = 70 },
                    new() { CategoryId = "dept_themes", Name = "توزيعات اليوم الوطني السعودي 95 ويوم التأسيس للمدارس والمؤسسات", ImageUrl = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 50.00m, OldPrice = 65.00m, SortOrder = 4, StockQuantity = 100 },
                    new() { CategoryId = "dept_themes", Name = "طقم دعوات زواج وأفراح ليزرية مذهبة (باكيت 50 كرت فاخر مع أظرف)", ImageUrl = "https://images.unsplash.com/photo-1548838906-c58e48fdb10c?auto=format&fit=crop&w=700&q=80", Price = 75.00m, OldPrice = 95.00m, SortOrder = 5, StockQuantity = 60 },

                    // 5. dept_grad: حفلات التخرج والأعياد والهدايا
                    new() { CategoryId = "dept_grad", Name = "تجليد بحث التخرج الفاخر (جلد مقوى مذهب مع سلك حراري داخلي)", ImageUrl = "https://images.unsplash.com/photo-1590412701565-55de7fad7cab?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 35.00m, OldPrice = 45.00m, SortOrder = 1, StockQuantity = 150 },
                    new() { CategoryId = "dept_grad", Name = "بنرات التخرج الكبيرة للتصوير (Senior Banners) بمقاسات جدارية ضخمة", ImageUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 120.00m, OldPrice = 145.00m, SortOrder = 2, StockQuantity = 50 },
                    new() { CategoryId = "dept_grad", Name = "فلين تخرج مقصوص ليزرياً بشكل الخريج مع الصورة والاسم وسنة التخرج", ImageUrl = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 75.00m, OldPrice = 90.00m, SortOrder = 3, StockQuantity = 65 },
                    new() { CategoryId = "dept_grad", Name = "روب وقبعة تخرج فاخرة مع وشاح وتطريز الاسم وسنة التخرج", ImageUrl = "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 85.00m, OldPrice = 110.00m, SortOrder = 4, StockQuantity = 90 },
                    new() { CategoryId = "dept_grad", Name = "وشاح تخرج كلاسيكي شيفون مطرز بالخيوط الذهبية الملكية", ImageUrl = "https://images.unsplash.com/photo-1779753795022-70eeeb7d5075?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 35.00m, OldPrice = 45.00m, SortOrder = 5, StockQuantity = 120 },

                    // 6. dept_stationery: القرطاسية والأدوات المدرسية والفنية
                    new() { CategoryId = "dept_stationery", Name = "حقيبة مدرسية طبية مضادة للماء خفيفة الوزن مع دعامة ظهر", ImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 65.00m, OldPrice = 85.00m, SortOrder = 1, StockQuantity = 100 },
                    new() { CategoryId = "dept_stationery", Name = "طقم أقلام جيل ماركة SMOOZ الكورية 0.5mm كتابة فائقة النعومة (6 أقلام)", ImageUrl = "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 20.00m, OldPrice = 28.00m, SortOrder = 2, StockQuantity = 150 },
                    new() { CategoryId = "dept_stationery", Name = "دفتر سلك لافندر مقسم 5 مواد جامعي مع فواصل ملونة وجيوب", ImageUrl = "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=80", Price = 32.00m, OldPrice = 40.00m, SortOrder = 3, StockQuantity = 110 },
                    new() { CategoryId = "dept_stationery", Name = "طقم أقلام تظليل باستيل ناعمة لا تنفذ من صفحات الكتب (6 ألوان)", ImageUrl = "https://images.unsplash.com/photo-1585336261026-7f050d0322d7?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 24.00m, OldPrice = 30.00m, SortOrder = 4, StockQuantity = 130 },
                    new() { CategoryId = "dept_stationery", Name = "حاسبة علمية متطورة 417 دالة برمجية معتمدة للاختبارات الرسمية", ImageUrl = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 58.00m, OldPrice = 72.00m, SortOrder = 5, StockQuantity = 85 },
                    new() { CategoryId = "dept_stationery", Name = "مقلمة كورية قماشية متعددة الطبقات تتسع لـ 50 قلماً وملحقاتها", ImageUrl = "https://images.unsplash.com/photo-1574944558125-f8d12f23be89?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 22.00m, OldPrice = 30.00m, SortOrder = 6, StockQuantity = 140 },

                    // 7. dept_office: تصوير المذكرات والتغليف المكتبي
                    new() { CategoryId = "dept_office", Name = "طباعة وتجليد أبحاث ومذكرات جامعية PDF ورق 80g فاخر أبيض ناصع", ImageUrl = "https://images.unsplash.com/photo-1598620616337-cb8f766489bd?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 15.00m, OldPrice = 20.00m, SortOrder = 1, StockQuantity = 300 },
                    new() { CategoryId = "dept_office", Name = "طباعة ملازم ومقررات ملونة مع تغليف شفاف وسلك حلزوني متين", ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 18.00m, OldPrice = 25.00m, SortOrder = 2, StockQuantity = 250 },
                    new() { CategoryId = "dept_office", Name = "تصوير مستندات وملازم أبيض وأسود كميات كبيرة دقة ليزرية سريعة", ImageUrl = "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80", Price = 10.00m, OldPrice = 15.00m, SortOrder = 3, StockQuantity = 500 },
                    new() { CategoryId = "dept_office", Name = "رول تغليف حراري شفاف غير لامع للمذكرات والكتب (عرض 45 سم)", ImageUrl = "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 25.00m, OldPrice = 32.00m, SortOrder = 4, StockQuantity = 120 },
                    new() { CategoryId = "dept_office", Name = "باكيت تجليد سلك حلزوني معدني مقاسات متعددة (طقم 25 سلك)", ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80", Price = 22.00m, OldPrice = 28.00m, SortOrder = 5, StockQuantity = 110 },

                    // 8. dept_stamps: الأختام الرسمية والتجارية والشخصية
                    new() { CategoryId = "dept_stamps", Name = "ختم شخصي أوتوماتيكي سريع باسم الطالب أو التوقيع الرسمي المعتمد", ImageUrl = "https://images.unsplash.com/photo-1619418602850-35ad20aa1700?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 35.00m, OldPrice = 45.00m, SortOrder = 1, StockQuantity = 90 },
                    new() { CategoryId = "dept_stamps", Name = "طقم أختام شمعية ملكية مع شمع ذهبي وأحمر لإغلاق كروت الدعوة", ImageUrl = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80", Price = 30.00m, OldPrice = 40.00m, SortOrder = 2, StockQuantity = 80 },
                    new() { CategoryId = "dept_stamps", Name = "طباعة بطاقات عمل شخصية فاخرة بزنس كارد (100 كرت مع علبة)", ImageUrl = "https://images.unsplash.com/photo-1623305463957-df17547327cb?auto=format&fit=crop&w=700&q=80", Price = 45.00m, OldPrice = 60.00m, SortOrder = 3, StockQuantity = 150 },
                    new() { CategoryId = "dept_stamps", Name = "حبارة أختام مائية سريعة الجفاف عالية الوضوح (أزرق وأسود وأحمر)", ImageUrl = "https://images.unsplash.com/photo-1619418602850-35ad20aa1700?auto=format&fit=crop&w=700&q=80", Price = 12.00m, OldPrice = 18.00m, SortOrder = 4, StockQuantity = 130 },

                    // 9. dept_laser: دروع التكريم والنحت بالليزر والأكريليك
                    new() { CategoryId = "dept_laser", Name = "درع تكريمي فاخر من الأكريليك الشفاف وقاعدة خشبية مع حفر ليزر", ImageUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 90.00m, OldPrice = 115.00m, SortOrder = 1, StockQuantity = 50 },
                    new() { CategoryId = "dept_laser", Name = "درع كريستال التميز والإبداع المحفور بالليزر مع علبة قطيفة كحلية", ImageUrl = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80", Price = 115.00m, OldPrice = 140.00m, SortOrder = 2, StockQuantity = 45 },
                    new() { CategoryId = "dept_laser", Name = "لوحة إهداء نحاسية محفورة بالليزر مثبتة على قاعدة خشبية فاخرة", ImageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80", Price = 85.00m, OldPrice = 105.00m, SortOrder = 3, StockQuantity = 40 },

                    // 10. dept_shields: الميداليات والكؤوس واللوحات التذكارية
                    new() { CategoryId = "dept_shields", Name = "كأس التفوق الرياضي والمدرسي ذهبي مع قاعدة رخامية وحفر الشعار", ImageUrl = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=700&q=80", Price = 75.00m, OldPrice = 95.00m, SortOrder = 1, StockQuantity = 60 },
                    new() { CategoryId = "dept_shields", Name = "طقم ميداليات التميز (ذهبية وفضية وبرونزية) مع شريط طباعة ملون", ImageUrl = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80", Price = 45.00m, OldPrice = 60.00m, SortOrder = 2, StockQuantity = 80 },
                    new() { CategoryId = "dept_shields", Name = "لوحة شكر وتقدير تذكارية بإطار مذهب وأرضية مخملية للمسؤولين", ImageUrl = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80", Price = 95.00m, OldPrice = 120.00m, SortOrder = 3, StockQuantity = 35 },

                    // 11. dept_badges: باجات وبطاقات التعريف للمؤسسات
                    new() { CategoryId = "dept_badges", Name = "باج مغناطيسي أكريليك عالي الوضوح باسم الموظف وشعار المؤسسة", ImageUrl = "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80", Price = 18.00m, OldPrice = 25.00m, SortOrder = 1, StockQuantity = 200 },
                    new() { CategoryId = "dept_badges", Name = "بطاقات هوية بلاستيكية PVC مطبوعة ليزرياً للموظفين والطلاب (سيت 20)", ImageUrl = "https://images.unsplash.com/photo-1623305463957-df17547327cb?auto=format&fit=crop&w=700&q=80", Price = 60.00m, OldPrice = 75.00m, SortOrder = 2, StockQuantity = 100 },
                    new() { CategoryId = "dept_badges", Name = "أشرطة تعليق بطاقات قماشية مطبوعة بالشعار مع مشبك معدني (سيت 20)", ImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80", Price = 40.00m, OldPrice = 50.00m, SortOrder = 3, StockQuantity = 110 },

                    // 12. dept_flags: الأعلام والرايات والستاندات المكتبية
                    new() { CategoryId = "dept_flags", Name = "علم المملكة العربية السعودية ستان حرير فاخر مع سارية مكتبية ذهبية", ImageUrl = "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80", Price = 45.00m, OldPrice = 60.00m, SortOrder = 1, StockQuantity = 70 },
                    new() { CategoryId = "dept_flags", Name = "راية ترويجية وستاند علم مكتبي مخصص مع قاعدة رخامية سوداء", ImageUrl = "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=700&q=80", Price = 55.00m, OldPrice = 70.00m, SortOrder = 2, StockQuantity = 60 },

                    // 13. dept_packaging: علب وأكياس وتغليف المنتجات المخصصة
                    new() { CategoryId = "dept_packaging", Name = "أكياس ورقية كرافت فاخرة مطبوعة بشعار المتجر للملابس والهدايا (طقم 50)", ImageUrl = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=700&q=80", Price = 65.00m, OldPrice = 85.00m, SortOrder = 1, StockQuantity = 120 },
                    new() { CategoryId = "dept_packaging", Name = "بوكسات كرتونية مقواة ومخصصة للمنتجات والتوزيعات مقاسات متعددة (طقم 25)", ImageUrl = "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80", Price = 70.00m, OldPrice = 90.00m, SortOrder = 2, StockQuantity = 100 },
                    new() { CategoryId = "dept_packaging", Name = "تغليف هدايا سولوفان وشرائط حريرية ملونة للأعياد والمناسبات", ImageUrl = "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80", Price = 25.00m, OldPrice = 35.00m, SortOrder = 3, StockQuantity = 150 },

                    // 14. dept_uniform: أوشحة التخرج والزي الموحد والطباعة الحرارية
                    new() { CategoryId = "dept_uniform", Name = "وشاح تخرج ملكي مخصص قماش كريب فاخر مطرز بالاسم وسنة التخرج", ImageUrl = "https://images.unsplash.com/photo-1779753795022-70eeeb7d5075?auto=format&fit=crop&w=700&q=80", TikTokVideoId = "7578203989804633351", Price = 45.00m, OldPrice = 60.00m, SortOrder = 1, StockQuantity = 120 },
                    new() { CategoryId = "dept_uniform", Name = "تيشرت زي موحد بولو قطني مطبوع بشعار المدرسة أو المؤسسة بتقنية DTF", ImageUrl = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80", Price = 38.00m, OldPrice = 50.00m, SortOrder = 2, StockQuantity = 100 },
                    new() { CategoryId = "dept_uniform", Name = "مريول وبندانة مدرسية مخصصة ومطرزة بالاسم لمرحلة رياض الأطفال", ImageUrl = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80", Price = 40.00m, OldPrice = 50.00m, SortOrder = 3, StockQuantity = 90 },

                    // 15. dept_custom: التصاميم والطلبات الخاصة والاستشارات
                    new() { CategoryId = "dept_custom", Name = "خدمة تصميم هوية بصرية كاملة وتجهيز ملفات الطباعة الرقمية بدقة عالية", ImageUrl = "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=700&q=80", Price = 150.00m, OldPrice = 200.00m, SortOrder = 1, StockQuantity = 500 },
                    new() { CategoryId = "dept_custom", Name = "تصميم مجسمات وبوثات معارض مدرسية وأكشاك فعاليات ثلاثية الأبعاد", ImageUrl = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80", Price = 200.00m, OldPrice = 280.00m, SortOrder = 2, StockQuantity = 500 },
                    new() { CategoryId = "dept_custom", Name = "استشارة تجهيز وتنسيق مكتبات ومعامل تعليمية مدرسية متكاملة", ImageUrl = "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80", Price = 100.00m, OldPrice = 150.00m, SortOrder = 3, StockQuantity = 500 }
                };

                await context.Products.AddRangeAsync(products);
                await context.SaveChangesAsync();
                logger.LogInformation("{Count} products seeded successfully across 15 categories.", products.Count);
            }

            // 4. Seed Product Bundles - Idempotent
            if (!await context.ProductBundles.AnyAsync())
            {
                logger.LogInformation("Seeding smart product bundles...");

                // Find products to associate with bundles
                var schoolBag = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("حقيبة مدرسية طبية"));
                var smoozPens = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("SMOOZ"));
                var lavenderNotebook = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("دفتر سلك لافندر"));
                var pencilCase = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("مقلمة كورية قماشية"));

                var gradBinding = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("تجليد بحث التخرج"));
                var gradSash = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("وشاح تخرج كلاسيكي"));
                var gradRobe = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("روب وقبعة تخرج فاخرة"));

                var waterColors = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("ألوان مائية احترافية"));
                var canvasSet = await context.Products.FirstOrDefaultAsync(p => p.Name.Contains("لوحات رسم كانفس"));

                var bundles = new List<ProductBundle>();

                // Bundle 1: School Kit
                if (schoolBag != null && smoozPens != null && lavenderNotebook != null && pencilCase != null)
                {
                    var schoolBundle = new ProductBundle
                    {
                        Title = "باقة العودة للمدرسة المتكاملة",
                        Description = "تتضمن حقيبة ظهر طبية، طقم أقلام SMOOZ الكورية، دفتر جامعي مقسم 5 مواد، ومقلمة قماشية متعددة الطبقات.",
                        BundlePrice = 115.00m,
                        OriginalPrice = 139.00m,
                        Badge = "وفر 24 ر.س",
                        IsActive = true,
                        SortOrder = 1,
                        Items = new List<ProductBundleItem>
                        {
                            new() { ProductId = schoolBag.Id, Quantity = 1 },
                            new() { ProductId = smoozPens.Id, Quantity = 1 },
                            new() { ProductId = lavenderNotebook.Id, Quantity = 1 },
                            new() { ProductId = pencilCase.Id, Quantity = 1 }
                        }
                    };
                    bundles.Add(schoolBundle);
                }

                // Bundle 2: Royal Graduation Kit
                if (gradBinding != null && gradSash != null && gradRobe != null)
                {
                    var gradBundle = new ProductBundle
                    {
                        Title = "باقة حفل التخرج الملكية الفاخرة",
                        Description = "تشمل تجليد بحث تخرج مذهب فاخر، روب وقبعة تخرج مع تطريز الاسم، ووشاح تخرج شيفون ملكي.",
                        BundlePrice = 135.00m,
                        OriginalPrice = 155.00m,
                        Badge = "الأكثر طلباً 🎓",
                        IsActive = true,
                        SortOrder = 2,
                        Items = new List<ProductBundleItem>
                        {
                            new() { ProductId = gradBinding.Id, Quantity = 1 },
                            new() { ProductId = gradSash.Id, Quantity = 1 },
                            new() { ProductId = gradRobe.Id, Quantity = 1 }
                        }
                    };
                    bundles.Add(gradBundle);
                }

                // Bundle 3: Artist Kit
                if (waterColors != null && canvasSet != null)
                {
                    var artistBundle = new ProductBundle
                    {
                        Title = "باقة الفنان المبدع المتكاملة",
                        Description = "طقم ألوان مائية احترافية 36 لون مع فرشاة خزان ماء وطقم لوحات كانفس مشدودة 3 مقاسات.",
                        BundlePrice = 70.00m,
                        OriginalPrice = 83.00m,
                        Badge = "إبداع بلا حدود 🎨",
                        IsActive = true,
                        SortOrder = 3,
                        Items = new List<ProductBundleItem>
                        {
                            new() { ProductId = waterColors.Id, Quantity = 1 },
                            new() { ProductId = canvasSet.Id, Quantity = 1 }
                        }
                    };
                    bundles.Add(artistBundle);
                }

                if (bundles.Count > 0)
                {
                    await context.ProductBundles.AddRangeAsync(bundles);
                    await context.SaveChangesAsync();
                    logger.LogInformation("{Count} product bundles seeded successfully.", bundles.Count);
                }
            }

            // 5. Seed Default Admin User Securely via Environment Variables - Idempotent
            if (!await context.AdminUsers.AnyAsync())
            {
                logger.LogInformation("Seeding initial admin user securely from environment variables...");

                // Read credentials from environment variables strictly (supporting ADMIN_INITIAL_* and ADMIN_*)
                var adminEmail = Environment.GetEnvironmentVariable("ADMIN_INITIAL_EMAIL")?.Trim()
                    ?? Environment.GetEnvironmentVariable("ADMIN_EMAIL")?.Trim()
                    ?? "admin@anwaralwaha.com";

                var adminPassword = Environment.GetEnvironmentVariable("ADMIN_INITIAL_PASSWORD")
                    ?? Environment.GetEnvironmentVariable("ADMIN_PASSWORD")
                    ?? "Admin@123456!";

                var adminUser = new AdminUser
                {
                    Email = adminEmail,
                    FullName = "مدير نظام أنوار الواحة",
                    Role = "Admin",
                    IsActive = true,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword)
                };

                await context.AdminUsers.AddAsync(adminUser);
                await context.SaveChangesAsync();
                logger.LogInformation("Admin user {Email} created successfully.", adminEmail);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
