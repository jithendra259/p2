const API_KEY = "c69bd9a20bccfbbe7b4f2e37a17b1a2f2332b423";
const BASE_URL = "https://api.waqi.info";

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function for API calls with caching
async function fetchWithCache(url, cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    
    const data = await res.json();
    if (data.status !== "ok") {
      throw new Error(data.message || "API returned non-OK status");
    }

    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
}

// Helper function to process station name
function parseStationName(name) {
  if (!name) return { station: "", state: "", country: "" };
  const parts = name.split(",");
  return {
    station: parts[0]?.trim() || "",
    state: parts[1]?.trim() || "",
    country: parts[2]?.trim() || ""
  };
}

export async function get24hrData(city) {
  try {
    const url = `${BASE_URL}/feed/${encodeURIComponent(city)}/?token=${API_KEY}`;
    const response = await fetchWithCache(url, `24hr-${city}`);

    if (!response?.data) {
      throw new Error('Invalid response from API');
    }

    // Extract time series data
    const now = new Date();
    const data = Array.from({ length: 24 }, (_, i) => {
      const time = new Date(now - (23 - i) * 60 * 60 * 1000);
      const hour = time.getHours().toString().padStart(2, '0');
      
      return {
        time: `${hour}:00`,
        value: response.data.iaqi?.pm25?.v || 'N/A',
        aqi: response.data.aqi || 'N/A'
      };
    });

    return data;
  } catch (error) {
    console.error('Error fetching 24hr data:', error);
    return [];
  }
}

export async function get7DayData(city, pollutant) {
  const json = await fetchWithCache(
    `${BASE_URL}/feed/${city}/?token=${API_KEY}`,
    `7day-${city}-${pollutant}`
  );

  const forecast = json.data.forecast?.daily?.[pollutant] || [];
  return forecast.slice(-7).map(entry => ({
    date: entry.day,
    min: entry.min,
    max: entry.max,
    avg: (entry.min + entry.max) / 2
  }));
}

export async function get30DayData(city, pollutant) {
  const json = await fetchWithCache(
    `${BASE_URL}/feed/${city}/?token=${API_KEY}`,
    `30day-${city}-${pollutant}`
  );

  const forecast = json.data.forecast?.daily?.[pollutant] || [];
  return forecast.slice(-30).map(entry => ({
    date: entry.day,
    min: entry.min,
    max: entry.max,
    avg: (entry.min + entry.max) / 2
  }));
}

export async function getCityData(city) {
  const json = await fetchWithCache(
    `${BASE_URL}/feed/${city}/?token=${API_KEY}`,
    `city-${city}`
  );

  const { aqi, time, city: cityInfo, iaqi, forecast } = json.data;
  const { station, state, country } = parseStationName(cityInfo?.name);

  const pollutants = Object.entries(iaqi || {}).reduce((acc, [key, value]) => {
    acc[key.toLowerCase()] = value?.v;
    return acc;
  }, {});

  return {
    aqi,
    time,
    station,
    state,
    country,
    pollutants,
    forecast,
    geo: cityInfo.geo,
    url: cityInfo.url
  };
}

export async function getMapFeed(lat1, lng1, lat2, lng2, networks = "all") {
  const latlng = `${lat1},${lng1},${lat2},${lng2}`;
  const cacheKey = `map-${latlng}-${networks}`;
  
  return fetchWithCache(
    `${BASE_URL}/v2/map/bounds?token=${API_KEY}&latlng=${latlng}&networks=${networks}`,
    cacheKey
  );
}

// Optimization for color calculation
const AQI_SPECTRUM = [
  { threshold: 0, bg: "#cccccc", fg: "#ffffff" },
  { threshold: 50, bg: "#009966", fg: "#ffffff" },
  { threshold: 100, bg: "#ffde33", fg: "#000000" },
  { threshold: 150, bg: "#ff9933", fg: "#000000" },
  { threshold: 200, bg: "#cc0033", fg: "#ffffff" },
  { threshold: 300, bg: "#660099", fg: "#ffffff" },
  { threshold: 500, bg: "#7e0023", fg: "#ffffff" }
].reverse();

export function colorize(aqi) {
  const level = AQI_SPECTRUM.find(s => aqi > s.threshold) || AQI_SPECTRUM[AQI_SPECTRUM.length - 1];
  return {
    text: aqi,
    style: { backgroundColor: level.bg, color: level.fg }
  };
}

// Export other functions with caching
export const getCityFeed = city => 
  fetchWithCache(`${BASE_URL}/feed/${city}/?token=${API_KEY}`, `feed-${city}`);

export const getGeoFeed = (lat, lng) => 
  fetchWithCache(`${BASE_URL}/feed/geo:${lat};${lng}/?token=${API_KEY}`, `geo-${lat}-${lng}`);

export const getHereFeed = () => 
  fetchWithCache(`${BASE_URL}/feed/here/?token=${API_KEY}`, 'here');

export const searchAQI = keyword => 
  fetchWithCache(`${BASE_URL}/search/?token=${API_KEY}&keyword=${encodeURIComponent(keyword)}`, `search-${keyword}`);

export const getPollutantValue = async (city, pollutant) => {
  const data = await getCityData(city);
  return data.pollutants[pollutant.toLowerCase()] ?? null;
};

import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import { AQIStation } from '@/lib/aqiModel';

export async function GET(request) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    
    let query = {};
    if (city) {
      query = { 'city.name': { $regex: city, $options: 'i' } };
    }

    const stations = await AQIStation.find(query)
      .sort({ 'fetched_at': -1 })
      .limit(100);

    return NextResponse.json({ success: true, data: stations });
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AQI data' },
      { status: 500 }
    );
  }
}