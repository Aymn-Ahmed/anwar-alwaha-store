// =========================================================================
// MAKTABAH - Cart Drawer & Checkout Component (js/CartDrawer.js)
// =========================================================================

function CartDrawer(props) {
  const {
    cartItems = [],
    setCartItems,
    totalCartQuantity = 0,
    customerName = '',
    setCustomerName,
    customerPhone = '',
    setCustomerPhone,
    customerAddress = '',
    setCustomerAddress,
    customerNotes = '',
    setCustomerNotes,
    deliveryMethod = 'branch',
    setDeliveryMethod,
    customerLocationLat = null,
    setCustomerLocationLat,
    customerLocationLng = null,
    setCustomerLocationLng,
    isLocatingGps = false,
    handleGetGpsLocation,
    pricedSubtotal = 0,
    unpricedCartItems = [],
    isSubmittingOrder = false,
    handleSubmitOrderToStore,
    handleSubmitOrderDirectly = props.handleSubmitOrderDirectly || handleSubmitOrderToStore,
    handleSendWhatsAppOrder = props.handleSendWhatsAppOrder,
    showToast,
    setActiveNavTab,
    setSelectedProduct,
    activeProducts = []
  } = props;

  return (
                  <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-2 sm:pt-4 pb-28 animate-fade-in">
                    {/* شريط رأس السلة النظيف */}
                    <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-zinc-200/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-black text-zinc-900 flex items-center gap-2">
                            <span>🎒</span>
                            <span>حقيبة المشتريات والطلبات</span>
                          </h2>
                          <span className="text-[11px] font-bold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full border border-zinc-200">
                            {cartItems.length} أصناف ({totalCartQuantity} قطع)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          مكتبة أنوار الواحة • فرع خميس مشيط • تأكيد مباشر ومتابعة عبر واتساب
                        </p>
                      </div>

                      {cartItems.length > 0 && (
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من رغبتك في إفراغ السلة؟')) {
                              setCartItems([]);
                              showToast('تم إفراغ السلة');
                            }
                          }}
                          className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200"
                        >
                          إفراغ السلة 🗑️
                        </button>
                      )}
                    </div>

                    {cartItems.length === 0 ? (
                      /* حالة السلة الفارغة */
                      <div className="max-w-md mx-auto text-center py-14 px-6 bg-zinc-50/70 border border-zinc-200/80 rounded-3xl my-6 shadow-2xs">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-xs border border-zinc-200/80 flex items-center justify-center text-4xl mx-auto mb-4">
                          🎒
                        </div>
                        <h3 className="text-base font-black text-zinc-900 mb-1.5">
                          حقيبة المشتريات فارغة حالياً
                        </h3>
                        <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-6 leading-relaxed">
                          استكشف خدمات الطباعة المدرسية والإعلانية، اللوحات، الدروع والأدوات القرطاسية لتضيف ما يناسبك بضغطة زر.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                          <button
                            onClick={() => setActiveNavTab('services')}
                            className="w-full sm:w-auto bg-[#c40d00] hover:bg-[#a80b00] active:scale-[0.98] text-white text-xs font-black px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            استعراض الخدمات والأقسام ⚡
                          </button>
                          <button
                            onClick={() => setActiveNavTab('shop')}
                            className="w-full sm:w-auto bg-zinc-900 hover:bg-black active:scale-[0.98] text-white text-xs font-black px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            تصفح القرطاسية والمتجر 🛍️
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* تخطيط من عمودين على الشاشات الكبيرة وعمود واحد على الجوال */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* ========================================================= */}
                        {/* العمود الأيمن: قائمة المنتجات المختارة + مقترحات مكملة    */}
                        {/* ========================================================= */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-5">

                          {/* بطاقات المنتجات المضافة في السلة */}
                          <div className="bg-white rounded-3xl border border-zinc-200/80 p-3 sm:p-5 shadow-2xs space-y-3.5">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                              <span className="text-xs font-bold text-zinc-500">
                                المنتجات والخدمات المحددة ({cartItems.length}):
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                يمكنك كتابة ملاحظات مخصصة لكل صنف
                              </span>
                            </div>

                            {cartItems.map((item, idx) => {
                              const hasPrice = item.price !== null && item.price !== undefined && Number(item.price) > 0;
                              const qty = item.quantity || 1;
                              const itemTotal = hasPrice ? Number(item.price) * qty : null;

                              return (
                                <div
                                  key={idx}
                                  className="p-3.5 sm:p-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all shadow-2xs space-y-3"
                                >
                                  {/* الجزء العلوي: الصورة + الاسم + السعر + زر الحذف */}
                                  <div className="flex items-start gap-3">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                                      <img
                                        src={item.img || item.image_url || FALLBACK_IMG}
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                                        className="w-full h-full object-cover"
                                        alt={item.name}
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug line-clamp-2">
                                          {item.name}
                                        </h4>

                                        <button
                                          type="button"
                                          onClick={() => removeFromCart(idx)}
                                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-red-50 hover:text-red-600 text-zinc-400 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors shrink-0"
                                          title="حذف هذا الصنف من السلة"
                                        >
                                          🗑️
                                        </button>
                                      </div>

                                      {/* السعر */}
                                      <div className="mt-2 flex items-baseline gap-2">
                                        {hasPrice ? (
                                          <>
                                            <PriceTag price={itemTotal} size="md" />
                                            {qty > 1 && (
                                              <span className="text-[11px] text-zinc-400 font-normal inline-flex items-center gap-0.5">
                                                (<PriceTag price={item.price} size="xs" className="text-zinc-400" showDecimals={false} /> للحبة)
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-700 bg-zinc-200/80 px-2 py-0.5 rounded-md">
                                            <span>⚡</span>
                                            <span>السعر حسب الطلب والمواصفات</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* الجزء السفلي: التحكم بالكمية + حقل ملاحظات التنفيذ المخصص */}
                                  <div className="pt-2.5 border-t border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    {/* أزرار التحكم بالكمية */}
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs font-bold text-zinc-500">الكمية:</span>
                                      <div className="flex items-center bg-white rounded-xl border border-zinc-200 shadow-2xs p-0.5">
                                        <button
                                          type="button"
                                          onClick={() => updateItemQuantity(idx, qty - 1)}
                                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center text-sm font-black transition-colors cursor-pointer active:scale-95"
                                          title="تقليل الكمية"
                                        >
                                          −
                                        </button>
                                        <span className="w-8 text-center text-xs font-black text-zinc-900">
                                          {qty}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => updateItemQuantity(idx, qty + 1)}
                                          className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 flex items-center justify-center text-sm font-black transition-colors cursor-pointer active:scale-95"
                                          title="زيادة الكمية"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>

                                    {/* حقل نصي صغير اختياري لكل منتج */}
                                    <div className="flex-1 max-w-md">
                                      <input
                                        type="text"
                                        value={item.notes || ''}
                                        onChange={(e) => updateItemNotes(idx, e.target.value)}
                                        placeholder="ملاحظات التنفيذ (المقاس، اللون، الاسم المطلوب...)"
                                        className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#25D366] transition-colors"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* شريط أفقي: قد تحتاج أيضاً (منتجات مكملة) */}
                          {cartComplements.length > 0 && (
                            <div className="bg-gradient-to-br from-zinc-50 to-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-2xs">
                              <div className="flex items-center justify-between mb-3.5">
                                <div>
                                  <h4 className="text-xs sm:text-sm font-black text-zinc-900 flex items-center gap-1.5">
                                    <span className="text-emerald-600">✨</span>
                                    <span>قد تحتاج أيضاً (منتجات مكملة لطلبك)</span>
                                  </h4>
                                  <p className="text-[11px] text-zinc-500 mt-0.5">
                                    مقترحات تناسب مشترياتك الحالية، أضفها بضغطة زر واحدة
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                                  {cartComplements.length} مقترحات
                                </span>
                              </div>

                              {/* شبكة البطاقات المكملة */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {cartComplements.map(comp => (
                                  <div
                                    key={comp.id}
                                    className="bg-white rounded-2xl border border-zinc-200/90 p-3 flex flex-col justify-between shadow-2xs hover:shadow-sm hover:border-zinc-300 transition-all group"
                                  >
                                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 mb-2">
                                      <img
                                        src={comp.img || comp.image_url || FALLBACK_IMG}
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        alt={comp.name}
                                        loading="lazy"
                                      />
                                      {comp.price && Number(comp.price) > 0 ? (
                                        <span className="absolute bottom-1.5 right-1.5 bg-black/85 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs">
                                          {Number(comp.price).toFixed(0)} ر.س
                                        </span>
                                      ) : (
                                        <span className="absolute bottom-1.5 right-1.5 bg-zinc-900/80 backdrop-blur-xs text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded-lg shadow-xs">
                                          حسب الطلب
                                        </span>
                                      )}
                                    </div>

                                    <h5 className="text-xs font-bold text-zinc-800 line-clamp-1 mb-2.5" title={comp.name}>
                                      {comp.name}
                                    </h5>

                                    <button
                                      type="button"
                                      onClick={() => addToCart(comp, 1)}
                                      className="w-full py-2 px-3 bg-zinc-100 hover:bg-emerald-600 hover:text-white text-zinc-800 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                                    >
                                      <span>+ أضف للسلة</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ========================================================= */}
                        {/* العمود الأيسر: ملخص الطلب وإرسال الفاتورة عبر واتساب      */}
                        {/* ========================================================= */}
                        <div className="lg:col-span-5 xl:col-span-4 sticky top-20 space-y-4">
                          <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
                            <div className="pb-3 border-b border-zinc-100">
                              <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                                <span>📋</span>
                                <span>بيانات المستلم والاستلام</span>
                              </h3>
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                تُدرج هذه البيانات آلياً في الفاتورة المنسقة للواتساب
                              </p>
                            </div>

                            {/* إشعار التعبئة التلقائية إن وُجدت بيانات في الملف الشخصي */}
                            {userProfile.name && (
                              <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-emerald-200/80">
                                <span className="flex items-center gap-1.5">
                                  <span>✨</span>
                                  <span>تم ملء بياناتك تلقائياً من ملفك الشخصي 👤</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveNavTab('profile')}
                                  className="text-emerald-900 underline hover:opacity-80 cursor-pointer text-[10px]"
                                >
                                  تعديل البيانات
                                </button>
                              </div>
                            )}

                            {/* حقل اسم العميل */}
                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">
                                الاسم الكريم / الجهة أو المدرسة *
                              </label>
                              <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="مثال: فهد القحطاني أو مدرسة الأندلس..."
                                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-[#25D366] transition-colors"
                              />
                            </div>

                            {/* حقل رقم الجوال */}
                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">
                                رقم الجوال للتواصل وتأكيد الطلب *
                              </label>
                              <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="05XXXXXXXX"
                                dir="ltr"
                                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-[#25D366] transition-colors text-right"
                              />
                            </div>

                            {/* طريقة الاستلام */}
                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                                طريقة الاستلام المطلوبة:
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setDeliveryMethod('branch')}
                                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${deliveryMethod === 'branch'
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                  <span className="block text-base mb-0.5">🏪</span>
                                  <span>استلام من الفرع</span>
                                  <span className="block text-[10px] text-zinc-400 font-normal">خميس مشيط</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeliveryMethod('delivery')}
                                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${deliveryMethod === 'delivery'
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                  <span className="block text-base mb-0.5">🚚</span>
                                  <span>توصيل لموقعي</span>
                                  <span className="block text-[10px] text-zinc-400 font-normal">خميس مشيط / أبها</span>
                                </button>
                              </div>
                            </div>

                            {/* حقل العنوان عند اختيار التوصيل */}
                            {deliveryMethod === 'delivery' && (
                              <div>
                                <label className="block text-xs font-bold text-zinc-700 mb-1">
                                  الحي والعنوان للتوصيل (خميس مشيط والمناطق المجاورة) *
                                </label>
                                <input
                                  type="text"
                                  value={customerAddress}
                                  onChange={(e) => setCustomerAddress(e.target.value)}
                                  placeholder="مثال: حي النزهة، شارع الثلاثين، بجوار مسجد الخير..."
                                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-[#25D366] transition-colors"
                                />
                              </div>
                            )}

                            {/* ملاحظات عامة للطلب */}
                            <div>
                              <label className="block text-xs font-bold text-zinc-700 mb-1">
                                ملاحظات عامة على الطلب (اختياري)
                              </label>
                              <textarea
                                rows="2"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                                placeholder="أي تعليمات عامة بخصوص موعد التسليم أو تفاصيل إضافية..."
                                className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-[#25D366] transition-colors"
                              ></textarea>
                            </div>

                            {/* ملخص الحساب الذكي */}
                            <div className="pt-3 border-t border-zinc-100 space-y-2">
                              <h4 className="text-xs font-black text-zinc-900 mb-2">
                                💰 ملخص الحساب التقديري:
                              </h4>

                              <div className="flex justify-between items-center text-xs text-zinc-600">
                                <span>الأصناف المختارة:</span>
                                <span className="font-bold text-zinc-900">{cartItems.length} أصناف ({totalCartQuantity} قطع)</span>
                              </div>

                              {pricedSubtotal > 0 && (
                                <div className="flex justify-between items-center text-xs text-zinc-600">
                                  <span>إجمالي المنتجات المسعرة:</span>
                                  <span className="font-bold text-zinc-900">{pricedSubtotal.toFixed(0)} ر.س</span>
                                </div>
                              )}

                              {/* تنبيه الخدمات غير المسعرة */}
                              {unpricedCartItems.length > 0 && (
                                <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-2.5 text-xs text-amber-900 my-2">
                                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                                    <span>⚡</span>
                                    <span>+ خدمات تُسعّر حسب المواصفات عبر الواتساب</span>
                                  </div>
                                  <p className="text-[11px] text-amber-800 leading-snug">
                                    تحتوي السلة على ({unpricedCartItems.length}) خدمات مخصصة سيتم مراجعة مواصفاتها وملاحظاتك وتزويدك بالسعر النهائي فوراً.
                                  </p>
                                </div>
                              )}

                              <div className="flex justify-between items-baseline pt-2 border-t border-zinc-100">
                                <span className="text-xs font-bold text-zinc-700">المبلغ التقديري:</span>
                                <div className="text-left">
                                  {pricedSubtotal > 0 ? (
                                    <span className="text-lg sm:text-xl font-black text-[#c40d00]">
                                      {pricedSubtotal.toFixed(0)} ر.س
                                      {unpricedCartItems.length > 0 && (
                                        <span className="text-[11px] text-zinc-500 font-bold mr-1 block sm:inline">
                                          (+ الخدمات حسب الطلب)
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-xs sm:text-sm font-black text-zinc-800">
                                      يُحدد حسب المواصفات عبر الواتساب
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* الزر الرئيسي لإرسال الطلب للمتجر مباشرة */}
                            <button
                              type="button"
                              onClick={handleSubmitOrderDirectly}
                              disabled={isSubmittingOrder}
                              className="w-full py-3.5 px-4 bg-[#c40d00] hover:bg-[#a80b00] active:scale-[0.98] text-white text-xs sm:text-sm font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              <span className="text-lg">🚀</span>
                              <span>{isSubmittingOrder ? 'جاري تأكيد وإرسال الطلب...' : 'إرسال الطلب للمتجر مباشرة'}</span>
                              <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">تأكيد فوري ⚡</span>
                            </button>

                            {/* زر اختياري للمتابعة وإرسال الفاتورة عبر واتساب مباشرة */}
                            <button
                              type="button"
                              onClick={handleSendWhatsAppOrder}
                              className="w-full py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 active:scale-[0.99] text-zinc-700 hover:text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-200/80"
                            >
                              <span className="text-base text-emerald-600">💬</span>
                              <span>أو المتابعة وإرسال الفاتورة عبر واتساب (0572350050)</span>
                            </button>

                            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 text-center pt-1">
                              <span>🛡️</span>
                              <span>خدمة فورية ومباشرة من مكتبة أنوار الواحة بخميس مشيط</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
  );
}

// Make available globally on window
window.CartDrawer = CartDrawer;