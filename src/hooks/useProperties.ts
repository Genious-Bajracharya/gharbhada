"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  purpose: string;
  price: number;
  negotiable: boolean;
  deposit?: number;
  address: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  area?: number;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  features: Record<string, boolean>;
  images: string[];
  videoUrl?: string;
  status: string;
  isVerified: boolean;
  views: number;
  createdAt: string;
  landlord: { id: string; name: string; phone: string; avatar?: string };
}

export interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  pages: number;
}

export function useProperties(params: Record<string, string>) {
  const [data, setData] = useState<PropertiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/properties?${query}`);
      setData(res.data.data);
    } catch {
      setError("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
