import { apiClient } from './client';
import { ApiResponse, PagedResult } from '../types/api.types';
import {
  AuthResponse,
  DashboardStats,
  OrderAdminSummary,
  BulkProductUpdateItem,
  QuickProductPatch,
  ProductCreateUpdate,
  CategoryCreateUpdate,
  CategoryReorderItem,
  CategoryTransferRequest,
  ServiceCreateUpdate,
  OrderStatusUpdate,
} from '../types/admin.types';
import { ServiceItem } from '../types/service.types';
import { Product, ProductDetail, ProductQueryParams } from '../types/product.types';
import { Category } from '../types/category.types';
import { OrderResponse } from '../types/order.types';
import { ProductReview } from '../types/review.types';
import { ProductBundle } from '../types/bundle.types';

export interface ImportProductItem {
  barcode?: string | null;
  name: string;
  price: number;
  categoryId: string;
  status: 'New' | 'Update';
  existingProductId?: string | null;
  existingPrice?: number | null;
}

export interface PosPreviewResult {
  totalRows: number;
  skippedRows: number;
  newCount: number;
  updateCount: number;
  items: ImportProductItem[];
}

export interface ImportSummary {
  added: number;
  updated: number;
  skipped: number;
}

export interface BarcodeImageStats {
  totalProducts: number;
  withImageCount: number;
  eligibleForFetchCount: number;
  notFoundCount: number;
  isRunning?: boolean;
  sessionProcessed?: number;
  sessionUploaded?: number;
  sessionNotFound?: number;
  quotaExceeded?: boolean;
  lastMessage?: string | null;
}

export interface BarcodeImageBatchResult {
  processed: number;
  foundAndUploaded: number;
  notFound: number;
  remainingEligible: number;
  quotaExceeded?: boolean;
  message?: string | null;
}

export interface KeywordEnrichmentStatus {
  totalProducts: number;
  enrichedCount: number;
  remainingCount: number;
  isRunning: boolean;
  sessionProcessed: number;
  lastMessage?: string | null;
}

export interface ComplementGroupProduct {
  productId: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  categoryId: string;
}

export interface ComplementGroup {
  id: string;
  title: string;
  isActive: boolean;
  products: ComplementGroupProduct[];
}

export interface ComplementGroupCreateUpdate {
  title: string;
  isActive: boolean;
  productIds: string[];
}

export interface CategoryComplementRule {
  id: string;
  sourceCategoryId: string;
  sourceCategoryTitle: string;
  targetCategoryId: string;
  targetCategoryTitle: string;
  isActive: boolean;
}

export interface CategoryComplementRuleCreate {
  sourceCategoryId: string;
  targetCategoryId: string;
  isActive: boolean;
}

export const adminApi = {
  auth: {
    login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      const res = await apiClient.post<ApiResponse<AuthResponse>>('/admin/auth/login', credentials);
      if (!res.data.data) throw new Error(res.data.message || 'فشل تسجيل الدخول');
      return res.data.data;
    },

    refresh: async (): Promise<AuthResponse> => {
      const res = await apiClient.post<ApiResponse<AuthResponse>>('/admin/auth/refresh', {});
      if (!res.data.data) throw new Error(res.data.message || 'فشل تجديد الجلسة');
      return res.data.data;
    },

    logout: async (): Promise<void> => {
      await apiClient.post('/admin/auth/logout', {});
    },
  },

  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
      return res.data.data || {
        totalOrders: 0,
        totalSales: 0,
        pendingOrders: 0,
        lowStockProductsCount: 0,
        totalProducts: 0,
        totalCategories: 0,
        recentOrders: [],
      };
    },
  },

  products: {
    getAll: async (params?: ProductQueryParams): Promise<PagedResult<Product>> => {
      const res = await apiClient.get<ApiResponse<PagedResult<Product>>>('/admin/products', { params });
      return res.data.data || { items: [], totalCount: 0, page: 1, pageSize: 20 };
    },

    getById: async (id: string): Promise<ProductDetail | null> => {
      const res = await apiClient.get<ApiResponse<ProductDetail>>(`/admin/products/${id}`);
      return res.data.data || null;
    },

    create: async (data: ProductCreateUpdate): Promise<Product> => {
      const res = await apiClient.post<ApiResponse<Product>>('/admin/products', data);
      if (!res.data.data) throw new Error(res.data.message || 'فشل إضافة المنتج');
      return res.data.data;
    },

    update: async (id: string, data: ProductCreateUpdate): Promise<Product> => {
      const res = await apiClient.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
      if (!res.data.data) throw new Error(res.data.message || 'فشل تعديل المنتج');
      return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/products/${id}`);
    },

    deleteImage: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/products/${id}/image`);
    },

    bulkUpdate: async (items: BulkProductUpdateItem[]): Promise<number> => {
      const res = await apiClient.patch<ApiResponse<number>>('/admin/products/bulk', items);
      return res.data.data || 0;
    },

    quickPatch: async (items: QuickProductPatch[]): Promise<number> => {
      const res = await apiClient.patch<ApiResponse<number>>('/admin/products/quick-patch', items);
      return res.data.data || 0;
    },

    previewPosCsv: async (file: File): Promise<PosPreviewResult> => {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.post<ApiResponse<PosPreviewResult>>('/admin/products/preview-pos-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      return res.data.data as PosPreviewResult;
    },

    confirmImport: async (items: ImportProductItem[]): Promise<ImportSummary> => {
      const res = await apiClient.post<ApiResponse<ImportSummary>>('/admin/products/confirm-import', items, {
        timeout: 300000,
      });
      return res.data.data as ImportSummary;
    },

    getBarcodeImageStats: async (): Promise<BarcodeImageStats> => {
      const res = await apiClient.get<ApiResponse<BarcodeImageStats>>('/admin/products/barcode-images/stats');
      return res.data.data as BarcodeImageStats;
    },

    startBarcodeImagesFetch: async (apiKey?: string, batchSize: number = 25): Promise<BarcodeImageStats> => {
      const res = await apiClient.post<ApiResponse<BarcodeImageStats>>(
        '/admin/products/barcode-images/start',
        { apiKey: apiKey?.trim() || undefined, batchSize }
      );
      return res.data.data as BarcodeImageStats;
    },

    stopBarcodeImagesFetch: async (): Promise<BarcodeImageStats> => {
      const res = await apiClient.post<ApiResponse<BarcodeImageStats>>(
        '/admin/products/barcode-images/stop',
        {}
      );
      return res.data.data as BarcodeImageStats;
    },

    fetchBarcodeImagesBatch: async (batchSize: number = 25, apiKey?: string): Promise<BarcodeImageBatchResult> => {
      const res = await apiClient.post<ApiResponse<BarcodeImageBatchResult>>(
        `/admin/products/barcode-images/fetch-batch?batchSize=${batchSize}`,
        { batchSize, apiKey: apiKey?.trim() || undefined },
        { timeout: 180000 }
      );
      return res.data.data as BarcodeImageBatchResult;
    },

    resetBarcodeImageAttempts: async (): Promise<number> => {
      const res = await apiClient.post<ApiResponse<number>>('/admin/products/barcode-images/reset-attempts', {});
      return res.data.data || 0;
    },

    getKeywordsStatus: async (): Promise<KeywordEnrichmentStatus> => {
      const res = await apiClient.get<ApiResponse<KeywordEnrichmentStatus>>('/admin/products/keywords/status');
      return res.data.data as KeywordEnrichmentStatus;
    },

    startKeywordsEnrichment: async (): Promise<KeywordEnrichmentStatus> => {
      const res = await apiClient.post<ApiResponse<KeywordEnrichmentStatus>>('/admin/products/keywords/start', {});
      return res.data.data as KeywordEnrichmentStatus;
    },

    stopKeywordsEnrichment: async (): Promise<KeywordEnrichmentStatus> => {
      const res = await apiClient.post<ApiResponse<KeywordEnrichmentStatus>>('/admin/products/keywords/stop', {});
      return res.data.data as KeywordEnrichmentStatus;
    },
  },

  categories: {
    getAll: async (): Promise<Category[]> => {
      const res = await apiClient.get<ApiResponse<Category[]>>('/admin/categories');
      return res.data.data || [];
    },

    create: async (data: CategoryCreateUpdate): Promise<Category> => {
      const res = await apiClient.post<ApiResponse<Category>>('/admin/categories', data);
      if (!res.data.data) throw new Error(res.data.message || 'فشل إنشاء القسم');
      return res.data.data;
    },

    update: async (id: string, data: CategoryCreateUpdate): Promise<Category> => {
      const res = await apiClient.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
      if (!res.data.data) throw new Error(res.data.message || 'فشل تعديل القسم');
      return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/categories/${id}`);
    },

    transferProducts: async (data: CategoryTransferRequest): Promise<number> => {
      const res = await apiClient.post<ApiResponse<number>>('/admin/categories/transfer-products', data);
      return res.data.data || 0;
    },

    reorder: async (items: CategoryReorderItem[]): Promise<number> => {
      const res = await apiClient.patch<ApiResponse<number>>('/admin/categories/reorder', items);
      return res.data.data || 0;
    },
  },

  services: {
    getAll: async (): Promise<ServiceItem[]> => {
      const res = await apiClient.get<ApiResponse<ServiceItem[]>>('/admin/services');
      return res.data.data || [];
    },

    create: async (data: ServiceCreateUpdate): Promise<ServiceItem> => {
      const res = await apiClient.post<ApiResponse<ServiceItem>>('/admin/services', data);
      return res.data.data as ServiceItem;
    },

    update: async (id: string, data: ServiceCreateUpdate): Promise<ServiceItem> => {
      const res = await apiClient.put<ApiResponse<ServiceItem>>(`/admin/services/${id}`, data);
      return res.data.data as ServiceItem;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/services/${id}`);
    },
  },

  orders: {
    getAll: async (params?: { status?: string; page?: number; pageSize?: number }): Promise<PagedResult<OrderAdminSummary>> => {
      const res = await apiClient.get<ApiResponse<PagedResult<OrderAdminSummary>>>('/admin/orders', { params });
      return res.data.data || { items: [], totalCount: 0, page: 1, pageSize: 20 };
    },

    getById: async (id: string): Promise<OrderResponse | null> => {
      const res = await apiClient.get<ApiResponse<OrderResponse>>(`/admin/orders/${id}`);
      return res.data.data || null;
    },

    updateStatus: async (id: string, data: OrderStatusUpdate): Promise<OrderResponse> => {
      const res = await apiClient.patch<ApiResponse<OrderResponse>>(`/admin/orders/${id}/status`, data);
      if (!res.data.data) throw new Error(res.data.message || 'فشل تحديث حالة الطلب');
      return res.data.data;
    },
  },

  reviews: {
    getAll: async (params?: { isApproved?: boolean; page?: number; pageSize?: number }): Promise<PagedResult<ProductReview>> => {
      const res = await apiClient.get<ApiResponse<PagedResult<ProductReview>>>('/admin/reviews', { params });
      return res.data.data || { items: [], totalCount: 0, page: 1, pageSize: 20 };
    },

    approve: async (id: string): Promise<void> => {
      await apiClient.patch(`/admin/reviews/${id}/approve`);
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/reviews/${id}`);
    },
  },

  bundles: {
    getAll: async (): Promise<ProductBundle[]> => {
      const res = await apiClient.get<ApiResponse<ProductBundle[]>>('/admin/bundles');
      return res.data.data || [];
    },

    create: async (data: any): Promise<ProductBundle> => {
      const res = await apiClient.post<ApiResponse<ProductBundle>>('/admin/bundles', data);
      if (!res.data.data) throw new Error(res.data.message || 'فشل إنشاء الباقة');
      return res.data.data;
    },

    update: async (id: string, data: any): Promise<ProductBundle> => {
      const res = await apiClient.put<ApiResponse<ProductBundle>>(`/admin/bundles/${id}`, data);
      if (!res.data.data) throw new Error(res.data.message || 'فشل تعديل الباقة');
      return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/bundles/${id}`);
    },
  },

  complements: {
    getGroups: async (): Promise<ComplementGroup[]> => {
      const res = await apiClient.get<ApiResponse<ComplementGroup[]>>('/admin/complements/groups');
      return res.data.data || [];
    },

    createGroup: async (data: ComplementGroupCreateUpdate): Promise<ComplementGroup> => {
      const res = await apiClient.post<ApiResponse<ComplementGroup>>('/admin/complements/groups', data);
      return res.data.data as ComplementGroup;
    },

    updateGroup: async (id: string, data: ComplementGroupCreateUpdate): Promise<ComplementGroup> => {
      const res = await apiClient.put<ApiResponse<ComplementGroup>>(`/admin/complements/groups/${id}`, data);
      return res.data.data as ComplementGroup;
    },

    deleteGroup: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/complements/groups/${id}`);
    },

    getCategoryRules: async (): Promise<CategoryComplementRule[]> => {
      const res = await apiClient.get<ApiResponse<CategoryComplementRule[]>>('/admin/complements/category-rules');
      return res.data.data || [];
    },

    createCategoryRule: async (data: CategoryComplementRuleCreate): Promise<CategoryComplementRule> => {
      const res = await apiClient.post<ApiResponse<CategoryComplementRule>>('/admin/complements/category-rules', data);
      return res.data.data as CategoryComplementRule;
    },

    deleteCategoryRule: async (id: string): Promise<void> => {
      await apiClient.delete(`/admin/complements/category-rules/${id}`);
    },
  },
};
