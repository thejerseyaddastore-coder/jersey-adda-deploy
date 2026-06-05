import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getPrimaryJerseyImage } from '../utils/image';
import BrandLogo from './BrandLogo';

const CartDrawer = () => {
  const { isCartOpen, toggleCart, cart, cartTotal, removeFromCart, updateQuantity } = useCart();

  return (
    <>
      {/* Backdrop overlay */}
      {isCartOpen && (
        <div 
          onClick={toggleCart}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300"
        />
      )}
      {/* Slide-out drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-charcoal/15 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-charcoal/10 bg-cream">
          <BrandLogo showWordmark={false} compact />
          <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-charcoal">Shopping Cart</h2>
          <button onClick={toggleCart} className="text-charcoal/60 hover:text-charcoal transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-sm text-charcoal/50 font-sans text-center py-8">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex items-center pb-4 border-b border-charcoal/5 last:border-b-0 last:pb-0">
                <img src={getPrimaryJerseyImage(item)} alt={item.name} className="w-16 h-16 object-cover rounded-none border border-charcoal/10 bg-cream mr-4" />
                <div className="flex-grow min-w-0">
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal truncate">{item.name}</h3>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-charcoal/50 font-bold mt-0.5">Size: <span className="text-charcoal">{item.size}</span></p>
                  <p className="font-heading text-sm font-black text-charcoal mt-1">{formatCurrency(item.price)}</p>
                  <div className="flex items-center mt-2.5">
                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="px-2 py-0.5 border border-charcoal/20 bg-cream text-charcoal hover:bg-charcoal/5 text-xs font-black rounded-none">-</button>
                    <span className="px-3 text-xs font-black text-charcoal">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="px-2 py-0.5 border border-charcoal/20 bg-cream text-charcoal hover:bg-charcoal/5 text-xs font-black rounded-none">+</button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id, item.size)} className="text-xs font-heading font-bold uppercase tracking-widest text-red-500 hover:text-red-700 ml-4 border border-transparent hover:border-red-100 p-1.5">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-charcoal/10 bg-cream">
          <div className="flex justify-between items-center">
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">Subtotal</span>
            <span className="font-heading text-lg font-black text-charcoal">{formatCurrency(cartTotal)}</span>
          </div>
          <Link to="/cart" onClick={toggleCart} className="block text-center w-full btn-secondary mt-4 py-3.5 text-xs font-heading font-bold tracking-wider">
            View Cart
          </Link>
          <Link to="/checkout" onClick={toggleCart} className="block text-center w-full btn-primary mt-2 py-3.5 text-xs font-heading font-bold tracking-wider">
            Checkout
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default CartDrawer;
