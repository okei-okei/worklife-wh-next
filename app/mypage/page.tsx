"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const mypageCards = [
  {
    href: "/mypage/jobs",
    title: "保存した求人",
    description: "気になる求人を保存・管理できます。",
  },
  {
    href: "/mypage/properties",
    title: "保存した物件",
    description: "気になる物件を保存・管理できます。",
  },
  {
    href: "/mypage/resume",
    title: "履歴書管理",
    description: "応募に使う基本情報、職歴、スキルを保存できます。",
  },
  {
    href: "/mypage/job-application",
    title: "求人応募支援",
    description: "英語の応募メールとカバーレターを作れます。",
  },
  {
    href: "/mypage/property-inquiry",
    title: "物件問い合わせ支援",
    description: "英語の問い合わせメールを作れます。",
  },
  {
    href: "/planner",
    title: "ライフプランナー",
    description: "仕事と住まいの収支を比較できます。",
  },
  {
    href: "/mypage/checklist",
    title: "チェックリスト",
    description: "渡航前から生活開始までの準備を確認できます。",
  },
  {
    href: "/partners",
    title: "比較おすすめサービス",
    description: "SIM、保険、送金、生活インフラを確認できます。",
  },
  {
    href: "/articles",
    title: "役立ち情報",
    description: "ビザ、IRD、契約時の注意点を確認できます。",
  },
];

export default function MyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const response = await fetch("/api/admin/access", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        setIsAdmin(response.ok);
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    router.push("/");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl min-w-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-4xl">マイページ</h1>
          <p className="mt-2 break-words text-base font-semibold text-gray-800">
            {email}
          </p>
        </div>

        {isAdmin ? (
          <section className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 md:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-blue-700">運営管理</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">運営メニュー</h2>
                <p className="mt-1 text-sm font-medium leading-6 text-gray-800">
                  利用状況の確認と、求人・物件の掲載申請審査を行えます。
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                <Link href="/admin" className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white hover:bg-blue-800 sm:w-auto">ダッシュボード</Link>
                <Link href="/admin/submissions" className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-center font-bold text-blue-800 sm:w-auto">掲載審査</Link>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mypageCards.map((card) => (
            <Link key={card.href} href={card.href} className="block min-w-0">
              <div
                className="min-h-full min-w-0 cursor-pointer rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6"
              >
                <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                  {card.title}
                </h2>
                <p className="text-base font-medium leading-7 text-gray-800">
                  {card.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white sm:w-auto"
          >
            ログアウト
          </button>
        </div>
      </div>
    </main>
  );
}
