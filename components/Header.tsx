"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navigationItems = [
  { href: "/", label: "ホーム" },
  { href: "/jobs", label: "仕事" },
  { href: "/properties", label: "物件" },
  { href: "/planner", label: "ライフプランナー" },
  { href: "/mypage", label: "マイページ" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(Boolean(user));
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  const linkClassName = (href: string) =>
    pathname === href
      ? "whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"
      : "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100";

  return (
    <header className="fixed left-0 top-0 z-[10000] h-16 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link
          href="/"
          className="min-w-0 shrink-0 whitespace-nowrap text-xl font-bold text-blue-700 md:text-2xl"
        >
          WorkLife WH
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClassName(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white"
            >
              ログアウト
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100"
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"
              >
                新規登録
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-900 lg:hidden"
          aria-label="メニューを開閉"
          aria-expanded={isMenuOpen}
        >
          <span className="text-2xl leading-none">{isMenuOpen ? "×" : "≡"}</span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-b border-gray-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="mx-auto grid max-w-6xl grid-cols-1 gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={linkClassName(item.href)}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-2 grid grid-cols-1 gap-2 border-t border-gray-200 pt-3 min-[420px]:grid-cols-2">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full whitespace-nowrap rounded-lg bg-gray-900 px-4 py-3 text-sm font-bold text-white"
                >
                  ログアウト
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full whitespace-nowrap rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-900"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full whitespace-nowrap rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    新規登録
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
