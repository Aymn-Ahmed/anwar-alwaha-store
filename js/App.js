// =========================================================================
// MAKTABAH - Main App Component (js/App.js)
// =========================================================================

function App() {
  const PRODUCTS = window.PRODUCTS || [];
  const SERVICES_DATA = window.SERVICES_DATA || [];
  const MAKTABAH_15_CATEGORIES = window.MAKTABAH_15_CATEGORIES || [];
  const HERO_SLIDES = window.HERO_SLIDES || [];
  const TABS = window.TABS || [];
  const ORDER_TRACKING_STAGES = window.ORDER_TRACKING_STAGES || [];
  const FALLBACK_IMG = window.FALLBACK_IMG || '';
  const SarSymbol = window.SarSymbol;
  const PriceTag = window.PriceTag;
  const ProductCard = window.ProductCard;
  const ProductGrid = window.ProductGrid;
  const ProductModal = window.ProductModal;
  const ServicesView = window.ServicesView;
  const CartDrawer = window.CartDrawer;
  const ProfileOrders = window.ProfileOrders;
  const getComplementaryProducts = window.getComplementaryProducts;
  const extractTikTokVideoId = window.extractTikTokVideoId;

      // 1. التبويبات والتصفية
      const [activeNavTab, setActiveNavTab] = useState('shop');
      const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

      // 2. المنتج المختار وتفاصيل الصنف
      const [selectedProduct, setSelectedProduct] = useState(null);
      const [selectedQuantity, setSelectedQuantity] = useState(1);

      // 3. حالات خوارزمية المنتجات المكملة (Complementary Products)
      const [complementaryProducts, setComplementaryProducts] = useState([]);
      const [loadingComplements, setLoadingComplements] = useState(false);

      // 4. مزامنة البيانات السحابية من Supabase
      const [remoteServices, setRemoteServices] = useState(null);
      const [remoteProducts, setRemoteProducts] = useState(null);
      const [isSupabaseLive, setIsSupabaseLive] = useState(false);

      // 5. قسم الخدمات الرقمية والأكاديمية (Services Studios Hub)
      const [activeServiceCategory, setActiveServiceCategory] = useState('all');
      const [popoverServiceId, setPopoverServiceId] = useState(null);
      const [selectedServiceChip, setSelectedServiceChip] = useState({});
      const [selectedService, setSelectedService] = useState(null);
      const [selectedServiceOption, setSelectedServiceOption] = useState(null);
      const [modalPreviewCard, setModalPreviewCard] = useState(null);
      const [serviceModalItem, setServiceModalItem] = useState(null);
      const [cvPreviewMode, setCvPreviewMode] = useState('after');
      const [selectedCvPkg, setSelectedCvPkg] = useState('pro');
      const [gradDegree, setGradDegree] = useState('master');
      const [webMockupMode, setWebMockupMode] = useState('portfolio');
      const [proofPages, setProofPages] = useState(15);
      const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
      const [showFloatingBadge, setShowFloatingBadge] = useState(true);

      // 6. الباقة الحصرية المعتمدة للصنف المختار (Real Product Bundles)
      const [activeBundle, setActiveBundle] = useState(null);
      const [loadingBundle, setLoadingBundle] = useState(false);

      // 7. تتبع الطلبات وقسم "طلباتي"
      const [customerOrders, setCustomerOrders] = useState([]);
      const [orderSearchCode, setOrderSearchCode] = useState('');
      const [orderSearchLoading, setOrderSearchLoading] = useState(false);
      const [expandedOrderCodes, setExpandedOrderCodes] = useState({});
      const [confirmedOrderModal, setConfirmedOrderModal] = useState(null);
      const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

      // 8. تقييمات المنتجات بالوسائط المتعددة (SHEIN Style)
      const [allApprovedReviews, setAllApprovedReviews] = useState([]);
      const [reviewModalOrder, setReviewModalOrder] = useState(null);
      const [reviewDrafts, setReviewDrafts] = useState({});
      const [isSubmittingReviews, setIsSubmittingReviews] = useState(false);
      const [previewReviewMedia, setPreviewReviewMedia] = useState(null);
      const [productReviewFilter, setProductReviewFilter] = useState('all'); // 'all' | 'media'

      // 9. البيانات النشطة: إما الحية من سوبابيز أو الاحتياطية المحلية
      const activeServices = (remoteServices && remoteServices.length > 0) ? remoteServices : SERVICES_DATA;
      const activeProducts = remoteProducts || PRODUCTS;

      // 10. عدد الطلبات الجارية النشطة (التي لم تُسلّم بعد)
      const activeOrdersCount = useMemo(() => {
        return (customerOrders || []).filter(o => o.status !== 'delivered').length;
      }, [customerOrders]);

      // قراءة طلبات العميل وتفعيل الاستماع اللحظي (Realtime) لتحديث المراحل فورياً
      useEffect(() => {
        let ordersRealtimeChannel = null;

        try {
          const local = JSON.parse(localStorage.getItem('anwar_customer_orders') || '[]');
          setCustomerOrders(local);

          if (window.SUPABASE_CONFIG?.isConfigured?.()) {
            const client = window.SUPABASE_CONFIG.getClient();
            if (client) {
              // 1. مزامنة أولية لحالة طلبات العميل
              if (local.length > 0) {
                const codes = local.map(o => o.order_code);
                client
                  .from('orders')
                  .select('*')
                  .in('order_code', codes)
                  .then(({ data, error }) => {
                    if (!error && data && data.length > 0) {
                      const merged = local.map(lo => {
                        const remote = data.find(r => r.order_code === lo.order_code);
                        return remote ? { ...lo, ...remote } : lo;
                      });
                      setCustomerOrders(merged);
                      localStorage.setItem('anwar_customer_orders', JSON.stringify(merged));
                    }
                  })
                  .catch(err => console.warn('Refresh orders error:', err));
              }

              // 2. تفعيل الاستماع اللحظي (Supabase Realtime) على تحديثات الطلبات
              ordersRealtimeChannel = client
                .channel('customer-orders-realtime-feed')
                .on(
                  'postgres_changes',
                  { event: 'UPDATE', schema: 'public', table: 'orders' },
                  (payload) => {
                    const updated = payload.new;
                    if (!updated) return;

                    setCustomerOrders(prev => {
                      const idx = prev.findIndex(o => o.order_code === updated.order_code || o.id === updated.id);
                      if (idx !== -1) {
                        const next = [...prev];
                        const oldStatus = next[idx].status;
                        next[idx] = { ...next[idx], ...updated };
                        try {
                          localStorage.setItem('anwar_customer_orders', JSON.stringify(next));
                        } catch (e) { }

                        // إشعار فوري للعميل عند تغير المرحلة
                        if (oldStatus !== updated.status) {
                          const stage = ORDER_TRACKING_STAGES.find(s => s.key === updated.status);
                          showToast('🔔 تحديث مرحلة طلبك (' + (updated.order_code || '') + '): ' + (stage ? stage.label : updated.status));
                        }
                        return next;
                      }
                      return prev;
                    });
                  }
                )
                .subscribe();
            }
          }
        } catch (e) {
          console.warn('Orders init error:', e);
        }

        return () => {
          if (ordersRealtimeChannel && window.SUPABASE_CONFIG?.getClient?.()) {
            window.SUPABASE_CONFIG.getClient().removeChannel(ordersRealtimeChannel);
          }
        };
      }, []);

      // قراءة التقييمات المعتمدة من Supabase
      const loadApprovedReviews = () => {
        if (window.SUPABASE_CONFIG?.isConfigured?.()) {
          const client = window.SUPABASE_CONFIG.getClient();
          if (client) {
            client
              .from('product_reviews')
              .select('*')
              .eq('is_approved', true)
              .order('created_at', { ascending: false })
              .then(({ data, error }) => {
                if (!error && data) {
                  setAllApprovedReviews(data);
                  window.ALL_APPROVED_REVIEWS = data;
                }
              })
              .catch(err => console.warn('Fetch reviews error:', err));
          }
        }
      };

      useEffect(() => {
        loadApprovedReviews();
      }, []);


      // قراءة البيانات من Supabase مع استخدام البيانات الحالية كـ Fallback تلقائي
      useEffect(() => {
        if (window.SUPABASE_CONFIG?.isConfigured?.()) {
          const client = window.SUPABASE_CONFIG.getClient();
          if (client) {
            // جلب الخدمات المدارة من جدول services (is_active = true)
            client
              .from('services')
              .select('*')
              .eq('is_active', true)
              .order('sort_order', { ascending: true })
              .then(({ data: servs, error: sErr }) => {
                if (!sErr && servs && servs.length > 0) {
                  setRemoteServices(servs);
                  setIsSupabaseLive(true);
                }
              })
              .catch(err => console.warn('Supabase services fetch:', err));

            // جلب المنتجات من جدول products
            client
              .from('products')
              .select('*')
              .order('sort_order', { ascending: true })
              .then(({ data: prods, error: prodErr }) => {
                if (!prodErr && prods && prods.length > 0) {
                  const mapped = prods.map(p => {
                    const hasValidPrice = p.price !== null && p.price !== undefined && !isNaN(Number(p.price)) && Number(p.price) > 0;
                    const parsedP = hasValidPrice ? Number(p.price) : null;
                    return {
                      id: p.id,
                      name: p.name,
                      categoryKey: p.category_id,
                      categoryName: 'أصناف المتجر',
                      price: parsedP,
                      origPrice: parsedP ? parsedP * 1.25 : null,
                      discount: parsedP ? '-20%' : null,
                      img: p.image_url || FALLBACK_IMG,
                      badge: p.tiktok_video_id ? 'فيديو تيك توك 🎥' : 'متوفر بالمكتبة ✨',
                      soldCount: '+100 طلب',
                      tiktokVideoId: p.tiktok_video_id || '',
                      desc: p.name
                    };
                  });
                  setRemoteProducts(mapped);
                  setIsSupabaseLive(true);
                }
              })
              .catch(err => console.warn('Supabase products fetch:', err));
          }
        }
      }, []);

      const handleOpenService = (service) => {
        setSelectedService(service);
        setSelectedProduct(null);
        setSelectedServiceOption(service.options && service.options.length > 0 ? service.options[0] : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
      // التمرير التلقائي الفوري لأعلى الصفحة وإعادة ضبط الكمية عند فتح أي صنف أو تغييره
      useEffect(() => {
        if (selectedProduct) {
          setSelectedQuantity(1);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }, [selectedProduct?.id]);

      // السلة وبيانات الطلب لمكتبة أنوار الواحة
      const [cartItems, setCartItems] = useState(() => {
        if (typeof PRODUCTS !== 'undefined' && PRODUCTS && PRODUCTS.length >= 2) {
          return [
            {
              id: PRODUCTS[0].id,
              name: PRODUCTS[0].name,
              price: (PRODUCTS[0].price && Number(PRODUCTS[0].price) > 0) ? Number(PRODUCTS[0].price) : null,
              img: PRODUCTS[0].img || FALLBACK_IMG,
              quantity: 1,
              notes: '',
              categoryKey: PRODUCTS[0].categoryKey || ''
            },
            {
              id: PRODUCTS[1].id,
              name: PRODUCTS[1].name,
              price: (PRODUCTS[1].price && Number(PRODUCTS[1].price) > 0) ? Number(PRODUCTS[1].price) : null,
              img: PRODUCTS[1].img || FALLBACK_IMG,
              quantity: 1,
              notes: '',
              categoryKey: PRODUCTS[1].categoryKey || ''
            }
          ];
        }
        return [];
      });

      // الملف الشخصي وبيانات العميل المحفوظة محلياً (localStorage)
      const [userProfile, setUserProfile] = useState(() => {
        try {
          const saved = localStorage.getItem('maktabah_user_profile');
          if (saved) return JSON.parse(saved);
        } catch (e) { }
        return { name: '', phone: '', address: '' };
      });

      const [customerName, setCustomerName] = useState(() => {
        try {
          const saved = localStorage.getItem('maktabah_user_profile');
          if (saved) return JSON.parse(saved).name || '';
        } catch (e) { }
        return '';
      });

      const [customerPhone, setCustomerPhone] = useState(() => {
        try {
          const saved = localStorage.getItem('maktabah_user_profile');
          if (saved) return JSON.parse(saved).phone || '';
        } catch (e) { }
        return '';
      });

      const [customerAddress, setCustomerAddress] = useState(() => {
        try {
          const saved = localStorage.getItem('maktabah_user_profile');
          if (saved) return JSON.parse(saved).address || '';
        } catch (e) { }
        return '';
      });

      // قائمة المفضلة المحفوظة في الجهاز
      const [favorites, setFavorites] = useState(() => {
        try {
          const saved = localStorage.getItem('maktabah_favorites');
          if (saved) return JSON.parse(saved);
        } catch (e) { }
        return [];
      });

      const [showFavoritesModal, setShowFavoritesModal] = useState(false);

      const toggleFavorite = (productId, e) => {
        e?.stopPropagation?.();
        setFavorites(prev => {
          const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
          try {
            localStorage.setItem('maktabah_favorites', JSON.stringify(next));
          } catch (e) { }
          return next;
        });
      };

      const handleSaveUserProfile = (e) => {
        e?.preventDefault?.();
        const updated = {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: customerAddress.trim()
        };
        setUserProfile(updated);
        try {
          localStorage.setItem('maktabah_user_profile', JSON.stringify(updated));
        } catch (e) { }
        showToast('تم حفظ وتثبيت بياناتك الشخصية بنجاح ✓');
      };

      const [deliveryMethod, setDeliveryMethod] = useState('branch'); // 'branch' | 'delivery'
      const [customerNotes, setCustomerNotes] = useState('');
      const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
      const [toastMessage, setToastMessage] = useState(null);

      const productsSectionRef = useRef(null);
      const productDetailsRef = useRef(null);

      const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
      };

      // تقليب الشريحة آلياً
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentSlideIndex(prev => (prev + 1) % HERO_SLIDES.length);
        }, 4500);
        return () => clearInterval(interval);
      }, []);

      // إجمالي الكميات الكلية في السلة
      const totalCartQuantity = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      }, [cartItems]);

      // الأصناف المسعرة وإجماليها
      const pricedCartItems = useMemo(() => {
        return cartItems.filter(item => item.price !== null && item.price !== undefined && Number(item.price) > 0);
      }, [cartItems]);

      const pricedSubtotal = useMemo(() => {
        return pricedCartItems.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
      }, [pricedCartItems]);

      // الأصناف غير المسعرة (التي تحتاج تسعير حسب المواصفات عبر الواتساب)
      const unpricedCartItems = useMemo(() => {
        return cartItems.filter(item => item.price === null || item.price === undefined || Number(item.price) <= 0);
      }, [cartItems]);

      // منتجات مكملة مقترحة في السلة (حتى 3 أصناف ليست في السلة)
      const cartComplements = useMemo(() => {
        if (!activeProducts || activeProducts.length === 0) return [];
        const cartIds = new Set(cartItems.map(item => String(item.id)));
        const cartCats = new Set(cartItems.map(item => item.categoryKey).filter(Boolean));

        let candidates = activeProducts.filter(p => !cartIds.has(String(p.id)) && cartCats.has(p.categoryKey));
        if (candidates.length < 3) {
          const others = activeProducts.filter(p => !cartIds.has(String(p.id)) && !candidates.some(c => c.id === p.id));
          candidates = [...candidates, ...others];
        }
        return candidates.slice(0, 3);
      }, [cartItems, activeProducts]);

      const handleIncreaseQuantity = () => setSelectedQuantity(prev => prev + 1);
      const handleDecreaseQuantity = () => setSelectedQuantity(prev => Math.max(1, prev - 1));

      // إضافة منتج للسلة مع توحيد السجلات والكميات
      const addToCart = (product, qty = 1, notes = '') => {
        if (!product) return;
        const pId = String(product.id);
        const pPrice = (product.price !== null && product.price !== undefined && !isNaN(Number(product.price)) && Number(product.price) > 0) ? Number(product.price) : null;
        const pImg = product.img || product.image_url || FALLBACK_IMG;
        const pName = product.name || 'منتج / خدمة';
        const pCat = product.categoryKey || product.category_id || '';

        setCartItems(prev => {
          const existingIndex = prev.findIndex(item => String(item.id) === pId);
          if (existingIndex > -1) {
            const updated = [...prev];
            const currentItem = updated[existingIndex];
            updated[existingIndex] = {
              ...currentItem,
              quantity: (currentItem.quantity || 1) + qty,
              notes: notes || currentItem.notes || ''
            };
            return updated;
          } else {
            return [...prev, {
              id: product.id,
              name: pName,
              price: pPrice,
              img: pImg,
              quantity: Math.max(1, qty),
              notes: notes || '',
              categoryKey: pCat
            }];
          }
        });
        showToast(`تمت إضافة "${pName.slice(0, 24)}..." للسلة ✓`);
      };

      const handleAddToCartWithQty = () => {
        if (!selectedProduct) return;
        addToCart(selectedProduct, selectedQuantity);
        confetti({ particleCount: 35, spread: 60 });
      };

      const addServiceToCart = (serviceItem) => {
        addToCart(serviceItem, 1);
        confetti({ particleCount: 40, spread: 65 });
      };

      const updateItemQuantity = (idx, newQty) => {
        if (newQty <= 0) {
          removeFromCart(idx);
          return;
        }
        setCartItems(prev => {
          const updated = [...prev];
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], quantity: newQty };
          }
          return updated;
        });
      };

      const updateItemNotes = (idx, notes) => {
        setCartItems(prev => {
          const updated = [...prev];
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], notes };
          }
          return updated;
        });
      };

      const removeFromCart = (idx) => {
        setCartItems(prev => prev.filter((_, i) => i !== idx));
        showToast("تم حذف الصنف من السلة");
      };

      // إرسال الطلب للمتجر مباشرة وحفظه فورياً في جدول orders مع فتح شاشة التأكيد
      const handleSubmitOrderDirectly = async () => {
        if (cartItems.length === 0) return;

        // توليد رقم طلب مميز
        const orderCode = 'AW-' + Math.floor(1000 + Math.random() * 9000);
        const nameLine = customerName.trim() ? customerName.trim() : (userProfile.name || 'عميل متجر أنوار الواحة');
        const phoneLine = customerPhone.trim() ? customerPhone.trim() : (userProfile.phone || 'غير مسجل');
        const addressLine = customerAddress.trim() ? customerAddress.trim() : (userProfile.address || '');

        const orderItemsPayload = cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price ? Number(item.price) : null,
          quantity: item.quantity || 1,
          notes: item.notes || '',
          image_url: item.img || item.image_url || ''
        }));

        // تحديث وتثبيت الملف الشخصي محلياً
        if (customerName.trim() || customerPhone.trim() || customerAddress.trim()) {
          const prof = {
            name: customerName.trim() || userProfile.name || '',
            phone: customerPhone.trim() || userProfile.phone || '',
            address: customerAddress.trim() || userProfile.address || ''
          };
          setUserProfile(prof);
          try {
            localStorage.setItem('maktabah_user_profile', JSON.stringify(prof));
          } catch (e) { }
        }

        const orderData = {
          order_code: orderCode,
          customer_name: nameLine,
          customer_phone: phoneLine !== 'غير مسجل' ? phoneLine : '',
          delivery_method: deliveryMethod,
          status: 'pending',
          items: orderItemsPayload,
          total_amount: pricedSubtotal > 0 ? pricedSubtotal : 0,
          customer_notes: customerNotes.trim() + (addressLine && deliveryMethod === 'delivery' ? (' [العنوان: ' + addressLine + ']') : ''),
          admin_notes: '',
          is_reviewed: false,
          created_at: new Date().toISOString()
        };

        setIsSubmittingOrder(true);

        try {
          // 1. حفظ مؤكد وفوري في Supabase Realtime Table
          if (window.SUPABASE_CONFIG?.isConfigured?.()) {
            const client = window.SUPABASE_CONFIG.getClient();
            if (client) {
              const { error } = await client.from('orders').insert([orderData]);
              if (error) {
                console.warn('Supabase insert order error:', error);
              }
            }
          }

          // 2. حفظ الطلب محلياً في قائمة طلباتي
          try {
            const existing = JSON.parse(localStorage.getItem('anwar_customer_orders') || '[]');
            const updated = [orderData, ...existing.filter(o => o.order_code !== orderCode)];
            localStorage.setItem('anwar_customer_orders', JSON.stringify(updated));
            setCustomerOrders(updated);
          } catch (e) {
            console.warn('localStorage save order error:', e);
          }

          // 3. تفريغ السلة وفتح شاشة التأكيد برقم الطلب
          setCartItems([]);
          setConfirmedOrderModal(orderData);
          showToast('تم إرسال واستلام طلبك برقم (' + orderCode + ') بنجاح! 🎉');
        } catch (err) {
          console.error("Submit order error:", err);
          showToast("تعذر إرسال الطلب، يرجى المحاولة أو الإرسال عبر الواتساب");
        } finally {
          setIsSubmittingOrder(false);
        }
      };

      // إرسال الفاتورة وتوليد رقم الطلب وحفظه في Supabase و localStorage
      const handleSendWhatsAppOrder = async () => {
        if (cartItems.length === 0) return;

        // توليد رقم طلب مميز
        const orderCode = `AW-${Math.floor(1000 + Math.random() * 9000)}`;
        const nameLine = customerName.trim() ? customerName.trim() : (userProfile.name || 'عميل متجر أنوار الواحة');
        const phoneLine = customerPhone.trim() ? customerPhone.trim() : (userProfile.phone || 'غير مسجل');
        const addressLine = customerAddress.trim() ? customerAddress.trim() : (userProfile.address || '');
        const deliveryText = deliveryMethod === 'branch'
          ? 'استلام من فرع خميس مشيط 🏪'
          : `توصيل لموقعي 🚚 (${addressLine ? addressLine : 'خميس مشيط / أبها'})`;

        let itemsText = '';
        const orderItemsPayload = [];
        cartItems.forEach((item, idx) => {
          const qty = item.quantity || 1;
          const hasPrice = item.price && Number(item.price) > 0;
          const itemPriceText = hasPrice
            ? `${(Number(item.price) * qty).toFixed(0)} ر.س ${qty > 1 ? `(${Number(item.price).toFixed(0)} ر.س / حبة)` : ''}`
            : 'يُحدد السعر حسب المواصفات المطلوبة';

          const itemNotes = item.notes && item.notes.trim() ? `\n   📝 ملاحظات التنفيذ: ${item.notes.trim()}` : '';

          itemsText += `\n${idx + 1}) *${item.name}*\n   • الكمية: ${qty}\n   • السعر: ${itemPriceText}${itemNotes}\n`;

          orderItemsPayload.push({
            id: item.id,
            name: item.name,
            price: item.price ? Number(item.price) : null,
            quantity: qty,
            notes: item.notes || '',
            image_url: item.img || item.image_url || ''
          });
        });

        let summaryText = '';
        if (pricedSubtotal > 0) {
          summaryText += `• إجمالي المنتجات المسعرة: *${pricedSubtotal.toFixed(0)} ر.س*\n`;
        }
        if (unpricedCartItems.length > 0) {
          summaryText += `• خدمات مخصصة (${unpricedCartItems.length}): يتم تحديد السعر النهائي والتكلفة حسب المواصفات عبر الواتساب.\n`;
        }
        if (pricedSubtotal === 0 && unpricedCartItems.length > 0) {
          summaryText = `• السعر الإجمالي: يتم تحديده حسب مواصفات الطلب عبر الواتساب.\n`;
        }

        const generalNotesText = customerNotes.trim() ? `\n📌 *ملاحظات عامة على الطلب:*\n${customerNotes.trim()}\n` : '';

        const fullMessage = `*طلب جديد من متجر مكتبة أنوار الواحة الإلكتروني* 📚✨\n--------------------------------\n🔖 *رقم الطلب:* ${orderCode}\n👤 *بيانات العميل:*\n• الاسم: ${nameLine}\n• الجوال: ${phoneLine}\n• طريقة الاستلام: ${deliveryText}${addressLine && deliveryMethod === 'delivery' ? `\n• الحي / العنوان: ${addressLine}` : ''}\n\n📦 *قائمة المنتجات والخدمات المطلوبة (${cartItems.length} أصناف):*${itemsText}\n--------------------------------\n💰 *ملخص الحساب:*\n${summaryText}${generalNotesText}--------------------------------\n📍 متجر مكتبة أنوار الواحة - خميس مشيط\n📞 هاتف / واتساب: 0572350050`;

        // حفظ وتحديث بيانات العميل في الملف الشخصي محلياً
        if (customerName.trim() || customerPhone.trim() || customerAddress.trim()) {
          const prof = {
            name: customerName.trim() || userProfile.name || '',
            phone: customerPhone.trim() || userProfile.phone || '',
            address: customerAddress.trim() || userProfile.address || ''
          };
          setUserProfile(prof);
          try {
            localStorage.setItem('maktabah_user_profile', JSON.stringify(prof));
          } catch (e) { }
        }

        // تجهيز كائن الطلب
        const orderData = {
          order_code: orderCode,
          customer_name: nameLine,
          customer_phone: phoneLine !== 'غير مسجل' ? phoneLine : '',
          delivery_method: deliveryMethod,
          status: 'pending',
          items: orderItemsPayload,
          total_amount: pricedSubtotal > 0 ? pricedSubtotal : 0,
          customer_notes: customerNotes.trim() + (addressLine && deliveryMethod === 'delivery' ? ` [العنوان: ${addressLine}]` : ''),
          admin_notes: '',
          is_reviewed: false,
          created_at: new Date().toISOString()
        };

        // 1. حفظ الطلب في Supabase
        if (window.SUPABASE_CONFIG?.isConfigured?.()) {
          const client = window.SUPABASE_CONFIG.getClient();
          if (client) {
            client.from('orders').insert([orderData]).then(({ error }) => {
              if (error) console.warn('Supabase insert order error:', error);
            });
          }
        }

        // 2. حفظ الطلب محلياً في localStorage
        try {
          const existing = JSON.parse(localStorage.getItem('anwar_customer_orders') || '[]');
          const updated = [orderData, ...existing.filter(o => o.order_code !== orderCode)];
          localStorage.setItem('anwar_customer_orders', JSON.stringify(updated));
          setCustomerOrders(updated);
        } catch (e) {
          console.warn('localStorage save order error:', e);
        }

        showToast(`تم إنشاء طلبك برقم (${orderCode}) بنجاح! جاري تحويلك للواتساب...`);

        // فتح واتساب
        window.open(`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(fullMessage)}`, '_blank');
      };

      // البحث عن الطلب محلياً وفي السيرفر
      const handleSearchOrder = async (e) => {
        if (e) e.preventDefault();
        const q = orderSearchCode.trim();
        if (!q) {
          showToast('يرجى إدخال رقم الطلب أو رقم الجوال للبحث');
          return;
        }

        const localMatch = customerOrders.find(o =>
          (o.order_code && o.order_code.toLowerCase() === q.toLowerCase()) ||
          (o.customer_phone && o.customer_phone.includes(q))
        );

        if (localMatch) {
          setExpandedOrderCodes(prev => ({ ...prev, [localMatch.order_code]: true }));
          showToast(`تم العثور على الطلب (${localMatch.order_code})`);
        }

        if (window.SUPABASE_CONFIG?.isConfigured?.()) {
          const client = window.SUPABASE_CONFIG.getClient();
          if (client) {
            setOrderSearchLoading(true);
            try {
              let query = client.from('orders').select('*');
              if (q.toUpperCase().startsWith('AW-')) {
                query = query.eq('order_code', q.toUpperCase());
              } else {
                query = query.or(`order_code.ilike.%${q}%,customer_phone.ilike.%${q}%`);
              }

              const { data, error } = await query;
              if (!error && data && data.length > 0) {
                const found = data[0];
                setCustomerOrders(prev => {
                  const filtered = prev.filter(o => o.order_code !== found.order_code);
                  const updated = [found, ...filtered];
                  localStorage.setItem('anwar_customer_orders', JSON.stringify(updated));
                  return updated;
                });
                setExpandedOrderCodes(prev => ({ ...prev, [found.order_code]: true }));
                showToast(`تم تحديث بيانات الطلب (${found.order_code}) مباشرة من السيرفر!`);
              } else if (!localMatch) {
                showToast('لم يتم العثور على طلب بهذا الرقم، تأكد من الرقم والمحاولة ثانية');
              }
            } catch (err) {
              console.warn('Search order error:', err);
            } finally {
              setOrderSearchLoading(false);
            }
          }
        }
      };

      // فتح نافذة تقييم أصناف الطلب
      const openReviewModal = (order) => {
        setReviewModalOrder(order);
        const initial = {};
        const items = Array.isArray(order.items) ? order.items : [];
        items.forEach(it => {
          initial[it.id] = {
            productId: it.id,
            productName: it.name,
            rating: 5,
            comment: '',
            files: [],
            previewUrls: []
          };
        });
        setReviewDrafts(initial);
      };

      const handleReviewRatingChange = (productId, rating) => {
        setReviewDrafts(prev => ({
          ...prev,
          [productId]: { ...(prev[productId] || {}), rating }
        }));
      };

      const handleReviewCommentChange = (productId, comment) => {
        setReviewDrafts(prev => ({
          ...prev,
          [productId]: { ...(prev[productId] || {}), comment }
        }));
      };

      const handleReviewFilesSelected = (productId, fileList) => {
        if (!fileList || fileList.length === 0) return;
        const newFiles = Array.from(fileList);
        const newUrls = newFiles.map(f => URL.createObjectURL(f));

        setReviewDrafts(prev => {
          const curr = prev[productId] || { rating: 5, comment: '', files: [], previewUrls: [] };
          return {
            ...prev,
            [productId]: {
              ...curr,
              files: [...(curr.files || []), ...newFiles],
              previewUrls: [...(curr.previewUrls || []), ...newUrls]
            }
          };
        });
      };

      const handleRemoveReviewFile = (productId, fileIdx) => {
        setReviewDrafts(prev => {
          const curr = prev[productId];
          if (!curr) return prev;
          const nextFiles = curr.files.filter((_, i) => i !== fileIdx);
          const nextUrls = curr.previewUrls.filter((_, i) => i !== fileIdx);
          return {
            ...prev,
            [productId]: {
              ...curr,
              files: nextFiles,
              previewUrls: nextUrls
            }
          };
        });
      };

      // إرسال تقييمات المنتجات ورفع الوسائط إلى Supabase
      const handleSubmitOrderReviews = async () => {
        if (!reviewModalOrder) return;
        setIsSubmittingReviews(true);
        try {
          const client = window.SUPABASE_CONFIG?.getClient?.();
          const orderItems = Array.isArray(reviewModalOrder.items) ? reviewModalOrder.items : [];
          const customerName = reviewModalOrder.customer_name || 'عميل المتجر';

          for (const item of orderItems) {
            const draft = reviewDrafts[item.id] || { rating: 5, comment: '', files: [] };
            const mediaUrls = [];

            // رفع الملفات إلى Supabase Storage bucket 'reviews-media'
            if (client && draft.files && draft.files.length > 0) {
              for (const file of draft.files) {
                try {
                  const ext = file.name.split('.').pop() || 'jpg';
                  const filePath = `${reviewModalOrder.order_code}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
                  const { error: upErr } = await client.storage
                    .from('reviews-media')
                    .upload(filePath, file);

                  if (!upErr) {
                    const { data: pubData } = client.storage
                      .from('reviews-media')
                      .getPublicUrl(filePath);
                    if (pubData?.publicUrl) {
                      mediaUrls.push(pubData.publicUrl);
                    }
                  } else {
                    console.warn('Storage upload error:', upErr);
                  }
                } catch (e) {
                  console.warn('File upload exception:', e);
                }
              }
            }

            // إدخال التقييم في جدول product_reviews
            if (client) {
              const { error: revErr } = await client
                .from('product_reviews')
                .upsert([{
                  product_id: item.id,
                  order_code: reviewModalOrder.order_code,
                  customer_name: customerName,
                  rating: draft.rating || 5,
                  comment: draft.comment || '',
                  media_urls: mediaUrls,
                  is_approved: true
                }], { onConflict: 'order_code,product_id' });

              if (revErr) {
                console.warn('Review upsert error:', revErr);
              }
            }
          }

          // تحديث حقل is_reviewed في جدول orders
          if (client) {
            await client
              .from('orders')
              .update({ is_reviewed: true })
              .eq('order_code', reviewModalOrder.order_code);
          }

          // تحديث الحالة محلياً وفي localStorage
          setCustomerOrders(prev => prev.map(o => o.order_code === reviewModalOrder.order_code ? { ...o, is_reviewed: true } : o));
          try {
            const stored = JSON.parse(localStorage.getItem('anwar_customer_orders') || '[]');
            const updated = stored.map(o => o.order_code === reviewModalOrder.order_code ? { ...o, is_reviewed: true } : o);
            localStorage.setItem('anwar_customer_orders', JSON.stringify(updated));
          } catch (e) { }

          showToast('شكراً لك! تم إرسال تقييمك ومشاركته في المتجر بنجاح ⭐');
          setReviewModalOrder(null);
          loadApprovedReviews();
          confetti({ particleCount: 50, spread: 80 });
        } catch (err) {
          console.error('Submit reviews error:', err);
          showToast('تعذر إرسال التقييم: ' + (err.message || ''), 'error');
        } finally {
          setIsSubmittingReviews(false);
        }
      };

      // فلترة المنتجات بناءً على القسم المختار (تدعم سوبابيز والبيانات المحلية)
      const filteredProducts = useMemo(() => {
        if (activeCategoryFilter === 'all') return activeProducts;
        return activeProducts.filter(p => p.categoryKey === activeCategoryFilter);
      }, [activeCategoryFilter, activeProducts]);

      // اسم القسم النشط حالياً
      const activeCategoryObj = useMemo(() => {
        if (activeCategoryFilter === 'all') return null;
        return MAKTABAH_15_CATEGORIES.find(c => c.categoryKey === activeCategoryFilter);
      }, [activeCategoryFilter]);

      // عند النقر على أي قسم من الـ 15: توجيه مباشر وفوري لصفحة عرض أصناف القسم فقط
      const handleSelectCategory = (catKey) => {
        setActiveCategoryFilter(catKey);
        setActiveNavTab('shop');
        setSelectedProduct(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };


      // استعلام الباقة المفعّلة الحقيقية من Supabase للصنف المختار
      useEffect(() => {
        if (!selectedProduct) {
          setActiveBundle(null);
          return;
        }

        let isMounted = true;
        setLoadingBundle(true);

        const fetchProductBundle = async () => {
          try {
            if (window.SUPABASE_CONFIG?.isConfigured?.()) {
              const client = window.SUPABASE_CONFIG.getClient();
              if (client) {
                // 1. البحث في product_bundle_items عن باقة تحوي هذا المنتج
                const { data: itemRows, error: itemErr } = await client
                  .from('product_bundle_items')
                  .select('bundle_id')
                  .eq('product_id', selectedProduct.id);

                if (!itemErr && itemRows && itemRows.length > 0) {
                  const bundleIds = itemRows.map(r => r.bundle_id);

                  // 2. التحقق من وجود باقة مفعّلة في product_bundles
                  const { data: bundlesData, error: bErr } = await client
                    .from('product_bundles')
                    .select('*')
                    .in('id', bundleIds)
                    .eq('is_active', true)
                    .limit(1);

                  if (!bErr && bundlesData && bundlesData.length > 0) {
                    const foundBundle = bundlesData[0];

                    // 3. جلب جميع عناصر هذه الباقة
                    const { data: allBundleItems, error: abiErr } = await client
                      .from('product_bundle_items')
                      .select('product_id')
                      .eq('bundle_id', foundBundle.id);

                    if (!abiErr && allBundleItems && allBundleItems.length > 0) {
                      const pIds = allBundleItems.map(x => String(x.product_id));
                      const bundleProducts = activeProducts.filter(p => pIds.includes(String(p.id)));

                      if (bundleProducts.length > 0) {
                        const originalTotal = bundleProducts.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
                        const finalBundlePrice = Number(foundBundle.bundle_price) || 0;
                        const savingsDiff = Math.max(0, originalTotal - finalBundlePrice);
                        const savingsPercent = originalTotal > 0 ? Math.round((savingsDiff / originalTotal) * 100) : 0;

                        if (isMounted) {
                          setActiveBundle({
                            ...foundBundle,
                            bundlePrice: finalBundlePrice,
                            originalTotal,
                            savings: savingsDiff,
                            savingsPercent,
                            products: bundleProducts
                          });
                          setLoadingBundle(false);
                          return;
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.warn('Fetch active bundle error:', err);
          }

          if (isMounted) {
            setActiveBundle(null);
            setLoadingBundle(false);
          }
        };

        fetchProductBundle();
        return () => { isMounted = false; };
      }, [selectedProduct?.id, activeProducts]);

      const functionalComplements = useMemo(() => {
        if (!selectedProduct || !selectedProduct.complements) return [];
        return PRODUCTS.filter(p => selectedProduct.complements.includes(p.id));
      }, [selectedProduct]);

      // =========================================================================
      // خوارزمية التوصية الذكية للأصناف المقترحة (Smart Recommendation Algorithm)
      // =========================================================================
      const recommendedProducts = useMemo(() => {
        if (!selectedProduct) return [];

        // 1. استخراج الكلمات المفتاحية الدلالية للصنف الحالي
        const currentKeywords = (selectedProduct.name + ' ' + (selectedProduct.desc || ''))
          .toLowerCase()
          .split(/[\s,()،\-–]+/)
          .filter(w => w.length > 2);

        // 2. استبعاد الصنف المعروض حالياً (Exclude Current Product ID)
        const candidates = PRODUCTS.filter(p => p.id !== selectedProduct.id);

        // 3. نظام النقاط الذكي (Multi-factor Smart Scoring)
        const scored = candidates.map(product => {
          let score = 0;

          // أ) الأولوية القصوى: الانتماء لنفس القسم (Same Category ID)
          if (product.categoryKey === selectedProduct.categoryKey) {
            score += 1000;
          }

          // ب) تطابق الكلمات المفتاحية والوسوم (Keywords / Tags Matching)
          const targetText = (product.name + ' ' + (product.desc || '')).toLowerCase();
          currentKeywords.forEach(kw => {
            if (targetText.includes(kw)) {
              score += 25;
            }
          });

          // ج) الأكثر طلباً وشعبية (Popularity / Sold Count Sorting)
          const soldNum = parseFloat(String(product.soldCount).replace(/[^0-9.]/g, '')) || 0;
          const isK = String(product.soldCount).includes('k');
          const normalizedSold = isK ? soldNum * 1000 : soldNum;
          score += Math.min(normalizedSold / 50, 80);

          // د) التوافق الوظيفي المباشر (Complements)
          if (selectedProduct.complements && selectedProduct.complements.includes(product.id)) {
            score += 150;
          }

          // هـ) التوافق اللوني والجمالي (Same Palette)
          if (product.palette === selectedProduct.palette) {
            score += 60;
          }

          // و) التقييم
          score += (product.rating || 4.8) * 5;

          return { product, score };
        });

        // ترتيب النتائج تنازلياً حسب مجموع النقاط الذكية
        scored.sort((a, b) => b.score - a.score);

        // الحد الأقصى للعرض: 4 إلى 6 أصناف مقترحة (Top 6)
        return scored.slice(0, 6).map(s => s.product);
      }, [selectedProduct]);

      // سلوك التنقل عند الضغط على صنف مقترح: تحديث فوري والتمرير التلقائي لأعلى الصفحة
      const handleSelectRecommendedProduct = (product) => {
        setSelectedProduct(product);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (productDetailsRef.current) {
          productDetailsRef.current.scrollTop = 0;
        }
      };

      const handleAddFullBundle = () => {
        if (!activeBundle) return;
        const bundleImg = activeBundle.products?.[0]?.img || activeBundle.products?.[0]?.image_url || FALLBACK_IMG;
        const itemsNames = (activeBundle.products || []).map(p => p.name).join(' + ');
        const bundleCartItem = {
          id: 'bundle_' + activeBundle.id,
          name: `🎁 باقة: ${activeBundle.title}`,
          price: activeBundle.bundlePrice,
          img: bundleImg,
          quantity: 1,
          notes: `مشتملات الباقة: ${itemsNames}`,
          categoryKey: 'bundles'
        };
        addToCart(bundleCartItem, 1);
        confetti({ particleCount: 75, spread: 70 });
        showToast(`تمت إضافة باقة (${activeBundle.title}) بالسعر المخفض للسلة 🎉`);
      };

      const activeSlide = HERO_SLIDES[currentSlideIndex];

      return (
        <div className={`w-full max-w-md sm:max-w-xl md:max-w-5xl lg:max-w-7xl mx-auto bg-white min-h-screen text-right flex flex-col justify-between shadow-xs relative transition-all ${selectedProduct || selectedService ? 'pb-0' : 'pb-20 md:pb-8'}`}>

          {/* ========================================================================= */}
          {/* شريط الملاحة العلوي المكتبي للابتوب والشاشات الكبيرة (Desktop Navigation) */}
          {/* ========================================================================= */}
          <header className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-2xs">
            <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">

              {/* الشعار واسم المتجر */}
              <div
                onClick={() => { setSelectedProduct(null); setSelectedService(null); setActiveNavTab('shop'); }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-[#fa2c19] transition-colors">
                  أ
                </div>
                <div>
                  <div className="font-logo font-black text-base text-black tracking-wider leading-none">ANWAR AL WAHAH</div>
                  <div className="text-[11px] text-zinc-500 font-medium tracking-tight mt-0.5">مكتبة أنوار الواحة • خميس مشيط</div>
                </div>
              </div>

              {/* روابط التبويبات للابتوب والديسكتوب */}
              <nav className="flex items-center gap-1.5 bg-zinc-100/90 p-1 rounded-2xl">
                {[
                  { id: 'shop', title: '🏠 الرئيسية' },
                  { id: 'categories', title: '📂 الأقسام' },
                  { id: 'services', title: '⚡ الخدمات' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedProduct(null);
                      setSelectedService(null);
                      setActiveNavTab(tab.id);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeNavTab === tab.id && !selectedProduct && !selectedService
                      ? 'bg-black text-white shadow-xs font-black'
                      : 'text-zinc-600 hover:text-black hover:bg-white/60'
                      }`}
                  >
                    {tab.title}
                  </button>
                ))}
              </nav>

              {/* الأزرار والإجراءات في اليسار */}
              <div className="flex items-center gap-2.5">
                <a
                  href="https://api.whatsapp.com/send?phone=966572350050"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>💬</span>
                  <span>دعم واتساب (0572350050)</span>
                </a>

                <a 
                  href="admin.html" 
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors" 
                  title="لوحة تحكم المسؤول"
                >
                  <span>⚙️</span>
                  <span className="hidden lg:inline">لوحة الإدارة</span>
                </a>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedService(null);
                    setActiveNavTab('bag');
                  }}
                  className="relative bg-black hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <span>🎒 الحقيبة</span>
                  {totalCartQuantity > 0 && (
                    <span className="bg-[#fa2c19] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {totalCartQuantity}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedService(null);
                    setActiveNavTab('profile');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${(activeNavTab === 'profile' || activeNavTab === 'my_orders') ? 'bg-[#c40d00] text-white shadow-xs font-black' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                    }`}
                  title="الملف الشخصي وطلباتي"
                >
                  <span className="text-sm">👤</span>
                  <span>حسابي</span>
                  {activeOrdersCount > 0 ? (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse" title={`${activeOrdersCount} طلبات نشطة قيد التنفيذ`}>
                      {activeOrdersCount}
                    </span>
                  ) : customerOrders.length > 0 ? (
                    <span className="bg-zinc-400 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {customerOrders.length}
                    </span>
                  ) : null}
                </button>
              </div>

            </div>
          </header>

          {/* إشعار خفيف علوي */}
          {toastMessage && (
            <div className="fixed top-3 inset-x-4 max-w-sm mx-auto z-50 bg-black/95 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-2xl flex items-center justify-between border border-zinc-700">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-zinc-400 text-xs mr-2">✕</button>
            </div>
          )}

          <div>

            {/* ========================================================================= */}
            {/* 1. صفحة تفاصيل الصنف المستقلة (Full Page View مع زر رجوع طبيعي)           */}
            {/* ========================================================================= */}

            {/* ========================================================================= */}
            {/* عرض صفحة تفاصيل الصنف المستقلة عبر مكون ProductModal                     */}
            {/* ========================================================================= */}
            {selectedProduct ? (
              <ProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onOpenBag={() => { setSelectedProduct(null); setActiveNavTab('bag'); }}
                totalCartQuantity={totalCartQuantity}
                allProducts={activeProducts}
                allApprovedReviews={allApprovedReviews}
                cartItems={cartItems}
                setCartItems={setCartItems}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                showToast={showToast}
                confetti={confetti}
                onSelectCategory={handleSelectCategory}
                activeBundle={activeBundle}
                setActiveBundle={setActiveBundle}
                selectedQuantity={selectedQuantity}
                setSelectedQuantity={setSelectedQuantity}
                handleIncreaseQuantity={handleIncreaseQuantity}
                handleDecreaseQuantity={handleDecreaseQuantity}
                handleAddToCart={handleAddToCart}
                handleInstantOrder={handleInstantOrder}
                isInstantOrdering={isInstantOrdering}
                productReviewFilter={productReviewFilter}
                setProductReviewFilter={setProductReviewFilter}
                previewReviewMedia={previewReviewMedia}
                setPreviewReviewMedia={setPreviewReviewMedia}
                productDetailsRef={productDetailsRef}
                activeCategoryFilter={activeCategoryFilter}
                setActiveNavTab={setActiveNavTab}
              />
            ) : (
              <div>
                {/* --- التبويب 1: الشاشة الرئيسية (Home / Shop) --- */}
                {activeNavTab === 'shop' && (
                  <div>
                    {activeCategoryFilter === 'all' ? (
                      /* ========================================================================= */
                      /* أ) الشاشة الرئيسية المتكاملة (Hero + 15 قسم + جميع الأصناف)                */
                      /* ========================================================================= */
                      <div>
                        {/* البنر العلوي المدمج بالناف بار الشفاف */}
                        <div className="relative overflow-hidden w-full select-none">
                          <div className={`relative h-64 bg-gradient-to-r ${activeSlide.gradient} flex flex-col justify-between transition-all duration-700`}>

                            <div className="relative z-30 pt-3 pb-1 px-3.5 bg-gradient-to-b from-black/55 via-black/20 to-transparent">
                              <div className="flex items-center justify-between text-white">

                                <div className="flex items-center gap-3">
                                  <button onClick={() => setActiveNavTab('categories')} className="hover:opacity-80 p-1 cursor-pointer">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                  </button>
                                </div>

                                <div
                                  onClick={() => setActiveNavTab('shop')}
                                  className="logo-font text-xl sm:text-2xl font-black tracking-wider text-white cursor-pointer drop-shadow-sm flex items-center gap-2"
                                >
                                  <span>ANWAR AL WAHAH</span>
                                  <span className="text-yellow-300 text-xs font-sans font-bold tracking-normal border-r border-white/20 pr-2 mr-1">مكتبة أنوار الواحة</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <button onClick={() => setActiveNavTab('bag')} className="hover:opacity-80 p-1 relative cursor-pointer">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    {totalCartQuantity > 0 && (
                                      <span className="absolute -top-1.5 -right-1.5 bg-white text-red-700 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                                        {totalCartQuantity}
                                      </span>
                                    )}
                                  </button>
                                </div>

                              </div>

                              {/* تبويبات الفئات مع الخط الأبيض المباشر */}
                              <div className="flex items-center justify-around text-xs font-bold pt-2.5 pb-0.5">
                                {TABS.map(tab => (
                                  <button
                                    key={tab.id}
                                    onClick={() => {
                                      setActiveCategoryFilter(tab.id);
                                      if (tab.id === 'all') setCurrentSlideIndex(0);
                                      else if (tab.id === 'cat_printing' || tab.id === 'cat_grad') setCurrentSlideIndex(0);
                                      else if (tab.id === 'cat_events') setCurrentSlideIndex(1);
                                      else if (tab.id === 'cat_art') setCurrentSlideIndex(2);
                                    }}
                                    className={`pb-1 px-1.5 relative transition-all whitespace-nowrap cursor-pointer ${activeCategoryFilter === tab.id ? 'text-white font-black' : 'text-white/75 hover:text-white'
                                      }`}
                                  >
                                    <span>{tab.title}</span>
                                    {activeCategoryFilter === tab.id && (
                                      <span className="absolute bottom-0 inset-x-1 h-[2.5px] bg-white rounded-full"></span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* محتوى البنر */}
                            <div className="relative z-10 px-4 pb-4 text-center text-white">
                              <span className="inline-block bg-white/20 backdrop-blur-md text-[10px] font-black px-2.5 py-0.5 rounded-full mb-1">
                                {activeSlide.badge}
                              </span>
                              <h2 className="text-xl font-black drop-shadow-sm">{activeSlide.mainTitle}</h2>
                              <p className="text-xs text-white/90 mt-0.5">{activeSlide.subTitle}</p>
                              <button
                                onClick={() => handleSelectCategory(activeSlide.categoryTarget)}
                                className="mt-2.5 bg-black/80 hover:bg-black text-white text-[11px] font-black px-4 py-1.5 rounded-full border border-white/20 cursor-pointer"
                              >
                                {activeSlide.buttonText} ‹
                              </button>
                            </div>

                            {/* مؤشر النقاط */}
                            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 z-20">
                              {HERO_SLIDES.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setCurrentSlideIndex(idx)}
                                  className={`h-1.5 rounded-full transition-all cursor-pointer ${currentSlideIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                                    }`}
                                ></button>
                              ))}
                            </div>

                          </div>
                        </div>

                        {/* بطاقة الشحن والعروض السريعة */}
                        <div className="mx-3 mt-2.5 mb-3 bg-[#fff8f7] border border-[#fde4e1] rounded-2xl p-2.5 flex items-center justify-between text-right shadow-2xs">
                          <div className="flex-1 pr-1 flex items-center justify-end gap-2">
                            <div>
                              <div className="text-xs font-black text-[#c40d00] flex items-center justify-end gap-1">
                                <span>توصيل مجاني للجامعات</span>
                                <span className="text-sm">🚚</span>
                              </div>
                              <div className="text-[10px] text-zinc-600 font-bold mt-0.5 whitespace-nowrap">
                                للطلبات فوق <span className="font-black text-black">50.00 ر.س</span>
                              </div>
                            </div>
                          </div>

                          <div className="w-[1px] h-7 bg-[#fcd5d0] mx-2"></div>

                          <div className="flex-1 pl-1 flex items-center justify-end gap-2">
                            <div>
                              <div className="text-xs font-black text-[#c40d00] flex items-center justify-end gap-1">
                                <span>طباعة سريعة واستلام</span>
                                <span className="text-sm">🖨️</span>
                              </div>
                              <div className="text-[10px] text-zinc-600 font-bold mt-0.5 whitespace-nowrap">
                                ارفع ملفك واستلم فوراً
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ========================================================================= */}
                        {/* شبكة الـ 15 دائرة مع هوامش سفلية كافية تمنع أي تداخل نهائياً               */}
                        {/* ========================================================================= */}
                        <div className="max-w-7xl mx-auto relative w-full px-1.5 sm:px-2 pt-1 pb-16 sm:pb-12">
                          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15 gap-y-3.5 gap-x-1 sm:gap-x-1.5 text-center">
                            {MAKTABAH_15_CATEGORIES.map(cat => (
                              <button
                                key={cat.id}
                                onClick={() => handleSelectCategory(cat.categoryKey)}
                                className="flex flex-col items-center group cursor-pointer"
                              >
                                {/* الدائرة بصور صالحة ومطابقة للمعنى 100% مع معالج الخطأ الفوري */}
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-[#f4f4f6] flex items-center justify-center p-0.5 border border-zinc-200/80 group-hover:border-[#c40d00] transition-all shadow-2xs">
                                  <img
                                    src={cat.img}
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                                    className="w-full h-full object-cover rounded-full"
                                    alt={cat.name}
                                    loading="lazy"
                                  />
                                </div>
                                {/* الاسم الدقيق */}
                                <span className="text-[10px] sm:text-[11px] font-bold mt-1.5 leading-tight line-clamp-2 max-w-[62px] text-zinc-900 group-hover:text-[#c40d00] transition-colors">
                                  {cat.name}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-2 bg-[#f7f7f8] border-t border-b border-zinc-200/60 my-2"></div>

                        {/* عنوان قسم المنتجات في الشاشة الرئيسية */}
                        <div ref={productsSectionRef} className="max-w-7xl mx-auto px-4 pt-2 mb-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-black">جميع خدمات ومنتجات المكتبة</span>
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#c40d00]">
                                {activeProducts.length} صنف متوفر
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-0.5">اضغط على أي قسم أعلاه أو اختر صنفاً لفتح صفحته الكاملة</p>
                          </div>
                        </div>

                        {/* شبكة جميع المنتجات في الشاشة الرئيسية - متجاوبة ومهندمة للأجهزة المكتبية والجوال */}
                        <ProductGrid
                          products={activeProducts}
                          favorites={favorites}
                          onToggleFavorite={toggleFavorite}
                          onSelectProduct={(product) => {
                            setSelectedProduct(product);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />

                      </div>
                    ) : (
                      /* ========================================================================= */
                      /* ب) صفحة مستقلة لعرض أصناف القسم المختار فقط (تصفية بناءً على Category ID)   */
                      /* ========================================================================= */
                      <div className="w-full min-h-screen pb-28">
                        {/* شريط رأس علوي مستقل مع زر رجوع صريح للشاشة الرئيسية */}
                        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-3 py-2.5 flex items-center justify-between shadow-2xs">
                          <button
                            onClick={() => setActiveCategoryFilter('all')}
                            className="flex items-center gap-1.5 text-xs font-black text-zinc-800 hover:text-[#c40d00] transition-colors py-1 px-2.5 rounded-xl hover:bg-zinc-100 cursor-pointer"
                          >
                            <span className="text-base font-black">‹</span>
                            <span>العودة للرئيسية</span>
                          </button>

                          <div className="text-center">
                            <span className="text-sm font-black text-black">{activeCategoryObj?.name}</span>
                            <span className="block text-[10px] text-[#c40d00] font-bold">{filteredProducts.length} أصناف متوفرة</span>
                          </div>

                          <button
                            onClick={() => setActiveNavTab('bag')}
                            className="relative p-1.5 hover:bg-zinc-100 rounded-xl text-zinc-700 cursor-pointer"
                            title="الحقيبة"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {totalCartQuantity > 0 && (
                              <span className="absolute -top-1 -right-1 bg-[#c40d00] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                {totalCartQuantity}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* بطاقة تعريف القسم المختار */}
                        <div className="max-w-7xl mx-auto mx-3 sm:mx-auto mt-3 mb-4 bg-white border border-zinc-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-2xs">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-100 border-2 border-red-100 shrink-0">
                            <img
                              src={activeCategoryObj?.img}
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                              className="w-full h-full object-cover"
                              alt={activeCategoryObj?.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h2 className="text-sm font-black text-black truncate">{activeCategoryObj?.name}</h2>
                              <span className="bg-red-50 text-[#c40d00] text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                                قسم مخصص
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{activeCategoryObj?.desc}</p>
                          </div>
                          <button
                            onClick={() => setActiveCategoryFilter('all')}
                            className="text-xs font-bold text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-xl shrink-0 cursor-pointer"
                          >
                            عرض الكل ✕
                          </button>
                        </div>

                        {/* شبكة أصناف هذا القسم المختار فقط - متجاوبة ومهندمة للأجهزة المكتبية والجوال */}
                        <ProductGrid
                          products={filteredProducts}
                          favorites={favorites}
                          onToggleFavorite={toggleFavorite}
                          onSelectProduct={(product) => {
                            setSelectedProduct(product);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        />
                      </div>
                    )}

                  </div>
                )}

                {/* --- التبويب 2: فئات (Categories View) --- */}
                {activeNavTab === 'categories' && (
                  <div className="p-4 pb-20">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-4">
                      <div>
                        <h2 className="text-lg font-black text-black">🗂️ جميع أقسام وتصنيفات المكتبة</h2>
                        <p className="text-xs text-zinc-500">اختر أي قسم لعرض أصنافه وتصفيته فوراً</p>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">15 قسماً</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {MAKTABAH_15_CATEGORIES.map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => handleSelectCategory(cat.categoryKey)}
                          className="bg-zinc-50 hover:bg-red-50/50 rounded-2xl p-2.5 border border-zinc-200/80 hover:border-[#c40d00] flex flex-col items-center text-center cursor-pointer transition-all"
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden mb-2 bg-white p-0.5 border border-zinc-200">
                            <img
                              src={cat.img}
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          <span className="text-[11px] font-black text-black line-clamp-1">{cat.name}</span>
                          <span className="text-[9px] text-zinc-400 line-clamp-1 mt-0.5">{cat.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* --- التبويب 3: خدمات (Services Studios Hub) --- */}
                {activeNavTab === 'services' && (
                  <ServicesView
                    activeServices={activeServices}
                    selectedService={selectedService}
                    setSelectedService={setSelectedService}
                    popoverServiceId={popoverServiceId}
                    setPopoverServiceId={setPopoverServiceId}
                    selectedServiceChip={selectedServiceChip}
                    setSelectedServiceChip={setSelectedServiceChip}
                    modalPreviewCard={modalPreviewCard}
                    setModalPreviewCard={setModalPreviewCard}
                    activeProducts={activeProducts}
                    handleSelectCategory={handleSelectCategory}
                    showToast={showToast}
                  />
                )}

                {/* --- التبويب 4: الحقيبة (Bag / Cart View) --- */}
                {activeNavTab === 'bag' && (
                  <CartDrawer
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                    totalCartQuantity={totalCartQuantity}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    customerPhone={customerPhone}
                    setCustomerPhone={setCustomerPhone}
                    customerAddress={customerAddress}
                    setCustomerAddress={setCustomerAddress}
                    customerNotes={customerNotes}
                    setCustomerNotes={setCustomerNotes}
                    deliveryMethod={deliveryMethod}
                    setDeliveryMethod={setDeliveryMethod}
                    customerLocationLat={customerLocationLat}
                    setCustomerLocationLat={setCustomerLocationLat}
                    customerLocationLng={customerLocationLng}
                    setCustomerLocationLng={setCustomerLocationLng}
                    isLocatingGps={isLocatingGps}
                    handleGetGpsLocation={handleGetGpsLocation}
                    pricedSubtotal={pricedSubtotal}
                    unpricedCartItems={unpricedCartItems}
                    isSubmittingOrder={isSubmittingOrder}
                    handleSubmitOrderToStore={handleSubmitOrderToStore}
                    showToast={showToast}
                    setActiveNavTab={setActiveNavTab}
                    setSelectedProduct={setSelectedProduct}
                    activeProducts={activeProducts}
                  />
                )}

                {/* --- التبويب 5: الملف الشخصي والطلبات --- */}
                {(activeNavTab === 'my_orders' || activeNavTab === 'profile') && (
                  <ProfileOrders
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    isEditingProfile={isEditingProfile}
                    setIsEditingProfile={setIsEditingProfile}
                    profileDraftName={profileDraftName}
                    setProfileDraftName={setProfileDraftName}
                    profileDraftPhone={profileDraftPhone}
                    setProfileDraftPhone={setProfileDraftPhone}
                    profileDraftAddress={profileDraftAddress}
                    setProfileDraftAddress={setProfileDraftAddress}
                    handleSaveProfile={handleSaveProfile}
                    customerOrders={customerOrders}
                    expandedOrderCodes={expandedOrderCodes}
                    setExpandedOrderCodes={setExpandedOrderCodes}
                    reviewModalOrder={reviewModalOrder}
                    setReviewModalOrder={setReviewModalOrder}
                    reviewDrafts={reviewDrafts}
                    setReviewDrafts={setReviewDrafts}
                    isSubmittingReviews={isSubmittingReviews}
                    handleOrderReviewFieldChange={handleOrderReviewFieldChange}
                    handleReviewFileSelect={handleReviewFileSelect}
                    handleRemoveReviewFile={handleRemoveReviewFile}
                    handleSubmitOrderReviews={handleSubmitOrderReviews}
                    showToast={showToast}
                    confetti={confetti}
                    activeProducts={activeProducts}
                    previewReviewMedia={previewReviewMedia}
                    setPreviewReviewMedia={setPreviewReviewMedia}
                    setActiveNavTab={setActiveNavTab}
                    setSelectedProduct={setSelectedProduct}
                  />
                )}
              </div>
            )}
          </div>


          {/* ========================================================================= */}
          {/* زر "توفير الباقات" العائم بتموضع مستقل (fixed) لا يغطي أي دائرة إطلاقاً   */}
          {/* ========================================================================= */}
          {false && showFloatingBadge && !selectedProduct && (
            <div className="fixed bottom-36 z-30 pointer-events-auto left-4 md:left-[calc(50%-220px)]">
              <div
                onClick={() => handleSelectCategory('cat_bundles')}
                className="relative bg-gradient-to-br from-[#c40d00] via-[#d61304] to-[#990a00] text-white p-2.5 rounded-2xl shadow-2xl border-2 border-white flex flex-col items-center text-center animate-bounce cursor-pointer hover:scale-105 transition-all"
                title="اضغط لتصفح باقات التوفير"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFloatingBadge(false);
                  }}
                  className="absolute -top-2 -left-2 bg-zinc-800 text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shadow-md hover:bg-black cursor-pointer border border-white"
                  title="إغلاق"
                >
                  ✕
                </button>
                <span className="text-sm">🎁</span>
                <span className="text-[10px] font-black leading-tight tracking-tight mt-0.5">توفير</span>
                <span className="text-[10px] font-black leading-tight tracking-tight text-yellow-300">الباقات</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* القائمة السفلية ذات الـ 5 تبويبات (تظهر فقط خارج تفاصيل المنتجات والخدمات) */}
          {/* ========================================================================= */}
          {!selectedProduct && !selectedService && (
            <nav className="md:hidden fixed bottom-0 inset-x-0 w-full max-w-md sm:max-w-xl mx-auto bg-white/95 backdrop-blur-md border-t border-[#ebebeb] z-40 py-1.5 px-2 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-lg">
              <div className="grid grid-cols-5 text-center">

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedService(null);
                    setActiveCategoryFilter('all');
                    setActiveNavTab('shop');
                  }}
                  className={`flex flex-col items-center py-1 transition-all cursor-pointer ${activeNavTab === 'shop' && !selectedProduct && activeCategoryFilter === 'all' ? 'text-black font-black scale-105' : 'text-zinc-400 font-semibold hover:text-zinc-600'}`}
                >
                  <span className="text-lg">🏠</span>
                  <span className="text-[10px] mt-0.5">الرئيسية</span>
                  {activeNavTab === 'shop' && !selectedProduct && <span className="w-1 h-1 rounded-full bg-[#fa2c19] mt-0.5"></span>}
                </button>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedService(null);
                    setActiveNavTab('categories');
                  }}
                  className={`flex flex-col items-center py-1 transition-all cursor-pointer ${activeNavTab === 'categories' ? 'text-black font-black scale-105' : 'text-zinc-400 font-semibold hover:text-zinc-600'}`}
                >
                  <span className="text-lg">📂</span>
                  <span className="text-[10px] mt-0.5">الأقسام</span>
                  {activeNavTab === 'categories' && <span className="w-1 h-1 rounded-full bg-[#fa2c19] mt-0.5"></span>}
                </button>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedService(null);
                    setActiveNavTab('services');
                  }}
                  className={`flex flex-col items-center py-1 transition-all cursor-pointer ${activeNavTab === 'services' && !selectedService ? 'text-black font-black scale-105' : 'text-zinc-400 font-semibold hover:text-zinc-600'}`}
                >
                  <span className="text-lg">⚡</span>
                  <span className="text-[10px] mt-0.5">الخدمات</span>
                  {activeNavTab === 'services' && !selectedService && <span className="w-1 h-1 rounded-full bg-[#fa2c19] mt-0.5"></span>}
                </button>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveNavTab('bag');
                  }}
                  className={`relative flex flex-col items-center py-1 transition-all cursor-pointer ${activeNavTab === 'bag' ? 'text-black font-black scale-105' : 'text-zinc-400 font-semibold hover:text-zinc-600'}`}
                >
                  <span className="text-lg">🎒</span>
                  {totalCartQuantity > 0 && (
                    <span className="absolute top-0 right-4 bg-[#fa2c19] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {totalCartQuantity}
                    </span>
                  )}
                  <span className="text-[10px] mt-0.5">الحقيبة</span>
                  {activeNavTab === 'bag' && <span className="w-1 h-1 rounded-full bg-[#fa2c19] mt-0.5"></span>}
                </button>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setSelectedService(null);
                    setActiveNavTab('profile');
                  }}
                  className={`relative flex flex-col items-center py-1 transition-all cursor-pointer ${(activeNavTab === 'my_orders' || activeNavTab === 'profile') ? 'text-black font-black scale-105' : 'text-zinc-400 font-semibold hover:text-zinc-600'}`}
                >
                  <span className="text-lg">👤</span>
                  {activeOrdersCount > 0 ? (
                    <span className="absolute top-0 right-4 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {activeOrdersCount}
                    </span>
                  ) : customerOrders.length > 0 ? (
                    <span className="absolute top-0 right-4 bg-zinc-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {customerOrders.length}
                    </span>
                  ) : null}
                  <span className="text-[10px] mt-0.5">حسابي</span>
                  {(activeNavTab === 'my_orders' || activeNavTab === 'profile') && <span className="w-1 h-1 rounded-full bg-[#fa2c19] mt-0.5"></span>}
                </button>

              </div>
            </nav>
          )}

          {/* ========================================================================= */}
          {/* شاشة ونافذة تأكيد استلام الطلب الفوري مع رقم الطلب ومتابعة واتساب          */}
          {/* ========================================================================= */}
          {confirmedOrderModal && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
              <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-scale-up space-y-4 text-center">

                {/* شارة النجاح المتحركة */}
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
                  ✓
                </div>

                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span>⚡</span>
                    <span>تم الإرسال للمكتبة والمزامنة اللحظية</span>
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-black mt-2">
                    تم تأكيد واستلام طلبك بنجاح! 🎉
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    طلبك الآن قيد المراجعة في لوحة إدارة المكتبة وسيبدأ تنفيذه فوراً.
                  </p>
                </div>

                {/* بطاقة تفاصيل الطلب برقم AW-XXXX */}
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 text-right space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                    <span className="text-xs font-bold text-zinc-500">رقم الطلب الرسمي:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-[#c40d00] tracking-wide">
                        {confirmedOrderModal.order_code}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(confirmedOrderModal.order_code);
                          showToast("تم نسخ رقم الطلب بنجاح 📋");
                        }}
                        className="text-[10px] font-bold text-zinc-700 hover:text-black bg-zinc-200 hover:bg-zinc-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        نسخ 📋
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-bold">مرحلة الطلب:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                      ⏳ قيد المراجعة
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-bold">اسم العميل:</span>
                    <span className="font-bold text-zinc-800">{confirmedOrderModal.customer_name}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 font-bold">طريقة الاستلام:</span>
                    <span className="font-bold text-zinc-800">
                      {confirmedOrderModal.delivery_method === 'branch' ? 'استلام من فرع خميس مشيط 🏪' : 'توصيل لموقعي 🚚'}
                    </span>
                  </div>

              {/* إشعار تتبع المراحل اللحظي */}
              <div className="bg-sky-50 text-sky-800 text-[11px] p-3 rounded-2xl border border-sky-100 flex items-start gap-2.5 text-right">
                <span className="text-base shrink-0 mt-0.5">ℹ️</span>
                <span className="leading-relaxed">
                  يمكنك متابعة وتتبع مراحل طلبك الـ 5 مباشرة في قسم <strong>(حسابي 👤 ← طلباتي)</strong> حيث يتحدث الشريط تلقائياً لحظة بلحظة بمجرد تحديثه من إدارة المكتبة.
                </span>
              </div>

                  {confirmedOrderModal.total_amount > 0 && (
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-zinc-700">الإجمالي المسعر:</span>
                      <span className="text-[#c40d00] text-sm">{confirmedOrderModal.total_amount} ر.س</span>
                    </div>
                  )}
                </div>

                {/* إشعار تتبع المراحل اللحظي */}
                <div className="bg-sky-50 text-sky-800 text-[11px] p-3 rounded-2xl border border-sky-100 flex items-start gap-2.5 text-right">
                  <span className="text-base shrink-0 mt-0.5">ℹ️</span>
                  <span className="leading-relaxed">
                    يمكنك متابعة وتتبع مراحل طلبك الـ 5 مباشرة في قسم <strong>(حسابي 👤 ← طلباتي)</strong> حيث يتحدث الشريط تلقائياً لحظة بلحظة بمجرد تحديثه من إدارة المكتبة.
                  </span>
                </div>

                {/* أزرار الإجراءات */}
                <div className="space-y-2 pt-2">
                  {/* زر واتساب اختياري لإرفاق ملفات ومستندات */}
                  <a
                    href={`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(
                      `مرحباً مكتبة أنوار الواحة 👋 أود المتابعة بخصوص طلبي رقم (${confirmedOrderModal.order_code}) وإرفاق ملفات ومستندات الطباعة والتصميم.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1faa53] active:scale-[0.98] text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="text-lg">💬</span>
                    <span>مراسلة المكتبة عبر واتساب لإرفاق ملفات</span>
                    <span className="text-xs">←</span>
                  </a>

                  {/* زر تتبع الطلب في طلباتي */}
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedOrderModal(null);
                      setActiveNavTab('my_orders');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📦</span>
                    <span>تتبع حالة الطلب في (طلباتي)</span>
                  </button>

                  {/* زر العودة للتسوق */}
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedOrderModal(null);
                      setActiveNavTab('shop');
                    }}
                    className="w-full py-2 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    العودة للتسوق 🏠
                  </button>
                </div>

              </div>
            </div>
          )}


          {/* ========================================================================= */}
          {/* نافذة قائمة رغباتي والمفضلة (Favorites Modal)                             */}
          {/* ========================================================================= */}
          {showFavoritesModal && (
            <div
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
              onClick={() => setShowFavoritesModal(false)}
            >
              <div
                className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-hidden p-4 sm:p-6 shadow-2xl flex flex-col justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                {/* رأس النافذة */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-500 text-lg flex items-center justify-center shrink-0">
                      ❤️
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900">
                        قائمة رغباتي والمفضلة
                      </h3>
                      <p className="text-xs text-zinc-400 font-semibold">
                        {favorites.length > 0 ? `لديك ${favorites.length} منتج محفوظ` : 'لا توجد منتجات محفوظة حالياً'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFavoritesModal(false)}
                    className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* محتوى القائمة */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 max-h-[55vh] no-scrollbar">
                  {favorites.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3">
                      <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 text-3xl flex items-center justify-center mx-auto">
                        🤍
                      </div>
                      <h4 className="text-sm font-black text-zinc-800">قائمة المفضلة فارغة</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                        اضغط على أيقونة القلب ❤️ الموجودة على أي منتج لحفظه في قائمتك والرجوع إليه وطلبه بسهولة لاحقاً.
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setShowFavoritesModal(false);
                            setActiveNavTab('shop');
                          }}
                          className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          تصفح القرطاسية والمنتجات
                        </button>
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const favoriteProducts = (activeProducts || []).filter(p => favorites.includes(p.id));
                      if (favoriteProducts.length === 0) {
                        return (
                          <div className="text-center py-8 text-xs text-zinc-400">
                            المنتجات المفضلة السابقة لم تعد متوفرة في المتجر حالياً.
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2.5">
                          {favoriteProducts.map((p) => {
                            const pImg = p.img || p.image_url || FALLBACK_IMG;
                            return (
                              <div
                                key={p.id}
                                className="bg-zinc-50 hover:bg-zinc-100/70 p-3 rounded-2xl border border-zinc-200/80 flex items-center justify-between gap-3 transition-colors"
                              >
                                <div
                                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                                  onClick={() => {
                                    setShowFavoritesModal(false);
                                    setSelectedProduct(p);
                                  }}
                                >
                                  <img
                                    src={pImg}
                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 shrink-0 bg-white"
                                    alt={p.name}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate hover:text-[#c40d00] transition-colors">
                                      {p.name}
                                    </h4>
                                    <div className="mt-1 flex items-center gap-2">
                                      <PriceTag price={p.price} size="sm" />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {p.price && Number(p.price) > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        addToCart(p, 1);
                                        showToast(`تمت إضافة ${p.name} إلى السلة 🛍️`);
                                      }}
                                      className="p-2 sm:px-3 sm:py-2 bg-[#c40d00] hover:bg-[#a80b00] text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                      title="أضف للسلة"
                                    >
                                      <span>+</span>
                                      <span className="hidden sm:inline">أضف للسلة</span>
                                    </button>
                                  ) : (
                                    <a
                                      href={`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(`مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار عن منتج (${p.name}) من قائمتي المفضلة.`)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                                      title="استفسار واتساب"
                                    >
                                      <span>💬</span>
                                      <span className="hidden sm:inline">استفسار</span>
                                    </a>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => toggleFavorite(p.id, e)}
                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                    title="إزالة من المفضلة"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* أسفل النافذة */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-400 font-semibold">
                    مكتبة أنوار الواحة - خميس مشيط
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFavoritesModal(false)}
                    className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* نافذة المعاينة المكبرة لوسائط التقييم (Lightbox Preview)                   */}
          {/* ========================================================================= */}
          {previewReviewMedia && (
            <div
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setPreviewReviewMedia(null)}
            >
              <div
                className="relative max-w-3xl max-h-[85vh] bg-black rounded-3xl overflow-hidden p-2 shadow-2xl flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setPreviewReviewMedia(null)}
                  className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white font-black text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
                {previewReviewMedia.isVideo ? (
                  <video
                    src={previewReviewMedia.url}
                    controls
                    autoPlay
                    className="max-h-[80vh] w-auto max-w-full rounded-2xl"
                  />
                ) : (
                  <img
                    src={previewReviewMedia.url}
                    className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain"
                    alt=""
                  />
                )}
              </div>
            </div>
          )}

        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);

// Make available globally on window
window.App = App;