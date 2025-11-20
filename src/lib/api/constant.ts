import { Author, Book, BookCategory, BookReviewsData, User } from "../constant";

export type RecommendApiResponse = {
  success: boolean;
  message: string;
  data: {
    mode: string;
    books: Book[];
  };
};

export type AuthorsApiResponse = {
  success: boolean;
  message: string;
  data: {
    authors: Author[];
  };
};

export type AuthorBooksApiResponse = {
  success: boolean;
  message: string;
  data: {
    author: Author;
    books: { id: number }[];
  };
};

export type BookDetailApiResponse = {
  success: boolean;
  message: string;
  data: Book;
};

export type BookReviewsApiResponse = {
  success: boolean;
  message: string;
  data: BookReviewsData;
};

export type BooksApiResponse = {
  success: boolean;
  message: string;
  data: {
    books: Book[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type CategoriesApiResponse = {
  success: boolean;
  message: string;
  data: {
    categories: BookCategory[];
  };
};



export type LoginSuccessResponse = {
  token: string;
  user: User;
};

export type LoginApiResponse = {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
};

export type MeApiResponse = {
  success: boolean;
  message: string;
  data: {
    profile: {
      id: number;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      phone?: string;
    };
    loanStats: {
      borrowed: number;
      late: number;
      returned: number;
      total: number;
    };
    reviewsCount: number;
  };
};