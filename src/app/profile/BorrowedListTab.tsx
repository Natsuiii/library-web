"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getAuthFromStorage } from "@/lib/api/function";
import ReviewDialog from "@/components/ReviewDialog";
import { toast } from "sonner";

type LoanStatus = "BORROWED" | "RETURNED" | string;

type Loan = {
  id: number;
  userId: number;
  bookId: number;
  status: LoanStatus;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  book: {
    id: number;
    title: string;
    coverImage: string | null;
    // API tidak kasih category/author, jadi kita tampilkan "-" / placeholder
  };
};

type LoansMyApiResponse = {
  success: boolean;
  message: string;
  data: {
    loans: Loan[];
  };
};

const LOANS_MY_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/loans/my";

async function fetchMyLoans(token: string): Promise<Loan[]> {
  const res = await axios.get<LoansMyApiResponse>(LOANS_MY_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load loans");
  }

  return res.data.data.loans ?? [];
}

type FilterTab = "ALL" | "ACTIVE" | "RETURNED" | "OVERDUE";

export default function BorrowedListTab() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("ALL");
  const [visibleCount, setVisibleCount] = useState(5);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>("");

  useEffect(() => {
    const token = getAuthFromStorage();
    setToken(token?.token.toString() ?? null);
  }, []);

  const {
    data: loans,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myLoans"],
    queryFn: () => fetchMyLoans(token as string),
    enabled: !!token,
  });

  const loansWithComputedStatus = useMemo(() => {
    const now = dayjs();
    return (loans ?? []).map((l) => {
      const isOverdue = l.status === "BORROWED" && now.isAfter(dayjs(l.dueAt));
      return {
        ...l,
        computedStatus: isOverdue ? "OVERDUE" : l.status,
      };
    });
  }, [loans]);

  const filteredLoans = useMemo(() => {
    let list = loansWithComputedStatus;

    if (filter === "ACTIVE") {
      list = list.filter((l) => l.computedStatus === "BORROWED");
    } else if (filter === "RETURNED") {
      list = list.filter((l) => l.computedStatus === "RETURNED");
    } else if (filter === "OVERDUE") {
      list = list.filter((l) => l.computedStatus === "OVERDUE");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.book.title.toLowerCase().includes(q));
    }

    return list;
  }, [loansWithComputedStatus, filter, search]);

  const visibleLoans = filteredLoans.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredLoans.length;

  const badgeForStatus = (s: string) => {
    if (s === "BORROWED") {
      return (
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
          Active
        </span>
      );
    }
    if (s === "RETURNED") {
      return (
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
          Returned
        </span>
      );
    }
    if (s === "OVERDUE") {
      return (
        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
          Overdue
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
        {s}
      </span>
    );
  };

  return (
    <div className="mt-6">
      <h1 className="text-xl font-semibold text-slate-900 mb-3">
        Borrowed List
      </h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          className="w-full pl-9 pr-3 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
          placeholder="Search book"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(5);
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {(["ALL", "ACTIVE", "RETURNED", "OVERDUE"] as FilterTab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setFilter(t);
              setVisibleCount(5);
            }}
            className={`px-3 py-1 rounded-full border transition
                ${
                  filter === t
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                }`}
          >
            {t === "ALL"
              ? "All"
              : t === "ACTIVE"
              ? "Active"
              : t === "RETURNED"
              ? "Returned"
              : "Overdue"}
          </button>
        ))}
      </div>

      {!token && (
        <p className="mt-4 text-sm text-red-500">You are not logged in.</p>
      )}

      {token && isLoading && (
        <p className="mt-4 text-sm text-slate-500">Loading borrowed books...</p>
      )}

      {token && isError && (
        <p className="mt-4 text-sm text-red-500">
          {(error as Error)?.message || "Failed to load borrowed books"}
        </p>
      )}

      {token && !isLoading && !isError && (
        <>
          {visibleLoans.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No borrowed books found.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {visibleLoans.map((loan) => {
                const statusShow = loan.computedStatus;
                const durationDays = Math.max(
                  dayjs(loan.dueAt).diff(dayjs(loan.borrowedAt), "day"),
                  0
                );

                return (
                  <div
                    key={loan.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Status</span>
                        {badgeForStatus(statusShow)}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Due Date</span>
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {dayjs(loan.dueAt).format("DD MMMM YYYY")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-4 py-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-28 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                          {loan.book.coverImage ? (
                            <Image
                              src={loan.book.coverImage}
                              alt={loan.book.title}
                              width={80}
                              height={112}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 text-center px-2">
                              No cover image
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-medium text-slate-700">
                            Category
                          </div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">
                            {loan.book.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            Author name
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {dayjs(loan.borrowedAt).format("DD MMM YYYY")} •
                            Duration {durationDays || "-"} Days
                          </div>
                        </div>
                      </div>

                      <Button
                        className="rounded-full bg-blue-600 hover:bg-blue-700 px-6"
                        onClick={() => {
                          setSelectedBookId(loan.book.id);
                          setSelectedBookTitle(loan.book.title);
                          setReviewOpen(true);
                        }}
                      >
                        Give Review
                      </Button>
                    </div>
                  </div>
                );
              })}

              {canLoadMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    className="rounded-full px-8"
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedBookId !== null && token && (
        <ReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          bookId={selectedBookId}
          bookTitle={selectedBookTitle}
          token={token}
          onSuccess={() =>
            toast.success("Successfully reviewed", {
              position: "top-right",
              style: {
                "--normal-bg":
                  "light-dark(var(--color-green-600), var(--color-green-400))",
                "--normal-text": "var(--color-white)",
                "--normal-border":
                  "light-dark(var(--color-green-600), var(--color-green-400))",
              } as React.CSSProperties,
            })
          }
        />
      )}
    </div>
  );
}
