import React, { memo, useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ForecastGraph = memo(({ data, pollutants, timeRange }) => {
  const [selectedPollutant, setSelectedPollutant] = useState('aqi');

  const xAxisProps = useMemo(() => {
    const isLongRange = Number(timeRange) >= 168;
    return {
      angle: -45,
      height: 60,
      interval: 'preserveStartEnd',
      tick: { fontSize: 12 }
    };
  }, [timeRange]);

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex justify-between mb-5">
        <div className="flex items-center gap-4">
          <select 
            className="bg-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 border border-gray-600"
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
          >
            {pollutants.map((p) => (
              <option key={p.key} value={p.key}>
                {p.title}
              </option>
            ))}
          </select>
          <span className="text-gray-400">
            {pollutants.find(p => p.key === selectedPollutant)?.info}
          </span>
        </div>
      </div>
      <div className="h-[400px]">
        {data && data[selectedPollutant] && data[selectedPollutant].length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data[selectedPollutant]}>
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                {...xAxisProps}
                textAnchor="end"
              />
              <YAxis 
                stroke="#9CA3AF"
                domain={['auto', 'auto']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ background: '#374151', border: 'none' }}
                labelStyle={{ color: '#9CA3AF' }}
                formatter={(value) => [`${value}`, selectedPollutant.toUpperCase()]}
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
            No forecast data available
          </div>
        )}
      </div>
    </div>
  );
});

ForecastGraph.displayName = 'ForecastGraph';

export default ForecastGraph;