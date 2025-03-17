import React, { useState, useRef, useEffect } from 'react';
// Import the search and detailed fetch functions from your AQI library.
import { searchAQI, getCityData } from '../lib/airQuality'; // Import search and city data functions
import { setSelectedLocation, getSelectedLocation } from '../lib/locationStore'; // Import location store functions

export default function SearchBar({ onSelectCity }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Fetch search results based on the user's query.
  const fetchSearchResults = async (query) => {
    console.log('Fetching search results for:', query); // Log the query being fetched

    if (!query) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the searchAQI function from the library.
      const data = await searchAQI(query);
      console.log('Fetched Data:', data); // Log the fetched data
      if (data.status === 'ok') {
        const validResults = data.data.filter(
          (result) => result.aqi && result.aqi !== '-' && result.aqi !== null
        );
        console.log('Valid Results:', validResults); // Log valid results
        setSearchResults(validResults);
        setShowDropdown(validResults.length > 0);
      } else {
        setError('Error fetching search results');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  // Handle changes in the input field.
  const handleChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce the API call to avoid too many requests.
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      fetchSearchResults(query);
    }, 300);
  };

  // When a user selects a city, fetch its full details (including pollutant values)
  // and update the global location store.
  const handleSelectCity = async (city) => { // Handle city selection
    try {
      const detailedCityData = await getCityData(`@${city.uid}`);
      console.log('Detailed City Data:', detailedCityData); // Log the detailed city data
      setSelectedLocation(detailedCityData); // Update the selected location in the store


      if (onSelectCity) {
        onSelectCity(detailedCityData);
      }

      setSearchQuery(detailedCityData.station);
      setSearchResults([]);
      setShowDropdown(false);
    } catch (err) {
      setError('Error fetching detailed city data.');
    }
  };

  // Close the dropdown if the user clicks outside of it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center justify-center relative" ref={dropdownRef}>
      <div className="relative w-full">
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder="Search city"
          value={searchQuery}
          onChange={handleChange}
          required
        />
        {loading && (
          <p className="text-sm text-gray-500 absolute right-2 top-2">
            Loading...
          </p>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {showDropdown && searchResults.length > 0 && (
        <ul
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg mt-2 w-full max-w-md max-h-60 overflow-y-auto z-10"
          style={{ top: '100%' }}
        >
          {searchResults.map((result) => (
            <li
              key={result.uid}
              className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectCity(result)}
            >
              <div>
                <p className="font-medium">{result.station.name}</p>
                <p className="text-sm text-gray-500">
                  {result.station.state}, {result.station.country}
                </p>
              </div>
              <span className="badge bg-primary rounded-pill">{result.aqi}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
