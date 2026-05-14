"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import PropertyPaymentModal from "@/components/properties/PropertyPaymentModal";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Calendar, CreditCard } from "lucide-react";

interface Lease {
  id: string;
  monthlyRent: number;
  deposit: number;
  startDate: string;
  endDate: string;
  status: string;
  property: { id: string; title: string; address: string; images: string[] };
  tenant: { id: string; name: string; phone: string };
  payments: { status: string; forMonth: string; amount: number }[];
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  TERMINATED: "bg-red-100 text-red-600",
};

export default function LeasesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLeaseId, setPaymentLeaseId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    api.get("/leases/my").then((r) => setLeases(r.data.data)).finally(() => setLoading(false));
  }, [user, router]);

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {user?.role === "LANDLORD" ? "Tenant Leases" : "My Lease"}
        </h1>

        {loading && <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>}

        {!loading && leases.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📄</p>
            <p className="font-medium text-gray-600">No leases yet</p>
          </div>
        )}

        <div className="space-y-4">
          {leases.map((lease) => {
            const pendingPayments = lease.payments.filter((p) => p.status === "PENDING");
            return (
              <div key={lease.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{lease.property.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{lease.property.address}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[lease.status] ?? "bg-gray-100"}`}>
                    {lease.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> Start: {fmt(lease.startDate)}</div>
                  <div className="flex items-center gap-1.5"><Calendar size={13} className="text-gray-400" /> End: {fmt(lease.endDate)}</div>
                  <div className="flex items-center gap-1.5"><CreditCard size={13} className="text-gray-400" /> Rent: Rs. {lease.monthlyRent.toLocaleString()}/mo</div>
                  <div className="flex items-center gap-1.5"><CreditCard size={13} className="text-gray-400" /> Deposit: Rs. {lease.deposit.toLocaleString()}</div>
                </div>

                {user?.role === "LANDLORD" && (
                  <p className="text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                    Tenant: <span className="font-medium text-gray-700">{lease.tenant.name}</span> — {lease.tenant.phone}
                  </p>
                )}

                {pendingPayments.length > 0 && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-xs font-medium text-yellow-700">{pendingPayments.length} payment{pendingPayments.length > 1 ? "s" : ""} pending</p>
                    <button
                      onClick={() => setPaymentLeaseId(lease.id)}
                      className="text-xs font-semibold text-white bg-yellow-500 px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      {paymentLeaseId && (
        <PropertyPaymentModal
          leaseId={paymentLeaseId}
          monthlyRent={leases.find((l) => l.id === paymentLeaseId)?.monthlyRent ?? 0}
          onClose={() => setPaymentLeaseId(null)}
        />
      )}
      </div>
    </>
  );
}
