"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { Ban, CheckCircle } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") { router.push("/dashboard"); return; }
    api.get("/users/")
      .then((r) => setUsers(r.data.data.users))
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleToggle = async (userId: string, currentActive: boolean) => {
    setToggling(userId);
    try {
      await api.patch(`/users/${userId}/suspend`, { isActive: !currentActive });
      setUsers((u) => u.map((user) => user.id === userId ? { ...user, isActive: !currentActive } : user));
    } catch {
      alert("Failed to update user status");
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Users</h1>
        <p className="text-gray-500 text-sm mb-6">{users.length} total users</p>

        {loading && <div className="text-center text-gray-400">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                  <td className="py-3 px-4 text-gray-600">{u.phone}</td>
                  <td className="py-3 px-4 text-gray-600 text-xs">{u.email || "—"}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(u.id, u.isActive)}
                      disabled={toggling === u.id}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-60 ${u.isActive ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                    >
                      {u.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
