"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Check, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [rejectionModal, setRejectionModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [imageGallery, setImageGallery] = useState<Record<string, number>>({});

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

  const handleRejectWithReason = async (id: string) => {
    setVerifying(id);
    try {
      await api.patch(`/properties/${id}/verify`, {
        isVerified: false,
        rejectionReason: rejectionReason.trim() || undefined
      });
      setProperties((p) => p.filter((pr) => pr.id !== id));
      setRejectionModal(null);
      setRejectionReason("");
      alert("Property rejected");
    } catch {
      alert("Failed to reject property");
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
          {properties.map((p) => {
            const imgIdx = imageGallery[p.id] || 0;
            const images = p.images || [];
            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
                {/* Main info */}
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  {/* Image Gallery */}
                  {images.length > 0 ? (
                    <div className="relative w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <Image src={images[imgIdx]} alt={p.title} fill className="object-cover" sizes="128px" />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={() => setImageGallery(g => ({ ...g, [p.id]: (imgIdx - 1 + images.length) % images.length }))}
                            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            onClick={() => setImageGallery(g => ({ ...g, [p.id]: (imgIdx + 1) % images.length }))}
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                          >
                            <ChevronRight size={14} />
                          </button>
                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setImageGallery(g => ({ ...g, [p.id]: i }))}
                                className={`w-1 h-1 rounded-full transition-colors ${i === imgIdx ? "bg-white" : "bg-white/40"}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-300">📸</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{p.city} • {p.type}</p>
                    <p className="text-red-600 font-bold mt-1">Rs. {p.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Listed by: <span className="font-medium text-gray-600">{p.landlord.name}</span> ({p.landlord.phone})
                    </p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    <Link href={`/properties/${p.id}`} className="flex-1 sm:flex-none p-2 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-gray-500">
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleVerify(p.id, true)}
                      disabled={verifying === p.id}
                      className="flex-1 sm:flex-none p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-60"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setRejectionModal(p.id)}
                      disabled={verifying === p.id}
                      className="flex-1 sm:flex-none p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-60"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Image thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto">
                    {images.map((img, i) => (
                      <button
                        key={img}
                        onClick={() => setImageGallery(g => ({ ...g, [p.id]: i }))}
                        className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? "border-red-500" : "border-transparent"}`}
                      >
                        <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rejection Modal */}
        {rejectionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Reject Property?</h3>
              <p className="text-sm text-gray-600">Provide a reason for rejection (optional but helpful)</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Images not clear, misleading description, listed property..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
                rows={3}
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setRejectionModal(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 border border-gray-200 py-2 rounded-lg font-medium hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectWithReason(rejectionModal)}
                  disabled={verifying === rejectionModal}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
