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
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">マイページ</h1>

            <p>{email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="
              bg-red-500
              text-white
              px-4
              py-2
              rounded-lg
            "
          >
            ログアウト
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/mypage/jobs">
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">保存した求人</h2>

              <p>SEEKなどの求人を管理できます。</p>
            </div>
          </Link>

          <Link href="/mypage/properties">
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">保存した物件</h2>

              <p>気になる物件を管理できます。</p>
            </div>
          </Link>

          <Link href="/mypage/checklist">
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer">
              <h2 className="text-2xl font-bold mb-2">
                住居決定後チェックリスト
              </h2>

              <p>入居後に必要な手続きを管理できます。</p>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-2">履歴書管理</h2>

            <p>英文履歴書を保存できます。</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-2">AI応募支援</h2>

            <p>カバーレターや応募メールを作成できます。</p>
          </div>

          <Link
            href="/planner"
            className="
    bg-blue-600
    text-white
    p-6
    rounded-2xl
    text-center
    text-xl
    font-bold
  "
          >
            ライフプランナー
          </Link>
        </div>
      </div>
    </main>
  );
}
