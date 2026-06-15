import React from 'react';
import { optimizeCloudinaryUrl } from '../utils/image';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    id: 'player-version',
    title: 'Player Version',
    subtitle: 'Professional, athletic-fit jerseys worn on the pitch.',
    image: 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1781001006/11_firfjm.jpg',
    path: '/jerseys?version=PLAYER',
    tag: 'Athletic Fit',
    color: 'from-charcoal/95 via-charcoal/65 to-transparent'
  },
  {
    id: 'stadium-version',
    title: 'Stadium Version',
    subtitle: 'Comfortable fan-fit jerseys designed for everyday wear.',
    image: 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1781001004/22_e8hjqj.jpg',
    path: '/jerseys?version=FAN',
    tag: 'Fan Fit',
    color: 'from-charcoal/95 via-charcoal/65 to-transparent'
  },
  {
    id: 'clearance-sale',
    title: 'Clearance Sale',
    subtitle: 'Grab your favorites at unbeatable discounted prices.',
    image: 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1781001006/33_yufkrw.jpg',
    path: '/jerseys?is_on_sale=Yes',
    tag: 'Up to 50% Off',
    color: 'from-charcoal/95 via-charcoal/65 to-transparent'
  }
];

export default function SpecialCollections() {
  return (
    <section className="w-full bg-cream py-16 border-t border-charcoal/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">
            Special Collections
          </h2>
          <p className="mt-2 text-sm text-charcoal/60 font-sans">
            Curated premium editions and clearance offers for true fans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col) => (
            <Link
              key={col.id}
              to={col.path}
              className="group relative h-96 block overflow-hidden border border-charcoal/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-charcoal shadow-sm hover:shadow-lg"
            >
              {/* Background Image - refactored to img tag for native lazy loading */}
              <img 
                src={optimizeCloudinaryUrl(col.image, 400)} 
                alt={col.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${col.color}`} />

              {/* Tag */}
              <span className="absolute top-4 left-4 bg-accent text-charcoal text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border border-charcoal/15">
                {col.tag}
              </span>

              {/* Text Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                <h3 className="font-heading text-2xl font-black uppercase tracking-wider group-hover:text-accent transition-colors duration-300">
                  {col.title}
                </h3>
                <p className="mt-2 text-xs text-white/80 font-sans line-clamp-2 leading-relaxed">
                  {col.subtitle}
                </p>
                <div className="mt-4 flex items-center gap-2 font-heading text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 text-accent" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
