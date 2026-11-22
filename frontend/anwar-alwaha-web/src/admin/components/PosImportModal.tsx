import React, { useMemo, useRef, useState } from 'react';
import { X, Upload, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { adminApi, ImportProductItem } from '../../api/adminApi';
import { Category } from '../../types/category.types';
import { useToast } from '../../context/ToastContext';

const PAGE_SIZE = 50;

interface Row extends ImportProductItem {
  key: number;
  selected: boolean;
}

interface Props {
  open: boolean;
  categories: Category[];
  onClose: () => void;
  onImported: () => void;
}

export const PosImportModal: React.FC<Props> = ({ open, categories, onClose, onImported }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const reset = () => {
    setRows([]);
    setSkipped(0);
    setSearch('');
    setCatFilter('');
    setStatusFilter('');
    setPage(1);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const res = await adminApi.products.previewPosCsv(file);
      setRows(res.items.map((it, i) => ({ ...it, key: i, selected: true })));
      setSkipped(res.skippedRows);
      setPage(1);
    } catch (err: any) {
      showToast(err.message || 'فشل قراءة الملف', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || (r.barcode || '').includes(q)) &&
        (!catFilter || r.categoryId === catFilter) &&
        (!statusFilter || r.status === statusFilter)
    );
  }, [rows, search, catFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selectedCount = rows.reduce((n, r) => n + (r.selected ? 1 : 0), 0);
  const pageAllSelected = pageRows.length > 0 && pageRows.every((r) => r.selected);

  const patchRows = (keys: Set<number>, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (keys.has(r.key) ? { ...r, ...patch } : r)));

  const handleConfirm = async () => {
    const payload = rows
      .filter((r) => r.selected)
      .map(({ key, selected, ...rest }) => rest as ImportProductItem);
    if (payload.length === 0) {
      showToast('لم يتم تحديد أي صنف', 'error');
      return;
    }
    try {
      setSaving(true);
      const s = await adminApi.products.confirmImport(payload);
      showToast(`تمت الإضافة: ${s.added} — التحديث: ${s.updated}`, 'success');
      reset();
      onImported();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'فشل الاستيراد', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-6xl max-h-full flex flex-col text-white text-xs">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="text-base font-black">استيراد من ملف الكاشير (CSV)</h2>
            {rows.length > 0 && (
              <p className="text-gray-400 mt-0.5">
                {rows.length} صنف صالح — {rows.filter((r) => r.status === 'New').length} جديد /{' '}
                {rows.filter((r) => r.status === 'Update').length} تحديث — تم استبعاد {skipped} صف
              </p>
            )}
          </div>
          <button onClick={() => { reset(); onClose(); }} className="p-2 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-4">
            {loading ? (
              <Loader2 className="animate-spin" size={32} />
            ) : (
              <>
                <p className="text-gray-400">اختر ملف CSV (فاصلة منقوطة، UTF-8) لمعاينته قبل الحفظ</p>
                <label className="cursor-pointer bg-brand-600 hover:bg-brand-700 font-extrabold py-2.5 px-5 rounded-xl flex items-center gap-2">
                  <Upload size={16} />
                  <span>اختيار الملف</span>
                  <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
                </label>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="p-3 flex flex-wrap items-center gap-2 border-b border-gray-800">
              <div className="relative min-w-[200px] flex-1 max-w-xs">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="بحث بالاسم أو الباركود..."
                  className="w-full bg-gray-800 border border-gray-700 pr-8 pl-3 py-2 rounded-xl focus:outline-none focus:border-brand-500"
                />
                <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <select
                value={catFilter}
                onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
                className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-xl"
              >
                <option value="">كل الأقسام</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-xl"
              >
                <option value="">كل الحالات</option>
                <option value="New">جديد</option>
                <option value="Update">تحديث</option>
              </select>
              <button
                onClick={() => patchRows(new Set(filtered.map((r) => r.key)), { selected: true })}
                className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-xl hover:bg-gray-700"
              >
                تحديد كل النتائج ({filtered.length})
              </button>
              <button
                onClick={() => patchRows(new Set(filtered.map((r) => r.key)), { selected: false })}
                className="bg-gray-800 border border-gray-700 px-3 py-2 rounded-xl hover:bg-gray-700"
              >
                إلغاء تحديد النتائج
              </button>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-right">
                <thead className="bg-gray-800 sticky top-0 text-gray-300">
                  <tr>
                    <th className="p-2 w-8">
                      <input
                        type="checkbox"
                        checked={pageAllSelected}
                        onChange={(e) => patchRows(new Set(pageRows.map((r) => r.key)), { selected: e.target.checked })}
                      />
                    </th>
                    <th className="p-2">الصنف</th>
                    <th className="p-2">الباركود</th>
                    <th className="p-2">السعر</th>
                    <th className="p-2">الحالة</th>
                    <th className="p-2">القسم</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.key} className={`border-t border-gray-800 ${r.selected ? '' : 'opacity-40'}`}>
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={r.selected}
                          onChange={(e) => patchRows(new Set([r.key]), { selected: e.target.checked })}
                        />
                      </td>
                      <td className="p-2 font-bold max-w-[320px] truncate" title={r.name}>{r.name}</td>
                      <td className="p-2 text-gray-400" dir="ltr">{r.barcode || '—'}</td>
                      <td className="p-2">
                        {r.price.toFixed(2)}
                        {r.status === 'Update' && r.existingPrice != null && r.existingPrice !== r.price && (
                          <span className="text-gray-500 line-through mr-1">{r.existingPrice.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${r.status === 'New' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                          {r.status === 'New' ? 'جديد' : 'تحديث'}
                        </span>
                      </td>
                      <td className="p-2">
                        <select
                          value={r.categoryId}
                          onChange={(e) => patchRows(new Set([r.key]), { categoryId: e.target.value })}
                          className="bg-gray-800 border border-gray-700 px-2 py-1 rounded-lg max-w-[200px]"
                        >
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {pageRows.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">لا توجد نتائج</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="p-1.5 bg-gray-800 rounded-lg disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
                <span>صفحة {safePage} من {totalPages}</span>
                <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="p-1.5 bg-gray-800 rounded-lg disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={reset} className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-700">
                  اختيار ملف آخر
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving || selectedCount === 0}
                  className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 font-extrabold px-5 py-2 rounded-xl flex items-center gap-2"
                >
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  اعتماد وحفظ المحدد ({selectedCount})
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
