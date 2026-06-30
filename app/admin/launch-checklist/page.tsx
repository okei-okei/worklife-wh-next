"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CheckItem = {
  section: string;
  title: string;
  description: string;
  href?: string;
};

const launchChecks: CheckItem[] = [
  {
    section: "SEO",
    title: "sitemap.xml と robots.txt",
    description:
      "sitemapには公開記事・比較ページ・法務ページのみを含め、admin/mypage/login/registerは検索対象外にします。",
    href: "/sitemap.xml",
  },
  {
    section: "SEO",
    title: "記事導線",
    description:
      "記事詳細下部に、関連比較ページ、チェックリスト、ライフプランナー、登録CTAが表示されることを確認します。",
    href: "/articles",
  },
  {
    section: "比較",
    title: "比較カテゴリ導線",
    description:
      "各比較ページ下部に関連記事、次に比較すべきカテゴリ、チェックリスト導線があることを確認します。",
    href: "/partners",
  },
  {
    section: "チェックリスト",
    title: "チェックリストから比較ページへ遷移",
    description:
      "SIM、保険、送金、銀行、電気、インターネット、家具、語学学校、留学エージェント、航空券・移動へ遷移できることを確認します。",
    href: "/mypage/checklist",
  },
  {
    section: "掲載",
    title: "公開求人・公開物件",
    description:
      "公開リスト、保存導線、地図表示、掲載申請から承認までの流れを確認します。",
    href: "/admin/listings",
  },
  {
    section: "法務",
    title: "法務ページ",
    description:
      "利用規約、プライバシー、Cookie、広告開示、AIポリシー、掲載規約が公開されていることを確認します。",
    href: "/legal",
  },
  {
    section: "計測",
    title: "管理者KPI",
    description:
      "記事PV、比較ページPV、広告クリック、公式リンククリック、チェックリスト遷移数が見られることを確認します。",
    href: "/admin",
  },
];

export default function LaunchChecklistPage() {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login?redirect=/admin/launch-checklist");
        return;
      }

      const response = await fetch("/api/admin/access", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        window.location.replace("/");
        return;
      }

      setAllowed(true);
      setChecking(false);
    };

    verify();
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
        <p className="mx-auto max-w-5xl rounded-xl bg-white p-5 font-bold">
          管理者権限を確認中...
        </p>
      </main>
    );
  }

  if (!allowed) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl bg-white p-4 shadow-sm md:p-6">
          <p className="text-sm font-bold text-emerald-700">
            WorkLife WH Admin
          </p>
          <h1 className="mt-2 text-2xl font-bold md:text-4xl">
            公開前チェックリスト
          </h1>
          <p className="mt-3 text-sm font-medium leading-6 text-gray-700">
            公開後運用で見落としやすいSEO、法務、比較導線、管理者KPIをまとめて確認します。
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {launchChecks.map((item) => (
            <article
              key={`${item.section}-${item.title}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5"
            >
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {item.section}
              </span>
              <h2 className="mt-3 text-lg font-bold text-gray-900">
                {item.title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-700">
                {item.description}
              </p>
              {item.href ? (
                <Link
                  href={item.href}
                  className="mt-4 inline-flex w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
                >
                  確認する
                </Link>
              ) : null}
            </article>
          ))}
        </section>

        <div className="flex justify-end">
          <Link
            href="/admin"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-center font-bold text-white hover:bg-slate-800 sm:w-auto"
          >
            管理者ダッシュボードへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
