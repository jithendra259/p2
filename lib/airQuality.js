// aqiLibrary.js

// Import all functions from your server file.
import {
  get24hrData,
  get7DayData,
  get30DayData,
  getCityData,
  getCityFeed,
  getGeoFeed,
  getHereFeed,
  getMapFeed,
  searchAQI,
  colorize,
  getPollutantValue
} from '../app/api/airqualityserver/route.js';

// Export each function as a named export.
export {
  get24hrData,
  get7DayData,
  get30DayData,
  getCityData,
  getCityFeed,
  getGeoFeed,
  getHereFeed,
  getMapFeed,
  searchAQI,
  colorize,
  getPollutantValue
};

// Also, export a default object containing all functions.
const AQILibrary = {
  get24hrData,
  get7DayData,
  get30DayData,
  getCityData,
  getCityFeed,
  getGeoFeed,
  getHereFeed,
  getMapFeed,
  searchAQI,
  colorize,
  getPollutantValue
};

export default AQILibrary;
