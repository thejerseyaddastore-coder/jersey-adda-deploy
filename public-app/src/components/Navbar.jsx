import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';
import MobileDrawer from './MobileDrawer';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Catalog', path: '/jerseys' },
  { label: 'International Jerseys', path: '/jerseys?category=INTERNATIONAL' },
  { label: 'Club Jerseys', path: '/jerseys?category=CLUB' },
  { label: 'Jerseys With Shorts', path: '/jerseys?category=SHORTS' },
  { label: 'Other Sports & Merchandise', path: '/jerseys?category=OTHER' },
  { label: 'Player Version', path: '/jerseys?version=PLAYER' },
  { label: 'Master Version', path: '/jerseys?version=FAN' },
  { label: 'Clearance Sale', path: '/jerseys?is_on_sale=Yes' },
];

export default function Navbar() {
  const { toggleCart, totalItems } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jerseys?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isActiveLink = (path) => {
    const [pathname, search] = path.split('?');
    if (location.pathname !== pathname) return false;
    
    if (!search) {
      if (pathname === '/jerseys') {
        return location.search === '' || location.search === '?';
      }
      return true;
    }

    const searchParams = new URLSearchParams(search);
    const currentParams = new URLSearchParams(location.search);

    for (const [key, value] of searchParams.entries()) {
      if (currentParams.get(key) !== value) return false;
    }
    return true;
  };

  return (
    <>
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
              <div className="flex-shrink-0 flex items-center mr-4">
                <Link to="/">
                  <BrandLogo />
                </Link>
              </div>

              <nav className="hidden lg:flex items-center flex-wrap gap-x-4 xl:gap-x-6 gap-y-1 max-w-[75%]">
                {navLinks.map((link) => {
                  const active = isActiveLink(link.path);
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      className={`font-heading text-[10px] xl:text-[11px] uppercase tracking-wider font-extrabold relative py-1 transition-colors ${
                        active ? 'text-charcoal' : 'text-charcoal/65 hover:text-charcoal'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-charcoal"></span>
                      )}
                    </Link>
                  );
                })}
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
                <button onClick={() => setIsDrawerOpen(true)} className="lg:hidden text-charcoal/70 hover:text-charcoal transition-colors" aria-label="Open menu">
                  <Menu size={22} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
