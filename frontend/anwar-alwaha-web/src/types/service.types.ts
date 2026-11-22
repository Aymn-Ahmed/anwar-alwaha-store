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
  sortOrder: number;
  isActive: boolean;
}
