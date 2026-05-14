"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/layout/Navbar";
import api from "@/lib/axios";
import { Upload, Check, Clock, X, Camera } from "lucide-react";

const schema = z.object({
  citizenshipNo: z.string().min(1, "Citizenship number required"),
  citizenshipFront: z.string().url("Valid image URL required"),
  citizenshipBack: z.string().url("Valid image URL required"),
  selfie: z.string().url("Valid image URL required"),
});
type FormData = z.infer<typeof schema>;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock },
  VERIFIED: { bg: "bg-green-50", text: "text-green-700", icon: Check },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", icon: X },
};

export default function KYCPage() {
  const [status, setStatus] = useState<"NOT_SUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED">("NOT_SUBMITTED");
  const [rejectedReason, setRejectedReason] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleImageUpload = async (file: File, field: keyof FormData) => {
    setUploading(field);
    try {
      const form = new FormData();
      form.append("images", file);
      const { data } = await api.post("/uploads/images", form);
      register(field, { value: data.data.urls[0] });
      setUploading(null);
    } catch {
      alert("Image upload failed");
      setUploading(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/users/kyc", data);
      setStatus("PENDING");
      alert("KYC submitted for review");
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to submit KYC");
    }
  };

  const front = watch("citizenshipFront");
  const back = watch("citizenshipBack");
  const selfie = watch("selfie");

  const statusInfo = status !== "NOT_SUBMITTED" ? STATUS_STYLES[status] : null;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">KYC Verification</h1>
        <p className="text-gray-500 text-sm mb-8">Complete your identity verification to unlock all features.</p>

        {statusInfo && (
          <div className={`${statusInfo.bg} rounded-2xl border border-gray-200 p-5 mb-8 flex items-center gap-3`}>
            <statusInfo.icon className={`text-2xl ${statusInfo.text}`} size={20} />
            <div>
              <p className={`font-semibold ${statusInfo.text}`}>{status}</p>
              {rejectedReason && <p className="text-xs mt-1 text-red-600">Reason: {rejectedReason}</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6">
          {/* Citizenship Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship Number</label>
            <input
              {...register("citizenshipNo")}
              placeholder="e.g., 12-34-56-78901"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400"
            />
            {errors.citizenshipNo && <p className="text-red-500 text-xs mt-1">{errors.citizenshipNo.message}</p>}
          </div>

          {/* Citizenship Front */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship - Front Side</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-red-400 transition-colors cursor-pointer relative">
              {front ? (
                <div className="text-center">
                  <Check className="mx-auto text-green-500 mb-1" size={20} />
                  <p className="text-xs text-green-600 font-medium">Image uploaded ✓</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-sm font-medium text-gray-600">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG — Max 10MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "citizenshipFront")}
              />
            </div>
          </div>

          {/* Citizenship Back */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship - Back Side</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-red-400 transition-colors cursor-pointer relative">
              {back ? (
                <div className="text-center">
                  <Check className="mx-auto text-green-500 mb-1" size={20} />
                  <p className="text-xs text-green-600 font-medium">Image uploaded ✓</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-sm font-medium text-gray-600">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-0.5">PNG, JPG — Max 10MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "citizenshipBack")}
              />
            </div>
          </div>

          {/* Selfie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selfie</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-red-400 transition-colors cursor-pointer relative">
              {selfie ? (
                <div className="text-center">
                  <Check className="mx-auto text-green-500 mb-1" size={20} />
                  <p className="text-xs text-green-600 font-medium">Image uploaded ✓</p>
                </div>
              ) : (
                <>
                  <Camera className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-sm font-medium text-gray-600">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-0.5">Clear selfie with your face — PNG, JPG — Max 10MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "selfie")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !front || !back || !selfie}
            className="w-full bg-red-600 text-white py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 text-sm"
          >
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-blue-900 mb-2">ℹ️ Verification Info</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Your documents are securely stored and encrypted</li>
            <li>• Verification typically takes 24-48 hours</li>
            <li>• You'll receive an email notification once verified</li>
            <li>• Clear, legible images improve verification speed</li>
          </ul>
        </div>
      </div>
    </>
  );
}
