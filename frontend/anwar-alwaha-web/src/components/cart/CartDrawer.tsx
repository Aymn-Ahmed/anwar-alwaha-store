import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { PriceTag } from '../common/PriceTag';

export const CartDrawer: React.FC = () => {
  const { items, itemsCount, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, updateNotes, subtotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-[#ebebeb] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h3 className="font-black text-zinc-900 text-base">حقيبة المشتريات</h3>
              <span className="bg-zinc-100 text-zinc-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {items.length} أصناف ({itemsCount} قطع)
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="overflow-y-auto p-4 space-y-3 flex-1 bg-[#f6f6f7]">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-white border border-[#ebebeb] rounded-full flex items-center justify-center mx-auto text-3xl">
                  🛍️
                </div>
                <div>
                  <h4 className="font-black text-zinc-900 text-base mb-1">حقيبتك فارغة حالياً</h4>
                  <p className="text-xs text-zinc-400">تصفح منتجاتنا المميزة وأضف ما يناسبك</p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/categories');
                  }}
                  className="bg-black hover:bg-[#c40d00] text-white text-xs font-black py-2.5 px-6 rounded-xl transition-colors"
                >
                  استعراض المنتجات
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-white rounded-2xl border border-[#ebebeb] flex flex-col gap-2.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-zinc-50 overflow-hidden shrink-0 border border-zinc-200/70 flex items-center justify-center">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">{item.product.categoryIcon || '📦'}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-zinc-900 line-clamp-1 mb-1">
                        {item.product.name}
                      </h4>
                      <PriceTag price={item.product.price} size="sm" />
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-zinc-400 hover:text-[#c40d00] p-1"
                      title="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => updateNotes(item.product.id, e.target.value)}
                      placeholder="ملاحظات التنفيذ (المقاس، اللون...)"
                      className="flex-1 text-[11px] bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-900"
                    />

                    <div className="flex items-center gap-1.5 bg-zinc-50 px-1.5 py-1 rounded-xl border border-zinc-200 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-zinc-600 hover:text-black p-0.5"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-zinc-600 hover:text-black p-0.5"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-[#ebebeb] space-y-3">
              <div className="flex items-center justify-between text-sm font-black text-zinc-900">
                <span>المبلغ التقديري</span>
                <span className="text-[#c40d00] text-lg font-black">{subtotal.toFixed(2)} ر.س</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[#c40d00] hover:bg-[#a50b00] text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/20 active:scale-[0.99] transition-all"
              >
                <span>فتح حقيبة الطلبات وتأكيد الطلب</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
