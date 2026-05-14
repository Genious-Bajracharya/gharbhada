"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Home, Plus, User } from "lucide-react";

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardHref =
    user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-red-600">
            <Home size={22} />
            GharBhada
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/properties" className="hover:text-red-600 transition-colors">Browse</Link>
            {user?.role === "LANDLORD" && (
              <Link href="/dashboard/properties/new" className="hover:text-red-600 transition-colors flex items-center gap-1">
                <Plus size={16} /> List Property
              </Link>
            )}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:text-red-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <p className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100">{user.name}</p>
                    <Link href={dashboardHref} className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/dashboard/kyc" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      KYC
                    </Link>
                    {user.role === "LANDLORD" && (
                      <Link href="/dashboard/saved" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                        Saved Properties
                      </Link>
                    )}
                    <button
                      onClick={() => { clearAuth(); window.location.href = "/"; setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-t border-gray-100 text-red-600 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="hover:text-red-600 transition-colors">Login</Link>
                <Link href="/register" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 text-sm font-medium">
          <Link href="/properties" onClick={() => setOpen(false)}>Browse Properties</Link>
          {user?.role === "LANDLORD" && (
            <Link href="/dashboard/properties/new" onClick={() => setOpen(false)}>List a Property</Link>
          )}
          {user ? (
            <>
              <Link href={dashboardHref} onClick={() => setOpen(false)}>Dashboard</Link>
              <Link href="/dashboard/kyc" onClick={() => setOpen(false)}>KYC</Link>
              {user.role === "LANDLORD" && (
                <Link href="/dashboard/saved" onClick={() => setOpen(false)}>Saved Properties</Link>
              )}
              <button onClick={() => { clearAuth(); setOpen(false); window.location.href = "/"; }} className="text-left text-red-600 font-medium">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link href="/register" className="text-red-600 font-semibold" onClick={() => setOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
