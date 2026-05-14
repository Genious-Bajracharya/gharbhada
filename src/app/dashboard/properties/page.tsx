"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Property } from "@/hooks/useProperties";
import { Plus, Eye, Pencil, MapPin } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  RENTED: "bg-blue-100 text-blue-700",
  SOLD: "bg-gray-100 text-gray-500",
  INACTIVE: "bg-red-100 text-red-600",
};

export default function MyPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "LANDLORD") { router.push("/dashboard"); return; }
    api.get("/properties/my")
      .then((r) => setProperties(r.data.data))
      .finally(() => setLoading(false));
  }, [user, router]);

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <Link href="/dashboard/properties/new" className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
            <Plus size={16} /> Add Property
          </Link>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {!loading && properties.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🏠</p>
            <p className="font-medium text-gray-600">No listings yet</p>
            <Link href="/dashboard/properties/new" className="mt-4 inline-block text-sm text-red-600 font-medium hover:underline">
              List your first property
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4 p-4">
              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 text-2xl">🏠</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {p.status}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                  <MapPin size={11} /> {p.city}, {p.district}
                </p>
                <p className="text-red-600 font-semibold text-sm mt-1">Rs. {p.price.toLocaleString()}/mo</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/properties/${p.id}`} className="p-2 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-gray-500">
                  <Eye size={16} />
                </Link>
                <Link href={`/dashboard/properties/${p.id}/edit`} className="p-2 border border-gray-200 rounded-xl hover:border-red-300 transition-colors text-gray-500">
                  <Pencil size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
