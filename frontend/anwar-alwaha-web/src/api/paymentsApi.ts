import { apiClient } from './client';
import { ApiResponse } from '../types/api.types';
import {
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentStatusResponse,
} from '../types/payment.types';

export const paymentsApi = {
  initiate: async (data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> => {
    const res = await apiClient.post<ApiResponse<InitiatePaymentResponse>>(
      '/payments/initiate',
      data
    );
    const payload = (res.data as any)?.data ?? res.data;
    if (!payload) {
      throw new Error(res.data?.message || 'فشل تهيئة جلسة الدفع.');
    }
    return payload as InitiatePaymentResponse;
  },

  verify: async (
    orderCode: string,
    phoneLast4: string,
    paymentId?: string | null,
    status?: string | null
  ): Promise<PaymentStatusResponse | null> => {
    const res = await apiClient.get<ApiResponse<PaymentStatusResponse>>(
      `/payments/verify/${encodeURIComponent(orderCode)}`,
      {
        params: {
          phoneLast4,
          paymentId: paymentId || undefined,
          status: status || undefined,
        },
      }
    );
    return ((res.data as any)?.data ?? res.data) || null;
  },
};
