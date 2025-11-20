"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterApiResponse = {
  success: boolean;
  message: string;
  data?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

const REGISTER_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/auth/register";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // hanya untuk UI (API tidak butuh)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!phone.trim()) newErrors.phone = "Nomor handphone is required";

    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const res = await axios.post<RegisterApiResponse>(REGISTER_URL, {
        name,
        email,
        password,
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Register failed");
      }

      toast.success("Registered successfully", {
        description: "Please login using your new account.",
        position: "top-right",
      });

      window.location.href = "/login";
    } catch (err: any) {
      toast.error("Register failed", {
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unknown error",
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-6 text-blue-600"><BookOpen className="h-4 w-4" /></div>
          <span className="font-semibold text-slate-900">Booky</span>
        </div>

        <h1 className="text-xl font-semibold text-slate-900">Register</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create your account to start borrowing books.
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-slate-700">Name</Label>
            <Input
              className={`rounded-md ${
                errors.name ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-700">Email</Label>
            <Input
              type="email"
              className={`rounded-md ${
                errors.email ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-700">Nomor Handphone</Label>
            <Input
              className={`rounded-md ${
                errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""
              }`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder=""
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-700">Password</Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                className={`pr-10 rounded-md ${
                  errors.password
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-slate-700">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                className={`pr-10 rounded-md ${
                  errors.confirmPassword
                    ? "border-red-400 focus-visible:ring-red-400"
                    : ""
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>

          <p className="text-xs text-center text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
