let selectedLocation = null; // Initialize selected location
const subscribers = new Set();

export function setSelectedLocation(location) { 
  selectedLocation = location;
  if (typeof window !== "undefined") {
    localStorage.setItem("selectedLocation", JSON.stringify(location)); // Store in localStorage
  }

  subscribers.forEach((cb) => cb(selectedLocation));
}

export function getSelectedLocation() { 
  if (!selectedLocation) {
    const storedLocation = typeof window !== "undefined" ? localStorage.getItem("selectedLocation") : null;
    selectedLocation = storedLocation ? JSON.parse(storedLocation) : null;
  }
  return selectedLocation;
}

export function getStoredLocation() { 
  return getSelectedLocation(); // Ensure retrieval from storage
}

// Subscribe to location changes; returns an unsubscribe function
export function subscribeLocation(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}
