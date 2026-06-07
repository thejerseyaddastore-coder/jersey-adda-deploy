import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getJerseyImages } from '../utils/image';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

export default function JerseyCard({ jersey }) {
  const { addToCart } = useCart();
  const jerseySlug = jersey.slug || jersey.id;

  const images = useMemo(() => getJerseyImages(jersey), [jersey]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleAddToCart = (size) => {
    addToCart(jersey, size);
    toast.success(`${jersey.name} (Size: ${size}) added to cart!`);
  };

  return (
    <article className="group bg-white rounded-none border border-charcoal/10 hover:border-charcoal transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      <Link to={`/jerseys/${jerseySlug}`} className="block">
        <div className="relative overflow-hidden h-72 bg-cream">
          {images.map((imgUrl, index) => (
            <img
              key={imgUrl}
              src={imgUrl}
              alt={jersey.name}
              className={`absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-all duration-700 ease-in-out ${
                index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            />
          ))}
          
          {images.length > 1 && (
            <>
              {/* Left interactive click zone */}
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute left-0 top-0 bottom-0 w-1/2 cursor-w-resize z-20 flex items-center justify-start pl-2 group/btn"
              >
                <span className="bg-charcoal/80 hover:bg-accent text-white hover:text-charcoal p-1.5 rounded-none opacity-0 group-hover/btn:opacity-100 group-hover:opacity-40 transition-all duration-200 shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </span>
              </div>
              
              {/* Right interactive click zone */}
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-0 top-0 bottom-0 w-1/2 cursor-e-resize z-20 flex items-center justify-end pr-2 group/btn"
              >
                <span className="bg-charcoal/80 hover:bg-accent text-white hover:text-charcoal p-1.5 rounded-none opacity-0 group-hover/btn:opacity-100 group-hover:opacity-40 transition-all duration-200 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </>
          )}

          {jersey.is_on_sale && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-heading font-black uppercase tracking-wider px-2 py-0.5 rounded-none border border-red-700 z-10 shadow-sm">
              SALE
            </span>
          )}

          <div className="absolute top-2 right-2 flex flex-col space-y-1 z-10">
            {jersey.version && (
              <span className="bg-charcoal text-white text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border border-white/10">
                {jersey.version}
              </span>
            )}
            {jersey.sleeve && (
              <span className="bg-accent text-charcoal text-[10px] font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border border-charcoal/10">
                {jersey.sleeve}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-heading text-base font-extrabold uppercase tracking-wider text-charcoal truncate mb-0.5 group-hover:text-charcoal/70 transition-colors">
          <Link to={`/jerseys/${jerseySlug}`}>{jersey.name}</Link>
        </h3>
        <p className="font-sans text-xs text-charcoal/50 uppercase tracking-widest font-semibold mb-2">{jersey.team_name}</p>
        
        {jersey.is_on_sale ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-red-600 text-white text-[9px] font-heading font-black uppercase tracking-wider px-1.5 py-0.5 rounded-none">
                SALE
              </span>
              <span className="font-sans text-[11px] text-red-600 font-bold">
                Save {formatCurrency(Number(jersey.price) - Number(jersey.sale_price))}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-black text-charcoal">{formatCurrency(jersey.sale_price)}</span>
              <span className="font-heading text-xs font-semibold text-charcoal/40 line-through">{formatCurrency(jersey.price)}</span>
            </div>
          </div>
        ) : (
          <p className="font-heading text-lg font-black text-charcoal mb-4">
            {formatCurrency(jersey.price)}
          </p>
        )}

        <div className="mt-auto">
          <div className="mb-1">
            <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50">Available Sizes:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {jersey.available_sizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => handleAddToCart(size)}
                  className="w-8 h-8 border border-charcoal/15 rounded-none text-[11px] font-black text-charcoal hover:bg-accent hover:border-charcoal/40 transition-colors duration-200 flex items-center justify-center"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
