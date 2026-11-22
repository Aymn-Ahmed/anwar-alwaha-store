import React from 'react';
import { SarSymbol } from './SarSymbol';

interface PriceTagProps {
  price: number | null | undefined;
  oldPrice?: number | null;
  discountPercent?: number | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showDecimals?: boolean;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  oldPrice,
  discountPercent,
  size = 'md',
  className = 'text-[#c40d00]',
  showDecimals = true,
}) => {
  if (price === null || price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    return (
      <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
        السعر حسب الطلب
      </span>
    );
  }

  const num = Number(price);
  const intPart = Math.floor(num);
  const decPart = (num % 1 !== 0)
    ? (num - intPart).toFixed(2).slice(1)
    : (showDecimals ? '.00' : '');

  let intClass = 'text-base sm:text-lg';
  let decClass = 'text-xs';
  let symClass = 'w-3 h-3 sm:w-3.5 sm:h-3.5';

  if (size === 'xs') {
    intClass = 'text-xs'; decClass = 'text-[9px]'; symClass = 'w-2.5 h-2.5';
  } else if (size === 'sm') {
    intClass = 'text-sm'; decClass = 'text-[10px]'; symClass = 'w-2.5 h-2.5';
  } else if (size === 'md') {
    intClass = 'text-base sm:text-lg'; decClass = 'text-xs'; symClass = 'w-3 h-3 sm:w-3.5 sm:h-3.5';
  } else if (size === 'lg') {
    intClass = 'text-xl sm:text-2xl'; decClass = 'text-sm'; symClass = 'w-4 h-4';
  } else if (size === 'xl') {
    intClass = 'text-2xl sm:text-3xl'; decClass = 'text-base'; symClass = 'w-5 h-5';
  }

  return (
    <span className={`inline-flex items-baseline gap-0.5 ${className}`} dir="ltr">
      <span className={`${intClass} font-[800] tracking-tight leading-none`}>
        {intPart}
      </span>
      {decPart && (
        <span className={`${decClass} font-bold opacity-80 leading-none`}>
          {decPart}
        </span>
      )}
      <span className="inline-flex items-center ml-1 text-current self-center" dir="rtl">
        <SarSymbol className={symClass} />
      </span>
      {oldPrice && Number(oldPrice) > num && (
        <span className="text-xs text-zinc-400 line-through mr-1 font-normal" dir="ltr">
          {Number(oldPrice).toFixed(0)}
        </span>
      )}
    </span>
  );
};
