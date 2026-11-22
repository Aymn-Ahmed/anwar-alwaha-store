import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { productsApi } from '../../api/productsApi';
import { Product } from '../../types/product.types';
import { PriceTag } from './PriceTag';
import { ProductModal } from '../products/ProductModal';

export const Header: React.FC = () => {
  const { itemsCount, addToCart } = useCart();
  const { isLoggedIn, firstName, customer } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
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

  // Debounced live search (250ms) when user types 2+ characters
  useEffect(() => {
    const query = headerSearch.trim();
    if (query.length < 2) {
      setLiveProducts([]);
      setTotalMatches(0);
      setIsSearching(false);
      setDropdownOpen(false);
      return;
    }

    setDropdownOpen(true);
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await productsApi.getProducts({ search: query, pageSize: 5 });
        setLiveProducts((res.items || []).slice(0, 5));
        setTotalMatches(res.totalCount || (res.items ? res.items.length : 0));
      } catch {
        setLiveProducts([]);
        setTotalMatches(0);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [headerSearch]);

  // Extract quick search phrase suggestions from matching product names and SearchKeywords
  const keywordSuggestions = useMemo(() => {
    const query = headerSearch.trim().toLowerCase();
    if (query.length < 2 || liveProducts.length === 0) return [];

    const phrases = new Set<string>();

    for (const prod of liveProducts) {
      // Short clean phrases from product name
      const nameWords = prod.name
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

      if (nameWords.length >= 2) {
        phrases.add(nameWords.slice(0, 2).join(' '));
      }
      if (nameWords.length >= 3) {
        phrases.add(nameWords.slice(0, 3).join(' '));
      }

      // Extract matching phrases from searchKeywords
      if (prod.searchKeywords) {
        const kwParts = prod.searchKeywords
          .split(/[,،|]/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 2 && s.length <= 28);

        for (const kw of kwParts) {
          if (kw.toLowerCase().includes(query) || phrases.size < 4) {
            phrases.add(kw);
          }
          if (phrases.size >= 6) break;
        }
      }
      if (phrases.size >= 6) break;
    }

    return Array.from(phrases).slice(0, 5);
  }, [headerSearch, liveProducts]);

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
                placeholder="ابحث بالاسم أو العامية: مرسام، براية، دفتر سلك، حبر..."
                className="w-full bg-zinc-100 focus:bg-white border border-zinc-200 focus:border-black rounded-full pr-8 pl-7 py-1.5 text-xs focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                aria-label="بحث"
              >
                {isSearching ? (
                  <Loader2 size={13} className="animate-spin text-zinc-600" />
                ) : (
                  <Search size={13} />
                )}
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
            {dropdownOpen && headerSearch.trim().length >= 2 && (
              <div className="absolute top-full right-0 left-0 mt-2 w-full sm:w-[380px] bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {isSearching && liveProducts.length === 0 ? (
                  <div className="p-5 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                    <Loader2 size={15} className="animate-spin" />
                    <span>جاري البحث الذكي عن "{headerSearch.trim()}"...</span>
                  </div>
                ) : liveProducts.length === 0 ? (
                  <div className="p-5 text-center space-y-2">
                    <p className="text-xs font-bold text-zinc-700">
                      لا توجد أصناف مطابقة لـ "{headerSearch.trim()}"
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      جرّب البحث بكلمة أخرى مثل: مرسام، دفتر، حبر، ورق A4
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 max-h-[75vh] overflow-y-auto">
                    {/* 1. Quick Search Phrase Suggestions */}
                    {keywordSuggestions.length > 0 && (
                      <div className="p-3 bg-zinc-50/70 space-y-2">
                        <div className="flex items-center gap-1 text-[10px] font-black text-zinc-500">
                          <Sparkles size={11} className="text-amber-500" />
                          <span>اقتراحات بحث سريعة ومرادفات:</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {keywordSuggestions.map((phrase) => (
                            <button
                              key={phrase}
                              type="button"
                              onClick={() => handleSelectPhrase(phrase)}
                              className="inline-flex items-center gap-1 bg-white hover:bg-black hover:text-white text-zinc-700 border border-zinc-200 text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors"
                            >
                              <Search size={10} />
                              <span>{phrase}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Top 5 Matching Products */}
                    <div className="p-2 space-y-1">
                      <div className="px-2 py-1 flex items-center justify-between text-[10px] font-black text-zinc-400">
                        <span>أبرز الأصناف المطابقة</span>
                        <span>{totalMatches} نتيجة</span>
                      </div>

                      {liveProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectProduct(prod)}
                          className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Thumbnail */}
                            <div className="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg">{prod.categoryIcon || '📦'}</span>
                              )}
                            </div>

                            {/* Name & Price */}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-extrabold text-zinc-900 group-hover:text-[#c40d00] truncate">
                                {prod.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <PriceTag price={prod.price} size="sm" />
                                {prod.categoryTitle && (
                                  <span className="text-[10px] text-zinc-400 truncate">
                                    • {prod.categoryTitle}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Add to Cart Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(prod, 1);
                            }}
                            className="shrink-0 bg-black hover:bg-[#c40d00] text-white text-[11px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors shadow-sm"
                            title="إضافة سريعة للسلة"
                          >
                            <span>🛒</span>
                            <span>أضف</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* 3. Footer Button: View All Search Results */}
                    <div className="p-2.5 bg-zinc-50">
                      <button
                        type="button"
                        onClick={() => {
                          const q = headerSearch.trim();
                          setDropdownOpen(false);
                          navigate(`/categories?search=${encodeURIComponent(q)}`);
                        }}
                        className="w-full bg-zinc-900 hover:bg-black text-white text-xs font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>عرض جميع نتائج البحث لـ ({headerSearch.trim()})</span>
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
