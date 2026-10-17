import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export default function SearchBar({ initialValue = '', onSearch, placeholder = 'Search Dhatus, Nyayas, Agni, concepts, references...' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    } else if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl spatial-dock text-xs sm:text-sm text-slate-100 placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 shadow-2xl transition duration-200"
        />
        <Search className="w-5 h-5 text-amber-400 absolute left-4 pointer-events-none group-focus-within:scale-110 transition-transform duration-200" />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition absolute right-24 cursor-pointer"
            aria-label="Clear search input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:opacity-95 text-slate-950 transition-all duration-200 shadow-md shadow-amber-500/20 cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
}
