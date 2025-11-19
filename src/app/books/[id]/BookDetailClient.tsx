"use client";

import { CSSProperties, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import dayjs from "dayjs";
import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Share2, ChevronRight } from "lucide-react";
import {
  Author,
  Book,
  BookCategory,
  BookReview,
  BookReviewsData,
  CART_KEY,
  CartItem,
} from "@/lib/constant";
import BookCard from "@/components/BookCard";
import {
  BookDetailApiResponse,
  BookReviewsApiResponse,
  BooksApiResponse,
} from "@/lib/api/constant";
import ReviewCard from "@/components/ReviewCard";
import { toast } from "sonner";
import { getCurrentUserEmail, loadCartForCurrentUser, saveCartForCurrentUser } from "@/lib/cart/constant";

const BOOKS_URL = "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/books";

async function fetchBookDetail(id: string): Promise<Book> {
  const res = await axios.get<BookDetailApiResponse>(`${BOOKS_URL}/${id}`);

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load book detail");
  }

  return res.data.data;
}

const REVIEWS_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/reviews";

async function fetchBookReviews(
  bookId: string,
  limit: number
): Promise<BookReviewsData> {
  const res = await axios.get<BookReviewsApiResponse>(
    `${REVIEWS_URL}/book/${bookId}`,
    {
      params: {
        page: 1,
        limit,
      },
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load reviews");
  }

  return res.data.data;
}

async function fetchRelatedBooks(
  categoryId: number,
  currentBookId: string
): Promise<Book[]> {
  const res = await axios.get<BooksApiResponse>(BOOKS_URL, {
    params: {
      categoryId,
      page: 1,
      limit: 5,
    },
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load related books");
  }

  const books = res.data.data.books;
  return books.filter((b) => String(b.id) !== String(currentBookId));
}

export default function BookDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [reviewLimit, setReviewLimit] = useState(6);

  const {
    data: book,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookDetail", id],
    queryFn: () => fetchBookDetail(id as string),
    enabled: !!id,
  });

  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
    error: reviewsError,
  } = useQuery({
    queryKey: ["bookReviews", id, reviewLimit],
    queryFn: () => fetchBookReviews(id as string, reviewLimit),
    enabled: !!id,
  });

  const reviews = reviewsData?.reviews ?? [];
  const totalReviews = reviewsData?.pagination.total ?? 0;

  const {
    data: relatedBooks,
    isLoading: isRelatedLoading,
    isError: isRelatedError,
    error: relatedError,
  } = useQuery({
    queryKey: ["relatedBooks", book?.categoryId],
    queryFn: () => fetchRelatedBooks(book!.categoryId, id as string),
    enabled: !!book && !!id && !!book.categoryId,
  });

  const safeRelatedBooks = relatedBooks ?? [];

  const handleShareLink = async () => {
    try {
      if (typeof window === "undefined") return;
      const currentUrl = window.location.href;

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      }

      setCopyMessage("Link has been copied to clipboard");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Failed to copy link");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  const canLoadMore =
    totalReviews > 0 && reviews.length < totalReviews && !isReviewsLoading;

  function getCartFromStorage(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[] | any[];

      return parsed.map((item) => {
        if (typeof item === "number") {
          return {
            id: item,
            title: "",
            categoryName: "",
            authorName: "",
            coverImage: null,
            isChecked: false,
          } as CartItem;
        }

        return {
          id: item.id,
          title: item.title ?? "",
          categoryName: item.categoryName ?? "",
          authorName: item.authorName ?? "",
          coverImage: item.coverImage ?? null,
          isChecked:
            typeof item.isChecked === "boolean" ? item.isChecked : false,
        } satisfies CartItem;
      });
    } catch {
      return [];
    }
  }

  function saveCartToStorage(items: CartItem[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  const handleAddToCart = (book: Book) => {
    if (typeof window === "undefined" || !book) return;

    const email = getCurrentUserEmail();
    if (!email) {
      toast.warning("Please login first", {
        description: "You need to login before adding books to cart",
        position: "top-right",
      });
      return;
    }

    const current = loadCartForCurrentUser();

    const exists = current.some((item: any) => item.id === book.id);
    if (exists) {
      toast.warning("Book already in cart", {
        description: "You have already added this book to your cart",
        position: "top-right",
        style: {
          "--normal-bg":
            "light-dark(var(--color-amber-600), var(--color-amber-400))",
          "--normal-text": "var(--color-white)",
          "--normal-border":
            "light-dark(var(--color-amber-600), var(--color-amber-400))",
        } as CSSProperties,
      });
      return;
    }

    const newItem: CartItem = {
      id: book.id,
      title: book.title,
      categoryName: book.category?.name ?? "",
      authorName: book.author?.name ?? "",
      coverImage: book.coverImage ?? null,
      isChecked: false,
    };

    const updated = [...current, newItem];
    saveCartForCurrentUser(updated);
    console.log("Cart updated:", updated);
    toast.success("Successfully added to cart", {
      position: "top-right",
      style: {
        "--normal-bg":
          "light-dark(var(--color-green-600), var(--color-green-400))",
        "--normal-text": "var(--color-white)",
        "--normal-border":
          "light-dark(var(--color-green-600), var(--color-green-400))",
      } as React.CSSProperties,
    });
  };
  return (
    <>
      <Header />

      <main className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>Category</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 font-medium">
              {book?.title ?? "Book Detail"}
            </span>
          </nav>

          {!id && (
            <p className="text-sm text-red-500">Invalid book id in URL.</p>
          )}

          {id && isLoading && (
            <p className="text-sm text-slate-500">Loading book...</p>
          )}

          {id && isError && (
            <p className="text-sm text-red-500">
              {(error as Error)?.message || "Failed to load book detail"}
            </p>
          )}

          {id && !isLoading && !isError && book && (
            <>
              <div className="flex flex-col md:flex-row gap-8 mt-2">
                <div className="w-full md:w-1/3 flex justify-center md:justify-start">
                  <div className="w-full max-w-xs aspect-[3/4] rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        width={400}
                        height={600}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 px-4 text-center">
                        No cover image
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-800 mb-3">
                    {book.category?.name ?? "-"}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                    {book.title}
                  </h1>

                  <p className="mt-1 text-sm text-slate-600">
                    {book.author?.name ?? "-"}
                  </p>

                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="font-medium text-slate-900">
                      {typeof book.rating === "number"
                        ? book.rating.toFixed(1)
                        : "-"}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-8 text-sm">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        -
                      </div>
                      <div className="text-xs text-slate-500">Page</div>
                    </div>

                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {typeof book.rating === "number"
                          ? book.rating.toFixed(1)
                          : "-"}
                      </div>
                      <div className="text-xs text-slate-500">Rating</div>
                    </div>

                    <div>
                      <div className="text-lg font-semibold text-slate-900">
                        {typeof book.reviewCount === "number"
                          ? book.reviewCount
                          : "-"}
                      </div>
                      <div className="text-xs text-slate-500">Reviews</div>
                    </div>
                  </div>

                  <hr className="my-6" />

                  <div>
                    <h2 className="text-base font-semibold text-slate-900 mb-2">
                      Description
                    </h2>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {book.description || "-"}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      className="rounded-full px-6 border-slate-900 text-slate-900"
                      type="button"
                      onClick={() => {
                        handleAddToCart(book);
                      }}
                    >
                      Add to Cart
                    </Button>

                    <Button
                      className="rounded-full px-6 bg-blue-600 hover:bg-blue-700"
                      type="button"
                      onClick={() => {
                        console.log("Borrow book clicked", book.id);
                      }}
                    >
                      Borrow Book
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full px-4 text-slate-700"
                      onClick={handleShareLink}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {copyMessage && (
                    <p className="mt-2 text-xs text-green-600">{copyMessage}</p>
                  )}
                </div>
              </div>

              <section className="mt-10 border-t border-slate-200 pt-6">
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                  Review
                </h2>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-900">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="font-medium">
                    {typeof book.rating === "number"
                      ? book.rating.toFixed(1)
                      : "-"}
                  </span>
                  <span className="text-slate-500">
                    ({totalReviews} Ulasan)
                  </span>
                </div>

                {isReviewsLoading && (
                  <p className="mt-4 text-sm text-slate-500">
                    Loading reviews...
                  </p>
                )}

                {isReviewsError && (
                  <p className="mt-4 text-sm text-red-500">
                    {(reviewsError as Error)?.message ||
                      "Failed to load reviews"}
                  </p>
                )}

                {!isReviewsLoading &&
                  !isReviewsError &&
                  reviews.length === 0 && (
                    <p className="mt-4 text-sm text-slate-500">
                      Belum ada review untuk buku ini.
                    </p>
                  )}

                {!isReviewsLoading && !isReviewsError && reviews.length > 0 && (
                  <>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                    </div>

                    {canLoadMore && (
                      <div className="flex justify-center mt-6">
                        <Button
                          variant="outline"
                          className="rounded-full px-6"
                          onClick={() => setReviewLimit((prev) => prev + 6)}
                          disabled={isReviewsLoading}
                        >
                          Load More
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="mt-10 border-t border-slate-200 pt-6">
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                  Related Books
                </h2>

                {isRelatedLoading && (
                  <p className="mt-4 text-sm text-slate-500">
                    Loading related books...
                  </p>
                )}

                {isRelatedError && (
                  <p className="mt-4 text-sm text-red-500">
                    {(relatedError as Error)?.message ||
                      "Failed to load related books"}
                  </p>
                )}

                {!isRelatedLoading &&
                  !isRelatedError &&
                  safeRelatedBooks.length === 0 && (
                    <p className="mt-4 text-sm text-slate-500">
                      No related books found.
                    </p>
                  )}

                {!isRelatedLoading &&
                  !isRelatedError &&
                  safeRelatedBooks.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {safeRelatedBooks.map((b) => (
                        <BookCard key={b.id} b={b} />
                      ))}
                    </div>
                  )}
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
