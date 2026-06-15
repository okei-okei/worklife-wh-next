"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const mypageCards = [
  {
    href: "/mypage/jobs",
    title: "保存した求人",
    description: "SEEKなどの求人を管理できます。",
  },
  {
    href: "/mypage/properties",
    title: "保存した物件",
    description: "気になる物件を管理できます。",
  },
  {
    href: "/mypage/job-application",
    title: "求人応募支援",
    description:
      "保存済み求人や外部求人URLをもとに、応募メールとカバーレターを作成できます。",
    highlight: true,
  },
  {
    href: "/mypage/property-inquiry",
    title: "物件問い合わせ支援",
    description:
      "保存済み物件や外部物件URLをもとに、問い合わせメールを作成できます。",
    highlight: true,
  },
  {
    href: "/mypage/resume",
    title: "履歴書管理",
    description: "英文履歴書とPDF履歴書を保存できます。",
  },
  {
    href: "/planner",
    title: "ライフプランナー",
    description: "仕事・住まい・生活費から生活プランを比較できます。",
  },
  {
    href: "/mypage/checklist",
    title: "渡航・生活チェックリスト",
    description:
      "渡航前、到着後、仕事探し、物件探しで必要な準備を確認できます。",
    highlight: true,
  },
  {
    href: "/partners",
    title: "比較・おすすめサービス",
    description:
      "SIM、保険、送金、生活インフラなどをカテゴリ別に確認できます。",
  },
];

export default function MyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mypageCards.map((card) => (
            <Link key={card.href} href={card.href} className="block min-w-0">
              <div
                className={`min-h-full min-w-0 cursor-pointer rounded-2xl p-4 shadow hover:shadow-lg md:p-6 ${
                  card.highlight
                    ? "border-2 border-blue-200 bg-blue-50"
                    : "bg-white"
                }`}
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
