"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackMetric } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";

type Props = {
  title?: string;
  description?: string;
};

export default function AuthAwareCta({
  title = "次の準備へ進む",
  description = "求人・物件の保存、チェックリスト、生活プランナーを使って、渡航準備をひとつずつ進められます。",
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIsLoggedIn(Boolean(data.user));
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-gray-900 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-blue-700">WorkLife WH</p>
          <h2 className="mt-1 text-xl font-bold md:text-2xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-700">
            {description}
          </p>
        </div>
        <Link
          href={isLoggedIn ? "/mypage" : "/register"}
          onClick={() => {
            if (isLoggedIn) return;

            void trackMetric("register_cta_click", {
              eventType: "click",
              targetType: "site_cta",
              targetId: "register",
              pagePath:
                typeof window !== "undefined" ? window.location.pathname : undefined,
              metadata: {
                destination: "/register",
                ctaLabel: "無料で生活設計を始める",
              },
            });
          }}
          className="w-full rounded-lg bg-blue-700 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
        >
          {isLoggedIn
            ? "マイページで保存内容を確認する"
            : "無料で生活設計を始める"}
        </Link>
      </div>
    </section>
  );
}
