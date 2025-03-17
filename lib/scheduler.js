import cron from "node-cron";
import fetchAndStoreData from "./fetchAndStoreData.js";

// Schedule the fetchAndStoreData function to run every hour
cron.schedule("0 * * * *", () => {
    console.log("Fetching and storing data...");
    fetchAndStoreData()
        .then(() => console.log("Data fetch and store completed."))
        .catch((error) => console.error("Error during data fetch and store:", error));
});
