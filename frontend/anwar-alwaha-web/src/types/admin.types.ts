import { Product } from './product.types';
import { Category } from './category.types';
import { OrderResponse } from './order.types';

export interface AdminUser {
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMinutes: number;
  fullName: string;
  email: string;
  role: string;
}

export interface OrderAdminSummary {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone?: string;
  deliveryMethod: string;
  status: string;
  totalAmount: number;
  itemsCount: number;
  customerLocationLat?: number;
  customerLocationLng?: number;
  googleMapsUrl?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  lowStockProductsCount: number;
  totalProducts: number;
  totalCategories: number;
  recentOrders: OrderAdminSummary[];
}

export interface BulkProductUpdateItem {
  id: string;
  name?: string;
  price?: number;
  oldPrice?: number;
  clearOldPrice?: boolean;
  categoryId?: string;
  imageUrl?: string;
  stockQuantity?: number;
  isActive?: boolean;
}

export interface QuickProductPatch {
  id: string;
  name?: string;
  price?: number;
  discountPercent?: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface ProductCreateUpdate {
  categoryId: string;
  name: string;
  searchKeywords?: string;
  imageUrl?: string;
  tikTokVideoId?: string;
  price: number;
  oldPrice?: number;
  sortOrder: number;
  stockQuantity: number;
  isActive: boolean;
}

export interface CategoryCreateUpdate {
  title: string;
  description?: string;
  icon: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryReorderItem {
  id: string;
  sortOrder: number;
}

export interface ServiceCreateUpdate {
  title: string;
  description: string;
  iconName: string;
  accentColor: string;
  mediaType: string; // none | tiktok | youtube | video | image
  mediaUrl?: string;
  linkedCategoryId?: string;
  whatsAppTemplate?: string;
  detailedOverview?: string;
  availableOptionsOrSizes?: string;
  galleryImageUrls?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryTransferRequest {
  targetCategoryId: string;
  productIds: string[];
}

export interface OrderStatusUpdate {
  status: string;
  adminNotes?: string;
}
