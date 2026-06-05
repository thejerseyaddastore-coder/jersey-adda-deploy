import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function SearchFilters({ search, setSearch, team, setTeam, version, setVersion, sleeve, setSleeve, teams }) {
  return (
    <section className="bg-white border-b border-gray-200 md:sticky md:top-20 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-600 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-all sm:text-sm"
              placeholder="Search jerseys, teams, or players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Global Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center text-gray-500 mr-2">
              <Filter className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <select
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="block flex-1 min-w-[125px] md:flex-none md:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow appearance-none cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>
              ))}
            </select>

            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="block flex-1 min-w-[125px] md:flex-none md:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow appearance-none cursor-pointer"
            >
              <option value="All">All Versions</option>
              <option value="PLAYER">Player Version</option>
              <option value="FAN">Fan Version</option>
            </select>

            <select
              value={sleeve}
              onChange={(e) => setSleeve(e.target.value)}
              className="block flex-1 min-w-[125px] md:flex-none md:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow appearance-none cursor-pointer"
            >
              <option value="All">All Sleeves</option>
              <option value="HALF">Half Sleeve</option>
              <option value="FULL">Full Sleeve</option>
            </select>
          </div>

        </div>
      </div>
    </section>
  );
}
