"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/hooks/useProperties";

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (id: string) => void;
  height?: string;
}

export default function PropertyMap({ properties, onPropertyClick, height = "h-96" }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const icon = useMemo(() =>
    L.icon({
      iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40' fill='none'%3E%3Cpath d='M16 2C10.48 2 6 6.48 6 12c0 6 10 26 10 26s10-20 10-26c0-5.52-4.48-10-10-10z' fill='%23dc2626'/%3E%3Ccircle cx='16' cy='12' r='3.5' fill='white'/%3E%3C/svg%3E`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    }),
    []
  );

  useEffect(() => {
    if (!mapRef.current && typeof window !== "undefined") {
      mapRef.current = L.map("property-map").setView([27.7172, 85.324], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || properties.length === 0) return;

    // Remove old markers
    markersRef.current.forEach((m) => mapRef.current?.removeLayer(m));
    markersRef.current = [];

    // Add new markers
    const bounds = L.latLngBounds([]);
    properties.forEach((p) => {
      const marker = L.marker([p.lat, p.lng], { icon })
        .bindPopup(
          `<div class="text-sm font-semibold">${p.title}</div>
           <div class="text-xs text-gray-600">Rs. ${p.price.toLocaleString()}</div>
           ${onPropertyClick ? `<button class="text-xs text-red-600 font-medium mt-1" onclick="window.dispatchEvent(new CustomEvent('property-click', {detail: '${p.id}'}))">View</button>` : ""}`
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
      bounds.extend([p.lat, p.lng]);
    });

    // Fit all markers in view
    if (bounds.isValid()) {
      mapRef.current?.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, onPropertyClick]);

  useEffect(() => {
    if (onPropertyClick) {
      const handler = (e: any) => onPropertyClick(e.detail);
      window.addEventListener("property-click", handler);
      return () => window.removeEventListener("property-click", handler);
    }
  }, [onPropertyClick]);

  return <div id="property-map" className={`rounded-2xl overflow-hidden border border-gray-200 ${height}`} />;
}
