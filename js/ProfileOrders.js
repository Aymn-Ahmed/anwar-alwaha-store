// =========================================================================
// MAKTABAH - Profile & Orders View Component (js/ProfileOrders.js)
// =========================================================================

function ProfileOrders(props) {
  const {
    userProfile = {},
    setUserProfile,
    isEditingProfile,
    setIsEditingProfile,
    profileDraftName,
    setProfileDraftName,
    profileDraftPhone,
    setProfileDraftPhone,
    profileDraftAddress,
    setProfileDraftAddress,
    handleSaveProfile,
    customerOrders = [],
    expandedOrderCodes = {},
    setExpandedOrderCodes,
    reviewModalOrder,
    setReviewModalOrder,
    reviewDrafts = {},
    setReviewDrafts,
    isSubmittingReviews = false,
    handleOrderReviewFieldChange,
    handleReviewFileSelect,
    handleRemoveReviewFile,
    handleSubmitOrderReviews,
    showToast,
    confetti,
    activeProducts = [],
    previewReviewMedia,
    setPreviewReviewMedia,
    setActiveNavTab,
    setSelectedProduct
  } = props;

  return (
    <React.Fragment>
      {/* 1. قسم الملف الشخصي والطلبات الخمسة */}
                  <div className="p-4 pb-24 max-w-4xl mx-auto space-y-5">
                    {/* ترويسة الحساب والملف الشخصي */}
                    <div className="bg-gradient-to-r from-red-50 via-white to-zinc-50 rounded-3xl p-5 sm:p-6 border border-red-100 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#c40d00] to-red-600 text-white text-2xl flex items-center justify-center font-black shadow-md shrink-0">
                            👤
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-base sm:text-lg font-black text-zinc-900">
                                {userProfile.name ? `أهلاً بك، ${userProfile.name} 👋` : 'الملف الشخصي وحسابي 👤'}
                              </h2>
                              <span className="text-[10px] font-bold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200">
                                عميل متميز ✨
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                              مكتبة أنوار الواحة - خميس مشيط • إشراف ومتابعة طلباتك خطوة بخطوة
                            </p>
                          </div>
                        </div>

                        {/* بطاقات المؤشرات السريعة */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <div className="bg-white px-3 py-2 rounded-xl border border-zinc-200 text-center shadow-2xs">
                            <span className="text-xs font-black text-[#c40d00] block">{customerOrders.length}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">الطلبات</span>
                          </div>
                          <div className="bg-white px-3 py-2 rounded-xl border border-zinc-200 text-center shadow-2xs">
                            <span className="text-xs font-black text-emerald-600 block">{activeOrdersCount}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">قيد التنفيذ</span>
                          </div>
                          <div
                            onClick={() => setShowFavoritesModal(true)}
                            className="bg-white px-3 py-2 rounded-xl border border-zinc-200 text-center shadow-2xs cursor-pointer hover:border-red-300 transition-all"
                            title="عرض قائمة المفضلة"
                          >
                            <span className="text-xs font-black text-red-500 block">{favorites.length}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">المفضلة</span>
                          </div>
                        </div>
                      </div>

                      {/* زر الانتقال المباشر للوحة التحكم للمسؤولين */}
                      <div className="mt-4 pt-3 border-t border-red-100/70 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] text-zinc-500 font-semibold">هل أنت مسؤول أو مدير المتجر؟</span>
                        <a 
                          href="admin.html" 
                          className="py-1.5 px-3 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <span>⚙️ دخول لوحة الإدارة (Admin)</span>
                          <span>←</span>
                        </a>
                      </div>
                    </div>

 {/* القسم 1: بطاقة (بياناتي المحفوظة للتنفيذ السريع) */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-2xs">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📋</span>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-zinc-900">
                              بياناتي المحفوظة (التعبئة التلقائية للطلبات)
                            </h3>
                            <span className="text-[11px] text-zinc-400 font-medium">
                              تُحفظ في جهازك لتعبئة حقول السلة تلقائياً وتوفير وقتك في كل طلب جديد
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                          حفظ محلي آمن 🔒
                        </span>
                      </div>

                      <form onSubmit={handleSaveUserProfile} className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {/* الاسم */}
                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              الاسم الكريم / اسم الجهة أو المدرسة *
                            </label>
                            <input
                              type="text"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="مثال: فهد القحطاني أو مدرسة اليرموك"
                              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-[#c40d00] transition-colors"
                            />
                          </div>

                          {/* الجوال */}
                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              رقم الجوال للتواصل وتأكيد الطلب *
                            </label>
                            <input
                              type="tel"
                              required
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="05XXXXXXXX"
                              dir="ltr"
                              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-[#c40d00] transition-colors text-right"
                            />
                          </div>
                        </div>

                        {/* الحي والعنوان في خميس مشيط */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 mb-1">
                            الحي / العنوان الافتراضي للتوصيل (خميس مشيط والمناطق المجاورة)
                          </label>
                          <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="مثال: حي النزهة، شارع الثلاثين، بجوار مسجد الخير..."
                            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:border-[#c40d00] transition-colors"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
                          <span className="text-[11px] text-zinc-400 font-medium">
                            ✓ لن تحتاج لإعادة كتابة هذه البيانات في السلة بعد الآن
                          </span>
                          <button
                            type="submit"
                            className="px-5 py-2.5 bg-zinc-900 hover:bg-black active:scale-[0.98] text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>💾</span>
                            <span>حفظ وتثبيت البيانات</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* القسم 2: (📦 طلباتي وتتبع الطلبات خماسي المراحل) */}
                    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-2xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📦</span>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-zinc-900">
                              طلباتي وتتبع المراحل الخمس
                            </h3>
                            <span className="text-[11px] text-zinc-400 font-medium">
                              تتبع حالة مطبوعاتك ومشترياتك خطوة بخطوة، وشاركنا تقييمك بعد الاستلام ⭐
                            </span>
                          </div>
                        </div>

                        {activeOrdersCount > 0 && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 self-start sm:self-auto">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>لديك ({activeOrdersCount}) طلبات جارية قيد التنفيذ</span>
                          </span>
                        )}
                      </div>

                      {/* شريط البحث عن الطلب برقم الطلب أو الجوال */}
                      <form onSubmit={handleSearchOrder} className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={orderSearchCode}
                            onChange={(e) => setOrderSearchCode(e.target.value)}
                            placeholder="ابحث برقم الطلب (مثال: AW-1024) أو برقم الجوال..."
                            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#c40d00] shadow-2xs"
                          />
                          {orderSearchCode && (
                            <button
                              type="button"
                              onClick={() => setOrderSearchCode('')}
                              className="absolute left-3 top-2.5 text-xs text-zinc-400 hover:text-black cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={orderSearchLoading}
                          className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-black rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                        >
                          {orderSearchLoading ? 'جاري البحث...' : 'تتبع 🔍'}
                        </button>
                      </form>

                      {/* قائمة الطلبات المحفوظة */}
                      {customerOrders.length === 0 ? (
                        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-zinc-200 shadow-2xs">
                          <span className="text-4xl block mb-3">📭</span>
                          <h3 className="text-sm sm:text-base font-black text-zinc-800">لا توجد طلبات محفوظة في هذا الجهاز</h3>
                          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                            عند إرسال طلب جديد من حقيبة المشتريات سيظهر هنا تلقائياً، أو يمكنك إدخال رقم الطلب أو الجوال في شريط البحث أعلاه لاسترجاعه.
                          </p>
                          <button
                            onClick={() => { setSelectedProduct(null); setSelectedService(null); setActiveNavTab('services'); }}
                            className="mt-5 px-5 py-2.5 bg-[#c40d00] text-white text-xs font-black rounded-xl hover:bg-[#a80b00] transition-colors cursor-pointer shadow-sm"
                          >
                            تصفح خدمات وأقسام المتجر ⚡
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {customerOrders.map(order => {
                            const stageIdx = ORDER_TRACKING_STAGES.findIndex(s => s.key === order.status);
                            const currentStageIdx = stageIdx >= 0 ? stageIdx : 0;
                            const currentStage = ORDER_TRACKING_STAGES[currentStageIdx];
                            const items = Array.isArray(order.items) ? order.items : [];
                            const isExpanded = !!expandedOrderCodes[order.order_code];

                            return (
                              <div
                                key={order.order_code || order.id}
                                className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-6 shadow-2xs space-y-4 hover:border-zinc-300 transition-all"
                              >
                                {/* رأس بطاقة الطلب */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-zinc-100">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs sm:text-sm font-black bg-zinc-900 text-white px-2.5 py-1 rounded-xl">
                                      {order.order_code}
                                    </span>
                                    <span className="text-[11px] text-zinc-400 font-bold">
                                      {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                    </span>
                                    {order.delivery_method === 'branch' ? (
                                      <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg">
                                        🏪 استلام من الفرع
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-lg">
                                        🚚 توصيل للموقع
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <span className="text-xs font-black text-[#c40d00] bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-xl">
                                      {currentStage.icon} {currentStage.label}
                                    </span>
                                  </div>
                                </div>

                                {/* شريط التقدم البصري خماسي المراحل (5-Stage Visual Stepper) */}
                                <div className="pt-2 pb-1">
                                  <div className="relative flex items-center justify-between">
                                    {/* خط الربط الأفقي */}
                                    <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 h-1 bg-zinc-100 -z-0">
                                      <div
                                        className="h-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${(currentStageIdx / (ORDER_TRACKING_STAGES.length - 1)) * 100}%` }}
                                      ></div>
                                    </div>

                                    {ORDER_TRACKING_STAGES.map((stg, sIdx) => {
                                      const isDone = sIdx < currentStageIdx;
                                      const isCurrent = sIdx === currentStageIdx;
                                      return (
                                        <div key={stg.key} className="relative z-10 flex flex-col items-center">
                                          <div
                                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${isDone
                                              ? 'bg-emerald-500 text-white shadow-xs'
                                              : isCurrent
                                                ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-sm animate-pulse'
                                                : 'bg-zinc-200 text-zinc-500'
                                              }`}
                                          >
                                            {isDone ? '✓' : stg.icon}
                                          </div>
                                          <span
                                            className={`text-[9px] sm:text-[10px] mt-1.5 font-black text-center whitespace-nowrap ${isCurrent
                                              ? 'text-blue-700'
                                              : isDone
                                                ? 'text-emerald-700'
                                                : 'text-zinc-400'
                                              }`}
                                          >
                                            {stg.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* بطاقة توضيحية للمرحلة الحالية */}
                                  <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900 font-bold">
                                    <span className="text-base shrink-0">{currentStage.icon}</span>
                                    <span className="leading-snug">{currentStage.desc}</span>
                                  </div>
                                </div>

                                {/* ملاحظة الإدارة إن وُجدت */}
                                {order.admin_notes && (
                                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
                                    <span className="font-black text-amber-900 flex items-center gap-1.5">
                                      <span>📢</span>
                                      <span>ملاحظة من إدارة مكتبة أنوار الواحة:</span>
                                    </span>
                                    <p className="text-amber-800 leading-relaxed pr-5">{order.admin_notes}</p>
                                  </div>
                                )}

                                {/* تفاصيل الأصناف المشمولة في الطلب */}
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedOrderCodes(prev => ({ ...prev, [order.order_code]: !prev[order.order_code] }))}
                                    className="w-full flex items-center justify-between text-xs font-black text-zinc-700 hover:text-black py-1.5 cursor-pointer"
                                  >
                                    <span>الأصناف المطلوبة ({items.length})</span>
                                    <span>{isExpanded ? 'إخفاء التفاصيل ▲' : 'عرض التفاصيل ▼'}</span>
                                  </button>

                                  {isExpanded && (
                                    <div className="space-y-2 mt-2 pt-2 border-t border-zinc-100">
                                      {items.map((it, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-start justify-between gap-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 text-xs"
                                        >
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                              {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                              <span className="font-bold text-zinc-900 block truncate">{it.name}</span>
                                              {it.notes && (
                                                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                                                  📝 ملاحظات: {it.notes}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="text-left shrink-0">
                                            <span className="font-black text-zinc-900 block">{it.quantity || 1}×</span>
                                            {it.price && Number(it.price) > 0 ? (
                                              <span className="text-[10px] text-zinc-500 font-bold">{Number(it.price) * (it.quantity || 1)} ر.س</span>
                                            ) : (
                                              <span className="text-[10px] text-zinc-400">حسب الطلب</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                      {order.total_amount > 0 && (
                                        <div className="text-left pt-1 font-black text-xs text-zinc-900">
                                          الإجمالي: {Number(order.total_amount).toFixed(0)} ر.س
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* الشرط الذهبي للتقييم: عندما تصبح حالة الطلب (delivered) و (is_reviewed = false) */}
                                {order.status === 'delivered' && !order.is_reviewed ? (
                                  <div className="pt-2">
                                    <button
                                      onClick={() => openReviewModal(order)}
                                      className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                                    >
                                      <span className="text-base sm:text-lg">⭐</span>
                                      <span>قيّم منتجات طلبك بالصور والفيديو</span>
                                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">واكسب نقاطاً</span>
                                    </button>
                                  </div>
                                ) : order.is_reviewed ? (
                                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                                    <span>✅</span>
                                    <span>تم تقييم هذا الطلب بنجاح - شكراً لمشاركتك رأيك القيّم في المتجر</span>
                                  </div>
                                ) : null}

                                {/* زر استفسار واتساب مباشر */}
                                <div className="pt-1 flex items-center justify-end">
                                  <a
                                    href={`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(`مرحباً مكتبة أنوار الواحة 👋 أود الاستفسار عن طلبي رقم (${order.order_code}).`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-zinc-500 hover:text-black flex items-center gap-1 font-bold transition-colors"
                                  >
                                    <span>💬 استفسار عبر واتساب</span>
                                    <span className="text-[10px]">‹</span>
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* القسم 3: روابط مساعدة وخدمة العملاء أسفل الملف الشخصي */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* رابط المفضلة */}
                      <div
                        onClick={() => setShowFavoritesModal(true)}
                        className="bg-white p-4 rounded-2xl border border-zinc-200/90 hover:border-red-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 text-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            ❤️
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-zinc-900 group-hover:text-[#c40d00] transition-colors">
                              قائمة رغباتي والمفضلة
                            </h4>
                            <span className="text-[10px] text-zinc-400 font-semibold block">
                              لديك ({favorites.length}) أصناف محفوظة للرجوع إليها
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 group-hover:text-black transition-colors font-bold">
                          عرض ←
                        </span>
                      </div>

                      {/* رابط التواصل المباشر عبر واتساب */}
                      <a
                        href="https://api.whatsapp.com/send?phone=966572350050&text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85%D9%83%D8%AA%D8%A8%D8%A9%20%D8%A3%D9%86%D9%88%D8%A7%D8%B1%20%D8%A7%D9%84%D9%88%D8%A7%D8%AD%D8%A9%20%F0%9F%91%8B%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D9%88%D8%A7%D9%84%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white p-4 rounded-2xl border border-zinc-200/90 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#25D366] text-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            💬
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">
                              تواصل مع إدارة المكتبة عبر واتساب
                            </h4>
                            <span className="text-[10px] text-zinc-400 font-semibold block">
                              خدمة العملاء والرد الفوري: 0572350050
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-[#25D366] font-bold">
                          مراسلة ↗
                        </span>
                      </a>
                    </div>
                  </div>

      {/* 2. نافذة تقييم المنتجات بالوسائط المتعددة */}
          {reviewModalOrder && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
              <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4">
                {/* رأس النافذة */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 flex items-center gap-2">
                      <span className="text-amber-500">⭐</span>
                      <span>تقييم منتجات الطلب ({reviewModalOrder.order_code})</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      شاركنا تجربتك في جودة المنتجات والطباعة وارفع صوراً أو فيديو لتوثيق تقييمك
                    </p>
                  </div>
                  <button
                    onClick={() => setReviewModalOrder(null)}
                    className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* قائمة منتجات الطلب للتقييم */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                  {(reviewModalOrder.items || []).map((it, idx) => {
                    const draft = reviewDrafts[it.id] || { rating: 5, comment: '', files: [], previewUrls: [] };
                    const prodMatch = (activeProducts || []).find(p => p.id === it.id);
                    const prodImg = it.image_url || prodMatch?.img || prodMatch?.image_url || FALLBACK_IMG;

                    const starLabels = {
                      1: 'ضعيف 😞',
                      2: 'مقبول 😐',
                      3: 'جيد 🙂',
                      4: 'جيد جداً 😊',
                      5: 'ممتاز ورائع ✨'
                    };

                    return (
                      <div
                        key={it.id || idx}
                        className="bg-zinc-50/80 rounded-2xl border border-zinc-200/90 p-4 space-y-3.5"
                      >
                        {/* المنتج */}
                        <div className="flex items-center gap-3">
                          <img
                            src={prodImg}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                            className="w-12 h-12 rounded-xl object-cover border border-zinc-200 shrink-0"
                            alt=""
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-black text-zinc-900 truncate">{it.name}</h4>
                            <span className="text-[11px] text-zinc-400 font-bold block">
                              الكمية المستلمة: {it.quantity || 1}
                            </span>
                          </div>
                        </div>

                        {/* اختيار النجوم التفاعلية من 1 إلى 5 */}
                        <div className="bg-white p-3 rounded-xl border border-zinc-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-700">تقييمك للمنتج:</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-2xl text-amber-400 cursor-pointer select-none">
                              {[1, 2, 3, 4, 5].map(st => (
                                <button
                                  type="button"
                                  key={st}
                                  onClick={() => handleReviewRatingChange(it.id, st)}
                                  className="hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                                >
                                  {st <= draft.rating ? '★' : '☆'}
                                </button>
                              ))}
                            </div>
                            <span className="text-xs font-black text-amber-700 w-24 text-left">
                              {starLabels[draft.rating] || ''}
                            </span>
                          </div>
                        </div>

                        {/* كتابة التعليق */}
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 mb-1">
                            رأيك في الجودة والتنفيذ (اختياري):
                          </label>
                          <textarea
                            rows="2"
                            value={draft.comment}
                            onChange={(e) => handleReviewCommentChange(it.id, e.target.value)}
                            placeholder="صف جودة الورق، دقة الألوان، وسرعة الاستلام..."
                            className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-[#c40d00]"
                          ></textarea>
                        </div>

                        {/* رفع الصور والفيديوهات بأسلوب SHEIN */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-zinc-700">
                              📷 أضف صوراً أو فيديو حقيقي للمنتج:
                            </span>
                            <span className="text-[10px] text-zinc-400">يدعم JPG, PNG, MP4</span>
                          </div>

                          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                            {/* زر الرفع */}
                            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-300 hover:border-[#c40d00] bg-white flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0 shadow-2xs">
                              <span className="text-lg">📸</span>
                              <span className="text-[9px] font-black text-zinc-500 mt-0.5">+ رفع</span>
                              <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={(e) => handleReviewFilesSelected(it.id, e.target.files)}
                                className="hidden"
                              />
                            </label>

                            {/* المعاينة المصغرة للملفات مع زر الحذف */}
                            {(draft.previewUrls || []).map((pUrl, pIdx) => {
                              const fileObj = draft.files[pIdx];
                              const isVid = fileObj && fileObj.type && fileObj.type.startsWith('video');
                              return (
                                <div key={pIdx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-200 shadow-2xs">
                                  {isVid ? (
                                    <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">
                                      ▶ فيديو
                                    </div>
                                  ) : (
                                    <img src={pUrl} className="w-full h-full object-cover" alt="" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveReviewFile(it.id, pIdx)}
                                    className="absolute top-1 left-1 bg-red-600 hover:bg-red-700 text-white w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow-md cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* أزرار الإرسال والإلغاء */}
                <div className="pt-3 border-t border-zinc-100 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleSubmitOrderReviews}
                    disabled={isSubmittingReviews}
                    className="flex-1 py-3 px-4 bg-[#c40d00] hover:bg-[#a80b00] active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmittingReviews ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>جاري رفع الوسائط وحفظ التقييم...</span>
                      </>
                    ) : (
                      <>
                        <span>⭐</span>
                        <span>إرسال التقييمات ومشاركتها في المتجر</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModalOrder(null)}
                    className="py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
    </React.Fragment>
  );
}

// Make available globally on window
window.ProfileOrders = ProfileOrders;