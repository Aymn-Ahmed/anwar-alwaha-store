import React from 'react';
import { Eye, Heart } from 'lucide-react';
import { Product } from '../../types/product.types';
import { PriceTag } from '../common/PriceTag';
import { useCart } from '../../context/CartContext';
import { useCustomer } from '../../context/CustomerContext';
import { useCatalogCache } from '../../context/CatalogCacheContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const FALLBACK_IMG =
  'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%23f3f4f6%22%20stroke%3D%22%23e5e7eb%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20x%3D%2250%22%20y%3D%2257%22%20font-size%3D%2236%22%20text-anchor%3D%22middle%22%3E%F0%9F%93%9A%3C%2Ftext%3E%3C%2Fsvg%3E';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useCustomer();
  const { hideUnverifiedPhotos } = useCatalogCache();

  const liked = isInWishlist(product.id);

  const isPhotoVerified = Boolean(product.isVerifiedPhoto);
  const hasRawImage = Boolean(product.imageUrl);
  const shouldShowImage = hasRawImage && (!hideUnverifiedPhotos || isPhotoVerified);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

  const discountText =
    product.discountPercent && product.discountPercent > 0
      ? `-${product.discountPercent}%`
      : null;

  return (
    <div
      onClick={() => onQuickView?.(product)}
      className="group bg-white rounded-2xl border border-zinc-200/80 hover:border-zinc-900 flex flex-col cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
        {shouldShowImage ? (
          <img
            src={product.imageUrl!}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMG;
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-50 to-zinc-100">
            <span className="text-5xl sm:text-6xl leading-none">
              {product.categoryIcon || '📦'}
            </span>
            {product.categoryTitle && (
              <span className="text-[10px] font-bold text-zinc-400 px-2 text-center line-clamp-1">
                {product.categoryTitle}
              </span>
            )}
          </div>
        )}

        {/* Wishlist Heart Button - top left */}
        <button
          type="button"
          onClick={handleToggleLike}
          aria-label={liked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-90 ${
            liked
              ? 'bg-red-50 text-[#fa2c19] border border-red-200'
              : 'bg-white/90 text-zinc-500 hover:text-[#fa2c19] hover:bg-white'
          }`}
        >
          <Heart size={15} className={liked ? 'fill-[#fa2c19]' : ''} />
        </button>

        {/* Badges container - top right */}
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
          {discountText && (
            <span className="bg-[#c40d00] text-white text-[10px] font-black px-2 py-0.5 rounded-sm shadow-xs">
              {discountText}
            </span>
          )}
          {shouldShowImage && (
            isPhotoVerified ? (
              <span className="bg-emerald-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs backdrop-blur-xs">
                معتمدة ✓
              </span>
            ) : (
              <span className="bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs backdrop-blur-xs">
                صورة توضيحية
              </span>
            )
          )}
        </div>

        {/* Category badge - bottom right */}
        {product.categoryTitle && (
          <span className="absolute bottom-2 right-2 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded max-w-[85%] truncate">
            {product.categoryTitle}
          </span>
        )}

        {/* Quick view overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView?.(product);
          }}
          className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-white/90 text-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-black hover:text-white"
        >
          <Eye size={16} />
        </button>

        {/* TikTok indicator */}
        {product.tikTokVideoId && (
          <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
            🎵 تيك توك
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-2 flex-1">
        {/* Low stock warning */}
        {isLowStock && (
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded self-start">
            متبقي {product.stockQuantity} فقط
          </span>
        )}

        {/* Name */}
        <h3 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug flex-1">
          {product.name}
        </h3>

        {/* Price + Add to cart */}
        <div className="flex items-center justify-between gap-1 mt-auto">
          <PriceTag price={product.price} oldPrice={product.oldPrice} size="sm" />
          <button
            onClick={handleAddToCart}
            className="shrink-0 text-[11px] font-black px-2.5 py-1.5 rounded-lg transition-all active:scale-95 bg-zinc-900 hover:bg-[#c40d00] text-white"
          >
            اطلب الآن
          </button>
        </div>
      </div>
    </div>
  );
};
