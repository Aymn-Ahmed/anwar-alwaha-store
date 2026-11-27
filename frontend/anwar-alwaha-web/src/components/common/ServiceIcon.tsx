import React from 'react';
import {
  Printer,
  Palette,
  Coffee,
  GraduationCap,
  FileText,
  Zap,
  Sparkles,
  ShoppingBag,
  Award,
  Flag,
  Gift,
  Layers,
  Stamp,
  BookOpen,
  Scissors,
  PenTool,
  Monitor,
  CreditCard,
  Heart,
  PenLine,
  FileCheck,
  LucideIcon,
} from 'lucide-react';

interface ServiceIconProps {
  iconName?: string | null;
  size?: number;
  color?: string;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  printer: Printer,
  print: Printer,
  palette: Palette,
  art: Palette,
  brush: Palette,
  coffee: Coffee,
  cup: Coffee,
  themes: Coffee,
  'graduation-cap': GraduationCap,
  graduation: GraduationCap,
  grad: GraduationCap,
  school: GraduationCap,
  'file-text': FileText,
  file: FileText,
  office: FileText,
  zap: Zap,
  bolt: Zap,
  sparkles: Sparkles,
  'shopping-bag': ShoppingBag,
  stationery: ShoppingBag,
  award: Award,
  trophy: Award,
  flag: Flag,
  gift: Gift,
  layers: Layers,
  stamp: Stamp,
  book: BookOpen,
  'book-open': BookOpen,
  scissors: Scissors,
  pen: PenLine,
  'pen-tool': PenTool,
  'pen-line': PenLine,
  monitor: Monitor,
  web: Monitor,
  website: Monitor,
  computer: Monitor,
  'credit-card': CreditCard,
  card: CreditCard,
  nfc: CreditCard,
  heart: Heart,
  wedding: Heart,
  'file-check': FileCheck,
  turnitin: FileCheck,
};

export const SERVICE_ICON_OPTIONS = [
  { value: 'printer', label: 'طابعة (طباعة وبنرات)' },
  { value: 'zap', label: 'برق (وسائل وخدمات سريعة)' },
  { value: 'palette', label: 'لوحة ألوان (رسم وجداريات)' },
  { value: 'coffee', label: 'كوب (توزيعات وثيمات)' },
  { value: 'graduation-cap', label: 'قبعة تخرج (حفلات تخرج)' },
  { value: 'file-text', label: 'مستند (طباعة وتجليد بحوث)' },
  { value: 'shopping-bag', label: 'حقيبة (قرطاسية وأدوات)' },
  { value: 'award', label: 'درع (دروع وتكريم)' },
  { value: 'stamp', label: 'ختم (أختام وهوية)' },
  { value: 'gift', label: 'هدية (تغليف وهدايا)' },
  { value: 'sparkles', label: 'نجوم (تصاميم خاصة)' },
  { value: 'flag', label: 'علم (أعلام وستاندات)' },
];

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  iconName,
  size = 28,
  color,
  className = '',
}) => {
  const key = (iconName || 'sparkles').trim().toLowerCase();
  const IconComp = ICON_MAP[key];

  if (IconComp) {
    return <IconComp size={size} style={color ? { color } : undefined} className={className} />;
  }

  // If admin typed an emoji or custom symbol, render it cleanly
  if (iconName && iconName.trim().length <= 4 && !/^[a-z0-9_-]+$/i.test(iconName.trim())) {
    return (
      <span style={{ fontSize: size, lineHeight: 1 }} className={className}>
        {iconName.trim()}
      </span>
    );
  }

  return <Sparkles size={size} style={color ? { color } : undefined} className={className} />;
};
