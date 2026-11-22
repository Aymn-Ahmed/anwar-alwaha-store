import React, { useState, useEffect } from 'react';
import {
  Link2,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Layers,
  ArrowLeft,
  RefreshCw,
  Check,
} from 'lucide-react';
import {
  adminApi,
  ComplementGroup,
  CategoryComplementRule,
  ComplementGroupProduct,
} from '../../api/adminApi';
import { Category } from '../../types/category.types';
import { Product } from '../../types/product.types';
import { useToast } from '../../context/ToastContext';

export const AdminComplementsPage: React.FC = () => {
  const [groups, setGroups] = useState<ComplementGroup[]>([]);
  const [rules, setRules] = useState<CategoryComplementRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Mutual Group Modal State
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ComplementGroup | null>(null);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupActive, setGroupActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<ComplementGroupProduct[]>([]);
  const [prodSearch, setProdSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchingProds, setSearchingProds] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);

  // Category Rule Form State
  const [sourceCatId, setSourceCatId] = useState('');
  const [targetCatId, setTargetCatId] = useState('');
  const [savingRule, setSavingRule] = useState(false);

  const { showToast } = useToast();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [grps, rls, cats] = await Promise.all([
        adminApi.complements.getGroups(),
        adminApi.complements.getCategoryRules(),
        adminApi.categories.getAll(),
      ]);
      setGroups(grps);
      setRules(rls);
      setCategories(cats);
      if (cats.length >= 2 && !sourceCatId) {
        setSourceCatId(cats[0].id);
        setTargetCatId(cats[1].id);
      }
    } catch (err: any) {
      showToast(err.message || 'تعذر جلب بيانات التكميل والربط', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Product Search inside Group Modal
  useEffect(() => {
    if (!groupModalOpen) return;
    let isMounted = true;
    setSearchingProds(true);

    adminApi.products
      .getAll({ search: prodSearch.trim() || undefined, page: 1, pageSize: 15 })
      .then((res) => {
        if (isMounted) {
          setSearchResults(res.items || []);
          setSearchingProds(false);
        }
      })
      .catch(() => {
        if (isMounted) setSearchingProds(false);
      });

    return () => {
      isMounted = false;
    };
  }, [prodSearch, groupModalOpen]);

  const openCreateGroup = () => {
    setEditingGroup(null);
    setGroupTitle('');
    setGroupActive(true);
    setSelectedProducts([]);
    setProdSearch('');
    setGroupModalOpen(true);
  };

  const openEditGroup = (grp: ComplementGroup) => {
    setEditingGroup(grp);
    setGroupTitle(grp.title);
    setGroupActive(grp.isActive);
    setSelectedProducts(grp.products || []);
    setProdSearch('');
    setGroupModalOpen(true);
  };

  const toggleProductInGroup = (prod: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.productId === prod.id);
      if (exists) {
        return prev.filter((p) => p.productId !== prod.id);
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          imageUrl: prod.imageUrl,
          price: prod.price,
          categoryId: prod.categoryId,
        },
      ];
    });
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) {
      showToast('يرجى إدخال عنوان المجموعة المترابطة', 'error');
      return;
    }
    if (selectedProducts.length < 2) {
      showToast('يرجى اختيار منتجين على الأقل لربطهما ببعض', 'error');
      return;
    }

    const payload = {
      title: groupTitle.trim(),
      isActive: groupActive,
      productIds: selectedProducts.map((p) => p.productId),
    };

    try {
      setSavingGroup(true);
      if (editingGroup) {
        await adminApi.complements.updateGroup(editingGroup.id, payload);
        showToast('تم تحديث مجموعة الترابط بنجاح', 'success');
      } else {
        await adminApi.complements.createGroup(payload);
        showToast('تم إنشاء مجموعة الترابط بنجاح', 'success');
      }
      setGroupModalOpen(false);
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المجموعة', 'error');
    } finally {
      setSavingGroup(false);
    }
  };

  const handleDeleteGroup = async (id: string, title: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف مجموعة الترابط "${title}"؟`)) return;
    try {
      await adminApi.complements.deleteGroup(id);
      showToast('تم حذف المجموعة بنجاح', 'success');
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف المجموعة', 'error');
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCatId || !targetCatId) return;
    if (sourceCatId === targetCatId) {
      showToast('يرجى اختيار قسم مقترح مختلف عن القسم المصدر', 'error');
      return;
    }

    try {
      setSavingRule(true);
      await adminApi.complements.createCategoryRule({
        sourceCategoryId: sourceCatId,
        targetCategoryId: targetCatId,
        isActive: true,
      });
      showToast('تم حفظ قاعدة الربط بين القسمين بنجاح', 'success');
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'فشل إضافة قاعدة الربط', 'error');
    } finally {
      setSavingRule(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await adminApi.complements.deleteCategoryRule(id);
      showToast('تم حذف قاعدة الربط', 'info');
      fetchAll();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف القاعدة', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Link2 className="text-brand-500" size={24} />
            <span>التكميل والربط الذكي للأصناف والأقسام</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            أنشئ مجموعات منتجات مترابطة أو قواعد ربط بين الأقسام لزيادة متوسط سلة المشتريات تلقائياً
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700"
            title="تحديث"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateGroup}
            className="bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-600/20"
          >
            <Plus size={16} />
            <span>إنشاء مجموعة منتجات مترابطة</span>
          </button>
        </div>
      </div>

      {/* ==================== SECTION 1: MUTUAL PRODUCT GROUPS ==================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white">
              1. المجموعات المترابطة (Mutual Product Groups)
            </h2>
            <p className="text-xs text-gray-400">
              كل منتج داخل المجموعة يقترح بقية منتجات المجموعة تلقائياً في نافذة المنتج وسلة المشتريات
            </p>
          </div>
          <span className="text-xs font-bold bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full">
            {groups.length} مجموعات
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-40 bg-gray-900 border border-gray-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center space-y-3">
            <div className="text-3xl">🔗</div>
            <h3 className="font-bold text-sm text-white">لا توجد مجموعات مترابطة حالياً</h3>
            <p className="text-xs text-gray-400">
              مثال: أنشئ مجموعة «مستلزمات التخرج» أو «أدوات الهندسة» واربط منتجاتها ببعضها
            </p>
            <button
              onClick={openCreateGroup}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2 px-5 rounded-xl"
            >
              + إنشاء أول مجموعة مترابطة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((grp) => (
              <div
                key={grp.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{grp.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          grp.isActive
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {grp.isActive ? 'مفعّلة' : 'معطّلة'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditGroup(grp)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                        title="تعديل المجموعة"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(grp.id, grp.title)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg"
                        title="حذف المجموعة"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Linked Products Chips */}
                  <div className="flex flex-wrap gap-2">
                    {grp.products.map((p) => (
                      <div
                        key={p.productId}
                        className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 rounded-xl px-2.5 py-1.5 text-xs"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-900 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>
                        <span className="font-bold text-gray-200 max-w-[160px] truncate">
                          {p.name}
                        </span>
                        <span className="text-brand-400 font-black">{p.price.toFixed(2)} ر.س</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400">
                  عدد الأصناف المترابطة تبادلياً: <strong>{grp.products.length} أصناف</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== SECTION 2: CATEGORY COMPLEMENT RULES ==================== */}
      <section className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Layers size={18} className="text-sky-400" />
            <span>2. قواعد الربط التلقائي بين الأقسام (Category Complement Rules)</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            عندما يستعرض العميل منتجاً من «القسم المصدر»، يقترح المتجر تلقائياً أصنافاً مكملة من «القسم المقترح»
          </p>
        </div>

        {/* Add Category Rule Form */}
        <form
          onSubmit={handleCreateRule}
          className="bg-gray-950/60 border border-gray-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs"
        >
          <div className="sm:col-span-5 space-y-1">
            <label className="font-bold text-gray-300">عند شراء/تصفح منتج من القسم المصدر:</label>
            <select
              value={sourceCatId}
              onChange={(e) => setSourceCatId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="font-bold text-gray-300">اقترح أصنافاً مكملة من القسم الهدف:</label>
            <select
              value={targetCatId}
              onChange={(e) => setTargetCatId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={savingRule}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1"
            >
              <Plus size={15} />
              <span>إضافة قاعدة</span>
            </button>
          </div>
        </form>

        {/* Active Category Rules List */}
        {rules.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            لا توجد قواعد ربط أقسام مسجلة حالياً — أضف قاعدة من النموذج أعلاه.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rules.map((r) => (
              <div
                key={r.id}
                className="bg-gray-800/70 border border-gray-700 rounded-2xl p-3.5 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-white truncate">{r.sourceCategoryTitle}</span>
                  <ArrowLeft size={14} className="text-brand-400 shrink-0" />
                  <span className="font-bold text-sky-400 truncate">{r.targetCategoryTitle}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteRule(r.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg shrink-0"
                  title="حذف القاعدة"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== MODAL: CREATE / EDIT MUTUAL GROUP ==================== */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col text-xs">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-black text-sm text-white">
                {editingGroup ? 'تعديل مجموعة الترابط' : 'إنشاء مجموعة منتجات مترابطة جديدة'}
              </h3>
              <button
                onClick={() => setGroupModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-gray-300 font-bold">
                    اسم المجموعة المترابطة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder="مثال: مستلزمات التخرج، أدوات الهندسة، مستلزمات التغليف..."
                    className="w-full bg-gray-800 border border-gray-700 text-white p-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <label className="flex items-center gap-2 p-2.5 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groupActive}
                    onChange={(e) => setGroupActive(e.target.checked)}
                    className="w-4 h-4 accent-brand-600"
                  />
                  <span className="font-bold text-gray-200">مجموعة نشطة</span>
                </label>
              </div>

              {/* Selected Products in Group */}
              <div className="space-y-2">
                <label className="text-gray-300 font-bold block">
                  الأصناف المختارة في المجموعة ({selectedProducts.length}):
                </label>
                {selectedProducts.length === 0 ? (
                  <div className="p-3 rounded-xl bg-gray-950/60 border border-gray-800 text-gray-400 text-center">
                    ابحث عن الأصناف بالأسفل واضغط عليها لإضافتها للمجموعة
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((sp) => (
                      <div
                        key={sp.productId}
                        className="flex items-center gap-2 bg-brand-950 border border-brand-800 text-brand-300 px-2.5 py-1.5 rounded-xl"
                      >
                        <span className="font-bold max-w-[180px] truncate">{sp.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProducts((prev) =>
                              prev.filter((p) => p.productId !== sp.productId)
                            )
                          }
                          className="text-gray-400 hover:text-red-400"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search & Pick Products */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    placeholder="ابحث عن صنف لإضافته للمجموعة..."
                    className="w-full bg-gray-800 border border-gray-700 text-white pr-8 pl-3 py-2.5 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                  <Search
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto border border-gray-800 rounded-2xl divide-y divide-gray-800/60">
                  {searchingProds ? (
                    <div className="p-6 text-center text-gray-400">جاري البحث...</div>
                  ) : (
                    searchResults.map((prod) => {
                      const isPicked = selectedProducts.some((p) => p.productId === prod.id);
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => toggleProductInGroup(prod)}
                          className={`w-full p-2.5 flex items-center justify-between text-right hover:bg-gray-800 transition-colors ${
                            isPicked ? 'bg-brand-950/30' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{prod.categoryIcon || '📦'}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate">{prod.name}</div>
                              <div className="text-[10px] text-gray-400">
                                {prod.categoryTitle} • {prod.price.toFixed(2)} ر.س
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isPicked
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-800 border border-gray-700 text-gray-400'
                            }`}
                          >
                            {isPicked ? <Check size={13} /> : <Plus size={13} />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingGroup}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-black disabled:opacity-50"
                >
                  {savingGroup ? 'جاري الحفظ...' : 'حفظ المجموعة المترابطة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
