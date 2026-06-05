import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const { toggleCart, totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jerseys?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-md border-b border-charcoal/10 shadow-none">
      {isSearchOpen ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-white border border-charcoal/20 rounded-none px-4 py-3 focus-within:border-charcoal focus-within:ring-1 focus-within:ring-charcoal transition-all">
              <Search className="w-5 h-5 text-charcoal/60 mr-2" />
              <input
                type="text"
                placeholder="Search jerseys, teams, or players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow bg-transparent border-0 outline-none text-charcoal placeholder-charcoal/40 text-sm py-1 font-sans"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} 
                className="text-charcoal/50 hover:text-charcoal transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <BrandLogo />
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="font-heading text-lg uppercase tracking-wider text-charcoal font-semibold relative group py-2">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-charcoal transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/jerseys" className="font-heading text-lg uppercase tracking-wider text-charcoal/70 hover:text-charcoal font-semibold relative group py-2">
                Catalog
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-charcoal transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button onClick={() => setIsSearchOpen(true)} className="text-charcoal/70 hover:text-charcoal transition-colors" aria-label="Open search">
                <Search size={22} />
              </button>
              <button onClick={toggleCart} className="relative text-charcoal/70 hover:text-charcoal transition-colors">
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-charcoal text-[10px] font-black rounded-none h-4.5 w-4.5 flex items-center justify-center border border-charcoal/25">
                    {totalItems}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-charcoal/70 hover:text-charcoal transition-colors">
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-cream border-b border-charcoal/10 px-4 pt-2 pb-4 space-y-2">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block font-heading text-lg uppercase tracking-wider text-charcoal font-semibold py-2 transition-colors border-b border-charcoal/5"
          >
            Home
          </Link>
          <Link 
            to="/jerseys" 
            onClick={() => setMobileMenuOpen(false)}
            className="block font-heading text-lg uppercase tracking-wider text-charcoal/70 hover:text-charcoal font-semibold py-2 transition-colors border-b border-charcoal/5"
          >
            Catalog
          </Link>
        </nav>
      )}
    </header>
  );
}
