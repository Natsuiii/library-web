"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layouts/header";
import { Footer } from "@/components/layouts/footer";
import { Author, Book } from "@/lib/constant";
import BookCard from "@/components/BookCard";
import AuthorCard from "@/components/AuthorCard";
import { BookIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AuthorBooksApiResponse = {
  success: boolean;
  message: string;
  data: {
    author: Author;
    books: Book[];
  };
};

const AUTHOR_BOOKS_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/authors";

async function fetchAuthorBooks(authorId: string): Promise<{
  author: Author;
  books: Book[];
}> {
  const res = await axios.get<AuthorBooksApiResponse>(
    `${AUTHOR_BOOKS_URL}/${authorId}/books`
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to load author books");
  }

  return res.data.data;
}

export default function AuthorBooksClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["authorBooks", id],
    queryFn: () => fetchAuthorBooks(id as string),
    enabled: !!id,
  });

  const author = data?.author;
  const books = data?.books ?? [];
  const totalBooks = books.length;

  const initials =
    author?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "A";

  return (
    <>
      <Header />

      <main className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <section className="mb-6">
            <AuthorCard
              author={author as Author}
              totalBooks={totalBooks}
            />
          </section>

          {!id && (
            <p className="text-sm text-red-500">Invalid author id in URL.</p>
          )}

          {id && isLoading && (
            <p className="text-sm text-slate-500">Loading books...</p>
          )}

          {id && isError && (
            <p className="text-sm text-red-500">
              {(error as Error)?.message || "Failed to load author books"}
            </p>
          )}

          {id && !isLoading && !isError && (
            <>
              <h2 className="mt-4 mb-4 text-xl font-semibold text-slate-900">
                Book List
              </h2>

              {books.length === 0 ? (
                <p className="text-sm text-slate-500">
                  This author has no books yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {books.map((book) => (
                    <BookCard key={book.id} b={book} author={author} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
