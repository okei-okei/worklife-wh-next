"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackMetric } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

export default function HomeStartButton() {
  const [href, setHref] = useState("/register");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted && data.user) setHref("/mypage");
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Link
      href={href}
      onClick={() => {
        if (href !== "/register") return;

        void trackMetric("register_cta_click", {
          eventType: "click",
          targetType: "home_cta",
          targetId: "hero_register",
          pagePath: "/",
          metadata: {
            destination: "/register",
            ctaLabel: "無料で生活設計を始める",
          },
        });
      }}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#1E4D43] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#173d35] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D43] sm:w-auto md:px-6"
    >
      {href === "/mypage"
        ? "マイページで保存内容を確認する"
        : "生活設計を始める"}
    </Link>
  );
}
