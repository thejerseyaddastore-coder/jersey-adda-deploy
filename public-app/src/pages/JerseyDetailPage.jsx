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

    addToCart(jersey, selectedSize);
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
  const message = `Hi! I want to order the "${jersey.name}" (Slug: ${jersey.slug}). Price: ${formatCurrency(jersey.price)}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

  return (
    <main className="bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Breadcrumb / Back */}
        <nav className="mb-8">
          <Link to="/jerseys" className="inline-flex items-center font-heading text-xs font-bold uppercase tracking-widest text-charcoal/50 hover:text-charcoal transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Catalog
          </Link>
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
            <div className="mb-6">
              <h2 className="font-heading text-xs font-bold tracking-widest text-charcoal/50 uppercase mb-1">{jersey.team_name}</h2>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-charcoal tracking-wider uppercase mb-3">{jersey.name}</h1>
              <div className="flex items-center">
                <p className="font-heading text-3xl font-black text-charcoal">{formatCurrency(jersey.price || 0)}</p>
              </div>
            </div>

            <div className="text-charcoal/70 mb-8 font-sans text-sm leading-relaxed max-w-xl">
              <p>{jersey.description || 'Experience the game with this premium quality football jersey, designed for true fans and players alike.'}</p>
            </div>

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

            <div className="mb-8 rounded-none border border-charcoal/15 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-heading text-xs font-bold tracking-widest text-charcoal/50 uppercase">Select Size</h3>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="inline-flex items-center gap-1.5 font-heading text-xs font-extrabold uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:underline"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  View Size Chart
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 rounded-none border px-4 py-2 font-heading text-xs font-black transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-charcoal bg-charcoal text-white'
                        : 'border-charcoal/15 bg-white text-charcoal hover:border-charcoal hover:bg-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-none bg-charcoal px-5 py-4 font-heading text-xs font-bold uppercase tracking-wider text-white transition hover:bg-accent hover:text-charcoal border border-charcoal"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-none border border-charcoal/20 bg-white px-5 py-4 font-heading text-xs font-bold uppercase tracking-wider text-charcoal transition hover:border-charcoal hover:bg-accent"
                >
                  <Ruler className="h-4.5 w-4.5" />
                  Size Guide
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-8 border-t border-charcoal/10">
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
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-charcoal/10">
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
