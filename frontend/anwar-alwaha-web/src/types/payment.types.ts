export interface InitiatePaymentRequest {
  orderId?: string;
  orderCode?: string;
}

export interface InitiatePaymentResponse {
  publishableKey: string;
  amountInHalalas: number;
  currency: string;
  description: string;
  callbackUrl: string;
  metadata: {
    orderId: string;
    orderCode: string;
  };
}

export interface PaymentStatusResponse {
  orderCode: string;
  isPaid: boolean;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  paymentMethod?: string;
  gatewayReferenceId?: string;
  paidAt?: string;
}
