"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import axios from "axios";
import { toast } from "sonner";

import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { AUTH_KEY, CART_KEY, CartItem, User } from "@/lib/constant";
import { LoginSuccessResponse } from "@/lib/api/constant";
import { loadCartForCurrentUser, saveCartForCurrentUser } from "@/lib/cart/constant";

function getCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[] | any[];

    return parsed.map((item) => ({
      id: item.id,
      title: item.title ?? "",
      categoryName: item.categoryName ?? "",
      authorName: item.authorName ?? "",
      coverImage: item.coverImage ?? null,
      isChecked: typeof item.isChecked === "boolean" ? item.isChecked : false,
    }));
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getAuthFromStorage(): LoginSuccessResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoginSuccessResponse;
  } catch {
    return null;
  }
}

const LOANS_URL = "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/loans";

export default function CheckoutPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [borrowDate, setBorrowDate] = useState<string>(() =>
    dayjs().format("YYYY-MM-DD")
  );
  const [duration, setDuration] = useState<number>(3);

  const [agreeReturn, setAgreeReturn] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const auth = getAuthFromStorage();
    if (auth?.user) setUser(auth.user);
    else router.push("/login");

    const cart = loadCartForCurrentUser();
    const selected = cart.filter((item) => item.isChecked);
    setCartItems(selected);
  }, []);

  const returnDateLabel = useMemo(() => {
    if (!borrowDate) return "-";
    return dayjs(borrowDate).add(duration, "day").format("DD MMMM YYYY");
  }, [borrowDate, duration]);

  const canSubmit =
    cartItems.length > 0 && agreeReturn && agreePolicy && !isSubmitting;

  const handleConfirmBorrow = async () => {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);

      if (cartItems.length === 0) {
        toast.warning("No selected books to borrow");
        return;
      }

      const results: { success: number; failed: string[] } = {
        success: 0,
        failed: [],
      };

      for (const item of cartItems) {
        try {
          const res = await axios.post(
            LOANS_URL,
            {
              bookId: item.id,
              days: duration,
            },
            {
              headers: {
                Authorization: `Bearer ${getAuthFromStorage()?.token || ""}`,
              },
            }
          );

          const data = res.data as {
            success: boolean;
            message: string;
          };

          if (data.success) {
            results.success += 1;
          } else {
            results.failed.push(
              data.message || `Failed to borrow book ID ${item.id}`
            );
          }
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            `Failed to borrow book ID ${item.id}`;
          results.failed.push(message);
        }
      }

      const allCart = loadCartForCurrentUser();
      const borrowedIds = new Set(
        results.success > 0 ? cartItems.map((i) => i.id) : []
      );
      const remaining = allCart.filter((i) => !borrowedIds.has(i.id));
      saveCartForCurrentUser(remaining);

      if (results.success > 0) {
        toast.success("Borrow success", {
          description: `You have borrowed ${results.success} book${
            results.success > 1 ? "s" : ""
          }.`,
        });
      }

      if (results.failed.length > 0) {
        toast.warning("Some books could not be borrowed", {
          description: results.failed.join(" | "),
        });
      }

      if (results.success > 0 && results.failed.length === 0) {
        router.push("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <main className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
          <section className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6">
              Checkout
            </h1>

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-900">
                User Information
              </h2>
              <div className="mt-3 border-t border-slate-200 pt-3 text-xs md:text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Name</span>
                  <span className="text-slate-900 font-medium">
                    {user?.name ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-900 font-medium">
                    {user?.email ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Nomor Handphone</span>
                  <span className="text-slate-900 font-medium">
                    {user?.phone ?? "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Book List
              </h2>

              {cartItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No selected books from your cart.
                </p>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-24 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                        {item.coverImage ? (
                          <Image
                            src={item.coverImage}
                            alt={item.title}
                            width={64}
                            height={96}
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
                          {item.categoryName || "Category"}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">
                          {item.title || "Book Name"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.authorName || "Author name"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="w-full md:w-80">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-5">
              <h2 className="text-sm md:text-base font-semibold text-slate-900">
                Complete Your Borrow Request
              </h2>

              <div className="mt-4">
                <label className="block text-xs text-slate-500 mb-1">
                  Borrow Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                  value={borrowDate}
                  disabled
                  onChange={(e) => setBorrowDate(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Borrow Duration</p>
                <div className="space-y-1 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="duration"
                      value={3}
                      checked={duration === 3}
                      onChange={() => setDuration(3)}
                    />
                    <span>3 Days</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="duration"
                      value={5}
                      checked={duration === 5}
                      onChange={() => setDuration(5)}
                    />
                    <span>5 Days</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="duration"
                      value={10}
                      checked={duration === 10}
                      onChange={() => setDuration(10)}
                    />
                    <span>10 Days</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-0.5">
                  Return Date
                </p>
                <p>
                  Please return the book(s) no later than{" "}
                  <span className="text-red-500 font-semibold">
                    {returnDateLabel}
                  </span>
                  .
                </p>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={agreeReturn}
                    onChange={(e) => setAgreeReturn(e.target.checked)}
                  />
                  <span>
                    I agree to return the book(s) before the due date.
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={agreePolicy}
                    onChange={(e) => setAgreePolicy(e.target.checked)}
                  />
                  <span>I accept the library borrowing policy.</span>
                </label>
              </div>

              <Button
                className="mt-6 w-full rounded-full bg-blue-600 hover:bg-blue-700"
                type="button"
                disabled={!canSubmit}
                onClick={handleConfirmBorrow}
              >
                {isSubmitting ? "Processing..." : "Confirm & Borrow"}
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
