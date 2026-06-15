import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listJerseys } from '../api/jerseys';
import HeroSection from '../components/HeroSection';
import CategoryTabs from '../components/CategoryTabs';
import JerseyCard from '../components/JerseyCard';
import FeaturedClubs from '../components/FeaturedClubs';
import WhyChooseUs from '../components/WhyChooseUs';
import SpecialCollections from '../components/SpecialCollections';

export default function HomePage() {
  const [lovedJerseys, setLovedJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function fetchJerseys() {
      setLoading(true);
      setError('');
      try {
        const response = await listJerseys('?limit=8');
        if (!active) return;
        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        
        // Pick 8 random jerseys for "Football Jerseys Loved by Fans"
        const shuffled = [...items].sort(() => 0.5 - Math.random());
        setLovedJerseys(shuffled.slice(0, 8));
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load jerseys');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchJerseys();

    return () => {
      active = false;
    };
  }, []);

  const handleCategorySelect = (categoryId) => {
    if (categoryId) {
      navigate(`/jerseys?category=${categoryId}`);
    } else {
      navigate('/jerseys');
    }
  };

  return (
    <>
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Category Tabs */}
      <CategoryTabs activeCategory={null} setActiveCategory={handleCategorySelect} />

      <div className="bg-cream pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-charcoal/20 border-t-charcoal rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="max-w-7xl mx-auto px-4 pt-16">
            <div className="bg-red-50 text-red-600 p-6 rounded-none border border-red-100 text-center font-sans">
              {error}
            </div>
          </div>
        ) : lovedJerseys.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 pt-16">
            <div className="bg-white p-12 rounded-none border border-charcoal/10 text-center shadow-none">
              <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-charcoal mb-2">No jerseys found</h3>
              <p className="text-sm text-charcoal/50 font-sans">Our store is currently being updated. Please check back later!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Football Jerseys Loved by Fans Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">Football Jerseys Loved by Fans</h2>
                  <p className="mt-2 text-sm text-charcoal/60">Top-rated fan favorites picked just for you</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                {lovedJerseys.map((jersey) => (
                  <JerseyCard key={jersey.id} jersey={jersey} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Special Collections */}
      <SpecialCollections />

      {/* 3. Shop by Club */}
      <FeaturedClubs />

      {/* 4. Why Choose Us */}
      <WhyChooseUs />
    </>
  );
}
