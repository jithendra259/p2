"use client";
import React, { useEffect, useState } from "react";
import { getMapFeed } from "../lib/airQuality"; 

export default function Ranking() {
  const [citiesData, setCitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch data for the entire globe (all locations)
        const response = await getMapFeed(-90, -180, 90, 180);

        if (!isMounted) return;

        if (response && response.status === "ok" && Array.isArray(response.data)) {
          // Filter out invalid data points
          const validData = response.data
            .filter(item => item.station && item.station.name && item.aqi && !isNaN(item.aqi))
            .map(item => ({
              location: item.station.name.trim() || "Unknown Location",
              aqi: Math.round(Number(item.aqi))
            }));

          // Sort data by descending AQI; if equal, sort alphabetically by location
          validData.sort((a, b) => {
            if (b.aqi !== a.aqi) return b.aqi - a.aqi;
            return a.location.localeCompare(b.location);
          });

          setCitiesData(validData);
        } else {
          setError("Invalid data received from server");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Error fetching data");
          console.error("Error fetching data:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMore = () => {
    setVisibleCount(prev => prev + 2000);
  };

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Air Quality Rankings</h1>
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading data...</span>
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Rank</th>
                <th scope="col" className="px-6 py-3">Location</th>
                <th scope="col" className="px-6 py-3">AQI</th>
              </tr>
            </thead>
            <tbody>
              {citiesData.slice(0, visibleCount).map((city, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4">{city.location}</td>
                  <td className="px-6 py-4">{city.aqi}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleCount < citiesData.length && (
            <div className="flex justify-center p-4">
              <button
                onClick={handleMore}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
