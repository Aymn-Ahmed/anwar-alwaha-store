import { apiClient } from './client';
import { ApiResponse } from '../types/api.types';
import { CreateReviewRequest, ProductReview } from '../types/review.types';

export const reviewsApi = {
  getByProductId: async (productId: string): Promise<ProductReview[]> => {
    const res = await apiClient.get<ApiResponse<ProductReview[]>>(
      `/products/${encodeURIComponent(productId)}/reviews`
    );
    return res.data.data || [];
  },

  submit: async (data: CreateReviewRequest): Promise<ProductReview> => {
    try {
      const res = await apiClient.post<ApiResponse<ProductReview>>(
        `/products/${encodeURIComponent(data.productId)}/reviews`,
        data
      );
      if (!res.data.data) {
        throw new Error(res.data.message || 'فشل إرسال التقييم.');
      }
      return res.data.data;
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        'التقييم متاح فقط للعملاء الذين قاموا بشراء هذا المنتج مسبقاً';
      throw new Error(serverMsg);
    }
  },
};
