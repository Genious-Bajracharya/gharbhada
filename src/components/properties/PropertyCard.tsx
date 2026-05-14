import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Bath, Maximize2, Heart } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

interface PropertyCardProps {
  id: string;
  title: string;
  type: string;
  purpose: string;
  price: number;
  city: string;
  district: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images: string[];
  status: string;
  negotiable?: boolean;
  isSaved?: boolean;
  onSaveChange?: (isSaved: boolean) => void;
}

const PURPOSE_LABEL: Record<string, string> = { RENT: "For Rent", SALE: "For Sale", BOTH: "Rent / Sale" };
const TYPE_COLOR: Record<string, string> = {
  FLAT: "bg-blue-100 text-blue-700",
  HOUSE: "bg-green-100 text-green-700",
  ROOM: "bg-yellow-100 text-yellow-700",
  LAND: "bg-orange-100 text-orange-700",
  COMMERCIAL: "bg-purple-100 text-purple-700",
};

export default function PropertyCard(props: PropertyCardProps) {
  const { id, title, type, purpose, price, city, district, bedrooms, bathrooms, area, images, status, negotiable, isSaved: initialSaved, onSaveChange } = props;
  const { user } = useAuthStore();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved ?? false);
  const [savingLoading, setSavingLoading] = useState(false);
  const img = images[0] ?? "/placeholder-property.jpg";

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }

    setSavingLoading(true);
    try {
      if (isSaved) {
        await api.delete(`/properties/${id}/save`);
      } else {
        await api.post(`/properties/${id}/save`);
      }
      const newSaved = !isSaved;
      setIsSaved(newSaved);
      onSaveChange?.(newSaved);
    } catch {
      // silently fail
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <Link href={`/properties/${id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute top-3 left-3 text-xs font-semibold bg-red-600 text-white px-2 py-1 rounded-md">
          {PURPOSE_LABEL[purpose]}
        </span>
        <button
          onClick={handleSave}
          disabled={savingLoading}
          className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white transition-colors disabled:opacity-50"
        >
          <Heart
            size={16}
            className={isSaved ? "fill-red-600 text-red-600" : "text-gray-400"}
          />
        </button>
        {status === "RENTED" && (
          <span className="absolute bottom-3 right-3 text-xs font-semibold bg-gray-800 text-white px-2 py-1 rounded-md">
            Rented
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 flex-1">{title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${TYPE_COLOR[type] ?? "bg-gray-100 text-gray-600"}`}>
            {type}
          </span>
        </div>

        <p className="flex items-center gap-1 text-gray-500 text-xs mt-1">
          <MapPin size={12} /> {city}, {district}
        </p>

        <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
          {bedrooms != null && (
            <span className="flex items-center gap-1"><Bed size={13} /> {bedrooms} bed</span>
          )}
          {bathrooms != null && (
            <span className="flex items-center gap-1"><Bath size={13} /> {bathrooms} bath</span>
          )}
          {area != null && (
            <span className="flex items-center gap-1"><Maximize2 size={13} /> {area} sq.ft</span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <p className="text-red-600 font-bold text-base">
            Rs. {price.toLocaleString()}
            {purpose !== "SALE" && <span className="text-gray-400 font-normal text-xs">/mo</span>}
          </p>
          {negotiable && <span className="text-xs text-gray-400">Negotiable</span>}
        </div>
      </div>
    </Link>
  );
}
