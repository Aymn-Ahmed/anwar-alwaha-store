import { apiClient } from './client';
import { ApiResponse, PagedResult } from '../types/api.types';

export interface ErrorLogItem {
  id: string;
  message: string;
  exceptionType: string;
  stackTrace?: string | null;
  path: string;
  method: string;
  queryString?: string | null;
  statusCode: number;
  userAgent?: string | null;
  clientIp?: string | null;
  isResolved: boolean;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
}

export const errorLogsApi = {
  getPaged: async (
    page = 1,
    pageSize = 20,
    resolved?: boolean
  ): Promise<PagedResult<ErrorLogItem>> => {
    const params: Record<string, any> = { page, pageSize };
    if (resolved !== undefined) {
      params.resolved = resolved;
    }
    const res = await apiClient.get<ApiResponse<PagedResult<ErrorLogItem>>>('/admin/error-logs', {
      params,
    });
    return (
      res.data.data || {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
      }
    );
  },

  getById: async (id: string): Promise<ErrorLogItem> => {
    const res = await apiClient.get<ApiResponse<ErrorLogItem>>(`/admin/error-logs/${id}`);
    if (!res.data.data) throw new Error('سجل الخطأ غير موجود.');
    return res.data.data;
  },

  resolve: async (id: string, resolvedBy?: string): Promise<ErrorLogItem> => {
    const res = await apiClient.put<ApiResponse<ErrorLogItem>>(`/admin/error-logs/${id}/resolve`, {
      resolvedBy,
    });
    if (!res.data.data) throw new Error('فشل تحديد الخطأ كـ تم الحل.');
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/error-logs/${id}`);
  },

  clearResolved: async (): Promise<number> => {
    const res = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
      '/admin/error-logs/clear-resolved'
    );
    return res.data.data?.deletedCount || 0;
  },
};
