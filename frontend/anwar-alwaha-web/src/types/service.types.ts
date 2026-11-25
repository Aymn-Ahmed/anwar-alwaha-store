export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  accentColor: string;
  mediaType: string;
  mediaUrl?: string;
  linkedCategoryId?: string;
  linkedCategoryTitle?: string;
  whatsAppTemplate?: string;
  detailedOverview?: string;
  availableOptionsOrSizes?: string;
  galleryImageUrls?: string;
  sortOrder: number;
  isActive: boolean;
}
