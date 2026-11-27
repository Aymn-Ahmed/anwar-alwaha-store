import { apiClient } from './client';
import { ApiResponse, PagedResult } from '../types/api.types';

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  expiryDate?: string | null;
  usageLimit?: number | null;
  timesUsed: number;
  isActive: boolean;
  description?: string | null;
  createdAt: string;
}

export interface CreateCouponPayload {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  expiryDate?: string | null;
  usageLimit?: number | null;
  isActive: boolean;
  description?: string;
}

export interface ValidateCouponResult {
  isValid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  newTotal: number;
  message: string;
}

export interface StoreSettingsResponse {
  showCouponField: boolean;
  hideUnverifiedPhotos: boolean;
}

export const couponsApi = {
  // Public
  getPublicSettings: async (): Promise<boolean> => {
    try {
      const res = await apiClient.get<ApiResponse<StoreSettingsResponse>>('/coupons/settings');
      return Boolean(res.data.data?.showCouponField);
    } catch {
      return false; // Safe default: hidden
    }
  },

  getStoreSettings: async (): Promise<StoreSettingsResponse> => {
    try {
      const res = await apiClient.get<ApiResponse<StoreSettingsResponse>>('/coupons/settings');
      return res.data.data || { showCouponField: false, hideUnverifiedPhotos: false };
    } catch {
      return { showCouponField: false, hideUnverifiedPhotos: false };
    }
  },

  validate: async (code: string, subtotal: number): Promise<ValidateCouponResult> => {
    const res = await apiClient.post<ApiResponse<ValidateCouponResult>>('/coupons/validate', {
      code,
      subtotal,
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'الكوبون غير صالح.');
    }
    return res.data.data;
  },

  // Admin
  adminGetAll: async (): Promise<CouponItem[]> => {
    const res = await apiClient.get<ApiResponse<CouponItem[]>>('/admin/coupons');
    return res.data.data || [];
  },

  adminCreate: async (payload: CreateCouponPayload): Promise<CouponItem> => {
    const res = await apiClient.post<ApiResponse<CouponItem>>('/admin/coupons', payload);
    if (!res.data.data) throw new Error(res.data.message || 'فشل إنشاء الكوبون');
    return res.data.data;
  },

  adminUpdate: async (id: string, payload: CreateCouponPayload): Promise<CouponItem> => {
    const res = await apiClient.put<ApiResponse<CouponItem>>(`/admin/coupons/${id}`, payload);
    if (!res.data.data) throw new Error(res.data.message || 'فشل تحديث الكوبون');
    return res.data.data;
  },

  adminToggleActive: async (id: string): Promise<CouponItem> => {
    const res = await apiClient.put<ApiResponse<CouponItem>>(`/admin/coupons/${id}/toggle-active`);
    if (!res.data.data) throw new Error(res.data.message || 'فشل تعديل حالة الكوبون');
    return res.data.data;
  },

  adminDelete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/coupons/${id}`);
  },

  adminGetSettings: async (): Promise<boolean> => {
    const res = await apiClient.get<ApiResponse<StoreSettingsResponse>>('/admin/coupons/settings');
    return Boolean(res.data.data?.showCouponField);
  },

  adminGetFullSettings: async (): Promise<StoreSettingsResponse> => {
    const res = await apiClient.get<ApiResponse<StoreSettingsResponse>>('/admin/coupons/settings');
    return res.data.data || { showCouponField: false, hideUnverifiedPhotos: false };
  },

  adminUpdateSettings: async (
    settings: boolean | { showCouponField?: boolean; hideUnverifiedPhotos?: boolean }
  ): Promise<boolean> => {
    const payload = typeof settings === 'boolean' ? { showCouponField: settings } : settings;
    const res = await apiClient.put<ApiResponse<StoreSettingsResponse>>('/admin/coupons/settings', payload);
    return Boolean(res.data.data?.showCouponField);
  },

  adminUpdateFullSettings: async (
    settings: { showCouponField?: boolean; hideUnverifiedPhotos?: boolean }
  ): Promise<StoreSettingsResponse> => {
    const res = await apiClient.put<ApiResponse<StoreSettingsResponse>>('/admin/coupons/settings', settings);
    return res.data.data || { showCouponField: false, hideUnverifiedPhotos: false };
  },
};
