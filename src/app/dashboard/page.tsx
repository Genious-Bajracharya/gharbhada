"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Home, FileText, CreditCard, MessageCircle, Plus, ChevronRight } from "lucide-react";

interface Stats {
  properties?: number;
  activeLeases?: number;
  pendingPayments?: number;
  unreadMessages?: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    const fetchStats = async () => {
      try {
        const [leases, messages] = await Promise.all([
          api.get("/leases/my"),
          api.get("/messages/conversations"),
        ]);
        const activeLeases = leases.data.data.filter((l: any) => l.status === "ACTIVE").length;
        const pendingPayments = leases.data.data.reduce((acc: number, l: any) =>
          acc + (l.payments?.filter((p: any) => p.status === "PENDING").length ?? 0), 0);
        const unreadMessages = messages.data.data.filter((m: any) => !m.isRead && m.receiverId === user.id).length;
        setStats({ activeLeases, pendingPayments, unreadMessages });

        if (user.role === "LANDLORD") {
          const props = await api.get("/properties/my");
          setStats((s) => ({ ...s, properties: props.data.data.length }));
        }
      } catch {}
    };
    fetchStats();
  }, [user, router]);

  if (!user) return null;

  const cards = [
    ...(user.role === "LANDLORD" ? [{ icon: <Home size={22} className="text-red-600" />, label: "My Listings", value: stats.properties ?? 0, href: "/dashboard/properties", cta: "Manage" }] : []),
    { icon: <FileText size={22} className="text-blue-600" />, label: "Active Leases", value: stats.activeLeases ?? 0, href: "/dashboard/leases", cta: "View" },
    { icon: <CreditCard size={22} className="text-yellow-600" />, label: "Pending Payments", value: stats.pendingPayments ?? 0, href: "/dashboard/leases", cta: "Pay" },
    { icon: <MessageCircle size={22} className="text-green-600" />, label: "Messages", value: stats.unreadMessages ?? 0, href: "/dashboard/messages", cta: "Open" },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name.split(" ")[0]}</h1>
            <p className="text-gray-500 text-sm mt-0.5 capitalize">{user.role.toLowerCase()} account</p>
          </div>
          {user.role === "LANDLORD" && (
            <Link href="/dashboard/properties/new" className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
              <Plus size={16} /> List Property
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="mb-3">{c.icon}</div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
              <p className="text-xs text-red-600 font-medium mt-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {c.cta} <ChevronRight size={12} />
              </p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/properties" className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-1">Browse Properties</h3>
            <p className="text-sm text-gray-500">Find flats, rooms and houses near you.</p>
          </Link>
          {user.role === "LANDLORD" && (
            <Link href="/dashboard/properties/new" className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Add New Property</h3>
              <p className="text-sm text-gray-500">List your property and reach thousands of tenants.</p>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
