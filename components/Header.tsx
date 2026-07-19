"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trackMetric } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

const navigationItems = [
  { href: "/", label: "ホーム" },
  { href: "/jobs", label: "求人" },
  { href: "/properties", label: "物件" },
  { href: "/planner", label: "ライフプランナー" },
  { href: "/articles", label: "役立ち情報" },
  { href: "/partners", label: "比較・おすすめ" },
  { href: "/mypage", label: "マイページ" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [homeScene, setHomeScene] = useState("hero");

  const isHome = pathname === "/";
  const isHomeHeader = isHome && !isMenuOpen;
  const isMutedHomeScene =
    isHomeHeader && ["preparation", "partners"].includes(homeScene);
  const isTransparent = false;

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

  useEffect(() => {
    const handleSceneChange = (event: Event) => {
      const scene = (event as CustomEvent<string>).detail;
      if (scene) setHomeScene(scene);
    };

    window.addEventListener("homeSceneChange", handleSceneChange);

    return () => {
      window.removeEventListener("homeSceneChange", handleSceneChange);
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
      ? isTransparent
        ? "whitespace-nowrap rounded-lg bg-white/15 px-3 py-2 text-sm font-bold text-white"
        : "whitespace-nowrap rounded-lg bg-[#F7F7F5] px-3 py-2 text-sm font-bold text-[#235347]"
      : isTransparent
        ? "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-white/90 hover:bg-white/10 hover:text-white"
        : "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold text-gray-900 hover:bg-[#F7F7F5]";

  const trackHeaderLink = (href: string, label: string) => {
    if (href === "/planner") {
      void trackMetric("planner_cta_click", {
        eventType: "click",
        targetType: "header_link",
        targetId: "planner",
        pagePath: pathname,
        metadata: { label, destination: href },
      });
    }
  };

  const trackRegisterClick = (label: string) => {
    void trackMetric("register_cta_click", {
      eventType: "click",
      targetType: "header_link",
      targetId: "register",
      pagePath: pathname,
      metadata: { label, destination: "/register" },
    });
  };

  return (
    <header
      className={`fixed left-0 top-0 z-[10000] h-16 w-full transition-colors ${
        isTransparent
          ? "border-b border-white/10 bg-transparent"
          : isMutedHomeScene
            ? "border-b border-[#D8D8D4]/80 bg-[#F7F7F5]/90 backdrop-blur"
            : isHomeHeader
              ? "border-b border-[#D8D8D4]/80 bg-white/90 backdrop-blur"
            : "border-b border-[#D8D8D4]/80 bg-white/95 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link
          href="/"
          className={`min-w-0 shrink-0 whitespace-nowrap text-xl font-bold md:text-2xl ${
            isTransparent ? "text-white" : "text-[#235347]"
          }`}
        >
          WorkLife WH
        </Link>

        <nav className="hidden min-w-0 items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => trackHeaderLink(item.href, item.label)}
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
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold ${
                  isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-900 hover:bg-[#F7F7F5]"
                }`}
              >
                ログイン
              </Link>
              <Link
                href="/register"
                onClick={() => trackRegisterClick("新規登録")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold ${
                  isTransparent
                    ? "bg-white text-gray-950"
                    : "bg-[#1E4D43] text-white"
                }`}
              >
                新規登録
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border lg:hidden ${
            isTransparent
              ? "border-white/40 text-white"
              : "border-gray-300 text-gray-900"
          }`}
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
                onClick={() => {
                  trackHeaderLink(item.href, item.label);
                  setIsMenuOpen(false);
                }}
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
                    onClick={() => {
                      trackRegisterClick("新規登録");
                      setIsMenuOpen(false);
                    }}
                    className="w-full whitespace-nowrap rounded-lg bg-[#1E4D43] px-4 py-3 text-center text-sm font-bold text-white"
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
