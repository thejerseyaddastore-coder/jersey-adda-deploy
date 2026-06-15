import React from 'react';
import { optimizeCloudinaryUrl } from '../utils/image';
import { Link } from 'react-router-dom';

const clubs = [
  {
    id: 'BARCELONA',
    name: 'FC Barcelona',
    bgImage: 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/barca_zobf0w.jpg',
    color: 'from-blue-950/80 to-red-900/80',
    logo: 'BARCA',
  },
  {
    id: 'REAL_MADRID',
    name: 'Real Madrid',
    bgImage: 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/madrid_s8pzsx.jpg',
    color: 'from-gray-950/80 to-slate-900/80',
    logo: 'MADRID',
  },
  {
    id: 'MAN_UNITED',
    name: 'Manchester United',
    bgImage: 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/united_u9rups.jpg',
    color: 'from-red-950/80 to-black/80',
    logo: 'UNITED',
  },
  {
    id: 'AC_MILAN',
    name: 'AC Milan',
    bgImage: 'https://res.cloudinary.com/dalnbaeaz/image/upload/v1780696434/milan_mujfq4.jpg',
    color: 'from-red-950/85 to-black/85',
    logo: 'MILAN',
  }
];

export default function FeaturedClubs() {
  return (
    <section className="py-24 bg-cream border-t border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-wider text-charcoal mb-4">Shop by Club</h2>
          <p className="text-base text-charcoal/60 max-w-2xl mx-auto font-sans">
            Find the latest kits from Europe's most prestigious football clubs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clubs.map((club) => (
            <Link 
              key={club.id} 
              to={`/jerseys?club=${encodeURIComponent(club.id)}`}
              className="group relative h-64 rounded-none overflow-hidden border border-charcoal/15 hover:border-charcoal transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Background Image - refactored to img tag for native lazy loading */}
              <img 
                src={optimizeCloudinaryUrl(club.bgImage, 300)} 
                alt={club.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${club.color} opacity-80 group-hover:opacity-85 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">
                <h3 className="font-heading text-2xl font-extrabold uppercase text-white tracking-wider group-hover:text-accent transition-all duration-300">
                  {club.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
