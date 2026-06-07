import React, { useState, useEffect } from 'react';
import { listJerseys } from '../api/jerseys';
import HeroSection from '../components/HeroSection';
import SearchFilters from '../components/SearchFilters';
import JerseyCard from '../components/JerseyCard';
import FeaturedClubs from '../components/FeaturedClubs';
import WhyChooseUs from '../components/WhyChooseUs';

export default function HomePage() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Global filters
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  const [version, setVersion] = useState('All');
  const [sleeve, setSleeve] = useState('All');
  const [isOnSale, setIsOnSale] = useState('All');

  useEffect(() => {
    let active = true;

    async function fetchJerseys() {
      setLoading(true);
      setError('');
      try {
        const response = await listJerseys();
        if (!active) return;
        setJerseys(Array.isArray(response.data?.items) ? response.data.items : []);
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

  const teams = ['All', ...new Set(jerseys.map(j => j.team_name).filter(Boolean))];

  // Apply filters
  const baseFilteredJerseys = jerseys.filter(jersey => {
    // 1. Global Search
    const matchesSearch = search === '' || 
      [jersey.name, jersey.team_name, jersey.league_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

    // 2. Global Team filter
    const matchesTeam = team === 'All' || jersey.team_name === team;

    // 3. Version Filter
    const matchesVersion = version === 'All' || jersey.version_type === version;

    // 4. Sleeve Filter
    const matchesSleeve = sleeve === 'All' || jersey.sleeve_type === sleeve;

    // 5. On Sale Filter
    let matchesSale = true;
    if (isOnSale === 'Yes') {
      matchesSale = jersey.is_on_sale === true;
    } else if (isOnSale === 'No') {
      matchesSale = jersey.is_on_sale === false;
    }

    return matchesSearch && matchesTeam && matchesVersion && matchesSleeve && matchesSale;
  });

  // Dynamic products groupings based on requirements
  const saleJerseys = baseFilteredJerseys.filter(j => j.is_on_sale === true);
  const mostDemandedJerseys = baseFilteredJerseys.slice(0, 8);
  const internationalJerseys = baseFilteredJerseys.filter(j => j.category_type === 'INTERNATIONAL');
  const clubJerseys = baseFilteredJerseys.filter(j => j.category_type === 'CLUB');
  const shortsJerseys = baseFilteredJerseys.filter(j => j.category_type === 'SHORTS');
  const otherMerchJerseys = baseFilteredJerseys.filter(j => j.category_type === 'OTHER');

  return (
    <>
      {/* 1. Hero Banner */}
      <HeroSection />
      
      {/* 2. Search and Filters */}
      <SearchFilters 
        search={search} setSearch={setSearch}
        team={team} setTeam={setTeam}
        version={version} setVersion={setVersion}
        sleeve={sleeve} setSleeve={setSleeve}
        isOnSale={isOnSale} setIsOnSale={setIsOnSale}
        teams={teams}
      />

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
        ) : baseFilteredJerseys.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 pt-16">
            <div className="bg-white p-12 rounded-none border border-charcoal/10 text-center shadow-none">
              <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-charcoal mb-2">No jerseys found</h3>
              <p className="text-sm text-charcoal/50 font-sans">Try adjusting your filters or search criteria.</p>
              <button 
                onClick={() => {
                  setSearch(''); setTeam('All'); setVersion('All'); setSleeve('All'); setIsOnSale('All');
                }}
                className="mt-6 btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* 3. Sale & Clearance Section */}
            {saleJerseys.length > 0 && (
              <section className="bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 border-b border-charcoal/10 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                      <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal flex items-center gap-2">
                        <span>🔥 Sale & Clearance</span>
                      </h2>
                      <p className="mt-2 text-sm text-red-600 font-bold uppercase tracking-wider">Limited Time Deals</p>
                    </div>
                    <div className="text-xs font-heading font-black text-white bg-red-600 px-4 py-2 rounded-none uppercase tracking-widest border border-red-700">
                      {saleJerseys.length} {saleJerseys.length === 1 ? 'deal' : 'deals'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                    {saleJerseys.map((jersey) => (
                      <JerseyCard key={jersey.id} jersey={jersey} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 4. Most Demanded Jerseys */}
            {mostDemandedJerseys.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                    <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">Most Demanded Jerseys</h2>
                    <p className="mt-2 text-sm text-charcoal/60">Top picks loved by fans</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                  {mostDemandedJerseys.map((jersey) => (
                    <JerseyCard key={jersey.id} jersey={jersey} />
                  ))}
                </div>
              </section>
            )}

            {/* 5. International Jerseys */}
            {internationalJerseys.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                    <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">International Jerseys</h2>
                    <p className="mt-2 text-sm text-charcoal/60">National team kits from around the globe</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                  {internationalJerseys.map((jersey) => (
                    <JerseyCard key={jersey.id} jersey={jersey} />
                  ))}
                </div>
              </section>
            )}

            {/* 6. Club Jerseys */}
            {clubJerseys.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                    <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">Club Jerseys</h2>
                    <p className="mt-2 text-sm text-charcoal/60">Official club jerseys from top leagues</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                  {clubJerseys.map((jersey) => (
                    <JerseyCard key={jersey.id} jersey={jersey} />
                  ))}
                </div>
              </section>
            )}

            {/* 7. Jerseys With Shorts */}
            {shortsJerseys.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                    <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">Jerseys With Shorts</h2>
                    <p className="mt-2 text-sm text-charcoal/60">Complete matching sets</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                  {shortsJerseys.map((jersey) => (
                    <JerseyCard key={jersey.id} jersey={jersey} />
                  ))}
                </div>
              </section>
            )}

            {/* 8. Other Sports & Merchandise */}
            {otherMerchJerseys.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                    <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">Other Sports & Merchandise</h2>
                    <p className="mt-2 text-sm text-charcoal/60">NBA, Formula 1, Cricket, Lifestyle and Special Editions</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                  {otherMerchJerseys.map((jersey) => (
                    <JerseyCard key={jersey.id} jersey={jersey} />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      {/* 9. Featured Clubs */}
      <FeaturedClubs />
      <WhyChooseUs />
    </>
  );
}
