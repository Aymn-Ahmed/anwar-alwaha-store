// =========================================================================
// MAKTABAH - Product Detail Modal Component (js/ProductModal.js)
// =========================================================================

function ProductModal(props) {
  const ProductCard = window.ProductCard;
  const {
    product,
    selectedProduct = product,
    onClose,
    setSelectedProduct = onClose,
    onOpenBag,
    totalCartQuantity = 0,
    allProducts = [],
    activeProducts = allProducts,
    allApprovedReviews = [],
    cartItems = [],
    setCartItems,
    favorites = [],
    toggleFavorite,
    showToast,
    confetti,
    onSelectCategory,
    handleSelectCategory = onSelectCategory,
    activeBundle,
    setActiveBundle,
    selectedQuantity,
    setSelectedQuantity,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    handleAddToCart,
    handleInstantOrder,
    isInstantOrdering,
    productReviewFilter,
    setProductReviewFilter,
    previewReviewMedia,
    setPreviewReviewMedia,
    productDetailsRef,
    activeCategoryFilter,
    setActiveNavTab
  } = props;

  if (!selectedProduct) return null;

  return (
              <div ref={productDetailsRef} className="w-full bg-white pb-[100px] animate-fade-in">

                {/* رأس صفحة التفاصيل */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-zinc-200 flex items-center justify-between z-30 shadow-2xs">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex items-center gap-1.5 text-xs font-black text-black hover:text-[#c40d00] transition-colors bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    <span>‹ العودة للقائمة</span>
                  </button>

                  <span className="text-xs font-bold text-zinc-500 truncate max-w-[170px]">
                    {selectedProduct.categoryName}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setActiveNavTab('bag');
                    }}
                    className="relative p-1"
                  >
                    <span className="text-xl">🎒</span>
                    {totalCartQuantity > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#fa2c19] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {totalCartQuantity}
                      </span>
                    )}
                  </button>
                </div>

                {/* صورة المنتج الكبيرة */}
                <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden border-b border-zinc-100">
                  <img
                    src={selectedProduct.img}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                    className="w-full h-full object-cover"
                    alt={selectedProduct.name}
                  />
                  <span className="absolute top-3 right-3 bg-[#c40d00] text-white text-xs font-black px-2.5 py-1 rounded-sm shadow-md">
                    {selectedProduct.discount}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    {selectedProduct.badge}
                  </span>
                </div>

                {/* تفاصيل السعر والوصف */}
                <div className="p-4 border-b border-zinc-100">
                  {selectedProduct.price && Number(selectedProduct.price) > 0 ? (
                    <div className="flex items-baseline gap-2">
                      <PriceTag price={selectedProduct.price} size="xl" />
                      {selectedProduct.origPrice && Number(selectedProduct.origPrice) > Number(selectedProduct.price) && (
                        <span className="text-sm text-zinc-400 line-through">
                          <PriceTag price={selectedProduct.origPrice} size="sm" className="text-zinc-400" />
                        </span>
                      )}
                      {selectedProduct.origPrice && Number(selectedProduct.origPrice) > Number(selectedProduct.price) && (
                        <span className="text-xs bg-red-50 text-[#c40d00] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          وفرت {(Number(selectedProduct.origPrice) - Number(selectedProduct.price)).toFixed(0)} <SarSymbol className="w-2.5 h-2.5 inline" />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-zinc-800 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
                        السعر حسب الطلب
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">
                        تواصل لتحديد المقاس والمواصفات
                      </span>
                    </div>
                  )}

                  <h1 className="text-base font-black text-black mt-2 leading-snug">
                    {selectedProduct.name}
                  </h1>

                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    {selectedProduct.desc}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500 font-semibold">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">★ {selectedProduct.rating}</span>
                    <span>•</span>
                    <span>{selectedProduct.soldCount}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">متوفر وجاهز للاستلام الفوري ✓</span>
                  </div>
                </div>

                {/* الطبقة 1: باقات وأطقم معتمدة من المدير (Real Product Bundles) */}
                {activeBundle && activeBundle.products && activeBundle.products.length > 0 && (
                  <div className="p-4 border-b border-zinc-100">
                    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-3.5 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-200/60 mb-2.5">
                        <span className="text-xs font-black text-purple-900 flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">🎁</span>
                          <span className="truncate">عرض الباقة: {activeBundle.title}</span>
                        </span>
                        {activeBundle.savings > 0 && (
                          <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                            وفر {activeBundle.savings} <SarSymbol className="w-2 h-2 inline" /> ({activeBundle.savingsPercent}%)
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
                        {activeBundle.products.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs bg-white/90 p-2 rounded-xl">
                            <span className="font-bold text-zinc-800 flex items-center gap-1.5 min-w-0">
                              <span className="text-purple-600 font-black shrink-0">✓</span>
                              <span className="truncate">{item.name}</span>
                            </span>
                            {item.price && Number(item.price) > 0 ? (
                              <PriceTag price={item.price} size="xs" className="text-zinc-900 shrink-0" showDecimals={false} />
                            ) : (
                              <span className="text-[9px] text-zinc-400 shrink-0">حسب الطلب</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleAddFullBundle}
                        className="w-full bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-800 hover:to-purple-950 text-white font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="inline-flex items-center gap-1">
                          🛍️ أضف الطقم كاملاً بـ <PriceTag price={activeBundle.bundlePrice} size="xs" className="text-white" showDecimals={false} />
                        </span>
                        {activeBundle.originalTotal > activeBundle.bundlePrice && (
                          <span className="text-purple-200 line-through text-[11px] inline-flex items-center gap-0.5">
                            (<PriceTag price={activeBundle.originalTotal} size="xs" className="text-purple-200" showDecimals={false} />)
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* الطبقة 2: المكملات الوظيفية الإجبارية */}
                {functionalComplements.length > 0 && (
                  <div className="p-4 border-b border-zinc-100">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-black text-black flex items-center gap-1">
                        <span>💡 مستلزمات لا غنى عنها مع هذا الصنف:</span>
                      </span>
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">توافق تام ✓</span>
                    </div>

                    <div className="space-y-2">
                      {functionalComplements.map(comp => (
                        <div key={comp.id} className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/80 flex items-center justify-between gap-2">
                          <img
                            src={comp.img}
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-black line-clamp-1">{comp.name}</h4>
                            <PriceTag price={comp.price} size="xs" />
                          </div>
                          <button
                            onClick={() => addToCart(comp)}
                            className="bg-black hover:bg-zinc-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer"
                          >
                            + أضف للسلة
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ========================================================================= */}
                {/* 2. قسم "أصناف مقترحة / قد يعجبك أيضاً" (Related / Recommended Products)   */}
                {/* ========================================================================= */}
                {recommendedProducts.length > 0 && (
                  <div className="p-4 border-t border-zinc-100 bg-[#fafafa]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-black text-black flex items-center gap-1.5">
                          <span>🏷️ أصناف مقترحة قد تعجبك أيضاً:</span>
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          أصناف منتقاة بعناية من قسم ({selectedProduct.categoryName}) والأكثر طلباً
                        </p>
                      </div>
                      <span className="text-[10px] bg-red-50 text-[#c40d00] font-black px-2 py-0.5 rounded-full border border-red-200 shrink-0">
                        {recommendedProducts.length} مقترحات
                      </span>
                    </div>

                    {/* شبكة منظمة للأصناف المقترحة */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {recommendedProducts.map(rec => (
                        <ProductCard
                          key={rec.id}
                          product={rec}
                          onSelect={handleSelectRecommendedProduct}
                        />
                      ))}
                    </div>
                  </div>
                )}


                {/* ========================================================================= */}
                {/* 3. قسم: منتجات تُكمل طلبك مع زر طلب مباشر عبر واتساب                      */}
                {/* ========================================================================= */}
                {complementaryProducts.length > 0 && (
                  <div className="p-4 border-t border-zinc-200/80 bg-zinc-50/70">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-zinc-900 flex items-center gap-2">
                          <span className="text-emerald-600">✨</span>
                          <span>منتجات تُكمل طلبك</span>
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          أصناف مكملة مقترحة تناسب هذا الطلب مع إمكانية الطلب الفوري عبر واتساب
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200/80 shrink-0">
                        {complementaryProducts.length} مقترحات
                      </span>
                    </div>

                    {/* شبكة بطاقات نظيفة وموحدة الأبعاد */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {complementaryProducts.map(comp => (
                        <div
                          key={comp.id}
                          onClick={() => {
                            setSelectedProduct(comp);
                            window.scrollTo({ top: 0, behavior: 'instant' });
                            if (productDetailsRef.current) {
                              productDetailsRef.current.scrollTop = 0;
                            }
                          }}
                          className="bg-white rounded-2xl border border-zinc-200/90 hover:border-emerald-600 p-3 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                        >
                          {/* صورة المنتج بنسبة موحدة aspect-square */}
                          <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 mb-2.5">
                            <img
                              src={comp.img || comp.image_url || FALLBACK_IMG}
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              alt={comp.name}
                              loading="lazy"
                            />
                            {comp.price && Number(comp.price) > 0 ? (
                              <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs">
                                <PriceTag price={comp.price} size="xs" className="text-white" showDecimals={false} />
                              </span>
                            ) : (
                              <span className="absolute bottom-2 right-2 bg-zinc-900/80 backdrop-blur-xs text-zinc-300 text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
                                حسب الطلب
                              </span>
                            )}
                          </div>

                          {/* العنوان والتفاصيل */}
                          <div className="flex-1 flex flex-col justify-between">
                            <h4
                              className="text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 min-h-[2.4rem] leading-snug"
                              title={comp.name}
                            >
                              {comp.name}
                            </h4>

                            {/* زر طلب مباشر عبر واتساب 0572350050 */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const priceText = comp.price && Number(comp.price) > 0 ? `\n(السعر: ${Number(comp.price).toFixed(0)} ر.س)` : '';
                                const msg = `مرحباً مكتبة أنوار الواحة 👋\nأود طلب المنتج المكمل: *${comp.name}*${priceText}\nالتابع لطلبي الأساسي: *${selectedProduct.name}*`;
                                window.open(`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="w-full mt-3 py-2 px-3 bg-[#25D366] hover:bg-[#1faa53] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <span>طلب مكمل عبر واتساب</span>
                              <span>💬</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 4. قسم: تقييمات العملاء وآراؤهم بالصور والفيديو (SHEIN Style Reviews)      */}
                {/* ========================================================================= */}
                {(() => {
                  const currentProdReviews = allApprovedReviews.filter(r => r.product_id === selectedProduct.id);
                  const totalCount = currentProdReviews.length;
                  const avgRating = totalCount > 0 ? (currentProdReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1) : '5.0';
                  const mediaReviews = currentProdReviews.filter(r => r.media_urls && r.media_urls.length > 0);
                  const displayedReviews = productReviewFilter === 'media' ? mediaReviews : currentProdReviews;

                  // إحصاءات النجوم من 1 إلى 5
                  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                  currentProdReviews.forEach(r => {
                    if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
                  });

                  return (
                    <div className="p-4 border-t border-zinc-200/80 bg-white space-y-4">
                      {/* رأس القسم */}
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-zinc-900 flex items-center gap-2">
                            <span className="text-amber-500">⭐</span>
                            <span>تقييمات العملاء وآراؤهم</span>
                          </h3>
                          <p className="text-[11px] text-zinc-500 mt-0.5">
                            تجارب حقيقية وموثقة من عملاء استلموا هذا المنتج من مكتبة أنوار الواحة
                          </p>
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-800 font-black px-2.5 py-1 rounded-full border border-amber-200">
                          {totalCount} تقييم
                        </span>
                      </div>

                      {/* بطاقة ملخص التقييم العام وتوزيع النجوم */}
                      {totalCount > 0 ? (
                        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col sm:flex-row items-center gap-6">
                          {/* الدرجة الكلية والنجوم */}
                          <div className="text-center sm:border-l sm:border-zinc-200 sm:pl-6 shrink-0">
                            <span className="text-3xl sm:text-4xl font-black text-zinc-900 block">{avgRating}</span>
                            <div className="flex items-center justify-center gap-0.5 text-amber-400 text-sm mt-1">
                              {[1, 2, 3, 4, 5].map(st => (
                                <span key={st}>{st <= Math.round(Number(avgRating)) ? '★' : '☆'}</span>
                              ))}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-bold block mt-1">من أصل 5 نجوم</span>
                          </div>

                          {/* أشرطة توزيع النجوم */}
                          <div className="flex-1 w-full space-y-1.5">
                            {[5, 4, 3, 2, 1].map(stars => {
                              const cnt = starCounts[stars] || 0;
                              const pct = totalCount > 0 ? Math.round((cnt / totalCount) * 100) : 0;
                              return (
                                <div key={stars} className="flex items-center gap-2 text-xs">
                                  <span className="w-10 text-zinc-600 font-bold text-[11px] shrink-0 text-right">{stars} نجوم</span>
                                  <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                  <span className="w-8 text-[10px] text-zinc-400 font-mono text-left shrink-0">{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-zinc-50 rounded-2xl p-6 text-center border border-zinc-100">
                          <span className="text-3xl block mb-2">✨</span>
                          <h4 className="text-xs font-black text-zinc-800">كن أول من يقيّم هذا المنتج!</h4>
                          <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                            التقييمات بالصور والفيديو متاحة لعملائنا الكرام بعد استلام الطلب وتأكيده عبر زر "طلباتي 📦".
                          </p>
                        </div>
                      )}

                      {/* أزرار الفلترة: الكل vs مع صور وفيديو */}
                      {totalCount > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setProductReviewFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${productReviewFilter === 'all'
                              ? 'bg-zinc-900 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                              }`}
                          >
                            جميع التقييمات ({totalCount})
                          </button>
                          <button
                            onClick={() => setProductReviewFilter('media')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${productReviewFilter === 'media'
                              ? 'bg-[#c40d00] text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                              }`}
                          >
                            <span>📷</span>
                            <span>بالصور والفيديو ({mediaReviews.length})</span>
                          </button>
                        </div>
                      )}

                      {/* قائمة بطاقات التقييمات */}
                      {displayedReviews.length > 0 && (
                        <div className="space-y-3 pt-2">
                          {displayedReviews.map(rev => {
                            const mediaList = Array.isArray(rev.media_urls) ? rev.media_urls : [];
                            return (
                              <div
                                key={rev.id}
                                className="bg-white rounded-2xl border border-zinc-200/80 p-3.5 shadow-2xs space-y-2 hover:border-zinc-300 transition-all"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-black text-zinc-900">{rev.customer_name}</span>
                                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                                      <span>✓</span>
                                      <span>شراء موثق</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center text-amber-500 text-xs">
                                    {[1, 2, 3, 4, 5].map(st => (
                                      <span key={st}>{st <= rev.rating ? '★' : '☆'}</span>
                                    ))}
                                  </div>
                                </div>

                                {rev.comment && (
                                  <p className="text-xs text-zinc-700 leading-relaxed">
                                    "{rev.comment}"
                                  </p>
                                )}

                                {/* معرض وسائط التقييم (صور وفيديو بأسلوب SHEIN) */}
                                {mediaList.length > 0 && (
                                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                                    {mediaList.map((mUrl, mIdx) => {
                                      const isVideo = typeof mUrl === 'string' && (mUrl.includes('.mp4') || mUrl.includes('.webm') || mUrl.includes('.mov') || mUrl.includes('video'));
                                      return (
                                        <div
                                          key={mIdx}
                                          onClick={() => setPreviewReviewMedia({ url: mUrl, isVideo })}
                                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0 cursor-pointer group shadow-2xs"
                                        >
                                          {isVideo ? (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white text-[10px] font-bold">
                                              ▶ فيديو
                                            </div>
                                          ) : (
                                            <img
                                              src={mUrl}
                                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                              alt=""
                                            />
                                          )}
                                          <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                                            🔍
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ========================================================================= */}
                {/* الشريط الثابت السفلي في صفحة التفاصيل (Sticky Add-to-Cart Bar)             */}
                {/* ========================================================================= */}
                <div className="fixed bottom-0 inset-x-0 w-full max-w-md sm:max-w-xl mx-auto bg-white/95 backdrop-blur-md border-t border-zinc-200 px-3 py-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 flex items-center gap-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">

                  {/* عداد الكمية (+ / -) يبدأ من 1 */}
                  <div className="flex items-center bg-zinc-100 rounded-xl p-1 border border-zinc-200/80 shrink-0">
                    <button
                      onClick={handleDecreaseQuantity}
                      disabled={selectedQuantity <= 1}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm transition-all ${selectedQuantity <= 1
                        ? 'text-zinc-300 cursor-not-allowed'
                        : 'bg-white text-zinc-900 shadow-2xs hover:bg-zinc-200 cursor-pointer active:scale-95'
                        }`}
                      title="تقليل الكمية"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-black text-xs text-zinc-900 select-none">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={handleIncreaseQuantity}
                      className="w-7 h-7 rounded-lg bg-white text-zinc-900 shadow-2xs hover:bg-zinc-200 flex items-center justify-center font-black text-sm cursor-pointer active:scale-95 transition-all"
                      title="زيادة الكمية"
                    >
                      +
                    </button>
                  </div>

                  {/* الزر الرئيسي العريض: إضافة إلى السلة أو استفسار واتساب حسب وجود السعر */}
                  {selectedProduct.price && Number(selectedProduct.price) > 0 ? (
                    <button
                      onClick={handleAddToCartWithQty}
                      className="flex-1 bg-[#c40d00] hover:bg-red-800 text-white font-black text-xs py-3 px-3.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-between gap-2"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>🛍️</span>
                        <span>إضافة إلى السلة</span>
                      </span>
                      <span className="bg-black/25 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap">
                        <PriceTag price={Number(selectedProduct.price) * selectedQuantity} size="sm" className="text-white" showDecimals={false} />
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const msg = `مرحباً مكتبة أنوار الواحة 👋\nأود الاستفسار وطلب: *${selectedProduct.name}*\n(الكمية المطلوبة: ${selectedQuantity})\nأرجو تزويدي بالسعر وتفاصيل التنفيذ.`;
                        window.open(`https://api.whatsapp.com/send?phone=966572350050&text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="flex-1 bg-[#25D366] hover:bg-[#1faa53] text-white font-black text-xs py-3 px-3.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="text-base">💬</span>
                      <span>استفسر واطلب عبر واتساب (السعر حسب الطلب)</span>
                    </button>
                  )}

                  {/* زر إغلاق / رجوع ثانوي أنيق */}
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs p-3 rounded-xl cursor-pointer transition-all shrink-0"
                    title="الرجوع للقائمة"
                  >
                    ✕
                  </button>

                </div>

              </div>
  );
}

// Make available globally on window
window.ProductModal = ProductModal;