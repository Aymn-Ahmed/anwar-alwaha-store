export interface Product {
  id: string;
  categoryId: string;
  categoryTitle: string;
  categoryIcon?: string;
  name: string;
  barcode?: string;
  searchKeywords?: string;
  imageUrl?: string;
  tikTokVideoId?: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  sortOrder: number;
  stockQuantity: number;
  isActive: boolean;
  averageRating: number;
  reviewsCount: number;
}

export interface ProductBundleSimple {
  id: string;
  title: string;
  bundlePrice: number;
  originalPrice?: number;
  badge?: string;
}

export interface ProductDetail extends Product {
  complementaryProducts: Product[];
  relatedBundles: ProductBundleSimple[];
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  isFeatured?: boolean;
  imageFilter?: 'all' | 'no_image' | 'without_image' | 'with_image' | '';
  hasImage?: 'all' | 'without_image' | 'with_image' | '';
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest';
  page?: number;
  pageSize?: number;
}
