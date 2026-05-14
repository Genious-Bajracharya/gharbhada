import Link from "next/link";
import { Home } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-base mb-3">
            <Home size={18} /> GharBhada
          </Link>
          <p className="leading-relaxed">Find flats, rooms, houses &amp; land across Nepal.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Browse</h4>
          <ul className="space-y-2">
            <li><Link href="/properties?type=FLAT" className="hover:text-white transition-colors">Flats</Link></li>
            <li><Link href="/properties?type=HOUSE" className="hover:text-white transition-colors">Houses</Link></li>
            <li><Link href="/properties?type=ROOM" className="hover:text-white transition-colors">Rooms</Link></li>
            <li><Link href="/properties?type=LAND" className="hover:text-white transition-colors">Land</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Cities</h4>
          <ul className="space-y-2">
            <li><Link href="/properties?city=Kathmandu" className="hover:text-white transition-colors">Kathmandu</Link></li>
            <li><Link href="/properties?city=Pokhara" className="hover:text-white transition-colors">Pokhara</Link></li>
            <li><Link href="/properties?city=Lalitpur" className="hover:text-white transition-colors">Lalitpur</Link></li>
            <li><Link href="/properties?city=Bhaktapur" className="hover:text-white transition-colors">Bhaktapur</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2">
            <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © {new Date().getFullYear()} GharBhada Nepal. All rights reserved.
      </div>
    </footer>
  );
}
