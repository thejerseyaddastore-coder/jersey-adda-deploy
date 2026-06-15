import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { getPrimaryJerseyImage, optimizeCloudinaryUrl } from '../utils/image';
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';

const CartPage = () => {
  const { cart, cartTotal, totalItems, removeFromCart, updateQuantity, deliveryCost } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-charcoal mb-8">Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-none border border-charcoal/10 shadow-none max-w-xl mx-auto px-6">
          <div className="w-16 h-16 bg-accent border border-charcoal/10 rounded-none flex items-center justify-center mx-auto mb-6 text-charcoal">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-charcoal mb-2">Your cart is empty</h2>
          <p className="text-charcoal/50 text-sm mb-8 max-w-md mx-auto font-sans leading-relaxed">
            Looks like you haven't added any jerseys yet. Explore our collection to find your favorite team's kit!
          </p>
          <Link to="/jerseys" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-2 bg-white rounded-none border border-charcoal/10 shadow-none p-6 sm:p-8 space-y-6">
            {cart.map((item) => (
              <div 
                key={`${item.id}-${item.size}`} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 border-b border-charcoal/10 last:border-b-0 last:pb-0 first:pt-0 gap-4"
              >
                {/* Product details header */}
                <div className="flex items-center gap-4 sm:gap-6 flex-grow">
                  <img 
                    src={optimizeCloudinaryUrl(getPrimaryJerseyImage(item), 150)} 
                    alt={item.name} 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-none border border-charcoal/10 bg-cream shrink-0" 
                  />
                  <div className="flex-grow">
                    <h2 className="font-heading text-base sm:text-lg font-extrabold uppercase tracking-wider text-charcoal leading-snug">{item.name}</h2>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-charcoal/50 uppercase tracking-widest font-bold">
                      <span>Size: <strong className="text-charcoal">{item.size}</strong></span>
                      <span>•</span>
                      <span>Unit Price: <strong className="text-charcoal">{formatCurrency(item.price)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Pricing, Quantity, and Actions */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-charcoal/5">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-charcoal/20 rounded-none overflow-hidden bg-cream">
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} 
                      className="px-3 py-1 hover:bg-charcoal/5 text-charcoal text-base font-black transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-black text-charcoal min-w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} 
                      className="px-3 py-1 hover:bg-charcoal/5 text-charcoal text-base font-black transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="font-heading text-base sm:text-lg font-black text-charcoal min-w-[90px] text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id, item.size)} 
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2.5 rounded-none transition-colors border border-transparent hover:border-red-100"
                    title="Remove item"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Panel */}
          <div className="bg-white rounded-none border border-charcoal/10 p-6 sm:p-8 shadow-none">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-charcoal mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-widest text-charcoal/50">
                <span>Total Items</span>
                <span className="text-charcoal">{totalItems}</span>
              </div>
              <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-widest text-charcoal/50">
                <span>Delivery</span>
                <span className="text-charcoal bg-accent px-2.5 py-1 text-[10px] tracking-wider border border-charcoal/10 font-black">{formatCurrency(deliveryCost)}</span>
              </div>
              <div className="border-t border-charcoal/10 pt-4 mt-4 flex justify-between items-baseline">
                <span className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">Total Amount</span>
                <span className="font-heading text-2xl font-black text-charcoal">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="block text-center w-full btn-primary mt-8 py-4 text-sm font-heading font-bold tracking-wider"
            >
              Proceed to Checkout
            </Link>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;
