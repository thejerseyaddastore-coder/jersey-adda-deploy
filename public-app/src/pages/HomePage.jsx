import React, { useState, useEffect } from 'react';
import { listJerseys } from '../api/jerseys';
import HeroSection from '../components/HeroSection';
import SearchFilters from '../components/SearchFilters';
import CategoryTabs from '../components/CategoryTabs';
import JerseyCard from '../components/JerseyCard';
import FeaturedClubs from '../components/FeaturedClubs';
import WhyChooseUs from '../components/WhyChooseUs';
import { matchesClubFilter } from '../utils/clubs';

export default function HomePage() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Global filters
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('All');
  
  // Category-specific filters
  const [activeCategory, setActiveCategory] = useState('INTERNATIONAL');
  const [version, setVersion] = useState('All');
  const [sleeve, setSleeve] = useState('All');

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
  const filteredJerseys = jerseys.filter(jersey => {
    // 1. Global Search
    const matchesSearch = search === '' || 
      [jersey.name, jersey.team_name, jersey.league_name]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());

    // 2. Global Team filter
    const matchesTeam = team === 'All' || jersey.team_name === team;

    // 3. Category Tab filter
    let matchesCategory = true;
    if (activeCategory === 'INTERNATIONAL') {
      matchesCategory = jersey.is_national_team === true;
    } else if (activeCategory === 'CLUB') {
      matchesCategory = jersey.is_national_team === false && matchesClubFilter(jersey, jersey.featured_club || 'All');
    } else if (activeCategory === 'SHORTS') {
      matchesCategory = jersey.has_shorts === true;
    }

    // 4. Category-Specific Filters (Version & Sleeve)
    const matchesVersion = version === 'All' || jersey.version_type === version;
    const matchesSleeve = sleeve === 'All' || jersey.sleeve_type === sleeve;

    return matchesSearch && matchesTeam && matchesCategory && matchesVersion && matchesSleeve;
  });

  // Limit to 8 for the "Most Demanded" section
  const displayedJerseys = filteredJerseys.slice(0, 8);

  return (
    <>
      <HeroSection />
      
      {/* Sticky filters below hero */}
      <SearchFilters 
        search={search} setSearch={setSearch}
        team={team} setTeam={setTeam}
        version={version} setVersion={setVersion}
        sleeve={sleeve} setSleeve={setSleeve}
        teams={teams}
      />

      <div className="bg-cream pb-24">
        {/* Animated Tabs */}
        <CategoryTabs 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        {/* Most Demanded Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-heading font-extrabold uppercase tracking-wider text-charcoal">Most Demanded Jerseys</h2>
              <p className="mt-2 text-sm text-charcoal/60">Top picks loved by football fans</p>
            </div>
            <div className="text-xs font-heading font-black text-charcoal bg-accent px-4 py-2 rounded-none border border-charcoal/10 uppercase tracking-widest">
              Showing {displayedJerseys.length} {displayedJerseys.length === 1 ? 'jersey' : 'jerseys'}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-charcoal/20 border-t-charcoal rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-none border border-red-100 text-center font-sans">
              {error}
            </div>
          ) : displayedJerseys.length === 0 ? (
            <div className="bg-white p-12 rounded-none border border-charcoal/10 text-center shadow-none">
              <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-charcoal mb-2">No jerseys found</h3>
              <p className="text-sm text-charcoal/50 font-sans">Try adjusting your filters or search criteria.</p>
              <button 
                onClick={() => {
                  setSearch(''); setTeam('All'); setVersion('All'); setSleeve('All');
                }}
                className="mt-6 btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {displayedJerseys.map((jersey) => (
                <JerseyCard key={jersey.id} jersey={jersey} />
              ))}
            </div>
          )}
        </section>
      </div>

      <FeaturedClubs />
      <WhyChooseUs />
    </>
  );
}
