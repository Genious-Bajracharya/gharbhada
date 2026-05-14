"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Video } from "lucide-react";
import api from "@/lib/axios";

interface Props {
  images: string[];
  videoUrl?: string;
  onImagesChange: (urls: string[]) => void;
  onVideoChange: (url: string) => void;
}

export default function PropertyImageUpload({ images, videoUrl, onImagesChange, onVideoChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList) => {
    if (images.length + files.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("images", f));
      const { data } = await api.post("/uploads/images", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onImagesChange([...images, ...data.data.urls]);
    } catch {
      alert("Image upload failed. Check Cloudinary config.");
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const form = new FormData();
      form.append("video", file);
      const { data } = await api.post("/uploads/video", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onVideoChange(data.data.url);
    } catch {
      alert("Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeImage = (url: string) => onImagesChange(images.filter((i) => i !== url));

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Photos <span className="text-gray-400 font-normal">({images.length}/10)</span>
        </label>

        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-red-400 transition-colors"
          onClick={() => imageRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
        >
          <Upload className="mx-auto text-gray-400 mb-2" size={28} />
          {uploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600">Click or drag photos here</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — up to 10 images</p>
            </>
          )}
          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          />
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
            {images.map((url, i) => (
              <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image src={url} alt={`Property image ${i + 1}`} fill className="object-cover" sizes="150px" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">Cover</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Video Tour (optional)</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-red-400 transition-colors"
          onClick={() => videoRef.current?.click()}
        >
          <Video className="mx-auto text-gray-400 mb-1" size={22} />
          {uploadingVideo ? (
            <p className="text-sm text-gray-500">Uploading video...</p>
          ) : videoUrl ? (
            <p className="text-sm text-green-600 font-medium">Video uploaded ✓</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-600">Upload a walkthrough video</p>
              <p className="text-xs text-gray-400 mt-0.5">MP4, MOV — up to 100MB</p>
            </>
          )}
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  );
}
