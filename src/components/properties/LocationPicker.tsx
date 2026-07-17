"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number, address?: string, city?: string, district?: string) => void;
}

export default function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapRef.current, { preferCanvas: true }).setView([lat || 27.7172, lng || 85.324], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      map.on("click", (e) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      });

      updateMarker(lat || 27.7172, lng || 85.324);
    } catch (err) {
      console.error("Map initialization error:", err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleMapClick = async (latitude: number, longitude: number) => {
    updateMarker(latitude, longitude);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();

      const address = data.address?.road || data.address?.suburb || data.name || "Selected Location";
      const city = data.address?.city || data.address?.town || data.address?.village || "";
      const district = data.address?.county || data.address?.state || "";

      onLocationChange(latitude, longitude, address, city, district);
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      onLocationChange(latitude, longitude);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMarker = (latitude: number, longitude: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude]);
    } else {
      const locationIcon = L.icon({
        iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40' fill='none'%3E%3Cpath d='M16 2C10.48 2 6 6.48 6 12c0 6 10 26 10 26s10-20 10-26c0-5.52-4.48-10-10-10z' fill='%23dc2626'/%3E%3Ccircle cx='16' cy='12' r='3.5' fill='white'/%3E%3C/svg%3E`,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });

      markerRef.current = L.marker([latitude, longitude], { icon: locationIcon }).addTo(mapInstanceRef.current);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">
        Click on the map to select location {isLoading && "— loading..."}
      </p>
      <div
        ref={mapRef}
        className="w-full rounded-xl border border-gray-200 overflow-hidden"
        style={{ height: "400px", minHeight: "400px" }}
      />
      <p className="text-xs text-gray-400 mt-2">
        Selected: {lat?.toFixed(4)}, {lng?.toFixed(4)}
      </p>
    </div>
  );
}
