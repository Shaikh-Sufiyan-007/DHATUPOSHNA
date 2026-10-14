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
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-11 pr-24 py-3.5 rounded-2xl glass-panel text-sm text-slate-100 placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 shadow-xl transition"
        />
        <Search className="w-5 h-5 text-amber-400 absolute left-4 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition absolute right-20"
            aria-label="Clear search input"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition shadow-md"
        >
          Search
        </button>
      </div>
    </form>
  );
}
