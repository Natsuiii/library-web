import { Author, Book } from "@/lib/constant";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BookCardProps = {
  b: Book;
  author?: Author;
};

function BookCard({ b, author }: BookCardProps) {
  const router = useRouter();

  const handleAuthorClick = (
    e: React.MouseEvent<HTMLParagraphElement, MouseEvent>
  ) => {
    e.preventDefault();    
    e.stopPropagation();  

    const authorId = b.authorId || author?.id;
    if (!authorId) return;

    router.push(`/authors/${authorId}`);
  };

  return (
    <Link
      href={`/books/${b.id}`}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm p-2 flex flex-col hover:shadow-md transition"
    >
      <div className="aspect-[3/4] rounded-xl bg-slate-100 overflow-hidden mb-3">
        {b.coverImage ? (
          <Image
            src={b.coverImage}
            alt={b.title}
            width={300}
            height={400}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 px-2 text-center">
            No cover image
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
          {b.title}
        </div>
        <p
          className="text-xs text-slate-500 mt-1 line-clamp-1 cursor-pointer hover:underline"
          onClick={handleAuthorClick}
        >
          {b.author?.name || author?.name || "Author Name"}
        </p>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        <span className="text-xs font-medium text-slate-800">
          {typeof b.rating === "number" ? b.rating.toFixed(1) : "4.9"}
        </span>
      </div>
    </Link>
  );
}

export default BookCard;
