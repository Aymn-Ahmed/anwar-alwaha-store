import { apiClient } from './client';
import { ApiResponse } from '../types/api.types';
import { CreateOrderRequest, OrderResponse } from '../types/order.types';

export const ordersApi = {
  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const res = await apiClient.post<ApiResponse<OrderResponse>>('/orders', data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'فشل إنشاء الطلب.');
    }
    return res.data.data;
  },

  getByCode: async (orderCode: string, phoneLast4: string): Promise<OrderResponse | null> => {
    const res = await apiClient.get<ApiResponse<OrderResponse>>(`/orders/${orderCode}`, {
      params: { phoneLast4 },
    });
    return res.data.data || null;
  },

  getByPhone: async (phone: string): Promise<OrderResponse[]> => {
    const res = await apiClient.get<ApiResponse<OrderResponse[]>>('/orders/by-phone', {
      params: { phone },
    });
    return res.data.data || [];
  },
};
