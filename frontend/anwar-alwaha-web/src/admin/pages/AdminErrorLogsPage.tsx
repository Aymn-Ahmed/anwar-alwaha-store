import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Code,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { errorLogsApi, ErrorLogItem } from '../../api/errorLogsApi';
import { useToast } from '../../context/ToastContext';

export const AdminErrorLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<ErrorLogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [filterResolved, setFilterResolved] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ErrorLogItem | null>(null);
  const [copiedStack, setCopiedStack] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await errorLogsApi.getPaged(
        page,
        pageSize,
        filterResolved === 'all' ? undefined : filterResolved === 'resolved'
      );
      setLogs(res.items);
      setTotalCount(res.totalCount);
    } catch (err: any) {
      showToast(err.message || 'فشل تحميل سجل الأخطاء.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterResolved, showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResolve = async (id: string) => {
    try {
      setResolvingId(id);
      await errorLogsApi.resolve(id);
      showToast('تم تحديد الخطأ كـ تم الحل بنجاح ✓', 'success');
      if (selectedLog && selectedLog.id === id) {
        setSelectedLog((prev) => (prev ? { ...prev, isResolved: true, resolvedAt: new Date().toISOString() } : null));
      }
      fetchLogs();
    } catch (err: any) {
      showToast(err.message || 'فشل حل الخطأ.', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟')) return;
    try {
      await errorLogsApi.delete(id);
      showToast('تم حذف السجل بنجاح.', 'info');
      if (selectedLog && selectedLog.id === id) {
        setSelectedLog(null);
      }
      fetchLogs();
    } catch (err: any) {
      showToast(err.message || 'فشل حذف السجل.', 'error');
    }
  };

  const handleClearResolved = async () => {
    if (!window.confirm('هل أنت متأكد من مسح جميع الأخطاء المحلولة؟')) return;
    try {
      const count = await errorLogsApi.clearResolved();
      showToast(`تم مسح ${count} سجل خطأ تم حلها.`, 'success');
      fetchLogs();
    } catch (err: any) {
      showToast(err.message || 'فشل مسح السجلات.', 'error');
    }
  };

  const handleCopyStack = (stack: string) => {
    navigator.clipboard.writeText(stack);
    setCopiedStack(true);
    showToast('تم نسخ تفاصيل الـ StackTrace إلى الحافظة بنجاح 📋', 'success');
    setTimeout(() => setCopiedStack(false), 2500);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900">سجل أخطاء السيرفر (Error Logs)</h1>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                مراقبة أخطاء الخادم (500 Exceptions) اللحظية مع تتبع الـ StackTrace وحفظ السجلات لآخر 14 يوماً تلقائياً
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-black flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-zinc-500' : ''} />
            <span>تحديث</span>
          </button>

          <button
            type="button"
            onClick={handleClearResolved}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-black flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
          >
            <Trash2 size={14} />
            <span>مسح المحلولة</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-zinc-200/80 w-fit">
        <button
          type="button"
          onClick={() => {
            setFilterResolved('unresolved');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            filterResolved === 'unresolved'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          بانتظار الحل (Unresolved)
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterResolved('all');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            filterResolved === 'all'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          جميع السجلات ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterResolved('resolved');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            filterResolved === 'resolved'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          تم حلها (Resolved)
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 font-bold">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-zinc-500" />
            جاري تحميل سجل الأخطاء...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
            <p className="font-black text-sm text-zinc-800">السيرفر يعمل بكفاءة تامة!</p>
            <p className="text-xs text-zinc-400 mt-1">لا توجد أخطاء مسجلة تطابق الفلتر الحالي.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/80 text-zinc-500 font-black">
                  <th className="p-4">الوقت والتاريخ</th>
                  <th className="p-4">النوع والحالة</th>
                  <th className="p-4">المسار (Path)</th>
                  <th className="p-4">رسالة الخطأ</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-4 text-zinc-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Clock size={13} className="text-zinc-400" />
                        <span>{new Date(log.createdAt).toLocaleTimeString('ar-SA')}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {new Date(log.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono px-2 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                          {log.method}
                        </span>
                        {log.isResolved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ محلول
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200">
                            ● بانتظار المتابعة
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-zinc-500 mt-1 truncate max-w-[150px]">
                        {log.exceptionType}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-zinc-700 max-w-[200px] truncate" title={log.path}>
                      {log.path}
                    </td>

                    <td className="p-4 text-zinc-800 max-w-[320px] font-bold">
                      <div className="truncate" title={log.message}>
                        {log.message}
                      </div>
                      {log.clientIp && (
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">IP: {log.clientIp}</div>
                      )}
                    </td>

                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-black text-[11px] transition-colors"
                        >
                          عرض التفاصيل
                        </button>
                        {!log.isResolved && (
                          <button
                            type="button"
                            onClick={() => handleResolve(log.id)}
                            disabled={resolvingId === log.id}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-black text-[11px] transition-colors"
                          >
                            تم الحل ✓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 flex items-center justify-between text-xs font-bold text-zinc-500">
            <div>
              عرض الصفحة {page} من {totalPages} (إجمالي {totalCount} سجل)
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details & StackTrace Modal */}
      {selectedLog && (
        <div
          onClick={() => setSelectedLog(null)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center gap-2">
                <span className="font-mono px-2.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white">
                  500 Server Error
                </span>
                <span className="font-mono text-xs font-black text-zinc-700 bg-zinc-200 px-2 py-1 rounded-lg">
                  {selectedLog.method} {selectedLog.path}
                </span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-full hover:bg-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-700 flex-1">
              {/* Error Message Box */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="font-black text-red-900 text-sm mb-1">{selectedLog.exceptionType}</div>
                <div className="font-bold text-red-800 leading-relaxed">{selectedLog.message}</div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <span className="text-zinc-400 font-bold block mb-0.5">توقيت الخطأ:</span>
                  <span className="font-black text-zinc-900">
                    {new Date(selectedLog.createdAt).toLocaleString('ar-SA')}
                  </span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                  <span className="text-zinc-400 font-bold block mb-0.5">الحالة:</span>
                  <span className="font-black">
                    {selectedLog.isResolved ? (
                      <span className="text-emerald-700 font-black">
                        ✓ تم الحل {selectedLog.resolvedBy ? `بواسطة ${selectedLog.resolvedBy}` : ''}
                      </span>
                    ) : (
                      <span className="text-red-600 font-black">● بحاجة لمعالجة</span>
                    )}
                  </span>
                </div>

                {selectedLog.clientIp && (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                    <span className="text-zinc-400 font-bold block mb-0.5">IP العميل:</span>
                    <span className="font-mono font-bold text-zinc-800">{selectedLog.clientIp}</span>
                  </div>
                )}

                {selectedLog.queryString && (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
                    <span className="text-zinc-400 font-bold block mb-0.5">Query String:</span>
                    <span className="font-mono font-bold text-zinc-800">{selectedLog.queryString}</span>
                  </div>
                )}
              </div>

              {/* StackTrace Box */}
              {selectedLog.stackTrace && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-zinc-800 flex items-center gap-1.5">
                      <Code size={15} className="text-zinc-500" />
                      تتبع الخطأ (StackTrace - أقصى طول 4000 حرف):
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyStack(selectedLog.stackTrace!)}
                      className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      {copiedStack ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-700">تم النسخ ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="text-zinc-500" />
                          <span>نسخ الـ StackTrace</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-zinc-950 text-zinc-200 p-4 rounded-2xl font-mono text-[11px] leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-all dir-ltr text-left border border-zinc-800 shadow-inner">
                    {selectedLog.stackTrace}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedLog.id)}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-black transition-colors"
              >
                حذف السجل
              </button>

              <div className="flex items-center gap-2">
                {!selectedLog.isResolved && (
                  <button
                    type="button"
                    onClick={() => handleResolve(selectedLog.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-colors shadow-sm"
                  >
                    تحديد كـ تم الحل ✓
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-black transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
