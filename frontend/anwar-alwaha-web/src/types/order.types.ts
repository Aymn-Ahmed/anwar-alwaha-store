export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  notes?: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: 'branch' | 'delivery';
  customerLocationLat?: number;
  customerLocationLng?: number;
  customerNotes?: string;
  couponCode?: string;
  items: CreateOrderItemRequest[];
}

export interface OrderItemResponse {
  id: string;
  productId?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  itemNotes?: string;
}

export interface OrderResponse {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  deliveryMethod: string;
  status: string; // pending, processing, ready, shipping, delivered, cancelled
  paymentStatus?: string; // paid, pending, failed
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerNotes?: string;
  adminNotes?: string;
  isReviewed: boolean;
  createdAt: string;
  items: OrderItemResponse[];
}
