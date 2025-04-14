import mongoose from 'mongoose';

// Define the nested schemas first
const forecastSchema = new mongoose.Schema({
  time: {
    type: Object,
    required: false
  },
  aqi: Number,
  iaqi: Object,
  pm25: Number,
  pm10: Number,
  no2: Number,
  o3: Number,
  t: Number,
  w: Number
}, { _id: false });

const citySchema = new mongoose.Schema({
  name: String,
  geo: [Number]
}, { _id: false });

// Main AQI Station schema
const aqiSchema = new mongoose.Schema({
  idx: {
    type: Number,
    required: true,
    index: true
  },
  city: {
    type: citySchema,
    required: true
  },
  station: {
    type: Object,
    required: false
  },
  time: {
    type: Object,
    required: true
  },
  aqi: {
    type: Number,
    required: true
  },
  iaqi: {
    type: Object,
    required: false
  },
  fetched_at: {
    type: Date,
    default: Date.now
  },
  forecast: [forecastSchema]
}, {
  collection: 'waqi_stations',
  timestamps: true
});

// Create indexes for better query performance
aqiSchema.index({ 'city.name': 1 });
aqiSchema.index({ aqi: -1 });
aqiSchema.index({ fetched_at: -1 });

// Prevent model recompilation error
let AQIStation;
try {
  // Try to get existing model
  AQIStation = mongoose.model('AQIStation');
} catch {
  // Create new model if it doesn't exist
  AQIStation = mongoose.model('AQIStation', aqiSchema);
}

export { AQIStation };
