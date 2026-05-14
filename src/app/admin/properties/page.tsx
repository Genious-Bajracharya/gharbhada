"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Check, X, Eye } from "lucide-react";

interface UnverifiedProperty {
  id: string;
  title: string;
  city: string;
  type: string;
  price: number;
  images: string[];
  landlord: { name: string; phone: string };
  createdAt: string;
}

export default function AdminPropertiesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [properties, setProperties] = useState<UnverifiedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { router.push("/dashboard"); return; }
    api.get("/properties?isVerified=false")
      .then((r) => setProperties(r.data.data.properties))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleVerify = async (id: string, isVerified: boolean) => {
    setVerifying(id);
    try {
      await api.patch(`/properties/${id}/verify`, { isVerified });
      setProperties((p) => p.filter((pr) => pr.id !== id));
      alert(`Property ${isVerified ? "verified" : "rejected"}`);
    } catch {
      alert("Failed to verify property");
    } finally {
      setVerifying(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verify Properties</h1>
        <p className="text-gray-500 text-sm mb-6">{properties.length} pending properties</p>

        {loading && <div className="text-center text-gray-400">Loading...</div>}

        {!loading && properties.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-2">✓</p>
            <p>All properties verified!</p>
          </div>
        )}

        <div className="space-y-4">
          {properties.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex gap-4">
              <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {p.images[0] ? (
                  <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">📸</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.city} • {p.type}</p>
                <p className="text-red-600 font-bold text-sm mt-1">Rs. {p.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Listed by: <span className="font-medium text-gray-600">{p.landlord.name}</span> ({p.landlord.phone})
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Link href={`/properties/${p.id}`} className="p-2 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-gray-500">
                  <Eye size={16} />
                </Link>
                <button
                  onClick={() => handleVerify(p.id, true)}
                  disabled={verifying === p.id}
                  className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-60"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleVerify(p.id, false)}
                  disabled={verifying === p.id}
                  className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-60"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
