import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product.types';
import { OrderResponse } from '../types/order.types';
import { ordersApi } from '../api/ordersApi';
import { useToast } from './ToastContext';

export interface CustomerAddress {
  id: string;
  label: string; // e.g., المنزل، العمل، المدرسة
  district: string;
  details: string;
  phone: string;
  isDefault: boolean;
}

export interface CustomerOrderItemSnapshot {
  productId?: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  itemNotes?: string;
  productSnapshot?: Product;
}

export interface CustomerSavedOrder {
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: string;
  status: string;
  paymentStatus?: string;
  adminNotes?: string;
  isReviewed?: boolean;
  totalAmount: number;
  createdAt: string;
  items: CustomerOrderItemSnapshot[];
}

export interface CustomerState {
  name: string;
  phone: string;
  email: string;
  isLoggedIn: boolean;
  addresses: CustomerAddress[];
  wishlistIds: string[];
  wishlistProducts: Product[];
  orders: CustomerSavedOrder[];
}

interface CustomerContextType {
  customer: CustomerState;
  isLoggedIn: boolean;
  firstName: string;
  defaultAddress: CustomerAddress | null;
  loginCustomer: (name: string, phone: string, email?: string) => Promise<void>;
  updateProfile: (data: { name: string; phone: string; email?: string }) => void;
  logoutCustomer: () => void;
  addAddress: (addr: Omit<CustomerAddress, 'id'>) => void;
  updateAddress: (id: string, addr: Omit<CustomerAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  recordCompletedOrder: (order: CustomerSavedOrder, addressDetails?: string) => void;
  linkExternalOrderToAccount: (order: OrderResponse) => void;
  refreshAccountOrders: () => Promise<void>;
}

const PORTAL_STORAGE_KEY = 'anwar_alwaha_customer_portal_v1';
const LEGACY_PROFILE_KEY = 'anwar_alwaha_customer_profile';

const INITIAL_STATE: CustomerState = {
  name: '',
  phone: '',
  email: '',
  isLoggedIn: false,
  addresses: [],
  wishlistIds: [],
  wishlistProducts: [],
  orders: [],
};

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [customer, setCustomer] = useState<CustomerState>(() => {
    try {
      const raw = localStorage.getItem(PORTAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...INITIAL_STATE, ...parsed };
      }

      // Migrate from legacy checkout profile if present
      const legacyRaw = localStorage.getItem(LEGACY_PROFILE_KEY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        if (legacy?.name && legacy?.phone) {
          return {
            ...INITIAL_STATE,
            name: legacy.name,
            phone: legacy.phone,
            isLoggedIn: true,
          };
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(customer));
      if (customer.name || customer.phone) {
        localStorage.setItem(
          LEGACY_PROFILE_KEY,
          JSON.stringify({ name: customer.name, phone: customer.phone })
        );
      }
    } catch {
      // ignore
    }
  }, [customer]);

  const isLoggedIn = Boolean(customer.isLoggedIn && customer.phone.trim());
  const firstName = customer.name.trim().split(/\s+/)[0] || 'حسابي';

  const defaultAddress =
    customer.addresses.find((a) => a.isDefault) || customer.addresses[0] || null;

  const syncOrdersByPhone = useCallback(async (phoneToSync: string) => {
    const cleanPhone = phoneToSync.trim();
    if (cleanPhone.length < 8) return;

    try {
      const dbOrders = await ordersApi.getByPhone(cleanPhone);
      if (!Array.isArray(dbOrders)) return;

      setCustomer((prev) => {
        const existingMap = new Map(prev.orders.map((o) => [o.orderCode, o]));

        const mergedDbOrders: CustomerSavedOrder[] = dbOrders.map((apiOrder) => {
          const prevOrd = existingMap.get(apiOrder.orderCode);
          return {
            orderCode: apiOrder.orderCode,
            customerName: apiOrder.customerName || prev.name,
            customerPhone: apiOrder.customerPhone || cleanPhone,
            customerAddress: apiOrder.customerAddress ?? prevOrd?.customerAddress,
            deliveryMethod: apiOrder.deliveryMethod,
            status: apiOrder.status,
            paymentStatus: apiOrder.paymentStatus,
            adminNotes: apiOrder.adminNotes,
            isReviewed: apiOrder.isReviewed,
            totalAmount: apiOrder.totalAmount,
            createdAt: apiOrder.createdAt,
            items: apiOrder.items.map((it, idx) => ({
              productId: it.productId,
              productName: it.productName,
              unitPrice: it.unitPrice,
              quantity: it.quantity,
              lineTotal: it.lineTotal,
              itemNotes: it.itemNotes,
              productSnapshot: prevOrd?.items[idx]?.productSnapshot,
            })),
          };
        });

        const dbCodes = new Set(mergedDbOrders.map((o) => o.orderCode));
        const localOnlyOrders = prev.orders.filter((o) => !dbCodes.has(o.orderCode));

        const combined = [...mergedDbOrders, ...localOnlyOrders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          ...prev,
          orders: combined,
        };
      });
    } catch {
      // Keep local orders if offline
    }
  }, []);

  const loginCustomer = async (name: string, phone: string, email?: string) => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = (email || customer.email || '').trim();

    setCustomer((prev) => ({
      ...prev,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      isLoggedIn: true,
    }));

    await syncOrdersByPhone(cleanPhone);

    // Attempt to pull latest order from sessionStorage if it belongs to this phone
    const lastCode = sessionStorage.getItem('last_order_code');
    if (lastCode && cleanPhone.length >= 4) {
      try {
        const found = await ordersApi.getByCode(lastCode, cleanPhone.slice(-4));
        if (found) {
          linkExternalOrderToAccount(found);
        }
      } catch {
        // ignore if not matching
      }
    }

    showToast(`أهلاً بك يا ${cleanName.split(/\s+/)[0]} في حسابك الشخصي!`, 'success');
  };

  const updateProfile = (data: { name: string; phone: string; email?: string }) => {
    const cleanPhone = data.phone.trim();
    setCustomer((prev) => ({
      ...prev,
      name: data.name.trim(),
      phone: cleanPhone,
      email: (data.email ?? prev.email).trim(),
      isLoggedIn: true,
    }));
    syncOrdersByPhone(cleanPhone);
    showToast('تم حفظ بياناتك الشخصية ومزامنة طلباتك بنجاح', 'success');
  };

  const logoutCustomer = () => {
    setCustomer((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
    try {
      localStorage.removeItem(LEGACY_PROFILE_KEY);
    } catch {}
    showToast('تم تسجيل الخروج من حسابك', 'info');
  };

  const addAddress = (addr: Omit<CustomerAddress, 'id'>) => {
    const newId = `addr_${Date.now()}`;
    setCustomer((prev) => {
      const shouldBeDefault = addr.isDefault || prev.addresses.length === 0;
      const existing = shouldBeDefault
        ? prev.addresses.map((a) => ({ ...a, isDefault: false }))
        : prev.addresses;
      return {
        ...prev,
        addresses: [...existing, { ...addr, id: newId, isDefault: shouldBeDefault }],
      };
    });
    showToast('تمت إضافة العنوان إلى دفتر عناوينك', 'success');
  };

  const updateAddress = (id: string, addr: Omit<CustomerAddress, 'id'>) => {
    setCustomer((prev) => {
      const next = prev.addresses.map((a) => {
        if (a.id === id) {
          return { ...addr, id };
        }
        return addr.isDefault ? { ...a, isDefault: false } : a;
      });
      if (!next.some((a) => a.isDefault) && next.length > 0) {
        next[0].isDefault = true;
      }
      return { ...prev, addresses: next };
    });
    showToast('تم تحديث العنوان بنجاح', 'success');
  };

  const removeAddress = (id: string) => {
    setCustomer((prev) => {
      const next = prev.addresses.filter((a) => a.id !== id);
      if (!next.some((a) => a.isDefault) && next.length > 0) {
        next[0] = { ...next[0], isDefault: true };
      }
      return { ...prev, addresses: next };
    });
    showToast('تم حذف العنوان', 'info');
  };

  const setDefaultAddress = (id: string) => {
    setCustomer((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      })),
    }));
    showToast('تم تعيين العنوان كعنوان افتراضي للطلبات', 'success');
  };

  const toggleWishlist = (product: Product) => {
    const exists = customer.wishlistIds.includes(product.id);
    setCustomer((prev) => {
      const alreadyIn = prev.wishlistIds.includes(product.id);
      if (alreadyIn) {
        return {
          ...prev,
          wishlistIds: prev.wishlistIds.filter((id) => id !== product.id),
          wishlistProducts: prev.wishlistProducts.filter((p) => p.id !== product.id),
        };
      }
      return {
        ...prev,
        wishlistIds: [product.id, ...prev.wishlistIds],
        wishlistProducts: [
          product,
          ...prev.wishlistProducts.filter((p) => p.id !== product.id),
        ],
      };
    });

    if (exists) {
      showToast(`تمت إزالة "${product.name}" من المفضلة`, 'info');
    } else {
      showToast(`تمت إضافة "${product.name}" إلى المفضلة ❤️`, 'success');
    }
  };

  const isInWishlist = useCallback(
    (productId: string) => customer.wishlistIds.includes(productId),
    [customer.wishlistIds]
  );

  const recordCompletedOrder = (order: CustomerSavedOrder, addressDetails?: string) => {
    setCustomer((prev) => {
      const cleanAddr = (addressDetails || '').trim();
      let updatedAddresses = prev.addresses;

      if (
        cleanAddr &&
        !prev.addresses.some(
          (a) => a.details.trim() === cleanAddr || `${a.district} - ${a.details}`.trim() === cleanAddr
        )
      ) {
        const isFirst = prev.addresses.length === 0;
        updatedAddresses = [
          ...prev.addresses,
          {
            id: `addr_${Date.now()}`,
            label: 'عنوان التوصيل',
            district: 'خميس مشيط / أبها',
            details: cleanAddr,
            phone: order.customerPhone,
            isDefault: isFirst,
          },
        ];
      }

      const filteredOrders = prev.orders.filter((o) => o.orderCode !== order.orderCode);

      return {
        ...prev,
        name: order.customerName || prev.name,
        phone: order.customerPhone || prev.phone,
        isLoggedIn: true,
        addresses: updatedAddresses,
        orders: [order, ...filteredOrders],
      };
    });

    if (order.customerPhone) {
      syncOrdersByPhone(order.customerPhone);
    }
  };

  const linkExternalOrderToAccount = (apiOrder: OrderResponse) => {
    setCustomer((prev) => {
      const existing = prev.orders.find((o) => o.orderCode === apiOrder.orderCode);
      const mapped: CustomerSavedOrder = {
        orderCode: apiOrder.orderCode,
        customerName: apiOrder.customerName || prev.name,
        customerPhone: apiOrder.customerPhone || prev.phone,
        customerAddress: apiOrder.customerAddress,
        deliveryMethod: apiOrder.deliveryMethod,
        status: apiOrder.status,
        paymentStatus: apiOrder.paymentStatus,
        isReviewed: apiOrder.isReviewed,
        totalAmount: apiOrder.totalAmount,
        createdAt: apiOrder.createdAt,
        items: apiOrder.items.map((it, idx) => ({
          productId: it.productId,
          productName: it.productName,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          lineTotal: it.lineTotal,
          itemNotes: it.itemNotes,
          productSnapshot: existing?.items[idx]?.productSnapshot,
        })),
      };

      const others = prev.orders.filter((o) => o.orderCode !== apiOrder.orderCode);
      return {
        ...prev,
        orders: [mapped, ...others],
      };
    });
  };

  const refreshAccountOrders = useCallback(async () => {
    const phone = customer.phone.trim();
    if (phone.length < 8) return;
    await syncOrdersByPhone(phone);
  }, [customer.phone, syncOrdersByPhone]);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isLoggedIn,
        firstName,
        defaultAddress,
        loginCustomer,
        updateProfile,
        logoutCustomer,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        toggleWishlist,
        isInWishlist,
        recordCompletedOrder,
        linkExternalOrderToAccount,
        refreshAccountOrders,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return ctx;
};
