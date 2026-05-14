import Link from "next/link";
import { Search, MapPin, Shield, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const CITIES = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Biratnagar", "Birgunj"];
const TYPES = [
  { label: "Flats", value: "FLAT", emoji: "🏢" },
  { label: "Houses", value: "HOUSE", emoji: "🏠" },
  { label: "Rooms", value: "ROOM", emoji: "🛏️" },
  { label: "Land", value: "LAND", emoji: "🌿" },
  { label: "Commercial", value: "COMMERCIAL", emoji: "🏪" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4">
              Find Your Perfect Home in Nepal
            </h1>
            <p className="text-red-100 text-lg mb-10">
              Search flats, rooms, houses and land for rent or sale across Nepal.
            </p>

            <form action="/properties" method="get" className="bg-white rounded-2xl shadow-xl p-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  name="city"
                  placeholder="City or district..."
                  className="w-full text-gray-800 outline-none text-sm bg-transparent"
                />
              </div>
              <select name="type" className="border border-gray-200 rounded-xl px-3 py-2 text-gray-700 text-sm outline-none">
                <option value="">All Types</option>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select name="purpose" className="border border-gray-200 rounded-xl px-3 py-2 text-gray-700 text-sm outline-none">
                <option value="">Rent &amp; Sale</option>
                <option value="RENT">For Rent</option>
                <option value="SALE">For Sale</option>
              </select>
              <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Property Types */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {TYPES.map((t) => (
              <Link
                key={t.value}
                href={`/properties?type=${t.value}`}
                className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{t.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{t.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Cities */}
        <section className="bg-gray-50 py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Cities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {CITIES.map((city) => (
                <Link
                  key={city}
                  href={`/properties?city=${city}`}
                  className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-red-400 hover:text-red-600 transition-all text-sm font-medium text-gray-700"
                >
                  <MapPin size={14} className="text-red-500" /> {city}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why GharBhada */}
        <section className="max-w-7xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why GharBhada?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="text-red-600" size={28} />, title: "Verified Listings", desc: "Every landlord is KYC-verified so you deal with real property owners only." },
              { icon: <MapPin className="text-red-600" size={28} />, title: "Map Search", desc: "Find properties within your preferred area using our radius map search." },
              { icon: <Star className="text-red-600" size={28} />, title: "Pay Rent Online", desc: "Pay monthly rent via Khalti or eSewa directly through the platform." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-red-600 text-white py-14 px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Have a Property to List?</h2>
          <p className="text-red-100 mb-6 text-sm">List your property for free and connect with verified tenants.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/register?role=LANDLORD" className="bg-white text-red-600 font-semibold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors">
              List for Free
            </Link>
            <Link href="/properties" className="border border-white text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition-colors">
              Browse Properties
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
