"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Property } from "@/hooks/useProperties";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";

const PropertyMap = dynamic(() => import("@/components/properties/PropertyMap"), { ssr: false });
const PropertyReviews = dynamic(() => import("@/components/properties/PropertyReviews"), { ssr: false });
import {
  MapPin, Bed, Bath, Maximize2, Eye, Phone, MessageCircle,
  CheckCircle, Home, ChevronLeft, ChevronRight, Play, Star
} from "lucide-react";

const FEATURE_LABELS: Record<string, string> = {
  attachedBathroom: "Attached Bathroom",
  parking: "Parking",
  furnished: "Furnished",
  waterSupply: "Water Supply",
  electricity: "Electricity",
  internet: "Internet",
  security: "Security",
  lift: "Lift / Elevator",
  garden: "Garden",
  rooftopAccess: "Rooftop Access",
};

const PURPOSE_LABEL: Record<string, string> = { RENT: "For Rent", SALE: "For Sale", BOTH: "Rent / Sale" };

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [contacting, setContacting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get(`/properties/${id}`),
      api.get(`/properties/${id}/reviews?limit=1`)
    ])
      .then(([propRes, reviewRes]) => {
        setProperty(propRes.data.data);
        setAverageRating(reviewRes.data.data.averageRating || 0);
        setReviewCount(reviewRes.data.data.total || 0);
      })
      .catch(() => router.push("/properties"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleContact = async () => {
    if (!user) { router.push("/login"); return; }
    setContacting(true);
    try {
      await api.post("/messages", {
        receiverId: property?.landlord.id,
        propertyId: id,
        content: `Hi, I'm interested in your property: "${property?.title}"`,
      });
      router.push("/dashboard/messages");
    } catch {
      alert("Failed to send message");
    } finally {
      setContacting(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-80 bg-gray-200 rounded-2xl" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
    </>
  );

  if (!property) return null;

  const features = Object.entries(property.features)
    .filter(([, val]) => val === true)
    .map(([key]) => FEATURE_LABELS[key] ?? key);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/properties" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to listings
        </Link>

        {/* Image Gallery */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-6 h-72 sm:h-96">
          {property.images.length > 0 ? (
            <>
              <Image
                src={property.images[imgIndex]}
                alt={property.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
              />
              {property.images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((i) => (i - 1 + property.images.length) % property.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setImgIndex((i) => (i + 1) % property.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {property.images.map((_, i) => (
                      <button key={i} onClick={() => setImgIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? "bg-white" : "bg-white/50"}`} />
                    ))}
                  </div>
                </>
              )}
              {property.videoUrl && !showVideo && (
                <button onClick={() => setShowVideo(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 text-white text-xs font-medium px-3 py-2 rounded-full hover:bg-black/80 transition-colors">
                  <Play size={14} /> Watch Tour
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Home size={48} />
            </div>
          )}
        </div>

        {showVideo && property.videoUrl && (
          <div className="mb-6">
            <video src={property.videoUrl} controls className="w-full rounded-2xl max-h-80 bg-black" />
          </div>
        )}

        {/* Thumbnails */}
        {property.images.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {property.images.map((img, i) => (
              <button key={img} onClick={() => setImgIndex(i)}
                className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIndex ? "border-red-500" : "border-transparent"}`}>
                <Image src={img} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  {PURPOSE_LABEL[property.purpose]}
                </span>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {property.type}
                </span>
                {property.status === "RENTED" && (
                  <span className="text-xs font-semibold bg-gray-800 text-white px-2 py-0.5 rounded-full">RENTED</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
              <p className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <MapPin size={14} /> {property.address}, {property.city}, {property.district}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              {property.bedrooms != null && <span className="flex items-center gap-1.5"><Bed size={16} className="text-gray-400" /> {property.bedrooms} Bedrooms</span>}
              {property.bathrooms != null && <span className="flex items-center gap-1.5"><Bath size={16} className="text-gray-400" /> {property.bathrooms} Bathrooms</span>}
              {property.area != null && <span className="flex items-center gap-1.5"><Maximize2 size={16} className="text-gray-400" /> {property.area} sq.ft</span>}
              <span className="flex items-center gap-1.5 text-gray-400"><Eye size={16} /> {property.views} views</span>
            </div>

            {features.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-3">Features &amp; Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            <PropertyReviews propertyId={id} landlordId={property.landlord.id} />

            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Location on Map</h2>
              <PropertyMap properties={[property]} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-20">
              <p className="text-3xl font-bold text-red-600">
                Rs. {property.price.toLocaleString()}
                {property.purpose !== "SALE" && <span className="text-base font-normal text-gray-400">/mo</span>}
              </p>
              {property.negotiable && <p className="text-xs text-gray-500 mt-1">Price is negotiable</p>}
              {property.deposit && <p className="text-sm text-gray-600 mt-1">Deposit: Rs. {property.deposit.toLocaleString()}</p>}

              {reviewCount > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}

              <div className="border-t border-gray-100 my-4" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                  {property.landlord.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{property.landlord.name}</p>
                  <p className="text-xs text-gray-400">Property Owner</p>
                </div>
              </div>

              <a
                href={`tel:${property.landlord.phone}`}
                className="flex items-center justify-center gap-2 w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:border-red-400 hover:text-red-600 transition-colors mb-2"
              >
                <Phone size={15} /> {property.landlord.phone}
              </a>

              {property.status !== "RENTED" && (
                <button
                  onClick={handleContact}
                  disabled={contacting || user?.id === property.landlord.id}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  <MessageCircle size={15} />
                  {contacting ? "Sending..." : "Message Landlord"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
