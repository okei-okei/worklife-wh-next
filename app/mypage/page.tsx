"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
          <div className="min-w-0">
            <h1 className="text-2xl font-bold md:text-4xl">マイページ</h1>

            <p className="mt-2 break-words text-base font-semibold text-gray-800">
              {email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <Link href="/mypage/jobs" className="block min-w-0">
            <div className="min-w-0 cursor-pointer rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                保存した求人
              </h2>

              <p className="text-base font-medium leading-7 text-gray-800">
                SEEKなどの求人を管理できます。
              </p>
            </div>
          </Link>

          <Link href="/mypage/properties" className="block min-w-0">
            <div className="min-w-0 cursor-pointer rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                保存した物件
              </h2>

              <p className="text-base font-medium leading-7 text-gray-800">
                気になる物件を管理できます。
              </p>
            </div>
          </Link>

          <Link href="/mypage/checklist" className="block min-w-0">
            <div className="min-w-0 cursor-pointer rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                住居決定後チェックリスト
              </h2>

              <p className="text-base font-medium leading-7 text-gray-800">
                入居後に必要な手続きを管理できます。
              </p>
            </div>
          </Link>

          <Link href="/mypage/resume" className="block min-w-0">
            <div className="min-w-0 cursor-pointer rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                履歴書管理
              </h2>

              <p className="text-base font-medium leading-7 text-gray-800">
                英文履歴書を保存できます。
              </p>
            </div>
          </Link>

          <Link href="/mypage/apply-email" className="block min-w-0">
            <div className="min-w-0 cursor-pointer rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                応募メール作成
              </h2>

              <p className="text-base font-medium leading-7 text-gray-800">
                保存した求人と履歴書から応募メールを作成できます。
              </p>
            </div>
          </Link>

          <Link href="/mypage/cover-letter" className="block min-w-0">
            <div className="min-w-0 cursor-pointer rounded-2xl bg-white p-4 shadow hover:shadow-lg md:p-6">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                カバーレター作成
              </h2>

              <p className="text-base font-medium leading-7 text-gray-800">
                求人と履歴書から英語のカバーレターを作成できます。
              </p>
            </div>
          </Link>

          <Link
            href="/planner"
            className="flex min-w-0 items-center justify-center rounded-2xl bg-blue-600 p-4 text-center text-xl font-bold text-white md:p-6"
          >
            ライフプランナー
          </Link>
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
