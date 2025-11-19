import { AUTH_KEY } from "../constant";
import { LoginSuccessResponse } from "./constant";

export function getAuthFromStorage(): LoginSuccessResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LoginSuccessResponse;
  } catch {
    return null;
  }
}