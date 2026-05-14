"use client";

import { useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/axios";

interface Props {
  leaseId: string;
  monthlyRent: number;
  onClose: () => void;
}

export default function PropertyPaymentModal({ leaseId, monthlyRent, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [gateway, setGateway] = useState<"KHALTI" | "ESEWA">("KHALTI");

  const initiatePayment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/payments/initiate", {
        leaseId,
        forMonth: new Date().toISOString(),
        gateway,
      });

      if (gateway === "KHALTI") {
        // Redirect to Khalti payment
        window.location.href = `https://a.khalti.com/api/v2/epayment/initiate/?pidx=${data.data.khaltiPayload.purchase_order_id}`;
      } else {
        alert("eSewa integration in progress");
      }
    } catch {
      alert("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Make Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-600">Amount to pay</p>
          <p className="text-2xl font-bold text-red-600">Rs. {monthlyRent.toLocaleString()}</p>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-red-300 transition-colors" style={{ borderColor: gateway === "KHALTI" ? "#f24c3d" : undefined }}>
            <input type="radio" checked={gateway === "KHALTI"} onChange={() => setGateway("KHALTI")} className="accent-red-600" />
            <div>
              <p className="font-semibold text-sm text-gray-900">Khalti</p>
              <p className="text-xs text-gray-500">Instant payment via Khalti wallet</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-green-300 transition-colors" style={{ borderColor: gateway === "ESEWA" ? "#119d3f" : undefined }}>
            <input type="radio" checked={gateway === "ESEWA"} onChange={() => setGateway("ESEWA")} className="accent-green-600" />
            <div>
              <p className="font-semibold text-sm text-gray-900">eSewa</p>
              <p className="text-xs text-gray-500">Pay via eSewa (coming soon)</p>
            </div>
          </label>
        </div>

        <button
          onClick={initiatePayment}
          disabled={loading || gateway === "ESEWA"}
          className="w-full bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 text-sm"
        >
          {loading ? "Processing..." : `Pay Rs. ${monthlyRent.toLocaleString()}`}
        </button>

        <button onClick={onClose} className="w-full mt-2 border border-gray-200 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm text-gray-700">
          Close
        </button>
      </div>
    </div>
  );
}
