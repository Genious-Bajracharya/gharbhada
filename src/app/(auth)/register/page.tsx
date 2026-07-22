"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { Suspense } from "react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^9[6-9]\d{8}$/, "Enter a valid Nepal mobile number"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["TENANT", "LANDLORD"]),
});
type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = (params.get("role") === "LANDLORD" ? "LANDLORD" : "TENANT") as "TENANT" | "LANDLORD";
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = { ...data, email: data.email || undefined };
      const res = await api.post("/auth/register", payload);
      const { user } = res.data.data;
      setAuth(user);
      router.push("/");
    } catch (err: any) {
      setError("root", { message: err.response?.data?.message ?? "Registration failed" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 text-red-600 font-bold text-xl mb-8">
          <Home size={22} /> GharBhada
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-6">Join GharBhada Nepal</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["TENANT", "LANDLORD"] as const).map((r) => (
                <label key={r} className="cursor-pointer">
                  <input {...register("role")} type="radio" value={r} className="sr-only peer" />
                  <div className="border-2 rounded-xl px-3 py-2.5 text-center text-sm font-medium transition-colors peer-checked:border-red-500 peer-checked:text-red-600 border-gray-200 text-gray-600 hover:border-gray-300">
                    {r === "TENANT" ? "🔍 Looking for Home" : "🏠 I'm a Landlord"}
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...register("name")} placeholder="Ram Sharma" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 transition-colors" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input {...register("phone")} placeholder="98XXXXXXXX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 transition-colors" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
              <input {...register("email")} type="email" placeholder="ram@example.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 transition-colors" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input {...register("password")} type="password" placeholder="Min. 8 characters" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-red-400 transition-colors" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {errors.root && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{errors.root.message}</p>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-60">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-red-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
