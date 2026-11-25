import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useCatalogCache } from '../../context/CatalogCacheContext';
import { productsApi } from '../../api/productsApi';
import { Product } from '../../types/product.types';
import { PriceTag } from './PriceTag';
import { ProductModal } from '../products/ProductModal';

export const Header: React.FC = () => {
  const { itemsCount, addToCart } = useCart();
  const { isLoggedIn, firstName, customer } = useCustomer();
  const { getSuggestions } = useCatalogCache();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Instant zero-latency suggestions on every keystroke
  const keywordSuggestions = useMemo(() => {
    return getSuggestions(headerSearch, 7);
  }, [headerSearch, getSuggestions]);

  // Open dropdown when typing 1+ characters
  useEffect(() => {
    if (headerSearch.trim().length >= 1) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  }, [headerSearch]);

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = headerSearch.trim();
    if (query) {
      setDropdownOpen(false);
      navigate(`/categories?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectPhrase = (phrase: string) => {
    setHeaderSearch(phrase);
    setDropdownOpen(false);
    navigate(`/categories?search=${encodeURIComponent(phrase)}`);
  };

  const handleSelectProduct = (prod: Product) => {
    setDropdownOpen(false);
    setQuickViewProduct(prod);
  };

  const accountLabel = isLoggedIn ? `👤 ${firstName}` : '👤 حسابي';
  const wishlistCount = customer.wishlistIds.length;

  const navLinks = [
    { to: '/', label: '🏠 الرئيسية' },
    { to: '/categories', label: '📂 الأقسام' },
    { to: '/services', label: '⚡ الخدمات' },
    { to: '/account', label: accountLabel },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#ebebeb] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-black text-lg logo-font">أ</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="logo-font text-black text-sm tracking-widest font-black">
                ANWAR AL WAHAH
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                مكتبة أنوار الواحة — خميس مشيط
              </span>
            </div>
          </Link>

          {/* Smart Search Bar in Header with Live Search Dropdown */}
          <div ref={searchContainerRef} className="flex-1 max-w-sm relative">
            <form onSubmit={handleHeaderSearch} className="relative">
              <input
                type="text"
                value={headerSearch}
                onFocus={() => {
                  if (headerSearch.trim().length >= 2) setDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setDropdownOpen(false);
                }}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="ابحث عن منتج أو خدمة..."
                className="w-full bg-zinc-100 focus:bg-white border border-zinc-200 focus:border-black rounded-full pr-8 pl-7 py-1.5 text-xs focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black cursor-pointer"
                aria-label="بحث"
              >
                <Search size={14} />
              </button>
              {headerSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setHeaderSearch('');
                    setDropdownOpen(false);
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                  aria-label="مسح البحث"
                >
                  <X size={12} />
                </button>
              )}
            </form>

            {/* Live Search Autocomplete Dropdown */}
            {dropdownOpen && headerSearch.trim().length >= 1 && (
              <div className="fixed inset-x-3 top-14 mt-1 sm:absolute sm:inset-x-auto sm:right-0 sm:w-[420px] sm:top-full sm:mt-2 bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {keywordSuggestions.length === 0 ? (
                  <div className="p-4 text-center space-y-1">
                    <p className="text-xs font-bold text-zinc-700">
                      اضغط بحث لعرض نتائج: "{headerSearch.trim()}"
                    </p>
                    <button
                      type="button"
                      onClick={() => handleHeaderSearch({ preventDefault: () => {} } as any)}
                      className="text-[11px] font-black text-emerald-600 hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>عرض النتائج الآن</span>
                      <ArrowLeft size={11} />
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Header bar */}
                    <div className="px-3.5 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-[10px] font-black text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-500" />
                        <span>اقتراحات البحث المباشرة</span>
                      </span>
                      <span>{keywordSuggestions.length} اقتراح</span>
                    </div>

                    {/* Clean Deduplicated Text Keyword Suggestions */}
                    <div className="divide-y divide-zinc-50 max-h-[60vh] overflow-y-auto">
                      {keywordSuggestions.map((phrase) => (
                        <button
                          key={phrase}
                          type="button"
                          onClick={() => handleSelectPhrase(phrase)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 text-right transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Search
                              size={14}
                              className="text-zinc-400 group-hover:text-black shrink-0"
                            />
                            <span className="text-xs sm:text-sm font-bold text-zinc-800 group-hover:text-black truncate">
                              {phrase}
                            </span>
                          </div>
                          <ArrowLeft
                            size={13}
                            className="text-zinc-300 group-hover:text-black shrink-0 transition-transform group-hover:-translate-x-0.5"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Bottom Action: View all results */}
                    <div className="p-2.5 bg-zinc-50 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => {
                          const q = headerSearch.trim();
                          setDropdownOpen(false);
                          navigate(`/categories?search=${encodeURIComponent(q)}`);
                        }}
                        className="w-full bg-black hover:bg-zinc-800 text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>عرض جميع نتائج البحث لـ "{headerSearch.trim()}"</span>
                        <ArrowLeft size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative text-sm font-bold px-4 py-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`
                }
              >
                <span>{label}</span>
                {to === '/account' && wishlistCount > 0 && (
                  <span className="mr-1.5 inline-flex items-center justify-center bg-[#fa2c19] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side: Account Quick Pill (Mobile/Tablet) + WhatsApp + Cart Page Link */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/account"
              className="lg:hidden hidden sm:flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold px-3 py-2 rounded-full transition-colors"
            >
              <span>{accountLabel}</span>
            </Link>

            <a
              href="https://wa.me/966572350050"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-full transition-colors"
            >
              <span>واتساب</span>
              <span>📱</span>
            </a>

            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white px-3 py-2 rounded-full text-xs font-bold transition-colors"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">الحقيبة</span>
              {itemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#fa2c19] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {itemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[#ebebeb] bg-white py-3 px-4 flex flex-col gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm font-bold px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm font-bold px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-black text-white' : 'text-zinc-700 hover:bg-zinc-100'
                }`
              }
            >
              🎒 حقيبة المشتريات ({itemsCount})
            </NavLink>
            <a
              href="https://wa.me/966572350050"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white text-sm font-bold px-4 py-3 rounded-xl mt-1"
            >
              📱 تواصل عبر واتساب — 0572350050
            </a>
          </div>
        )}
      </header>

      {quickViewProduct && (
        <ProductModal
          productId={quickViewProduct.id}
          initialProduct={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
};
