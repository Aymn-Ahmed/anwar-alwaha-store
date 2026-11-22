import { apiClient } from './client';
import { ApiResponse } from '../types/api.types';
import { Category } from '../types/category.types';

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data || [];
  },

  getById: async (id: string): Promise<Category | null> => {
    const res = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return res.data.data || null;
  },
};
