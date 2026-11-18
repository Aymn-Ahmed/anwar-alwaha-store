// =========================================================================
// MAKTABAH - Constants, Icons, and Utility Functions (js/constants.js)
// =========================================================================

var { useState, useEffect, useMemo, useRef } = React;
window.useState = React.useState;
window.useEffect = React.useEffect;
window.useMemo = React.useMemo;
window.useRef = React.useRef;

    var FALLBACK_IMG = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%23f3f4f6%22%20stroke%3D%22%23e5e7eb%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2257%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%3E%F0%9F%93%9A%3C%2Ftext%3E%3C%2Fsvg%3E";

    // =========================================================================
    // الرمز الرسمي الجديد للريال السعودي (Saudi Riyal Official SAMA Symbol)
    // =========================================================================
    function SarSymbol({ className = "w-3.5 h-3.5 inline-block mx-0.5 text-current align-baseline", style }) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1124.14 1256.39"
          className={className}
          style={style}
          fill="currentColor"
          aria-label="ريال سعودي"
        >
          <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
          <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
        </svg>
      );
    }

    // =========================================================================
    // مكون عرض السعر بأسلوب المتاجر العالمية (SHEIN Price Typography)
    // الرقم الرئيسي بخط عريض (800) والكسور العشرية أصغر مع رمز الريال الرسمي
    // =========================================================================
    function PriceTag({
      price,
      size = "md", // "xs", "sm", "md", "lg", "xl"
      className = "text-[#c40d00]",
      showDecimals = true,
      originalPrice = null
    }) {
      if (price === null || price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
        return (
          <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
            السعر حسب الطلب
          </span>
        );
      }

      const num = Number(price);
      const intPart = Math.floor(num);
      const decPart = (num % 1 !== 0) ? (num - intPart).toFixed(2).slice(1) : (showDecimals ? '.00' : '');

      let intClass = "text-base";
      let decClass = "text-[11px]";
      let symClass = "w-3 h-3";

      if (size === "xs") {
        intClass = "text-xs";
        decClass = "text-[9px]";
        symClass = "w-2.5 h-2.5";
      } else if (size === "sm") {
        intClass = "text-sm";
        decClass = "text-[10px]";
        symClass = "w-2.5 h-2.5";
      } else if (size === "md") {
        intClass = "text-base sm:text-lg";
        decClass = "text-xs";
        symClass = "w-3 h-3 sm:w-3.5 sm:h-3.5";
      } else if (size === "lg") {
        intClass = "text-xl sm:text-2xl";
        decClass = "text-sm";
        symClass = "w-4 h-4";
      } else if (size === "xl") {
        intClass = "text-2xl sm:text-3xl";
        decClass = "text-base";
        symClass = "w-5 h-5";
      }

      return (
        <span className={`inline-flex items-baseline gap-0.5 ${className}`} dir="ltr">
          <span className={`${intClass} font-[800] tracking-tight leading-none`}>
            {intPart}
          </span>
          {decPart && (
            <span className={`${decClass} font-bold opacity-80 leading-none`}>
              {decPart}
            </span>
          )}
          <span className="inline-flex items-center ml-1 text-current self-center" dir="rtl">
            <SarSymbol className={symClass} />
          </span>
          {originalPrice && Number(originalPrice) > num && (
            <span className="text-xs text-zinc-400 line-through mr-1 font-normal" dir="ltr">
              {Number(originalPrice).toFixed(0)}
            </span>
          )}
        </span>
      );
    }

    // --- تبويبات الرأس العلوية في الهوم ---
    var TABS = [
      { id: 'all', title: 'الكل' },
      { id: 'cat_printing', title: 'طباعة وبحوث' },
      { id: 'cat_grad', title: 'مشاريع تخرج' },
      { id: 'cat_events', title: 'دعوات ومناسبات' },
      { id: 'cat_art', title: 'أدوات رسم وفنون' },
    ];

    // --- بنرات العروض العلوية ---
    var HERO_SLIDES = [
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


    var MAKTABAH_15_CATEGORIES = [
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

    async function getComplementaryProducts(currentProduct, allProducts) {
      if (!currentProduct || !allProducts || allProducts.length === 0) return [];

      const maxLimit = 4;
      const currentId = String(currentProduct.id);
      const currentCatId = currentProduct.category_id || currentProduct.categoryKey;
      const seenIds = new Set([currentId]);
      let recommended = [];

      const addCandidate = (p) => {
        if (!p) return;
        const pid = String(p.id);
        if (!seenIds.has(pid)) {
          seenIds.add(pid);
          recommended.push(p);
        }
      };

      const client = window.SUPABASE_CONFIG?.isConfigured?.() ? window.SUPABASE_CONFIG.getClient() : null;

      // -----------------------------------------------------------------------
      // المستوى 1: المجموعات المتبادلة (Mutual Complement Groups)
      // -----------------------------------------------------------------------
      if (client && currentProduct.id) {
        try {
          // جلب المجموعات التي ينتمي إليها هذا المنتج
          const { data: memberItems, error: itemErr } = await client
            .from('complement_group_items')
            .select('group_id')
            .eq('product_id', currentProduct.id);

          if (!itemErr && memberItems && memberItems.length > 0) {
            const candidateGroupIds = [...new Set(memberItems.map(m => m.group_id))];

            // التحقق من تفعيل المجموعات (is_active = true)
            const { data: activeGroups, error: grpErr } = await client
              .from('complement_groups')
              .select('id')
              .in('id', candidateGroupIds)
              .eq('is_active', true);

            if (!grpErr && activeGroups && activeGroups.length > 0) {
              const activeGroupIds = activeGroups.map(g => g.id);

              // جلب العناصر الشقيقة في نفس المجموعات النشطة
              const { data: siblings, error: sibErr } = await client
                .from('complement_group_items')
                .select('product_id')
                .in('group_id', activeGroupIds)
                .neq('product_id', currentProduct.id);

              if (!sibErr && siblings && siblings.length > 0) {
                for (const row of siblings) {
                  if (recommended.length >= maxLimit) break;
                  const match = allProducts.find(p => String(p.id) === String(row.product_id));
                  if (match) addCandidate(match);
                }
              }
            }
          }
        } catch (lvl1Err) {
          console.warn('Level 1 complements query error:', lvl1Err);
        }
      }

      // دعم المكملات اليدوية السابقة أو المحلية كاحتياط
      if (recommended.length < maxLimit && Array.isArray(currentProduct.complements)) {
        for (const cId of currentProduct.complements) {
          if (recommended.length >= maxLimit) break;
          const match = allProducts.find(p => String(p.id) === String(cId));
          if (match) addCandidate(match);
        }
      }

      // -----------------------------------------------------------------------
      // المستوى 2: قواعد ربط الأقسام (Category Complement Rules)
      // -----------------------------------------------------------------------
      if (recommended.length < maxLimit && client && currentCatId) {
        try {
          const { data: rules, error: ruleErr } = await client
            .from('category_complement_rules')
            .select('target_category_id')
            .eq('source_category_id', currentCatId);

          if (!ruleErr && rules && rules.length > 0) {
            const targetCatIds = [...new Set(rules.map(r => r.target_category_id))];
            const targetProducts = allProducts.filter(p => {
              const pCat = p.category_id || p.categoryKey;
              return targetCatIds.includes(pCat) && !seenIds.has(String(p.id));
            });

            for (const tp of targetProducts) {
              if (recommended.length >= maxLimit) break;
              addCandidate(tp);
            }
          }
        } catch (lvl2Err) {
          console.warn('Level 2 category rules query error:', lvl2Err);
        }
      }

      // -----------------------------------------------------------------------
      // المستوى 3: التطابق التلقائي الذكي (الكلمات الدلالية + منتجات نفس القسم)
      // يعمل تلقائياً سواء في وضع أوفلاين أو أونلاين ليكتمل عدد المقترحات إلى 4
      // -----------------------------------------------------------------------
      if (recommended.length < maxLimit && currentProduct.name) {
        // كلمات التوقف المستثناة من التطابق
        const stopWords = ['مع', 'في', 'من', 'إلى', 'على', 'عن', 'هذا', 'هذه', 'لكل', 'بأي', 'عند', 'حجم', 'مكتبة', 'انوار', 'الواحة'];

        // استخراج الكلمات ذات الدلالة التي طولها أكثر من 3 أحرف
        const words = currentProduct.name
          .toLowerCase()
          .replace(/[^\u0621-\u064A\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length > 3 && !stopWords.includes(w));

        if (words.length > 0) {
          const matchedByKeyword = allProducts.filter(p => {
            if (seenIds.has(String(p.id))) return false;
            const pName = (p.name || '').toLowerCase();
            return words.some(w => pName.includes(w));
          });

          for (const kp of matchedByKeyword) {
            if (recommended.length >= maxLimit) break;
            addCandidate(kp);
          }
        }

        // إكمال النقص من نفس القسم إن لم يصل العدد إلى 4
        if (recommended.length < maxLimit && currentCatId) {
          const sameCategoryProds = allProducts.filter(p => {
            const pCat = p.category_id || p.categoryKey;
            return pCat === currentCatId && !seenIds.has(String(p.id));
          });

          for (const sp of sameCategoryProds) {
            if (recommended.length >= maxLimit) break;
            addCandidate(sp);
          }
        }
      }

      return recommended.slice(0, maxLimit);
    }

    // =========================================================================
    // تكوين مراحل تتبع الطلبات الخمس
    // =========================================================================

    var ORDER_TRACKING_STAGES = [
      { key: 'pending', label: 'قيد المراجعة', icon: '⏳', desc: 'تم استلام طلبك وبانتظار مراجعته وتأكيده من فريق المتجر' },
      { key: 'processing', label: 'جاري التجهيز', icon: '⚙️', desc: 'طلبك قيد التصميم أو الطباعة والتجهيز حالياً' },
      { key: 'ready', label: 'جاهز', icon: '✨', desc: 'تم تجهيز طلبك بالكامل وهو جاهز للاستلام من الفرع أو تسليمه للمندوب' },
      { key: 'shipping', label: 'جاري الشحن', icon: '🚚', desc: 'طلبك في الطريق مع مندوب التوصيل' },
      { key: 'delivered', label: 'تم الاستلام', icon: '✅', desc: 'تم استلام طلبك بنجاح! يسعدنا تقييمكم لجودة المنتجات والخدمة' }
    ];

    var extractTikTokVideoId = (url) => {
      if (!url) return '';
      const trimmed = String(url).trim();
      const m = trimmed.match(/\/video\/(\d+)/) || trimmed.match(/\/v\/(\d+)/) || trimmed.match(/(\d{15,22})/);
      return m ? m[1] : '';
    };


// Make available globally on window
window.FALLBACK_IMG = FALLBACK_IMG;
window.SarSymbol = SarSymbol;
window.PriceTag = PriceTag;
window.TABS = TABS;
window.HERO_SLIDES = HERO_SLIDES;
window.MAKTABAH_15_CATEGORIES = MAKTABAH_15_CATEGORIES;
window.ORDER_TRACKING_STAGES = ORDER_TRACKING_STAGES;
window.extractTikTokVideoId = extractTikTokVideoId;
window.getComplementaryProducts = getComplementaryProducts;

window.useState = React.useState;
window.useEffect = React.useEffect;
window.useMemo = React.useMemo;
window.useRef = React.useRef;