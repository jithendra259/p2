export const getStoredLocation = () => {
  // Logic to access the stored location
  return getSelectedLocation(); // Assuming this function is available from locationStore
};

export const fetchAQIData = async () => {
  const location = getStoredLocation();
  if (!location) {
    throw new Error('No location selected');
  }
  // Logic to fetch AQI data based on the stored location
  const data = await searchAQI(location); // Assuming searchAQI is available from aqiData
  return data;
};

export const getPollutantInfo = (aqiData) => {
  // Logic to extract pollutant information from AQI data
  return aqiData.data.map(item => ({
    name: item.station.name,
    aqi: item.aqi,
    pollutants: item.pollutants // Assuming pollutants are part of the data structure
  }));
};
