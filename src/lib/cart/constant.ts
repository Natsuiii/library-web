import { LoginSuccessResponse } from "../api/constant";
import { AUTH_KEY, CART_KEY, CartItem } from "../constant";

export function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoginSuccessResponse;
    return parsed.user?.email ?? null;
  } catch {
    return null;
  }
}

function getCartKeyForEmail(email: string | null): string {
  return email ? `${CART_KEY}:${email}` : `${CART_KEY}:guest`;
}

export function loadCartForCurrentUser(): CartItem[] {
  if (typeof window === "undefined") return [];
  const email = getCurrentUserEmail();
  const key = getCartKeyForEmail(email);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[] | any[];

    return parsed.map((item) => ({
      id: item.id,
      title: item.title ?? "",
      categoryName: item.categoryName ?? "",
      authorName: item.authorName ?? "",
      coverImage: item.coverImage ?? null,
      isChecked: typeof item.isChecked === "boolean" ? item.isChecked : false,
    }));
  } catch {
    return [];
  }
}

export function saveCartForCurrentUser(items: CartItem[]) {
  if (typeof window === "undefined") return;
  const email = getCurrentUserEmail();
  const key = getCartKeyForEmail(email);
  localStorage.setItem(key, JSON.stringify(items));
}