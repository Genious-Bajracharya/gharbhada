"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Check, X, Eye } from "lucide-react";

interface KycSubmission {
  id: string;
  userId: string;
  user: { name: string; phone: string };
  citizenshipNo: string;
  citizenshipFront: string;
  citizenshipBack: string;
  selfie: string;
  status: string;
  createdAt: string;
}

export default function AdminKycPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [kycList, setKycList] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { router.push("/dashboard"); return; }
    api.get("/admin/kyc")
      .then((r) => setKycList(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleReview = async (userId: string, status: "VERIFIED" | "REJECTED") => {
    setReviewing(userId);
    try {
      await api.patch(`/users/${userId}/kyc`, {
        status,
        rejectedReason: status === "REJECTED" ? reason : undefined,
      });
      setKycList((k) => k.filter((item) => item.userId !== userId));
      alert(`KYC ${status === "VERIFIED" ? "verified" : "rejected"}`);
      setReason("");
    } catch {
      alert("Failed to review KYC");
    } finally {
      setReviewing(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Review KYC Submissions</h1>
        <p className="text-gray-500 text-sm mb-6">{kycList.length} pending submissions</p>

        {loading && <div className="text-center text-gray-400">Loading...</div>}

        {!loading && kycList.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-2">✓</p>
            <p>All KYC submissions reviewed!</p>
          </div>
        )}

        <div className="space-y-6">
          {kycList.map((k) => (
            <div key={k.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{k.user.name}</h3>
                  <p className="text-sm text-gray-500">{k.user.phone}</p>
                  <p className="text-xs text-gray-400 mt-1">Citizenship: {k.citizenshipNo}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">PENDING</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Citizenship - Front", url: k.citizenshipFront },
                  { label: "Citizenship - Back", url: k.citizenshipBack },
                  { label: "Selfie", url: k.selfie },
                ].map((img) => (
                  <div key={img.label} className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-2">{img.label}</p>
                    <a href={img.url} target="_blank" rel="noopener noreferrer" className="relative inline-block w-full h-48 rounded-xl overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity">
                      <Image src={img.url} alt={img.label} fill className="object-cover" sizes="200px" />
                    </a>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4">
                {reviewing === k.userId ? (
                  <div className="space-y-3">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason for rejection (if rejecting)..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(k.userId, "VERIFIED")}
                        className="flex-1 bg-green-600 text-white py-2 rounded-xl font-semibold hover:bg-green-700 text-sm transition-colors"
                      >
                        <Check className="inline mr-1" size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleReview(k.userId, "REJECTED")}
                        className="flex-1 bg-red-600 text-white py-2 rounded-xl font-semibold hover:bg-red-700 text-sm transition-colors"
                      >
                        <X className="inline mr-1" size={14} /> Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewing(k.userId)}
                    className="w-full border border-gray-200 py-2 rounded-xl font-semibold hover:border-gray-300 text-sm transition-colors"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
