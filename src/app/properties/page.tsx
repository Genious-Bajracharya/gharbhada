"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { SlidersHorizontal, X, Map, Grid } from "lucide-react";

const PropertyMap = dynamic(() => import("@/components/properties/PropertyMap"), { ssr: false });

const TYPES = ["FLAT", "HOUSE", "ROOM", "LAND", "COMMERCIAL"];
const DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur", "Kaski", "Morang", "Rupandehi"];

function PropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const params: Record<string, string> = {};
  searchParams.forEach((v, k) => { if (v) params[k] = v; });

  const { data, loading, error } = useProperties(params);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    router.push(`/properties?${next.toString()}`);
  };

  const clearAll = () => router.push("/properties");

  const hasFilters = Array.from(searchParams.entries()).some(([k]) => k !== "page");

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            {data && <p className="text-sm text-gray-500 mt-0.5">{data.total} listings found</p>}
          </div>
          <div className="flex gap-2">
            <div className="flex border border-gray-200 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "map" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Map size={16} />
              </button>
            </div>
            {hasFilters && (
              <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-xl px-3 py-2 transition-colors">
                <X size={14} /> Clear
              </button>
            )}
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 hover:border-red-400 transition-colors">
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
              <select value={params.type ?? ""} onChange={(e) => setParam("type", e.target.value)} className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none">
                <option value="">All</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Purpose</label>
              <select value={params.purpose ?? ""} onChange={(e) => setParam("purpose", e.target.value)} className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="RENT">Rent</option>
                <option value="SALE">Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">District</label>
              <select value={params.district ?? ""} onChange={(e) => setParam("district", e.target.value)} className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none">
                <option value="">All</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Min Price (Rs.)</label>
              <input type="number" placeholder="0" value={params.minPrice ?? ""} onChange={(e) => setParam("minPrice", e.target.value)} className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Max Price (Rs.)</label>
              <input type="number" placeholder="Any" value={params.maxPrice ?? ""} onChange={(e) => setParam("maxPrice", e.target.value)} className="w-full border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none" />
            </div>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        )}

        {error && <p className="text-center text-red-500 py-20">{error}</p>}

        {data && !loading && (
          <>
            {data.properties.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">🏚️</p>
                <p className="font-medium text-gray-600">No properties found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : viewMode === "map" ? (
              <PropertyMap properties={data.properties} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.properties.map((p) => (
                  <PropertyCard key={p.id} {...p} />
                ))}
              </div>
            )}

            {data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: data.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setParam("page", String(i + 1))}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${data.page === i + 1 ? "bg-red-600 text-white" : "border border-gray-200 text-gray-600 hover:border-red-400"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default function PropertiesPage() {
  return <Suspense><PropertiesContent /></Suspense>;
}
