import { apiClient } from './client';
import { ApiResponse, PagedResult } from '../types/api.types';
import { Product, ProductDetail, ProductQueryParams } from '../types/product.types';

function unwrapResponse<T>(raw: any): T | null {
  if (!raw) return null;
  if (raw.data !== undefined && raw.success !== undefined) {
    return raw.data as T;
  }
  if (raw.data?.data !== undefined) {
    return raw.data.data as T;
  }
  return raw as T;
}

export const productsApi = {
  getAll: async (params?: ProductQueryParams): Promise<PagedResult<Product>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<Product>>>('/products', {
      params,
    });
    const unwrapped = unwrapResponse<PagedResult<Product>>(res.data);
    return unwrapped || { items: [], totalCount: 0, page: 1, pageSize: 20 };
  },

  getProducts: async (params?: ProductQueryParams): Promise<PagedResult<Product>> => {
    const res = await apiClient.get<ApiResponse<PagedResult<Product>>>('/products', {
      params,
    });
    const unwrapped = unwrapResponse<PagedResult<Product>>(res.data);
    return unwrapped || { items: [], totalCount: 0, page: 1, pageSize: 20 };
  },

  getById: async (idOrSlug: string): Promise<ProductDetail | null> => {
    const res = await apiClient.get<ApiResponse<ProductDetail>>(
      `/products/${encodeURIComponent(idOrSlug)}`
    );
    return unwrapResponse<ProductDetail>(res.data);
  },

  getProductById: async (idOrSlug: string): Promise<ProductDetail | null> => {
    const res = await apiClient.get<ApiResponse<ProductDetail>>(
      `/products/${encodeURIComponent(idOrSlug)}`
    );
    return unwrapResponse<ProductDetail>(res.data);
  },
};
