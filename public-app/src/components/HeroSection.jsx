import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dlnf5iam6/image/upload/v1780703328/11_jqdh47.jpg",
    title: "Vibrant Matchday Jerseys",
    subtitle: "Experience the game with premium-quality fan and player version kits.",
    tag: "New Season Collection",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dlnf5iam6/image/upload/v1780703329/22_jo23lw.jpg",
    title: "Pride of Your Nation",
    subtitle: "Show your pride with top national kits including Argentina, Brazil, and Spain.",
    tag: "National Teams",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dlnf5iam6/image/upload/v1780703335/33_ysxeqe.jpg",
    title: "Elite Club Jerseys",
    subtitle: "Wear the colors of the world's most prestigious clubs: Real Madrid, FC Barcelona, AC Milan, and Manchester United.",
    tag: "Club Collections",
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative overflow-hidden bg-charcoal h-[500px] md:h-[620px] lg:h-[660px]">
      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image - Clean & Sharp */}
            <div className="absolute inset-0">
              <img 
                src={slide.image} 
                alt={slide.title} 
                className={`w-full h-full object-cover object-center opacity-100 transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-100' : 'scale-105'
                }`}
              />
              {/* Dark overlay for a premium dark theme feel */}
              <div className="absolute inset-0 bg-black/40" />
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-charcoal/65 hover:bg-accent hover:text-charcoal text-white p-3 rounded-none border border-white/10 hover:border-transparent transition-all z-20 hover:scale-105 active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-charcoal/65 hover:bg-accent hover:text-charcoal text-white p-3 rounded-none border border-white/10 hover:border-transparent transition-all z-20 hover:scale-105 active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-none transition-all duration-300 ${
              index === currentSlide ? 'bg-accent w-6' : 'bg-white/40 w-2'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
