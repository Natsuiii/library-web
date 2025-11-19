"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { AUTH_KEY, CART_KEY, CartItem, User } from "@/lib/constant";
import { LoginSuccessResponse } from "@/lib/api/constant";
import {
  loadCartForCurrentUser,
  saveCartForCurrentUser,
} from "@/lib/cart/constant";
import { getAuthFromStorage } from "@/lib/api/function";



export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuthFromStorage();
    if (auth?.user) setUser(auth.user);
    else router.push("/login");
    const loaded = loadCartForCurrentUser();
    setItems(loaded);
  }, []);

  const allChecked = items.length > 0 && items.every((item) => item.isChecked);
  const selectedCount = items.filter((item) => item.isChecked).length;

  const handleToggleAll = (checked: boolean) => {
    const updated = items.map((item) => ({ ...item, isChecked: checked }));
    setItems(updated);
    saveCartForCurrentUser(updated);
  };

  const handleToggleItem = (id: number, checked: boolean) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, isChecked: checked } : item
    );
    setItems(updated);
    saveCartForCurrentUser(updated);
  };

  const handleBorrowClick = () => {
    if (selectedCount === 0) return;
    router.push("/checkout");
  };

  return (
    <>
      <Header />

      <main className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
          <section className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
              My Cart
            </h1>

            {items.length === 0 && (
              <p className="text-sm text-slate-500">Your cart is empty.</p>
            )}

            {items.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    checked={allChecked}
                    onChange={(e) => handleToggleAll(e.target.checked)}
                  />
                  <span className="text-sm text-slate-700">Select All</span>
                </div>

                <div className="divide-y divide-slate-200">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        checked={item.isChecked}
                        onChange={(e) =>
                          handleToggleItem(item.id, e.target.checked)
                        }
                      />

                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-20 h-28 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center">
                          {item.coverImage ? (
                            <Image
                              src={item.coverImage}
                              alt={item.title}
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
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <aside className="w-full md:w-80">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Loan Summary
              </h2>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-slate-500">Total Book</span>
                <span className="font-semibold text-slate-900">
                  {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
                </span>
              </div>

              <Button
                className="mt-6 w-full rounded-full bg-blue-600 hover:bg-blue-700"
                type="button"
                disabled={selectedCount === 0}
                onClick={handleBorrowClick}
              >
                Borrow Book
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
