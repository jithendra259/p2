'use client';

import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  <div className="block p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-white">
    <h5 className="mb-2 text-2xl font-bold tracking-tight">
      {name}
    </h5>
    <p className="font-normal text-gray-300">{value}</p>
  </div>
));
PollutantCard.displayName = 'PollutantCard';

// Update ForecastCard to include chart
const ForecastCard = memo(({ title, value, info, data }) => {
  console.log(`Rendering ForecastCard for ${title}:`, data);
  
  return (
    <div className="max-w-sm w-full bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between mb-5">
        <div>
          <h5 className="inline-flex items-center text-gray-400 leading-none font-normal mb-2">
            {title}
            <span className="ml-2 text-xs text-gray-500">{info}</span>
          </h5>
          <p className="text-white text-2xl leading-none font-bold">{value}</p>
        </div>
      </div>
      <div className="h-[200px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#9CA3AF"
                domain={['auto', 'auto']}
              />
              <Tooltip 
                contentStyle={{ background: '#374151', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value) => [`${value}`, title]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#60A5FA" 
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No data available
          </div>
        )}
      </div>
    </div>
  );
});

export default function AQIBoard({ locationData }) {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("48");
  const [forecastData, setForecastData] = useState({});

  // Process and group all readings by pollutant type
  const processGroupedReadingsData = useCallback((readings) => {
    if (!Array.isArray(readings)) return {};

    const pollutantMap = {
      aqi: [],
      pm25: [],
      pm10: [],
      no2: [],
      o3: [],
      so2: [],
      co: []
    };

    // Sort readings by time first
    const sortedReadings = [...readings].sort((a, b) => 
      new Date(a.time.s) - new Date(b.time.s)
    );

    sortedReadings.forEach(reading => {
      const time = new Date(reading.time.s).toLocaleString();
      
      // Handle AQI
      pollutantMap.aqi.push({
        time,
        value: Number(reading.aqi) || 0
      });

      // Handle other pollutants from iaqi
      Object.entries(reading.iaqi || {}).forEach(([key, data]) => {
        if (pollutantMap[key]) {
          pollutantMap[key].push({
            time,
            value: Number(data.v) || 0
          });
        }
      });
    });

    console.log('Processed forecast data:', pollutantMap);
    return pollutantMap;
  }, []);

  // Process data when locationData changes
  useEffect(() => {
    if (locationData) {
      setLoading(true);
      setError(null);
      try {
        const processedData = {
          ...locationData,
          city: locationData.city || { name: locationData.station || 'Unknown Location' },
          aqi: locationData.current?.aqi || locationData.aqi || 0,
          fetched_at: new Date().toISOString(),
          iaqi: locationData.current?.iaqi || locationData.iaqi || {},
          readings: locationData.readings || []
        };
        setAqiData(processedData);
        
        // Process and set forecast data
        const groupedData = processGroupedReadingsData(processedData.readings);
        setForecastData(groupedData);
      } catch (error) {
        console.error('Error processing AQI data:', error);
        setError('Failed to process air quality data');
      } finally {
        setLoading(false);
      }
    }
  }, [locationData, processGroupedReadingsData]);

  // Memoize the AQI level and color
  const aqiInfo = useMemo(() => {
    if (!aqiData?.aqi) return { level: 'Unknown', color: 'gray' };
    
    const aqi = aqiData.aqi;
    if (aqi <= 50) return { level: 'Good', color: 'green' };
    if (aqi <= 100) return { level: 'Moderate', color: 'yellow' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'orange' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'red' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'purple' };
    return { level: 'Hazardous', color: 'maroon' };
  }, [aqiData?.aqi]);

  // Memoized pollutants array
  const pollutants = useMemo(() => [
    { name: 'PM2.5', value: aqiData?.iaqi?.pm25?.v || 'N/A' },
    { name: 'PM10', value: aqiData?.iaqi?.pm10?.v || 'N/A' },
    { name: 'SO2', value: aqiData?.iaqi?.so2?.v || 'N/A' },
    { name: 'NO2', value: aqiData?.iaqi?.no2?.v || 'N/A' },
    { name: 'O3', value: aqiData?.iaqi?.o3?.v || 'N/A' },
    { name: 'CO', value: aqiData?.iaqi?.co?.v || 'N/A' },
  ], [aqiData?.iaqi]);

  // Memoize the forecast cards configuration
  const forecastCards = useMemo(() => [
    { title: 'AQI', key: 'aqi', info: 'Air Quality Index' },
    { title: 'PM2.5', key: 'pm25', info: 'Fine particulate matter' },
    { title: 'PM10', key: 'pm10', info: 'Coarse particulate matter' },
    { title: 'SO2', key: 'so2', info: 'Sulfur dioxide' },
    { title: 'NO2', key: 'no2', info: 'Nitrogen dioxide' },
    { title: 'O3', key: 'o3', info: 'Ozone' },
    { title: 'CO', key: 'co', info: 'Carbon monoxide' },
  ], []);

  return (
    <div className="min-h-screen bg-[#303030] p-6 pt-20"> {/* Changed background and added min-height */}
      <div className="max-w-4xl mx-auto">
        {loading && <LoadingSpinner />}

        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {aqiData && !loading && (
          <div className="space-y-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white"> {/* Updated for dark theme */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {aqiData.city?.name || 'Unknown Location'}
                  </h2>
                  <p className="text-sm text-gray-300">
                    Last Updated: {new Date(aqiData.fetched_at).toLocaleString()}
                  </p>
                </div>
                <div className={`mt-4 md:mt-0 px-6 py-3 rounded-full bg-opacity-20 bg-${aqiInfo.color}-500`}>
                  <span className={`text-${aqiInfo.color}-400 text-3xl font-bold`}>
                    {aqiData.aqi || 'N/A'}
                  </span>
                  <span className={`ml-2 text-${aqiInfo.color}-400 font-medium`}>
                    {aqiInfo.level}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pollutants.map((pollutant, index) => (
                <PollutantCard
                  key={index}
                  name={pollutant.name}
                  value={pollutant.value}
                />
              ))}
            </div>
            
            {aqiData && (
              <div className="mt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Forecast Data</h3>
                  <select 
                    className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                    onChange={(e) => setTimeRange(e.target.value)}
                    value={timeRange}
                  >
                    <option value="48">Last 48 hours</option>
                    <option value="168">Last 7 days</option>
                    <option value="720">Last 30 days</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {forecastCards.map((card) => (
                    <ForecastCard
                      key={card.key}
                      title={card.title}
                      value={aqiData.current?.[card.key]?.v || aqiData[card.key] || 'N/A'}
                      info={card.info}
                      data={forecastData[card.key] || []}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
