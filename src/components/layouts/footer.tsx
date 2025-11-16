"use client";

import { BookOpen, Facebook, Instagram, Linkedin, Music2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function Footer() {
  const router = useRouter();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col items-center text-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg text-slate-900">
            Booky
          </span>
        </div>

        <p className="max-w-2xl text-sm text-slate-600">
          Discover inspiring stories & timeless knowledge, ready to borrow
          anytime. Explore online or visit our nearest library branch.
        </p>

        <p className="mt-2 text-sm font-medium text-slate-900">
          Follow on Social Media
        </p>

        <div className="mt-1 flex items-center gap-4">
          <SocialIcon>
            <Facebook className="h-4 w-4" onClick={() => window.open("https://www.facebook.com/")}/>
          </SocialIcon>
          <SocialIcon>
            <Instagram className="h-4 w-4" onClick={() => window.open("https://www.instagram.com/owenn.tb")}/>
          </SocialIcon>
          <SocialIcon>
            <Linkedin className="h-4 w-4" onClick={() => window.open("https://www.linkedin.com/in/owen-tb/")}/>
          </SocialIcon>
          <SocialIcon>
            <Music2 className="h-4 w-4" onClick={() => window.open("https://www.tiktok.com")}/>
          </SocialIcon>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="h-9 w-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition"
    >
      {children}
    </button>
  );
}
