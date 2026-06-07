import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function SearchFilters({ search, setSearch, team, setTeam, version, setVersion, sleeve, setSleeve, teams, isOnSale, setIsOnSale }) {
  return (
    <section className="bg-white border-b border-charcoal/10 lg:sticky lg:top-20 z-40 shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal/40 group-focus-within:text-charcoal transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2.5 border border-charcoal/20 rounded-none leading-5 bg-cream placeholder-charcoal/40 focus:outline-none focus:border-charcoal focus:bg-white transition-all text-sm font-sans"
              placeholder="Search jerseys, teams, or players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Global Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center text-charcoal/50 mr-1 font-heading text-xs font-bold uppercase tracking-widest">
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <span>Filters:</span>
            </div>

            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="block flex-1 min-w-[125px] md:flex-none md:w-auto py-2.5 pl-3 pr-8 border border-charcoal/20 bg-white rounded-none text-xs font-heading font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>
              ))}
            </select>

            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="block flex-1 min-w-[125px] md:flex-none md:w-auto py-2.5 pl-3 pr-8 border border-charcoal/20 bg-white rounded-none text-xs font-heading font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Versions</option>
              <option value="PLAYER">Player Version</option>
              <option value="FAN">Fan Version</option>
            </select>

            <select
              value={sleeve}
              onChange={(e) => setSleeve(e.target.value)}
              className="block flex-1 min-w-[125px] md:flex-none md:w-auto py-2.5 pl-3 pr-8 border border-charcoal/20 bg-white rounded-none text-xs font-heading font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Sleeves</option>
              <option value="HALF">Half Sleeve</option>
              <option value="FULL">Full Sleeve</option>
            </select>

            <select
              value={isOnSale}
              onChange={(e) => setIsOnSale(e.target.value)}
              className="block flex-1 min-w-[125px] md:flex-none md:w-auto py-2.5 pl-3 pr-8 border border-charcoal/20 bg-white rounded-none text-xs font-heading font-bold uppercase tracking-wider focus:outline-none focus:border-charcoal transition-all appearance-none cursor-pointer"
            >
              <option value="All">On Sale: All</option>
              <option value="Yes">On Sale: Yes</option>
              <option value="No">On Sale: No</option>
            </select>
          </div>

        </div>
      </div>
    </section>
  );
}
