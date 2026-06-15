import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { listJerseys } from '../api/jerseys';
import JerseyCard from '../components/JerseyCard';
import { Search, Filter, ArrowLeft } from 'lucide-react';

export default function CatalogPage() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // URL is the single source of truth for filters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  const search = queryParams.get('search') || '';
  const team = queryParams.get('team') || 'All';
  const club = queryParams.get('club') || 'All';
  const isOnSale = queryParams.get('is_on_sale') || 'All';
  const category = queryParams.get('category') || 'All';
  const version = queryParams.get('version') || 'All';
  const sortByPrice = queryParams.get('sort') || 'None';

  // Debounced search text state
  const [searchInput, setSearchInput] = useState(search);

  // Sync search input state with URL parameter (e.g. on page back/forward or external links)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const filterKey = `${search}-${team}-${club}-${isOnSale}-${category}-${version}-${sortByPrice}`;

  // Track previous filter key to detect filter changes and prevent double-fetching
  const prevFilterKeyRef = React.useRef(filterKey);

  useEffect(() => {
    let active = true;

    // Reset page to 1 on filter changes and abort current fetch to prevent double fetch
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    async function fetchJerseys() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.set('limit', '20'); // Load 20 jerseys per page (Catalog Optimization)
      params.set('page', String(page));
      if (search) params.set('search', search);
      if (team !== 'All') params.set('team', team);
      if (club !== 'All') params.set('featured_club', club);

      // Map categories to backend filters
      if (category === 'CLUB') {
        params.set('category_type', 'CLUB');
      } else if (category === 'INTERNATIONAL') {
        params.set('national_team', 'true');
      } else if (category === 'SHORTS') {
        params.set('has_shorts', 'true');
      } else if (category === 'OTHER') {
        params.set('category_type', 'OTHER');
      }

      if (version !== 'All') params.set('version_type', version);

      if (isOnSale === 'Yes') {
        params.set('is_on_sale', 'true');
      } else if (isOnSale === 'No') {
        params.set('is_on_sale', 'false');
      }

      // Map sort logic
      if (sortByPrice === 'LowToHigh') {
        params.set('sort_by', 'price');
        params.set('sort_order', 'asc');
      } else if (sortByPrice === 'HighToLow') {
        params.set('sort_by', 'price');
        params.set('sort_order', 'desc');
      } else {
        params.set('sort_by', 'created_at');
        params.set('sort_order', 'desc');
      }

      try {
        const response = await listJerseys(`?${params.toString()}`);
        if (!active) return;

        const items = Array.isArray(response.data?.products) ? response.data.products : [];
        const nextHasMore = response.data?.hasMore ?? false;
        const totalCount = response.data?.totalCount ?? 0;

        // Overwrite if page 1, append if loading more
        setJerseys((current) => (page === 1 ? items : [...current, ...items]));
        setHasMore(nextHasMore);
        setTotal(totalCount);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load jerseys');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchJerseys();
    return () => { active = false; };
  }, [filterKey, page]);

  // Update URL filter helper
  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(location.search);
    if (value === 'All' || value === 'None' || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    // Reset page to 1 when filters are changed
    nextParams.delete('page');
    setPage(1);
    navigate({ search: nextParams.toString() }, { replace: true });
  };

  // Debounce search query update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateFilter('search', searchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleClearFilters = () => {
    setSearchInput('');
    setPage(1);
    navigate('/jerseys', { replace: true });
  };
 
  const teams = ['All', ...new Set(jerseys.map((jersey) => jersey.team_name).filter(Boolean))];
 
  const loadedJerseyCount = jerseys.length;
  const headerText = loading && page === 1
    ? 'Loading jerseys...'
    : total !== null
      ? `Showing ${loadedJerseyCount} of ${total} Jerseys`
      : `${loadedJerseyCount} jerseys available`;
 
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back to Home Navigation Link */}
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-none shadow-none border border-charcoal/10 p-6 sm:p-8 mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-extrabold uppercase tracking-wider text-charcoal mb-3">Complete Catalog</h1>
        <p className="text-charcoal/60 mb-8 max-w-3xl text-sm font-sans leading-relaxed">
          Browse our entire collection. Search by team, player, or browse through all available options to find your perfect match.
        </p>
 
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-3 border border-charcoal/20 bg-cream rounded-none leading-5 placeholder-charcoal/40 focus:outline-none focus:border-charcoal transition-all text-sm font-sans"
              placeholder="Search jerseys..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
 
          {/* Category Dropdown */}
          <div className="relative md:w-60">
            <select 
              value={category} 
              onChange={(event) => updateFilter('category', event.target.value)}
              className="block w-full px-4 py-3 border border-charcoal/25 bg-white rounded-none leading-5 font-heading text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="CLUB">Club Jerseys</option>
              <option value="INTERNATIONAL">International Jerseys</option>
              <option value="SHORTS">Jerseys With Shorts</option>
              <option value="OTHER">Other Sports & Merchandise</option>
            </select>
          </div>

          <div className="relative md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40">
              <Filter className="w-4 h-4" />
            </div>
            <select 
              value={team} 
              onChange={(event) => updateFilter('team', event.target.value)}
              className="block w-full pl-9 pr-8 py-3 border border-charcoal/20 bg-white rounded-none leading-5 font-heading text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              {teams.map((option) => (
                <option key={option} value={option}>
                  {option === 'All' ? 'All Teams' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="relative md:w-40">
            <select 
              value={version} 
              onChange={(event) => updateFilter('version', event.target.value)}
              className="block w-full px-4 py-3 border border-charcoal/20 bg-white rounded-none leading-5 font-heading text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Versions</option>
              <option value="PLAYER">Player Version</option>
              <option value="FAN">Stadium Version</option>
            </select>
          </div>

          <div className="relative md:w-40">
            <select 
              value={sortByPrice} 
              onChange={(event) => updateFilter('sort', event.target.value)}
              className="block w-full px-4 py-3 border border-charcoal/20 bg-white rounded-none leading-5 font-heading text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="None">Sort by Price</option>
              <option value="LowToHigh">Price: Low to High</option>
              <option value="HighToLow">Price: High to Low</option>
            </select>
          </div>

          <div className="relative md:w-40">
            <select 
              value={isOnSale} 
              onChange={(event) => updateFilter('is_on_sale', event.target.value)}
              className="block w-full px-4 py-3 border border-charcoal/20 bg-white rounded-none leading-5 font-heading text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="All">On Sale: All</option>
              <option value="Yes">On Sale: Yes</option>
              <option value="No">On Sale: No</option>
            </select>
          </div>
        </div>
      </div>
 
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <h2 className="font-heading text-xl font-extrabold uppercase tracking-wider text-charcoal">
          {headerText}
        </h2>
        {total !== null ? (
          <p className="text-sm text-charcoal/60 font-sans">
            Showing {loadedJerseyCount} of {total} Jerseys
          </p>
        ) : null}
      </div>
 
      {error && <p className="bg-red-50 text-red-600 p-4 rounded-none border border-red-150 font-sans text-sm">{error}</p>}
 
      {!loading && !error && jerseys.length === 0 && (
        <div className="text-center py-20 bg-white rounded-none border border-charcoal/10 shadow-none">
          <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-charcoal mb-2">No matches found</h3>
          <p className="text-sm text-charcoal/50 mb-6 font-sans">Try adjusting your search or filters.</p>
          <button onClick={handleClearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 transition-opacity duration-300 ${loading && page === 1 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {jerseys.map((jersey) => (
          <JerseyCard key={jersey.id} jersey={jersey} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            className="btn-primary px-6 py-3"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </main>
  );
}
