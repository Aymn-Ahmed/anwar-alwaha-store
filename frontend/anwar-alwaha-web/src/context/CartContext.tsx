import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Product } from '../types/product.types';
import { useToast } from './ToastContext';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  note?: string;
}

export interface AppliedCoupon {
  code: string;
  label: string;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  itemsCount: number;
  subtotal: number;
  deliveryMethod: 'branch' | 'delivery';
  setDeliveryMethod: (method: 'branch' | 'delivery') => void;
  deliveryFee: number;
  couponCode: string;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'anwar_alwaha_cart';
const CART_PREFS_STORAGE_KEY = 'anwar_alwaha_cart_prefs';

function computeCoupon(subtotal: number, rawCode: string): AppliedCoupon | null {
  if (subtotal <= 0 || !rawCode.trim()) return null;
  const code = rawCode.trim().toUpperCase();

  if (['WAHA10', 'WELCOME', 'WELCOME10', 'STUDENT', 'SCHOOL'].includes(code)) {
    const amt = Number((subtotal * 0.1).toFixed(2));
    return { code, label: 'خصم 10% على الطلب', discountAmount: Math.min(amt, subtotal) };
  }
  if (['ANWAR15', 'WAHA15'].includes(code)) {
    const amt = Number((subtotal * 0.15).toFixed(2));
    return { code, label: 'خصم 15% خاص للعملاء', discountAmount: Math.min(amt, subtotal) };
  }
  if (code === 'WAHA20') {
    const amt = subtotal >= 50 ? 20 : Number((subtotal * 0.1).toFixed(2));
    return {
      code,
      label: subtotal >= 50 ? 'خصم 20 ر.س على الطلب' : 'خصم 10% على الطلب',
      discountAmount: Math.min(amt, subtotal),
    };
  }
  if (code.startsWith('WAHA') || code.startsWith('ANWAR')) {
    const amt = Number((subtotal * 0.1).toFixed(2));
    return { code, label: 'خصم ترويجي 10%', discountAmount: Math.min(amt, subtotal) };
  }
  return null;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      const parsed: CartItem[] = JSON.parse(stored);
      return parsed.map((item) => ({
        ...item,
        notes: item.notes ?? item.note ?? '',
        note: item.note ?? item.notes ?? '',
      }));
    } catch {
      return [];
    }
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'branch' | 'delivery'>(() => {
    try {
      const raw = localStorage.getItem(CART_PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.deliveryMethod === 'delivery' || parsed.deliveryMethod === 'branch') {
          return parsed.deliveryMethod;
        }
      }
    } catch {}
    return 'branch';
  });

  const [couponCode, setCouponCode] = useState<string>(() => {
    try {
      const raw = localStorage.getItem(CART_PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.couponCode || '';
      }
    } catch {}
    return '';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_PREFS_STORAGE_KEY,
        JSON.stringify({ deliveryMethod, couponCode })
      );
    } catch {}
  }, [deliveryMethod, couponCode]);

  const addToCart = (product: Product, quantity: number = 1, notes?: string) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        const nextNote = notes !== undefined ? notes : next[existingIndex].notes ?? next[existingIndex].note;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          notes: nextNote,
          note: nextNote,
        };
        return next;
      } else {
        return [...prev, { product, quantity, notes, note: notes }];
      }
    });

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#22c55e', '#f59e0b', '#0284c7'],
      });
    } catch {}

    showToast(`تمت إضافة "${product.name}" إلى الحقيبة 🛒`, 'success', {
      actionLabel: 'عرض الحقيبة',
      actionPath: '/cart',
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('تم حذف الصنف من الحقيبة', 'info');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateNotes = (productId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notes, note: notes } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode('');
  };

  const itemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

  const appliedCoupon = useMemo(
    () => computeCoupon(subtotal, couponCode),
    [subtotal, couponCode]
  );

  const applyCoupon = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      showToast('يرجى إدخال كود الخصم أولاً', 'error');
      return false;
    }
    const evaluated = computeCoupon(Math.max(subtotal, 10), trimmed);
    if (!evaluated) {
      showToast('كود الخصم غير صالح أو منتهي الصلاحية (جرّب: WAHA10 أو ANWAR15)', 'error');
      return false;
    }
    setCouponCode(trimmed);
    showToast(`تم تطبيق كود الخصم (${trimmed}) بنجاح 🎉`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setCouponCode('');
    showToast('تم إزالة كود الخصم', 'info');
  };

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const deliveryFee = 0; // استلام من الفرع مجاناً، والتوصيل يُنسق حسب الحي أو مجاناً في العروض
  const finalTotal = Math.max(0, Number((subtotal - discountAmount + deliveryFee).toFixed(2)));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        itemsCount,
        subtotal,
        deliveryMethod,
        setDeliveryMethod,
        deliveryFee,
        couponCode,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        finalTotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
