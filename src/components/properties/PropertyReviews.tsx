"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Send } from "lucide-react";
import api from "@/lib/axios";
import { showToast } from "@/components/Toast";
import { useAuthStore } from "@/store/auth.store";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(500, "Comment must be under 500 characters"),
});
type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string };
}

interface PropertyReviewsProps {
  propertyId: string;
  landlordId: string;
}

export default function PropertyReviews({ propertyId, landlordId }: PropertyReviewsProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userReviewId, setUserReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const selectedRating = watch("rating");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/properties/${propertyId}/reviews`);
        setReviews(data.data.reviews);
        setAverageRating(data.data.averageRating);

        if (user) {
          const existingReview = data.data.reviews.find((r: Review) => r.user.id === user.id);
          if (existingReview) setUserReviewId(existingReview.id);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [propertyId, user]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      showToast("Please log in to leave a review", "error");
      return;
    }

    setSubmitting(true);
    try {
      const { data: response } = await api.post(`/properties/${propertyId}/reviews`, data);
      setReviews([response.data, ...reviews]);
      setAverageRating((prev) => {
        const total = reviews.length + 1;
        return (prev * reviews.length + data.rating) / total;
      });
      setUserReviewId(response.data.id);
      reset();
      showToast("Review posted successfully", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message ?? "Failed to post review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      const deleted = reviews.find((r) => r.id === reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      if (deleted) {
        setAverageRating((prev) => {
          const total = Math.max(1, reviews.length - 1);
          return (prev * reviews.length - deleted.rating) / total;
        });
      }
      if (userReviewId === reviewId) setUserReviewId(null);
      showToast("Review deleted", "success");
    } catch {
      showToast("Failed to delete review", "error");
    }
  };

  const isOwnProperty = user?.id === landlordId;

  return (
    <div>
      <h2 className="font-semibold text-gray-900 mb-4">Reviews &amp; Ratings</h2>

      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Based on <span className="font-semibold">{reviews.length}</span> {reviews.length === 1 ? "review" : "reviews"}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {!isOwnProperty && user && !userReviewId && !loading && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 p-4 border border-gray-200 rounded-xl bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
          <div className="flex gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setValue("rating", i + 1)}
                onMouseEnter={() => setHoveredRating(i + 1)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={
                    i < (hoveredRating || selectedRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-red-500 text-xs mb-2">{errors.rating.message}</p>}

          <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
          <textarea
            {...register("comment")}
            placeholder="Share your experience with this property..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400 resize-none"
            rows={3}
          />
          {errors.comment && <p className="text-red-500 text-xs mt-1">{errors.comment.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting || selectedRating === 0}
            className="mt-3 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            <Send size={14} /> Post Review
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No reviews yet. Be the first to review this property!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                    {review.user.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{review.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {user?.id === review.user.id && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
