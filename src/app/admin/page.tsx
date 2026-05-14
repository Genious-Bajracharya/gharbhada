"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import { HomeIcon, FileText, Users } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") router.push("/dashboard");
  }, [user, router]);

  const cards = [
    { icon: <HomeIcon className="text-blue-600" size={20} />, label: "Verify Properties", href: "/admin/properties", count: "?" },
    { icon: <FileText className="text-green-600" size={20} />, label: "Review KYC", href: "/admin/kyc", count: "?" },
    { icon: <Users className="text-purple-600" size={20} />, label: "Manage Users", href: "/admin/users", count: "?" },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Panel</h1>
        <p className="text-gray-500 mb-8">Manage properties, verify users, and maintain platform integrity.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div>{c.icon}</div>
                <span className="text-2xl font-bold text-gray-300 group-hover:text-gray-400">{c.count}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{c.label}</h3>
              <p className="text-xs text-gray-400 mt-1">Review and approve</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
