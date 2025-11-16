import { BookReview } from "@/lib/constant";
import dayjs from "dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star } from "lucide-react";

function ReviewCard({ review }: { review: BookReview }) {
  const initials = review.user?.name
    ? review.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const dateText = dayjs(review.createdAt).format(
    "DD MMMM YYYY, HH:mm"
  );

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt={review.user?.name} />
          <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">
            {review.user?.name ?? "Unknown User"}
          </span>
          <span className="text-xs text-slate-500">{dateText}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-1">
        {stars.map((s) => (
          <Star
            key={s}
            className={`h-3.5 w-3.5 ${
              s <= review.star
                ? "text-amber-400 fill-amber-400"
                : "text-slate-300"
            }`}
          />
        ))}
      </div>

      <p className="mt-1 text-sm text-slate-700 leading-relaxed">
        {review.comment || "-"}
      </p>
    </div>
  );
}

export default ReviewCard;