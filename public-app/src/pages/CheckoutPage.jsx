import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/currency';
import { http } from '../api/http';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Search, User, MapPin, ClipboardList } from 'lucide-react';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter a phone number first.');
      return;
    }
    
    try {
      const response = await http.get(`/customers/phone/${phone}`);
      setCustomer(response.data);
      setFormData(response.data);
      setIsNewCustomer(false);
      toast.success('Profile found and loaded!');
    } catch (error) {
      if (error.message === 'Customer not found') {
        setIsNewCustomer(true);
        setCustomer(null);
        setFormData({
          name: '',
          address_line_1: '',
          address_line_2: '',
          city: '',
          state: '',
          postal_code: '',
        });
        toast.success('No existing profile. Fill out details to create one!');
      } else {
        toast.error('An error occurred while fetching customer data.');
      }
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!customer || isNewCustomer) return;
    try {
      const response = await http.put(`/customers/${customer.id}`, formData);
      setCustomer(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update customer profile.');
    }
  };

  const handlePlaceOrder = async () => {
    let finalCustomer = customer;
    if (isNewCustomer) {
      try {
        const response = await http.post('/customers', { ...formData, phone });
        finalCustomer = response.data;
        setCustomer(finalCustomer);
        setIsNewCustomer(false);
        toast.success('New customer profile created!');
      } catch (error) {
        toast.error('Failed to create customer profile.');
        return;
      }
    }

    if (!finalCustomer) {
      toast.error('Please verify or enter customer details first.');
      return;
    }

    if (!formData.name.trim() || !formData.address_line_1.trim() || !formData.city.trim() || !formData.state.trim() || !formData.postal_code.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      const orderPayload = {
        customer: {
          ...finalCustomer,
          name: formData.name,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
        },
        cart,
        totalAmount: cartTotal,
      };
      const response = await http.post('/orders', orderPayload);
      const { whatsappUrl, order } = response.data;
      
      clearCart();
      navigate('/order-success', { state: { order } });
      window.location.href = whatsappUrl;

    } catch (error) {
      toast.error('Failed to place order.');
    }
  };

  const hasProfileChanges = customer && (
    formData.name !== customer.name ||
    formData.address_line_1 !== customer.address_line_1 ||
    (formData.address_line_2 || '') !== (customer.address_line_2 || '') ||
    formData.city !== customer.city ||
    formData.state !== customer.state ||
    formData.postal_code !== customer.postal_code
  );

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-6 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm mt-12">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty.</h1>
        <p className="text-gray-500 mb-8">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/jerseys" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl font-extrabold uppercase tracking-wider text-charcoal mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Step 1 Information Form */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-none border border-charcoal/10 p-6 sm:p-8 shadow-none">
            <div className="flex items-center gap-3 border-b border-charcoal/10 pb-4 mb-6">
              <div className="w-8 h-8 bg-accent border border-charcoal/10 rounded-none flex items-center justify-center text-charcoal shrink-0">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-charcoal">1. Customer Verification</h2>
            </div>
            
            <p className="text-sm text-charcoal/60 mb-6 font-sans leading-relaxed">
              Enter your phone number to check if you have an existing profile or to initialize a new checkout profile.
            </p>

            <form onSubmit={handlePhoneSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal/40">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number (e.g. +919876543210)"
                  className="w-full pl-11 pr-4 py-3 bg-cream border border-charcoal/20 rounded-none text-sm focus:outline-none focus:border-charcoal focus:bg-white transition-all font-sans text-charcoal"
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary px-8 py-3 rounded-none text-xs font-heading font-bold tracking-wider shrink-0"
              >
                Find Profile
              </button>
            </form>

            {(customer || isNewCustomer) && (
              <div className="mt-8 pt-8 border-t border-charcoal/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-accent border border-charcoal/10 rounded-none flex items-center justify-center text-charcoal shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-charcoal">
                    {isNewCustomer ? 'New Profile Details' : 'Shipping Details'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1.5">Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. John Doe" 
                      className="w-full bg-cream border border-charcoal/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-charcoal focus:bg-white transition-all text-charcoal font-sans" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1.5">Address Line 1 *</label>
                    <input 
                      type="text" 
                      name="address_line_1" 
                      value={formData.address_line_1} 
                      onChange={handleInputChange} 
                      placeholder="Street name, house/flat number" 
                      className="w-full bg-cream border border-charcoal/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-charcoal focus:bg-white transition-all text-charcoal font-sans" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1.5">Address Line 2 (Optional)</label>
                    <input 
                      type="text" 
                      name="address_line_2" 
                      value={formData.address_line_2 || ''} 
                      onChange={handleInputChange} 
                      placeholder="Apartment, suite, unit, floor, etc." 
                      className="w-full bg-cream border border-charcoal/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-charcoal focus:bg-white transition-all text-charcoal font-sans" 
                    />
                  </div>
                  <div>
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1.5">City *</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      placeholder="City" 
                      className="w-full bg-cream border border-charcoal/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-charcoal focus:bg-white transition-all text-charcoal font-sans" 
                    />
                  </div>
                  <div>
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1.5">State *</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={formData.state} 
                      onChange={handleInputChange} 
                      placeholder="State" 
                      className="w-full bg-cream border border-charcoal/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-charcoal focus:bg-white transition-all text-charcoal font-sans" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-heading text-[10px] font-bold uppercase tracking-widest text-charcoal/50 mb-1.5">Postal Code *</label>
                    <input 
                      type="text" 
                      name="postal_code" 
                      value={formData.postal_code} 
                      onChange={handleInputChange} 
                      placeholder="Postal Code" 
                      className="w-full bg-cream border border-charcoal/20 rounded-none px-4 py-3 text-sm focus:outline-none focus:border-charcoal focus:bg-white transition-all text-charcoal font-sans" 
                    />
                  </div>
                </div>

                {customer && !isNewCustomer && hasProfileChanges && (
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="mt-6 w-full btn-secondary py-3 text-xs font-heading font-bold tracking-wider hover:scale-[1.01]"
                  >
                    Save Profile Changes
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Step 2 Order Summary Panel */}
        <div className="lg:col-span-5 bg-white rounded-none border border-charcoal/10 p-6 sm:p-8 shadow-none lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-charcoal/10 pb-4 mb-6">
            <div className="w-8 h-8 bg-accent border border-charcoal/10 rounded-none flex items-center justify-center text-charcoal shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-charcoal">2. Order Summary</h2>
          </div>

          <div className="divide-y divide-charcoal/5 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 pr-4">
                  <p className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal truncate">{item.name}</p>
                  <p className="font-heading text-[10px] uppercase tracking-widest text-charcoal/50 font-bold mt-0.5">Size: {item.size} • Qty: {item.quantity}</p>
                </div>
                <p className="font-heading text-sm font-black text-charcoal shrink-0">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-charcoal/10 pt-6 mt-6 space-y-4">
            <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-widest text-charcoal/50">
              <span>Subtotal</span>
              <span className="text-charcoal">{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-widest text-charcoal/50">
              <span>Delivery</span>
              <span className="text-charcoal bg-accent px-2 py-0.5 border border-charcoal/10 text-[9px] font-black tracking-wider">Will be specified on WhatsApp</span>
            </div>
            <div className="border-t border-charcoal/10 pt-4 mt-4 flex justify-between items-baseline">
              <span className="font-heading text-sm font-bold uppercase tracking-wider text-charcoal">Total Amount</span>
              <span className="font-heading text-2xl font-black text-charcoal">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className={`w-full btn-primary mt-8 py-4 text-xs font-heading font-bold tracking-wider flex items-center justify-center gap-2 ${
              (!customer && !isNewCustomer) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!customer && !isNewCustomer}
          >
            Place Order via WhatsApp
          </button>
          
          <p className="text-center font-heading text-[10px] uppercase tracking-widest text-charcoal/40 mt-4 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Redirects to WhatsApp to finalize order.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
