export interface BundleItem {
  productId: string;
  productName: string;
  productImageUrl?: string;
  productPrice: number;
  quantity: number;
}

export interface ProductBundle {
  id: string;
  title: string;
  description?: string;
  bundlePrice: number;
  originalPrice?: number;
  badge?: string;
  sortOrder: number;
  isActive: boolean;
  items: BundleItem[];
}
