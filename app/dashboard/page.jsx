'use client';

import { useState } from 'react';
import Header from "@/components/header";
import AQIBoard from "@/components/aqiboard";

export default function Dashboard() {
  const [currentLocation, setCurrentLocation] = useState(null);

  const handleLocationUpdate = (data) => {
    setCurrentLocation(data);
  };

  return (
    <div className="container">
      <Header onLocationUpdate={handleLocationUpdate} />
      <AQIBoard locationData={currentLocation} />
    </div>
  );
}
