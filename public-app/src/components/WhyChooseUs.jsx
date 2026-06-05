import React from 'react';
import { ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export default function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-charcoal" />,
      title: 'Premium Quality Jerseys',
      description: 'Authentic feel, breathable fabrics, and durable prints. Available in both Player and Fan versions to suit your style.'
    },
    {
      icon: <Truck className="w-8 h-8 text-charcoal" />,
      title: 'Fast & Reliable Delivery',
      description: 'We ensure quick dispatch and secure packaging so your jersey reaches you in perfect condition, ready for matchday.'
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-charcoal" />,
      title: 'Secure Ordering via WhatsApp',
      description: 'Personalized customer service. Browse our catalog and finalize your order securely through a direct WhatsApp chat.'
    }
  ];

  return (
    <section className="py-24 bg-cream border-t border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-wider text-charcoal mb-4">Why Choose Jersey Adda?</h2>
          <p className="text-base text-charcoal/60 max-w-2xl mx-auto font-sans">
            We are dedicated to providing football fans with the best merchandise experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-accent border border-charcoal/15 mb-6 transform group-hover:scale-105 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading font-bold uppercase tracking-wider text-charcoal mb-3">{feature.title}</h3>
              <p className="text-charcoal/60 leading-relaxed font-sans text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
