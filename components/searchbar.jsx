'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function SearchBar({ onCitySelect = () => {} }) {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchCache = useRef(new Map());
  const abortController = useRef(null);

  const searchCities = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setCities([]);
      setSearchResults([]);
      return;
    }

    // Check cache first
    const cacheKey = term.toLowerCase();
    if (searchCache.current.has(cacheKey)) {
      const cachedResults = searchCache.current.get(cacheKey);
      setCities(cachedResults.cities);
      setSearchResults(cachedResults.searchResults);
      return;
    }

    setIsLoading(true);

    // Cancel previous request if any
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      const response = await fetch(
        `/api/airqualityserver?city=${encodeURIComponent(term)}`, 
        { signal: abortController.current.signal }
      );
      const data = await response.json();
      
      // Process and filter results
      const filteredData = data.data.filter(station => 
        station.city?.name?.toLowerCase().includes(term.toLowerCase())
      );

      // Extract unique cities with more efficient method
      const uniqueCities = Object.values(
        filteredData.reduce((acc, station) => {
          const key = station.idx;
          if (!acc[key]) {
            acc[key] = {
              name: station.city.name,
              aqi: station.current?.aqi || station.aqi,
              idx: station.idx,
              country: station.country || ''
            };
          }
          return acc;
        }, {})
      );

      // Sort by relevance
      uniqueCities.sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(term.toLowerCase());
        const bStart = b.name.toLowerCase().startsWith(term.toLowerCase());
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;
        return a.name.localeCompare(b.name);
      });

      // Cache the results
      searchCache.current.set(cacheKey, {
        cities: uniqueCities,
        searchResults: filteredData
      });

      setCities(uniqueCities);
      setSearchResults(filteredData);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error searching cities:', error);
        setCities([]);
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCitySelect = async (cityData) => {
    try {
      // First update the backend
      await updateBackendIdx(cityData.idx);
      
      // Then update the UI
      const fullStationData = searchResults.find(station => station.idx === cityData.idx);
      onCitySelect(fullStationData);
      setSearchTerm(cityData.name);
      setCities([]);
      
      // Store the selected idx in localStorage for persistence
      localStorage.setItem('selectedIdx', cityData.idx);
      
    } catch (error) {
      console.error('Error handling city selection:', error);
      // You might want to show an error message to the user here
    }
  };

  const updateBackendIdx = async (idx) => {
    try {
      const response = await fetch('http://localhost:5000/api/current-idx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idx })
      });

      if (!response.ok) {
        throw new Error('Failed to update backend idx');
      }

      const data = await response.json();
      console.log('Backend updated with idx:', data);
      return true;
    } catch (error) {
      console.error('Error updating backend:', error);
      return false;
    }
  };

  // Optimized debounce with shorter delay for longer terms
  useEffect(() => {
    const debounceTime = searchTerm.length > 3 ? 150 : 300;
    const timeoutId = setTimeout(() => {
      searchCities(searchTerm);
    }, debounceTime);

    return () => {
      clearTimeout(timeoutId);
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [searchTerm, searchCities]);

  // Clear cache periodically to prevent memory buildup
  useEffect(() => {
    const cacheCleanupInterval = setInterval(() => {
      searchCache.current.clear();
    }, 5 * 60 * 1000); // Clear cache every 5 minutes

    return () => clearInterval(cacheCleanupInterval);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a city..."
        className="w-full p-2 border rounded-lg"
      />
      
      {isLoading && (
        <div className="absolute right-2 top-2">
          <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
        </div>
      )}
      
      {cities.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
          {cities.map((city) => (
            <li
              key={city.idx}
              onClick={() => handleCitySelect(city)}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{city.name}</span>
                <span className={`px-2 py-1 rounded-full text-sm ${getAQIColorClass(city.aqi)}`}>
                  AQI: {city.aqi || 'N/A'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Helper function to determine AQI color class
function getAQIColorClass(aqi) {
  if (!aqi) return 'bg-gray-100 text-gray-600';
  if (aqi <= 50) return 'bg-green-100 text-green-800';
  if (aqi <= 100) return 'bg-yellow-100 text-yellow-800';
  if (aqi <= 150) return 'bg-orange-100 text-orange-800';
  if (aqi <= 200) return 'bg-red-100 text-red-800';
  if (aqi <= 300) return 'bg-purple-100 text-purple-800';
  return 'bg-red-200 text-red-900';
}
