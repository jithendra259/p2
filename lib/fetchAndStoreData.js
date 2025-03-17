import axios from "axios";
import AQI from "./aqiModel.js";
import { connectMongoDB } from "./mongodb.js";

// Replace with your actual WAQI API key
const API_KEY = "c69bd9a20bccfbbe7b4f2e37a17b1a2f2332b423";
const MAX_UID = 15000; // Upper limit for UID to try

async function fetchAndStoreData() {
    await connectMongoDB();
    const allResults = [];

    for (let uid = 1; uid <= MAX_UID; uid++) {
        const url = `https://api.waqi.info/feed/@${uid}/?token=${API_KEY}`;
        try {
            const response = await axios.get(url);
            if (response.data.status === "ok") {
                const data = response.data.data;
                allResults.push({
                    station: data.station.name,
                    aqi: data.aqi,
                    pollutants: data.iaqi,
                });
            }
        } catch (error) {
            console.log(`Error fetching uid ${uid}: ${error}`);
        }
    }

    // Store data in MongoDB
    await AQI.insertMany(allResults);
    console.log("Data successfully stored in MongoDB");
}

export default fetchAndStoreData;
