export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  orderCode: string;
  customerName: string;
  rating: number;
  comment?: string;
  mediaUrls: string[];
  isApproved: boolean;
  isVerifiedPurchase?: boolean;
  averageRating?: number;
  reviewsCount?: number;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderCode?: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment?: string;
  mediaUrls?: string[];
}
