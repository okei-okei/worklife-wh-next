"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      const { error } = code
        ? await supabase.auth.exchangeCodeForSession(code)
        : await supabase.auth.getSession();

      if (error) {
        setErrorMessage(`認証に失敗しました。${error.message}`);
        return;
      }

      router.replace("/mypage");
    };

    handleCallback();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 text-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 text-center shadow-lg md:p-8">
        <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
        <h1 className="text-2xl font-bold md:text-3xl">認証を確認中です</h1>

        {errorMessage ? (
          <>
            <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
              {errorMessage}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white"
            >
              ログインへ戻る
            </Link>
          </>
        ) : (
          <p className="mt-4 text-base font-medium leading-7 text-gray-800">
            メール確認が完了したら、マイページへ移動します。
          </p>
        )}
      </div>
    </main>
  );
}
