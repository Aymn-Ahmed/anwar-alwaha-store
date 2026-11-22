import { apiClient } from './client';
import { ApiResponse } from '../types/api.types';
import { ServiceItem } from '../types/service.types';

export const servicesApi = {
  getAll: async (): Promise<ServiceItem[]> => {
    const res = await apiClient.get<ApiResponse<ServiceItem[]>>('/services');
    return res.data.data || [];
  },

  getById: async (id: string): Promise<ServiceItem | null> => {
    const res = await apiClient.get<ApiResponse<ServiceItem>>(`/services/${id}`);
    return res.data.data || null;
  },
};
