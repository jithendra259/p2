 "use client";

import React, { useEffect, useState, useMemo, memo } from "react";
import { getStoredLocation, subscribeLocation } from "../lib/locationStore"; // Import from locationStore
import { setSelectedLocation } from "../lib/locationStore"; // Import from locationStore
import { getCityData } from "../lib/airQuality"; // Import from airQuality
import { getSelectedLocation } from "../lib/locationStore"; // Import from locationStore

// Default location
const DEFAULT_LOCATION = {
  station: "Chakala-Andheri East",
  state: "Mumbai",
  country: "India",
  aqi: typeof window !== "undefined" ? localStorage.getItem("aqi") || 0 : 0,
};

// Memoized components for better performance
const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

// PollutantCard component to display individual pollutant data
const PollutantCard = memo(({ name, value }) => (
  <div className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
      {name}
    </h5>
    <p className="font-normal text-gray-700 dark:text-gray-400">{value}</p>
  </div>
));
PollutantCard.displayName = 'PollutantCard';

export default function AQIBoard() {

  const [location, setLocation] = useState(getSelectedLocation() || DEFAULT_LOCATION);

  useEffect(() => {
    const unsubscribe = subscribeLocation((newLocation) => {
      setLocation(newLocation || DEFAULT_LOCATION);
    });
    return () => unsubscribe();
  }, []);

  const [loading, setLoading] = useState(true);
  const pollutants = useMemo(() => [
    { name: 'PM2.5', value: location.pollutants ? location.pollutants.pm25 : 'N/A' },
    { name: 'PM10', value: location.pollutants ? location.pollutants.pm10 : 'N/A' },
    { name: 'SO2', value: location.pollutants ? location.pollutants.so2 : 'N/A' },
    { name: 'NO2', value: location.pollutants ? location.pollutants.no2 : 'N/A' },
    { name: 'O3', value: location.pollutants ? location.pollutants.o3 : 'N/A' },
    { name: 'CO', value: location.pollutants ? location.pollutants.co : 'N/A' },
  ], [location.pollutants]);

  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function initializeDefaultLocation() {
      if (!getSelectedLocation()) {
        try {
          const cityData = await getCityData("mumbai");
          if (mounted && cityData) {
            setSelectedLocation({
              ...DEFAULT_LOCATION,
              ...cityData,
              station: "Chakala-Andheri East"
            });
          }
        } catch (error) {
          if (mounted) {
            setError("Failed to fetch default location data");
            setSelectedLocation(DEFAULT_LOCATION);
          }
        }
      }
      if (mounted) setLoading(false);
    }

    initializeDefaultLocation(); 

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const newLocation = getStoredLocation();
    setLocation(newLocation || DEFAULT_LOCATION);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div>
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-8 dark:bg-gray-800 dark:border-gray-700">
      <h5 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
        Real time Air Quality Index (AQI)
      </h5>
      <p className="mb-5 text-base text-gray-500 sm:text-lg dark:text-gray-400">
        {`${location.station}, ${location.state}, ${location.country}`}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        
        <div className="w-full sm:w-auto bg-gray-800 text-white rounded-lg p-4">
          <div className="text-xs">AQI</div>
          <div className="text-2xl font-bold">{location.aqi}</div>
        </div>
        <div className="w-full sm:w-auto bg-gray-800 text-white rounded-lg p-4">
          <div className="text-xs">Air Quality</div>
          <div className="text-2xl font-bold">{location.aqi <= 50 ? "Good" : location.aqi <= 100 ? "Moderate" : location.aqi <= 150 ? "Unhealthy for Sensitive Groups" : location.aqi <= 200 ? "Unhealthy" : location.aqi <= 300 ? "Very Unhealthy" : "Hazardous"}</div>
        </div>
      </div>
    </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {pollutants && pollutants.length > 0 ? pollutants.map(({ name, value }) => (
            <PollutantCard key={name} name={name} value={value} />
          )) : <div>No pollutant data available</div>}
        </div>

  </div>

  );
}
