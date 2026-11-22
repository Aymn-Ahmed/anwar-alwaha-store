import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';

export const BottomNav: React.FC = () => {
  const { itemsCount } = useCart();
  const { isLoggedIn, firstName, customer } = useCustomer();
  const badgeCount = customer.orders.length + customer.wishlistIds.length;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#ebebeb] grid grid-cols-5 safe-area-inset-bottom">
      {/* الرئيسية */}
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition-all ${
            isActive ? 'text-black scale-105' : 'text-zinc-400 hover:text-zinc-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="text-xl leading-none">🏠</span>
            <span>الرئيسية</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-[#c40d00] mt-0.5" />}
          </>
        )}
      </NavLink>

      {/* الأقسام */}
      <NavLink
        to="/categories"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition-all ${
            isActive ? 'text-black scale-105' : 'text-zinc-400 hover:text-zinc-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="text-xl leading-none">📂</span>
            <span>الأقسام</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-[#c40d00] mt-0.5" />}
          </>
        )}
      </NavLink>

      {/* الخدمات */}
      <NavLink
        to="/services"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition-all ${
            isActive ? 'text-black scale-105' : 'text-zinc-400 hover:text-zinc-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="text-xl leading-none">⚡</span>
            <span>الخدمات</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-[#c40d00] mt-0.5" />}
          </>
        )}
      </NavLink>

      {/* الحقيبة (/cart) */}
      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition-all ${
            isActive ? 'text-black scale-105' : 'text-zinc-400 hover:text-zinc-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="text-xl leading-none relative">
              🎒
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#fa2c19] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {itemsCount}
                </span>
              )}
            </span>
            <span>الحقيبة</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-[#c40d00] mt-0.5" />}
          </>
        )}
      </NavLink>

      {/* حسابي */}
      <NavLink
        to="/account"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-bold transition-all ${
            isActive ? 'text-black scale-105' : 'text-zinc-400 hover:text-zinc-600'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <span className="text-xl leading-none relative">
              👤
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-zinc-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </span>
            <span className="truncate max-w-[56px]">{isLoggedIn ? firstName : 'حسابي'}</span>
            {isActive && <span className="w-1 h-1 rounded-full bg-[#c40d00] mt-0.5" />}
          </>
        )}
      </NavLink>
    </div>
  );
};
