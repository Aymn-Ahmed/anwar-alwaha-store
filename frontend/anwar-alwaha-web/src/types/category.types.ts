export interface Category {
  id: string;
  title: string;
  description?: string;
  icon: string;
  imageUrl?: string;
  sortOrder: number;
  productsCount: number;
  isActive: boolean;
}
