import React from 'react';

const tabs = [
  {
    id: 'INTERNATIONAL',
    label: 'International Jerseys',
    bgImage: 'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780699658/national_nsvlmb.jpg',
    color: 'from-blue-950/80 to-sky-900/80',
  },
  {
    id: 'CLUB',
    label: 'Club Jerseys',
    bgImage: 'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780699661/club_i7qrny.avif',
    color: 'from-emerald-950/80 to-teal-900/80',
  },
  {
    id: 'SHORTS',
    label: 'Jerseys with Shorts',
    bgImage: 'https://res.cloudinary.com/dlnf5iam6/image/upload/v1780699658/with_shorts_pto6oq.jpg',
    color: 'from-amber-950/80 to-orange-900/80',
  }
];

export default function CategoryTabs({ activeCategory, setActiveCategory }) {
  return (
    <div className="w-full bg-gray-50 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Select a category to filter the featured jerseys below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`group relative h-48 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 w-full text-left outline-none ${
                  isActive 
                    ? 'ring-4 ring-yellow-400 shadow-yellow-400/20' 
                    : 'ring-2 ring-transparent'
                }`}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                  style={{ backgroundImage: `url(${tab.bgImage})` }}
                />
                
                {/* Colored Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${tab.color} opacity-80 group-hover:opacity-90 transition-opacity duration-300`} />
                
                {/* Floating Content */}
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center z-10">
                  <h3 className={`text-xl md:text-2xl font-black text-white tracking-wide transition-all duration-300 ${
                    isActive ? 'text-yellow-300 scale-105' : 'group-hover:text-yellow-400'
                  }`}>
                    {tab.label}
                  </h3>
                  {isActive && (
                    <span className="mt-2 bg-yellow-400 text-yellow-950 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
