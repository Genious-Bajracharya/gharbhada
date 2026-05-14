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
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
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
