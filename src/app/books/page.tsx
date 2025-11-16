"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { Book, BookCategory } from "@/lib/constant";
import BookCard from "@/components/BookCard";
import { BooksApiResponse, CategoriesApiResponse } from "@/lib/api/constant";



const CATEGORIES_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/categories";

const BOOKS_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/books";

async function fetchCategories(): Promise<BookCategory[]> {
  const res = await axios.get<CategoriesApiResponse>(CATEGORIES_URL);

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load categories");
  }

  return res.data.data.categories;
}

async function fetchBooksByCategory(
  categoryId: number
): Promise<Book[]> {
  const res = await axios.get<BooksApiResponse>(BOOKS_URL, {
    params: {
      categoryId,
      page: 1,
      limit: 8,
    },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load books");
  }

  return res.data.data.books;
}


export default function BookListPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(
    null
  );

  // Categories
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  useEffect(() => {
    if (categories && categories.length > 0 && selectedCategoryId === null) {
      const fiction = categories.find(
        (c) => c.name.toLowerCase() === "fiction"
      );
      setSelectedCategoryId(fiction ? fiction.id : categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  const {
    data: books,
    isLoading: isBooksLoading,
    isError: isBooksError,
    error: booksError,
  } = useQuery({
    queryKey: ["booksByCategory", selectedCategoryId],
    queryFn: () => fetchBooksByCategory(selectedCategoryId as number),
    enabled: selectedCategoryId !== null,
  });

  const filteredBooks =
    (books ?? []).filter((book) =>
      selectedRating ? (book.rating ?? 0) >= selectedRating : true
    ) ?? [];

  const handleCategoryChange = (id: number) => {
    setSelectedCategoryId(id);
  };

  const handleRatingChange = (value: number) => {
    setSelectedRating((prev) => (prev === value ? null : value));
  };

  return (
    <>
      <Header />

      <main className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-6">
            Book List
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-64">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Filter
                </p>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Category
                  </p>

                  {isCategoriesLoading && (
                    <p className="mt-2 text-xs text-slate-500">
                      Loading categories...
                    </p>
                  )}

                  {isCategoriesError && (
                    <p className="mt-2 text-xs text-red-500">
                      {(categoriesError as Error)?.message ||
                        "Failed to load categories"}
                    </p>
                  )}

                  {!isCategoriesLoading &&
                    !isCategoriesError &&
                    categories && (
                      <div className="mt-2 space-y-2">
                        {categories.map((cat) => (
                          <label
                            key={cat.id}
                            className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300 text-blue-600"
                              checked={selectedCategoryId === cat.id}
                              onChange={() =>
                                handleCategoryChange(cat.id)
                              }
                            />
                            <span>{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase">
                    Rating
                  </p>

                  <div className="mt-2 space-y-1">
                    {[5, 4, 3, 2, 1].map((value) => (
                      <label
                        key={value}
                        className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                          checked={selectedRating === value}
                          onChange={() => handleRatingChange(value)}
                        />
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          {value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <section className="flex-1">
              {isBooksLoading && (
                <p className="text-sm text-slate-500">
                  Loading books...
                </p>
              )}

              {isBooksError && (
                <p className="text-sm text-red-500">
                  {(booksError as Error)?.message ||
                    "Failed to load books"}
                </p>
              )}

              {!isBooksLoading &&
                !isBooksError &&
                filteredBooks.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No books found for this filter.
                  </p>
                )}

              {!isBooksLoading &&
                !isBooksError &&
                filteredBooks.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} b={book} />
                    ))}
                  </div>
                )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
