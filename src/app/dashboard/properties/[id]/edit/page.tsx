"use client";

import { useEffect, useState } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyImageUpload from "@/components/properties/PropertyImageUpload";
import api from "@/lib/axios";
import { MapPin } from "lucide-react";
import { showToast } from "@/components/Toast";

const LocationPicker = dynamic(() => import("@/components/properties/LocationPicker"), { ssr: false });

const optNum = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().positive().optional()
);
const optInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().int().optional()
);

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["FLAT", "HOUSE", "ROOM", "LAND", "COMMERCIAL"]),
  purpose: z.enum(["RENT", "SALE", "BOTH"]),
  price: z.coerce.number().positive("Price must be positive"),
  negotiable: z.boolean().default(false),
  deposit: optNum,
  address: z.string().min(5),
  city: z.string().min(1, "City required"),
  district: z.string().min(1, "District required"),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  area: optNum,
  floor: optInt,
  totalFloors: optInt,
  bedrooms: optInt,
  bathrooms: optInt,
  attachedBathroom: z.boolean().default(false),
  parking: z.boolean().default(false),
  furnished: z.boolean().default(false),
  waterSupply: z.boolean().default(false),
  electricity: z.boolean().default(false),
  internet: z.boolean().default(false),
  security: z.boolean().default(false),
  lift: z.boolean().default(false),
  garden: z.boolean().default(false),
  rooftopAccess: z.boolean().default(false),
});

type PropertyFormValues = z.infer<typeof schema>;

const FEATURES = [
  { key: "attachedBathroom", label: "Attached Bathroom" },
  { key: "parking", label: "Parking" },
  { key: "furnished", label: "Furnished" },
  { key: "waterSupply", label: "Water Supply" },
  { key: "electricity", label: "Electricity" },
  { key: "internet", label: "Internet" },
  { key: "security", label: "Security" },
  { key: "lift", label: "Lift" },
  { key: "garden", label: "Garden" },
  { key: "rooftopAccess", label: "Rooftop Access" },
] as const;

const DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur", "Kaski", "Morang", "Rupandehi", "Kailali", "Sunsari", "Bara", "Parsa"];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [locating, setLocating] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PropertyFormValues>({
    resolver: zodResolver(schema) as Resolver<PropertyFormValues>,
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/properties/${propertyId}`);
        const prop = res.data.data;

        setValue("title", prop.title);
        setValue("description", prop.description);
        setValue("type", prop.type);
        setValue("purpose", prop.purpose);
        setValue("price", prop.price);
        setValue("negotiable", prop.negotiable);
        if (prop.deposit) setValue("deposit", prop.deposit);
        setValue("address", prop.address);
        setValue("city", prop.city);
        setValue("district", prop.district);
        setValue("lat", prop.lat);
        setValue("lng", prop.lng);
        if (prop.area) setValue("area", prop.area);
        if (prop.floor) setValue("floor", prop.floor);
        if (prop.totalFloors) setValue("totalFloors", prop.totalFloors);
        if (prop.bedrooms) setValue("bedrooms", prop.bedrooms);
        if (prop.bathrooms) setValue("bathrooms", prop.bathrooms);

        if (prop.features) {
          Object.entries(prop.features).forEach(([key, value]) => {
            setValue(key as any, value);
          });
        }

        setImages(prop.images || []);
        setVideoUrl(prop.videoUrl || "");
        setLoading(false);
      } catch (err) {
        showToast("Failed to load property", "error");
        router.push("/dashboard/properties");
      }
    };

    if (propertyId) fetchProperty();
  }, [propertyId, setValue, router]);

  const getLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("lat", pos.coords.latitude);
        setValue("lng", pos.coords.longitude);
        setLocating(false);
      },
      () => { alert("Could not get location. Enter lat/lng manually."); setLocating(false); }
    );
  };

  const onSubmit = async (data: PropertyFormValues) => {
    if (images.length === 0) { alert("Please have at least one photo."); return; }

    const { attachedBathroom, parking, furnished, waterSupply, electricity, internet, security, lift, garden, rooftopAccess, deposit, area, floor, totalFloors, bedrooms, bathrooms, ...rest } = data;

    const payload = {
      ...rest,
      deposit: deposit || undefined,
      area: area || undefined,
      floor: floor || undefined,
      totalFloors: totalFloors || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      images,
      videoUrl: videoUrl || undefined,
      features: { attachedBathroom, parking, furnished, waterSupply, electricity, internet, security, lift, garden, rooftopAccess },
    };

    try {
      await api.patch(`/properties/${propertyId}`, payload);
      showToast("Property updated successfully!", "success");
      router.push("/dashboard/properties");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message ?? "Failed to update listing";
      showToast(errorMsg, "error");
    }
  };

  const purpose = watch("purpose");

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Property</h1>
        <p className="text-gray-500 text-sm mb-8">Update your property details below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select {...register("type")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400">
                  {["FLAT", "HOUSE", "ROOM", "LAND", "COMMERCIAL"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Listed For</label>
                <select {...register("purpose")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400">
                  <option value="RENT">Rent</option>
                  <option value="SALE">Sale</option>
                  <option value="BOTH">Rent &amp; Sale</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input {...register("title")} placeholder="e.g. 2BHK Flat in Baneshwor, Kathmandu" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register("description")} rows={4} placeholder="Describe the property in detail..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 resize-none" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-semibold text-gray-900">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Rs.) {purpose !== "SALE" && <span className="text-gray-400 font-normal">per month</span>}
                </label>
                <input {...register("price")} type="number" placeholder="15000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              {purpose !== "SALE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deposit (Rs.) <span className="text-gray-400 font-normal">optional</span></label>
                  <input {...register("deposit")} type="number" placeholder="30000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400" />
                </div>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input {...register("negotiable")} type="checkbox" className="rounded accent-red-600" />
              Price is negotiable
            </label>
          </section>

          {/* Location */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-semibold text-gray-900">Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input {...register("address")} placeholder="Street / Tole / Landmark" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400" />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input {...register("city")} placeholder="Kathmandu" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select {...register("district")} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400">
                  <option value="">Select district</option>
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
              </div>
            </div>
            <LocationPicker
              lat={watch("lat") || 27.7172}
              lng={watch("lng") || 85.324}
              onLocationChange={(lat, lng, address, city, district) => {
                setValue("lat", lat);
                setValue("lng", lng);
                if (address) setValue("address", address);
                if (city) setValue("city", city);
                if (district) setValue("district", district);
              }}
            />
            <button type="button" onClick={getLocation} className="flex items-center gap-2 text-sm text-red-600 font-medium hover:underline mt-3">
              <MapPin size={15} /> {locating ? "Getting location..." : "Or use my current location"}
            </button>
          </section>

          {/* Property Details */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-semibold text-gray-900">Property Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "bedrooms" as const, label: "Bedrooms" },
                { name: "bathrooms" as const, label: "Bathrooms" },
                { name: "area" as const, label: "Area (sq.ft)" },
                { name: "floor" as const, label: "Floor" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input {...register(name)} type="number" min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400" />
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Features &amp; Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FEATURES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input {...register(key)} type="checkbox" className="rounded accent-red-600" />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {/* Photos & Video */}
          <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Photos &amp; Video</h2>
            <PropertyImageUpload
              images={images}
              videoUrl={videoUrl}
              onImagesChange={setImages}
              onVideoChange={setVideoUrl}
            />
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 text-sm"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
