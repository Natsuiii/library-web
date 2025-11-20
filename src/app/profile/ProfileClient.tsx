"use client";

import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MeApiResponse } from "@/lib/api/constant";
import BorrowedListTab from "./BorrowedListTab";
import ReviewsTab from "./ReviewsTab";

const ME_URL = "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/me";

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

async function fetchMe(token: string) {
  const res = await axios.get<MeApiResponse>(ME_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load profile");
  }

  return res.data.data;
}

export default function ProfileClient() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getTokenFromStorage());
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe(token as string),
    enabled: !!token,
  });

  const profile = data?.profile;

  const initials = useMemo(() => {
    if (!profile?.name) return "U";
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, [profile?.name]);

  return (
    <>
      <Header />

      <main className="bg-white min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl bg-slate-100 p-1">
              <TabsTrigger value="profile" className="rounded-lg text-sm">
                Profile
              </TabsTrigger>
              <TabsTrigger value="borrowed" className="rounded-lg text-sm">
                Borrowed List
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-lg text-sm"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <h1 className="text-xl font-semibold text-slate-900 mb-4">
                Profile
              </h1>

              {!token && (
                <p className="text-sm text-red-500">You are not logged in.</p>
              )}

              {token && isLoading && (
                <p className="text-sm text-slate-500">Loading profile...</p>
              )}

              {token && isError && (
                <p className="text-sm text-red-500">
                  {(error as Error)?.message || "Failed to load profile"}
                </p>
              )}

              {token && !isLoading && !isError && profile && (
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" alt={profile.name} />
                      <AvatarFallback className="bg-slate-200 text-slate-700 font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name</span>
                        <span className="font-medium text-slate-900">
                          {profile.name}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Email</span>
                        <span className="font-medium text-slate-900">
                          {profile.email}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Nomor Handphone</span>
                        <span className="font-medium text-slate-900">
                          {profile.phone ?? "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="mt-6 w-full rounded-full bg-blue-600 hover:bg-blue-700"
                    type="button"
                    onClick={() => {
                      console.log("Update profile clicked");
                    }}
                  >
                    Update Profile
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="borrowed" className="mt-6">
              <BorrowedListTab />
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ReviewsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </>
  );
}
