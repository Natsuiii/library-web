"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Search as SearchIcon,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { RootState, AppDispatch } from "@/store";
import { setSearch, logout } from "@/store";

export function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const search = useSelector((state: RootState) => state.ui.search);

  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("auth");
    router.push("/login");
  };

  const userName = user?.name ?? "John Doe";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="bg-white border-b border-slate-100">
      <div className="h-[3px] bg-amber-300" />

      <div className="h-16 flex items-center px-6 max-w-6xl mx-auto gap-6">
        <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => router.push("/")}>
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg text-slate-900">
            Booky
          </span>
        </div>

        {isLoggedIn ? (
          <>
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-xl">
                <div className="relative h-10 rounded-full border border-slate-200 bg-white flex items-center px-4">
                  <SearchIcon className="h-4 w-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search book"
                    value={search}
                    onChange={(e) => dispatch(setSearch(e.target.value))}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                className="relative rounded-full h-9 w-9 flex items-center justify-center hover:bg-slate-100 transition"
              >
                <ShoppingBag className="h-5 w-5 text-slate-800" />
                <span className="absolute -top-1 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center">
                  1
                </span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full hover:bg-slate-100 px-2 py-1 transition"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={userName} />
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-slate-900 max-w-[120px] truncate">
                      {userName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => router.push("/my-profile")}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="h-9 rounded-full border-slate-900 text-slate-900 bg-transparent hover:bg-slate-100 px-5 text-sm"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="h-9 rounded-full bg-blue-600 hover:bg-blue-700 px-6 text-sm">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
