import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJerseyBySlug } from '../api/jerseys';
import { getJerseyImages } from '../utils/image';
import { formatCurrency } from '../utils/currency';
import { normalizeSizes, defaultJerseySizes } from '../utils/sizes';
import { useCart } from '../context/CartContext';
import SizeChartModal from '../components/SizeChartModal';
import { ArrowLeft, Check, Truck, ShieldCheck, MessageCircle, ShoppingBag, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JerseyDetailPage() {
  const { slug } = useParams();
  const [jersey, setJersey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const { addToCart } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState("+1234567890"); // Default fallback

  const images = getJerseyImages(jersey);
  const sizes = useMemo(() => {
    const normalized = normalizeSizes(jersey?.available_sizes);
    return normalized.length > 0 ? normalized : defaultJerseySizes;
  }, [jersey]);

  useEffect(() => {
    let active = true;
    async function fetchJersey() {
      setLoading(true);
      setError('');
      try {
        const response = await getJerseyBySlug(slug);
        if (!active) return;
        setJersey(response.data);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load jersey details');
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchJersey();
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    let active = true;
    async function fetchSettings() {
      try {
        const apiUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) 
          || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
          || '/api';
        const response = await fetch(`${apiUrl}/settings`);
        if (response.ok) {
          const data = await response.json();
          const number = data?.data?.whatsapp_number || data?.whatsapp_number;
          if (active && number) {
            setWhatsappNumber(number);
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    }
    fetchSettings();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (sizes.length > 0) {
      setSelectedSize((current) => (sizes.includes(current) ? current : sizes[0]));
    }
  }, [sizes]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first.');
      return;
    }

    addToCart(jersey, selectedSize, quantity);
    toast.success(`${jersey.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !jersey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 mb-6">
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p>{error || 'Jersey not found.'}</p>
        </div>
        <Link to="/jerseys" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  // WhatsApp ordering info
  const displayPrice = jersey.is_on_sale ? jersey.sale_price : jersey.price;
  const message = `Hi! I want to order the "${jersey.name}" (Slug: ${jersey.slug}). Price: ${formatCurrency(displayPrice)}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <main className="bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Breadcrumb / Back */}
        <nav className="mb-8 flex items-center space-x-2 font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
          <Link to="/" className="hover:text-charcoal transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <span>/</span>
          <Link to="/jerseys" className="hover:text-charcoal transition-colors">
            Collections
          </Link>
          <span>/</span>
          <span>
            {jersey.version_type ? `${jersey.version_type} Version` : 'Jerseys'}
          </span>
          <span>/</span>
          <span className="text-charcoal truncate max-w-[150px] sm:max-w-xs">{jersey.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 shrink-0 pb-2 lg:pb-0 hide-scrollbar">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-24 w-24 shrink-0 rounded-none overflow-hidden bg-white flex items-center justify-center border transition-all ${
                    activeImage === index ? 'border-charcoal ring-1 ring-charcoal' : 'border-charcoal/10 hover:border-charcoal/40'
                  }`}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-grow bg-white rounded-none overflow-hidden aspect-[4/5] border border-charcoal/10 group">
              <img 
                src={images[activeImage]} 
                alt={jersey.name} 
                className="w-full h-full object-cover object-center transition-all duration-500 ease-in-out"
              />
              
              {images.length > 1 && (
                <>
                  {/* Left Click Zone */}
                  <div 
                    onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-0 top-0 bottom-0 w-1/2 cursor-w-resize z-20 flex items-center justify-start pl-4 group/btn"
                  >
                    <span className="bg-charcoal/90 hover:bg-accent text-white hover:text-charcoal p-3 rounded-none opacity-0 group-hover/btn:opacity-100 transition-all duration-200 shadow-md">
                      <ChevronLeft className="w-6 h-6" />
                    </span>
                  </div>

                  {/* Right Click Zone */}
                  <div 
                    onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-0 top-0 bottom-0 w-1/2 cursor-e-resize z-20 flex items-center justify-end pr-4 group/btn"
                  >
                    <span className="bg-charcoal/90 hover:bg-accent text-white hover:text-charcoal p-3 rounded-none opacity-0 group-hover/btn:opacity-100 transition-all duration-200 shadow-md">
                      <ChevronRight className="w-6 h-6" />
                    </span>
                  </div>
                </>
              )}
              
              {jersey.version_type && (
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-1.5 text-xs font-heading font-extrabold bg-charcoal text-white rounded-none border border-white/10 shadow-sm uppercase tracking-widest">
                    {jersey.version_type} VERSION
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 lg:mt-0 px-2 sm:px-0 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-charcoal/10 pb-6">
              <div>
                <h2 className="font-heading text-xs font-bold tracking-widest text-charcoal/50 uppercase mb-1">{jersey.team_name}</h2>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-charcoal tracking-wide uppercase leading-tight">
                  {jersey.name}
                </h1>
              </div>
              {jersey.is_on_sale ? (
                <div className="text-right pt-1 sm:pt-0 shrink-0">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="font-heading text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 border border-red-700">
                      SALE
                    </span>
                    <span className="font-sans text-xs text-red-600 font-bold">
                      Save {formatCurrency(Number(jersey.price) - Number(jersey.sale_price))} ({Math.round(((Number(jersey.price) - Number(jersey.sale_price)) / Number(jersey.price)) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-baseline justify-end gap-2 mt-1 whitespace-nowrap">
                    <span className="font-heading text-2xl font-black text-charcoal">{formatCurrency(jersey.sale_price || 0)}</span>
                    <span className="font-heading text-sm font-semibold text-charcoal/45 line-through">{formatCurrency(jersey.price || 0)}</span>
                  </div>
                </div>
              ) : (
                <p className="font-heading text-2xl font-black text-charcoal whitespace-nowrap pt-1 sm:pt-0">
                  {formatCurrency(jersey.price || 0)}
                </p>
              )}
            </div>

            <div className="text-charcoal/70 mb-8 font-sans text-sm leading-relaxed max-w-xl">
              <p>{jersey.description || 'Experience the game with this premium quality football jersey, designed for true fans and players alike.'}</p>
            </div>

            {/* Specifications Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-none border border-charcoal/10">
                <p className="font-heading text-[10px] text-charcoal/40 uppercase tracking-widest font-extrabold mb-1">League</p>
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">{jersey.league_name || 'International'}</p>
              </div>
              <div className="bg-white p-4 rounded-none border border-charcoal/10">
                <p className="font-heading text-[10px] text-charcoal/40 uppercase tracking-widest font-extrabold mb-1">Sleeve</p>
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">{jersey.sleeve_type === 'HALF' ? 'Half Sleeve' : 'Full Sleeve'}</p>
              </div>
              <div className="bg-white p-4 rounded-none border border-charcoal/10">
                <p className="font-heading text-[10px] text-charcoal/40 uppercase tracking-widest font-extrabold mb-1">Version</p>
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">{jersey.version_type || 'Standard'}</p>
              </div>
              <div className="bg-white p-4 rounded-none border border-charcoal/10">
                <p className="font-heading text-[10px] text-charcoal/40 uppercase tracking-widest font-extrabold mb-1">Shorts</p>
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">{jersey.has_shorts ? 'Included' : 'Not Included'}</p>
              </div>
            </div>

            {/* Size & Buy Area */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="font-heading text-sm font-bold text-charcoal">
                  Size: <span className="font-black text-charcoal">{selectedSize}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="inline-flex items-center gap-1.5 font-heading text-[10px] font-black uppercase tracking-widest text-charcoal/50 hover:text-charcoal transition-colors"
                >
                  <Ruler className="h-3 w-3" />
                  View Size Chart
                </button>
              </div>

              {/* Size Buttons */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 min-w-[56px] rounded-none border font-heading text-xs font-bold uppercase transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-charcoal border-2 text-charcoal bg-white font-black'
                        : 'border-charcoal/10 bg-white text-charcoal/70 hover:border-charcoal/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* In stock badge */}
              <div className="mb-6 flex">
                <div className="inline-flex items-center bg-[#cdff65]/10 text-[#4c6b1f] px-4 py-2.5 rounded-full text-xs font-semibold font-sans tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#52821d] inline-block mr-2" />
                  In stock, ready to ship
                </div>
              </div>

              {/* Quantity Selector and Add to Cart Row */}
              <div className="flex gap-3">
                <div className="flex items-center border border-charcoal/15 bg-white h-14 w-28 justify-between px-3 select-none">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-charcoal/50 hover:text-charcoal px-2 py-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-heading text-sm font-black text-charcoal">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="text-charcoal/50 hover:text-charcoal px-2 py-1 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-accent text-charcoal hover:bg-charcoal hover:text-white border border-charcoal/15 font-heading text-xs font-black uppercase tracking-widest transition-all h-14 flex items-center justify-center shadow-xs"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Pair It With Section */}
            <div className="mt-4 pt-6 border-t border-charcoal/10">
              <p className="font-heading text-xs font-black tracking-widest text-charcoal uppercase mb-3">Pair it with:</p>
              <div className="bg-cream/40 border border-dashed border-charcoal/15 p-4 rounded-none text-center">
                <p className="text-xs text-charcoal/50 font-sans">Complete the kit with matching shorts or custom name printing on WhatsApp.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-charcoal/10">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4.5 rounded-none font-heading font-extrabold uppercase tracking-wider text-base transition-all duration-300 hover:scale-[1.01]"
              >
                <MessageCircle className="w-5 h-5" />
                Order via WhatsApp
              </a>
              <p className="text-center font-heading text-[10px] uppercase tracking-widest text-charcoal/40 mt-4 flex items-center justify-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-600" /> Stock verified manually upon order.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-charcoal/10">
              <div className="flex items-center gap-2.5 font-heading text-xs font-bold uppercase tracking-widest text-charcoal/60">
                <ShieldCheck className="w-4.5 h-4.5 text-charcoal/70" /> Premium Quality
              </div>
              <div className="flex items-center gap-2.5 font-heading text-xs font-bold uppercase tracking-widest text-charcoal/60">
                <Truck className="w-4.5 h-4.5 text-charcoal/70" /> Fast Delivery
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeChartModal open={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </main>
  );
}
