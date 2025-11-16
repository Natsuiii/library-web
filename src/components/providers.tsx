"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store, setCredentials } from "@/store";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function AuthInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("auth");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (parsed.token && parsed.user) {
        store.dispatch(
          setCredentials({
            token: parsed.token,
            user: parsed.user,
          })
        );
      }
    } catch (err) {
      console.error("Failed to parse auth from localStorage", err);
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>{children}</AuthInitializer>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}
