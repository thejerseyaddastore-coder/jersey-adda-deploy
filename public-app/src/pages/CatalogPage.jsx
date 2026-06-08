import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { listJerseys } from '../api/jerseys';
import JerseyCard from '../components/JerseyCard';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { matchesClubFilter } from '../utils/clubs';

export default function CatalogPage() {
  const [jerseys, setJerseys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse query params for initial state
  const queryParams = new URLSearchParams(location.search);
  const initialTeam = queryParams.get('team') || 'All';
  const initialClub = queryParams.get('club') || 'All';
  const initialSearch = queryParams.get('search') || '';
  const initialIsOnSale = queryParams.get('is_on_sale') || 'All';
  const initialCategory = queryParams.get('category') || 'All';
  const initialVersion = queryParams.get('version') || 'All';
  const initialSort = queryParams.get('sort') || 'None';
 
  const [search, setSearch] = useState(initialSearch);
  const [team, setTeam] = useState(initialTeam);
  const [club, setClub] = useState(initialClub);
  const [isOnSale, setIsOnSale] = useState(initialIsOnSale);
  const [category, setCategory] = useState(initialCategory);
  const [version, setVersion] = useState(initialVersion);
  const [sortByPrice, setSortByPrice] = useState(initialSort);
 
  useEffect(() => {
    setPage(1);
    setJerseys([]);
    setHasMore(false);
    setTotal(null);
  }, [search, team, club, isOnSale, category, version]);

  useEffect(() => {
    let active = true;
    async function fetchJerseys() {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      params.set('limit', '100');
      params.set('page', String(page));
      if (search) params.set('search', search);
      if (team !== 'All') params.set('team', team);
      if (club !== 'All') params.set('featured_club', club);
      if (category !== 'All') params.set('category_type', category);
      if (version !== 'All') params.set('version', version);
      if (isOnSale !== 'All') params.set('is_on_sale', isOnSale);

      try {
        const response = await listJerseys(`?${params.toString()}`);
        if (!active) return;

        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        const pagination = response.data?.pagination;
        const nextHasMore = pagination ? page < pagination.total_pages : items.length === 100;

        setJerseys((current) => (page === 1 ? items : [...current, ...items]));
        setHasMore(nextHasMore);
        setTotal(pagination?.total ?? null);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load jerseys');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchJerseys();
    return () => { active = false; };
  }, [search, team, club, isOnSale, category, version, page]);
 
  // Sync state with URL query parameters when they change (e.g. from homepage card clicks)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
    setTeam(params.get('team') || 'All');
    setClub(params.get('club') || 'All');
    setIsOnSale(params.get('is_on_sale') || 'All');
    setCategory(params.get('category') || 'All');
    setVersion(params.get('version') || 'All');
    setSortByPrice(params.get('sort') || 'None');
  }, [location.search]);
 
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (team !== 'All') params.set('team', team);
    if (club !== 'All') params.set('club', club);
    if (isOnSale !== 'All') params.set('is_on_sale', isOnSale);
    if (category !== 'All') params.set('category', category);
    if (version !== 'All') params.set('version', version);
    if (sortByPrice !== 'None') params.set('sort', sortByPrice);
    
    navigate({ search: params.toString() }, { replace: true });
  }, [search, team, club, isOnSale, category, version, sortByPrice, navigate]);
 
  const teams = ['All', ...new Set(jerseys.map((jersey) => jersey.team_name).filter(Boolean))];
 
  const filtered = jerseys.filter((jersey) => {
    const matchesSearch = [jersey.name, jersey.team_name, jersey.league_name, jersey.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase());
 
    const matchesTeam = team === 'All' || jersey.team_name === team;
    const matchesClub = club === 'All' || matchesClubFilter(jersey, club);
    
    let matchesSale = true;
    if (isOnSale === 'Yes') {
      matchesSale = jersey.is_on_sale === true;
    } else if (isOnSale === 'No') {
      matchesSale = jersey.is_on_sale === false;
    }

    const matchesVersion = version === 'All' || jersey.version_type === version;
    const matchesCategory = category === 'All' || jersey.category_type === category;

    return matchesSearch && matchesTeam && matchesClub && matchesSale && matchesVersion && matchesCategory;
  });
 
  const sorted = [...filtered];
  if (sortByPrice === 'LowToHigh') {
    sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortByPrice === 'HighToLow') {
    sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }
 
  const loadedJerseyCount = jerseys.length;
  const headerText = loading
    ? 'Loading jerseys...'
    : total !== null
      ? `Showing ${loadedJerseyCount} of ${total} total jerseys`
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
 
          {/* Category Dropdown */}
          <div className="relative md:w-60">
            <select 
              value={category} 
              onChange={(event) => setCategory(event.target.value)}
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
              onChange={(event) => setTeam(event.target.value)}
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
              onChange={(event) => setVersion(event.target.value)}
              className="block w-full px-4 py-3 border border-charcoal/20 bg-white rounded-none leading-5 font-heading text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Versions</option>
              <option value="PLAYER">Player Version</option>
              <option value="FAN">Fan Version</option>
            </select>
          </div>

          <div className="relative md:w-40">
            <select 
              value={sortByPrice} 
              onChange={(event) => setSortByPrice(event.target.value)}
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
              onChange={(event) => setIsOnSale(event.target.value)}
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
            Loaded {loadedJerseyCount} of {total} total jerseys
          </p>
        ) : null}
      </div>
 
      {error && <p className="bg-red-50 text-red-600 p-4 rounded-none border border-red-150 font-sans text-sm">{error}</p>}
 
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-none border border-charcoal/10 shadow-none">
          <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-charcoal mb-2">No matches found</h3>
          <p className="text-sm text-charcoal/50 mb-6 font-sans">Try adjusting your search or filters.</p>
          <button onClick={() => { setSearch(''); setTeam('All'); setClub('All'); setIsOnSale('All'); setCategory('All'); }} className="btn-primary">
            Clear Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
        {sorted.map((jersey) => (
          <JerseyCard key={jersey.id} jersey={jersey} />
        ))}
      </div>

      {hasMore && !loading && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            className="btn-primary px-6 py-3"
          >
            Load more jerseys
          </button>
        </div>
      )}
    </main>
  );
}
