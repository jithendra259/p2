import mongoose from "mongoose";

const aqiSchema = new mongoose.Schema({
    station: {
        type: String,
        required: true
    },
    aqi: {
        type: Number,
        required: true
    },
    pollutants: {
        type: Object,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const AQI = mongoose.model("AQI", aqiSchema);

export default AQI;
