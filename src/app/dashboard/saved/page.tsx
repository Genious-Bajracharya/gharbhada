"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/properties/PropertyCard";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Property } from "@/hooks/useProperties";

export default function SavedPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/properties/saved")
      .then((r) => setProperties(r.data.data.properties))
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Properties</h1>
        <p className="text-gray-500 text-sm mb-6">{properties.length} saved</p>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">💔</p>
            <p className="font-medium text-gray-600">No saved properties yet</p>
            <p className="text-sm mt-1">Save properties to your wishlist</p>
          </div>
        )}

        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((p) => (
              <PropertyCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
