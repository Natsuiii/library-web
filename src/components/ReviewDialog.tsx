"use client";

import { useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: number;
  bookTitle?: string;
  token: string;
  onSuccess?: () => void;
};

type ReviewApiResponse = {
  success: boolean;
  message: string;
  data?: any;
};

const REVIEWS_URL =
  "https://be-library-api-xh3x6c5iiq-et.a.run.app/api/reviews";

export default function ReviewDialog({
  open,
  onOpenChange,
  bookId,
  bookTitle,
  token,
  onSuccess,
}: ReviewDialogProps) {
  const [starValue, setStarValue] = useState<number>(0);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeStar = hoverStar || starValue;

  const handleSubmit = async () => {
    if (!starValue) {
      toast.warning("Please give a rating first");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await axios.post<ReviewApiResponse>(
        REVIEWS_URL,
        {
          bookId,
          star: starValue,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to save review");
      }

      toast.success("Review saved", {
        description: `Thanks for reviewing ${bookTitle ?? "this book"}!`,
      });

      setStarValue(0);
      setHoverStar(0);
      setComment("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error("Failed to save review", {
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">

        <DialogHeader className="relative mb-5">
          <DialogTitle className="absolute left-4 top-4 text-slate-500 hover:text-slate-900">
            Give Review
          </DialogTitle>

          <DialogClose
            className="absolute right-4 top-4 text-slate-500 hover:text-slate-900"
            aria-label="Close"
          >
            ✕
          </DialogClose>
        </DialogHeader>

        <div className="mt-6 text-center">
          <p className="text-xs font-medium text-slate-700 mb-3">
            Give Rating
          </p>

          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const val = i + 1;
              const filled = val <= activeStar;

              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStarValue(val)}
                  onMouseEnter={() => setHoverStar(val)}
                  onMouseLeave={() => setHoverStar(0)}
                  className="p-1"
                  aria-label={`rate ${val} star`}
                >
                  <Star
                    className={`h-8 w-8 ${
                      filled
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <Textarea
            placeholder="Please share your thoughts about this book"
            className="min-h-[140px] resize-none rounded-xl"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <Button
          className="mt-5 w-full rounded-full bg-blue-600 hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
