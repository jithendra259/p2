'use client';
import { useState, useEffect } from 'react';

export default function Ranking() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/airqualityserver');
      const data = await response.json();
      if (data.success) {
        const sortedData = data.data
          .sort((a, b) => b.aqi - a.aqi)
          .slice(0, 10);
        setRankings(sortedData);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Top 10 Most Polluted Cities</h2>
      {loading ? (
        <div className="loading-spinner" />
      ) : (
        <div className="grid gap-2">
          {rankings.map((station, index) => (
            <div key={station.idx} className="p-2 border rounded flex justify-between">
              <span>{index + 1}. {station.city.name}</span>
              <span>AQI: {station.aqi}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
