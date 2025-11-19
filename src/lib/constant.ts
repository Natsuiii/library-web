export type LoginRequest = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
};

export type Book = {
  id: number;
  title: string;
  description: string;
  isbn: string;
  publishedYear: number;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  authorId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  author: BookAuthor;
  category: BookCategory;
};

type BookAuthor = {
  id: number;
  name: string;
};

export type BookCategory = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type Author = {
  id: number;
  name: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewUser = {
  id: number;
  name: string;
};

export type BookReview = {
  id: number;
  star: number;
  comment: string;
  userId: number;
  bookId: number;
  createdAt: string;
  user: ReviewUser;
};

export type BookReviewsData = {
  bookId: number;
  reviews: BookReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type RelatedBook = {
  id: number;
  title: string;
  coverImage: string | null;
  rating: number;
  author: Author;
  category: BookCategory;
};

export type CartItem = {
  id: number;
  title: string;
  categoryName: string;
  authorName: string;
  coverImage: string | null;
  isChecked: boolean;
};

export const CART_KEY = "cart";
export const AUTH_KEY = "auth";
