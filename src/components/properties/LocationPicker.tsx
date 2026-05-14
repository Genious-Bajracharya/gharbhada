"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([lat || 27.7172, lng || 85.324], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      map.on("click", (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        onLocationChange(clickLat, clickLng);
        updateMarker(clickLat, clickLng);
      });
    }

    updateMarker(lat || 27.7172, lng || 85.324);
  }, [lat, lng, onLocationChange]);

  const updateMarker = (latitude: number, longitude: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      const redIcon = L.icon({
        iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23dc2626' width='32' height='32'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12c0 4.84 3.94 8.75 8.75 8.75.33 0 .66-.02.98-.05-3.36-1.47-5.68-4.92-5.68-8.95 0-5.52 4.48-10 10-10z'/%3E%3C/svg%3E",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      markerRef.current = L.marker([latitude, longitude], { icon: redIcon }).addTo(mapInstanceRef.current);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Click on the map to select location</p>
      <div ref={mapRef} className="w-full h-96 rounded-xl border border-gray-200" />
      <p className="text-xs text-gray-400 mt-2">Current: {lat?.toFixed(4)}, {lng?.toFixed(4)}</p>
    </div>
  );
}
