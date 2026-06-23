import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Search, Loader2 } from 'lucide-react';

const AutoComplete = ({
  apiPath,
  placeholder,
  displayField,
  onSelect,
  value = '',
  onChangeText = () => {},
  excludeIds = [],
  clearOnSelect = false,
}) => {
  const [query, setQuery] = useState(value);
  const [allItems, setAllItems] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Sync state query with value prop when value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all items on mount or when apiPath changes
  useEffect(() => {
    const loadAllItems = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(apiPath);
        setAllItems(data);
      } catch (error) {
        console.error('Error pre-fetching autocomplete data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllItems();
  }, [apiPath]);

  // Filter items in memory whenever query, allItems, or excludeIds change
  useEffect(() => {
    if (!query || query.trim() === '') {
      if (suggestions.length > 0) {
        setSuggestions([]);
      }
      return;
    }

    const searchLower = query.toLowerCase();
    const filtered = allItems.filter((item) => {
      // Filter out excluded IDs (e.g., already selected products)
      if (excludeIds.includes(item._id)) {
        return false;
      }
      const displayVal = (item[displayField] || '').toLowerCase();
      return displayVal.includes(searchLower);
    });

    // Prevent infinite loop by verifying if content actually changed
    const isDifferent =
      filtered.length !== suggestions.length ||
      filtered.some((item, idx) => item._id !== suggestions[idx]?._id);

    if (isDifferent) {
      setSuggestions(filtered);
    }
  }, [query, allItems, excludeIds, displayField, suggestions]);

  const handleChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    onChangeText(text); // Notify parent of raw text change
    setShowDropdown(true);
  };

  const handleSelect = (item) => {
    if (clearOnSelect) {
      setQuery('');
      onChangeText('');
    } else {
      setQuery(item[displayField]);
    }
    onSelect(item);
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-darkBg-card text-slate-800 dark:text-slate-100 placeholder-slate-400 focus-glow transition-all duration-200 text-sm"
        />
        <div className="absolute left-3.5 top-3.5 text-slate-400">
          {loading && allItems.length === 0 ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin text-primary" />
          ) : (
            <Search className="w-4.5 h-4.5" />
          )}
        </div>
      </div>

      {showDropdown && query && (
        <div className="absolute left-0 mt-2 w-full bg-white/95 dark:bg-darkBg-card/95 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {loading && allItems.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400 flex items-center justify-center space-x-2">
              <Loader2 className="w-4.5 h-4.5 animate-spin text-primary" />
              <span>Loading results...</span>
            </div>
          ) : (
            <div>
              {!suggestions.some(s => (s[displayField] || '').toLowerCase() === query.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => handleSelect({ _id: query.trim(), [displayField]: query.trim(), price: 0 })}
                  className="w-full text-left px-4 py-2.5 text-sm text-primary dark:text-primary-emerald font-bold hover:bg-slate-100 dark:hover:bg-darkBg-input transition-colors duration-150 border-b border-slate-50 dark:border-white/5"
                >
                  + Add "{query.trim()}"
                </button>
              )}
              {suggestions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 italic text-center">
                  No matches found
                </div>
              ) : (
                suggestions.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkBg-input transition-colors duration-150 border-b border-slate-50 dark:border-white/5 last:border-b-0"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{item[displayField]}</div>
                    {item.city && <div className="text-xs text-slate-400 font-medium mt-0.5">{item.city}</div>}
                    {item.price !== undefined && (
                      <div className="text-xs text-accent font-bold mt-0.5">RS {item.price.toFixed(2)}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;
