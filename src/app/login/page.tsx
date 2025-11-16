"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import axios from "axios";
import type { AppDispatch } from "@/store";
import { setCredentials } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, BookOpen } from "lucide-react";

const LOGIN_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/auth/login";

type LoginRequest = {
  email: string;
  password: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type LoginSuccessResponse = {
  token: string;
  user: User;
};

type LoginApiResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
};

async function loginApi(values: LoginRequest): Promise<LoginSuccessResponse> {
  try {
    const res = await axios.post<LoginApiResponse>(LOGIN_URL, values);
    const body = res.data;

    if (!body.success) {
      throw new Error(body.message || "Invalid credentials");
    }

    return {
      token: body.data.token,
      user: body.data.user,
    };
  } catch (err: any) {
    const apiMessage: string | undefined = err?.response?.data?.message;
    if (apiMessage) {
      throw new Error(apiMessage);
    }

    throw new Error("Login failed. Please try again.");
  }
}

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          token: data.token,
          user: data.user,
        })
      );

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            token: data.token,
            user: data.user,
          })
        );
      }

      router.push("/");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Login failed";
      setFormError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    loginMutation.mutate({ email, password });
  };

  const isLoading = loginMutation.isPending;

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="font-semibold text-lg text-slate-900">
              Booky
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sign in to manage your library account.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-slate-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={`h-9 text-sm text-slate-900 ${
                fieldErrors.email
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-slate-700"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }
                }}
                className={`h-9 pr-10 text-sm text-slate-900 ${
                  fieldErrors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
          )}

          <Button
            type="submit"
            className="w-full h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-sm"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </main>
  );
}
