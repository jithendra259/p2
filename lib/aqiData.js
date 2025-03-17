// locationStore.js

let selectedLocation = null;
const subscribers = new Set();

export function setSelectedLocation(location) {
  selectedLocation = location;
  // Notify all subscribers of the new location
  subscribers.forEach((cb) => cb(selectedLocation));
}

export function getSelectedLocation() {
  return selectedLocation;
}

// Subscribe to location changes; returns an unsubscribe function
export function subscribeLocation(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}