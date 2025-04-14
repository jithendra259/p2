'use client';
import { useState, useEffect } from 'react';

export default function SearchBar({ onCitySelect = () => {} }) {
  const [cities, setCities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const searchCities = async (term) => {
    if (!term) {
      setCities([]);
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/api/airqualityserver?city=${encodeURIComponent(term)}`);
      const data = await response.json();
      
      // Store full station data
      setSearchResults(data.data);
      
      // Extract unique city names
      const uniqueCities = [...new Set(data.data.map(station => ({
        name: station.city.name,
        aqi: station.current?.aqi || station.aqi,
        idx: station.idx
      })))];
      
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error searching cities:', error);
      setCities([]);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelect = (cityData) => {
    const fullStationData = searchResults.find(station => station.idx === cityData.idx);
    onCitySelect(fullStationData);
    setSearchTerm(cityData.name);
    setCities([]);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchCities(searchTerm);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

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
