import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BookIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Author } from "@/lib/constant";

type AuthorCardProps = {
  author?: Author;
  fetchAuthorBooksCount?: (authorId: number) => Promise<number>;
  totalBooks?: number;
};

function AuthorCard({ author, fetchAuthorBooksCount, totalBooks }: AuthorCardProps) {
  const {
    data: bookCount = 0,
    isLoading,
  } = useQuery({
    queryKey: ["authorBooksCount", author?.id],
    queryFn: async () => {
      if (!fetchAuthorBooksCount) return 0;
      return await fetchAuthorBooksCount(author?.id as number || 0);
    },
    enabled: !!fetchAuthorBooksCount,
  });

  const initials = author?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const booksLabel =
    bookCount === 1 ? "1 book" : `${bookCount} books`;

  return (
    <Link
      href={`/authors/${author?.id}`}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src="" alt={author?.name} />
        <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-900">
          {author?.name}
        </span>
        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
          <BookIcon className="h-3 w-3 text-blue-500" />
          <span>
            {!fetchAuthorBooksCount
              ? totalBooks
              : isLoading
              ? "Loading books..."
              : booksLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default AuthorCard;
