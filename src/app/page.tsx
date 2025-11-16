"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Header } from "@/components/layouts/header";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layouts/footer";
import BookCard from "@/components/BookCard";
import { Author, Book } from "@/lib/constant";
import { AuthorBooksApiResponse, AuthorsApiResponse, RecommendApiResponse } from "@/lib/api/constant";
import AuthorCard from "@/components/AuthorCard";


const RECOMMEND_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/books/recommend";

async function fetchRecommendedBooks(limit: number): Promise<Book[]> {
  const res = await axios.get<RecommendApiResponse>(RECOMMEND_URL, {
    params: { limit },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load recommendations");
  }

  return res.data.data.books;
}

const AUTHORS_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/authors";

async function fetchAuthors(): Promise<Author[]> {
  const res = await axios.get<AuthorsApiResponse>(AUTHORS_URL);

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load authors");
  }

  return res.data.data.authors;
}

async function fetchAuthorBooksCount(authorId: number): Promise<number> {
  const res = await axios.get<AuthorBooksApiResponse>(
    `${AUTHORS_URL}/${authorId}/books`
  );

  if (!res.data.success) {
    throw new Error(
      res.data.message || "Failed to load author's books"
    );
  }

  return res.data.data.books.length;
}

const heroSlides = [
  { id: 1, image: "/hero-welcome.png" },
  { id: 2, image: "/hero-welcome.png" },
  { id: 3, image: "/hero-welcome.png" },
];

const categories = [
  { id: 1, name: "Fiction", icon: "/categories/fiction.png" },
  { id: 2, name: "Non-Fiction", icon: "/categories/non-fiction.png" },
  { id: 3, name: "Self-Improvement", icon: "/categories/self-improvement.png" },
  { id: 4, name: "Finance", icon: "/categories/finance.png" },
  { id: 5, name: "Science", icon: "/categories/science.png" },
  { id: 6, name: "Education", icon: "/categories/education.png" },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [limit, setLimit] = useState(10);

  const search = useSelector((state: RootState) => state.ui.search);

  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["recommendedBooks", limit],
    queryFn: () => fetchRecommendedBooks(limit),
  });

  const {
    data: authors,
    isLoading: isAuthorsLoading,
    isError: isAuthorsError,
    error: authorsError,
  } = useQuery({
    queryKey: ["authors"],
    queryFn: fetchAuthors,
  });

  const topAuthors = authors?.slice(0, 4) ?? [];

  const filteredBooks =
    books?.filter((book) =>
      book.title.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const handleLoadMore = () => {
    setLimit((prev) => prev + 10);
  };

  return (
    <>
      <Header />

      <main className="bg-white">
        <div className="max-w-6xl mx-auto px-4 pb-10 pt-6">
          <section>
            <div className="relative w-full overflow-hidden rounded-3xl shadow-sm">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentSlide * 100}%)`,
                }}
              >
                {heroSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="min-w-full bg-gradient-to-b from-sky-300 to-sky-100"
                  >
                    <Image
                      src={slide.image}
                      alt="Welcome to Booky"
                      width={1440}
                      height={400}
                      className="w-full h-[220px] sm:h-[260px] md:h-[280px] object-cover"
                      priority
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-3">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 rounded-full ${
                    index === currentSlide ? "bg-blue-500" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>
          </section>

          <section className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="w-full h-[96px] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-center px-4 py-3 gap-2"
                >
                  <div className="w-full h-[56px] rounded-xl bg-[#E3F0FF] flex items-center justify-center overflow-hidden">
                    <Image
                      src={cat.icon}
                      alt={cat.name}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>

                  <span className="text-xs sm:text-sm font-medium text-slate-800 text-center w-full">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Recommendation
            </h2>

            {isLoading && (
              <p className="text-sm text-slate-500">Loading books...</p>
            )}

            {isError && (
              <p className="text-sm text-red-500">
                {(error as Error)?.message || "Failed to load books"}
              </p>
            )}

            {!isLoading && !isError && filteredBooks.length === 0 && (
              <p className="text-sm text-slate-500">
                No books found{search ? ` for “${search}”` : ""}.
              </p>
            )}

            {!isLoading && !isError && filteredBooks.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} b={book} />
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 text-slate-700"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    Load More
                  </Button>
                </div>
              </>
            )}
          </section>

          <section className="mt-10 border-t border-slate-200 pt-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Popular Authors
            </h2>

            {isAuthorsLoading && (
              <p className="text-sm text-slate-500">
                Loading authors...
              </p>
            )}

            {isAuthorsError && (
              <p className="text-sm text-red-500">
                {(authorsError as Error)?.message ||
                  "Failed to load authors"}
              </p>
            )}

            {!isAuthorsLoading && !isAuthorsError && topAuthors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topAuthors.map((author) => (
                  <AuthorCard key={author.id} author={author} fetchAuthorBooksCount={fetchAuthorBooksCount}/>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
