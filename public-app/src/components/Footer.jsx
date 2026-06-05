import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { http } from '../api/http';

export default function Footer() {
  const [whatsappNumber, setWhatsappNumber] = useState('+919876543210');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await http.get('/settings');
        const num = data?.whatsapp_number || data?.data?.whatsapp_number;
        if (num) {
          setWhatsappNumber(num);
        }
      } catch (error) {
        console.error('Failed to load settings in footer:', error);
      }
    };
    fetchSettings();
  }, []);

  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const message = "Hey, I would like to order a jersey";
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

  return (
    <footer className="bg-charcoal text-white pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-8 mb-12">
          <div>
            <BrandLogo tone="dark" compact showWordmark={true} />
          </div>
          
          <p className="text-gray-400 max-w-md leading-relaxed text-sm font-sans">
            Your premium destination for authentic and high-quality football jerseys. 
            Find the perfect fit to support your favorite club or national team.
          </p>

          <div className="flex flex-col items-center gap-4">
            <span className="font-heading text-lg uppercase tracking-wider text-gray-200">
              Phone: {whatsappNumber}
            </span>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-none font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-[1.01]"
            >
              <MessageCircle className="w-5 h-5" />
              Order via WhatsApp
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs tracking-wider uppercase font-heading">
            &copy; {new Date().getFullYear()} Jersey Adda. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
