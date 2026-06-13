"use client";

import { Menu, LogOut, User } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { LanguageSwitcher } from "../language-switcher";
import { useLocale } from "../providers/locale-provider";
import { Button } from "../ui/button";

interface HeaderProps {
  title: string;
  username: string;
  onMenuClick: () => void;
}

export function Header({ title, username, onMenuClick }: HeaderProps) {
  const { dict } = useLocale();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 sm:flex">
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate">{username}</span>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{dict.nav.logout}</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
