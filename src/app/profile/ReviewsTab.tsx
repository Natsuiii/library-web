"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { getAuthFromStorage } from "@/lib/api/function";

type Review = {
  id: number;
  star: number;
  comment: string;
  userId: number;
  bookId: number;
  createdAt: string;
  book: {
    id: number;
    title: string;
    coverImage: string | null;
  };
};

type ReviewsApiResponse = {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

const MY_REVIEWS_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/me/reviews";

async function fetchMyReviews(token: string, page: number) {
  const res = await axios.get<ReviewsApiResponse>(MY_REVIEWS_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page, limit: 20 },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load reviews");
  }

  return res.data.data;
}

export default function ReviewsTab() {
  const [token, setToken] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = getAuthFromStorage();
    setToken(token?.token.toString() ?? null);
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["myReviews", page],
    queryFn: () => fetchMyReviews(token as string, page),
    enabled: !!token,
  });

  const reviews = data?.reviews ?? [];
  const pagination = data?.pagination;

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return reviews;
    const q = search.toLowerCase();
    return reviews.filter((r) =>
      r.book.title.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const canLoadMore =
    !!pagination &&
    pagination.page < pagination.totalPages &&
    !isFetching;

  return (
    <div className="mt-6">
      <h1 className="text-xl font-semibold text-slate-900 mb-3">
        Reviews
      </h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
          placeholder="Search Reviews"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!token && (
        <p className="mt-4 text-sm text-red-500">
          You are not logged in.
        </p>
      )}

      {token && isLoading && (
        <p className="mt-4 text-sm text-slate-500">
          Loading reviews...
        </p>
      )}

      {token && isError && (
        <p className="mt-4 text-sm text-red-500">
          {(error as Error)?.message || "Failed to load reviews"}
        </p>
      )}

      {token && !isLoading && !isError && (
        <>
          {filteredReviews.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No reviews found.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {filteredReviews.map((rev: Review) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="px-4 py-3 text-xs text-slate-500">
                    {dayjs(rev.createdAt).format("DD MMMM YYYY, HH:mm")}
                  </div>

                  <hr />

                  <div className="px-4 py-4 flex items-center gap-4">
                    <Link
                      href={`/books/${rev.book.id}`}
                      className="w-16 h-20 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0"
                    >
                      {rev.book.coverImage ? (
                        <Image
                          src={rev.book.coverImage}
                          alt={rev.book.title}
                          width={64}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 text-center px-1">
                          No cover image
                        </span>
                      )}
                    </Link>

                    <div>
                      <div className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-700">
                        Category
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {rev.book.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        Author name
                      </div>
                    </div>
                  </div>

                  <hr />

                  <div className="px-4 py-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const filled = i + 1 <= rev.star;
                        return (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              filled
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        );
                      })}
                    </div>

                    <p className="text-sm text-slate-700 leading-relaxed">
                      {rev.comment || "-"}
                    </p>
                  </div>
                </div>
              ))}

              {canLoadMore && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="text-sm px-6 py-2 rounded-full border border-slate-200 hover:bg-slate-50"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
