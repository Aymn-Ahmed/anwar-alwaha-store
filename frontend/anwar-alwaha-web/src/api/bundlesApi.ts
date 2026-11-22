import { apiClient } from './client';
import { ApiResponse } from '../types/api.types';
import { ProductBundle } from '../types/bundle.types';

export const bundlesApi = {
  getAll: async (): Promise<ProductBundle[]> => {
    const res = await apiClient.get<ApiResponse<ProductBundle[]>>('/bundles');
    return res.data.data || [];
  },

  getById: async (id: string): Promise<ProductBundle | null> => {
    const res = await apiClient.get<ApiResponse<ProductBundle>>(`/bundles/${id}`);
    return res.data.data || null;
  },
};
