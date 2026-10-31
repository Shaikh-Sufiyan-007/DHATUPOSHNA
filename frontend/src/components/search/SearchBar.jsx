import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';

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
          className="w-full pl-12 pr-28 py-3.5 rounded-2xl spatial-dock text-xs sm:text-sm text-slate-100 placeholder-slate-400 border border-slate-700/80 focus:outline-none focus:border-ice focus:ring-2 focus:ring-ice/25 shadow-2xl transition duration-200 font-body"
        />
        <Search className="w-5 h-5 text-ice absolute left-4 pointer-events-none group-focus-within:scale-110 transition-transform duration-200" />

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

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="absolute right-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-ice-bright via-silver to-silver-deep hover:opacity-95 text-slate-950 transition-all duration-200 shadow-md shadow-ice/20 cursor-pointer font-heading"
        >
          Search
        </motion.button>
      </div>
    </form>
  );
}