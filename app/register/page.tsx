"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== passwordConfirm) {
      setErrorMessage("パスワードと確認用パスワードが一致しません。");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(`登録に失敗しました。${error.message}`);
      return;
    }

    setSuccessMessage(
      "確認メールを送信しました。メール内のリンクを開いて登録を完了してください",
    );
    setPassword("");
    setPasswordConfirm("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 text-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg md:p-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="text-2xl font-bold md:text-3xl">新規会員登録</h1>
          <p className="mt-2 text-base font-medium leading-7 text-gray-800">
            メール確認後にマイページを利用できます。
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-900">
              メールアドレス
            </span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-900">
              パスワード
            </span>
            <div className="flex rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 rounded-l-lg p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="shrink-0 rounded-r-lg px-3 text-sm font-bold text-blue-700"
              >
                {showPassword ? "非表示" : "表示"}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-900">
              パスワード確認
            </span>
            <div className="flex rounded-lg border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <input
                type={showPasswordConfirm ? "text" : "password"}
                placeholder="もう一度入力"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="min-w-0 flex-1 rounded-l-lg p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((current) => !current)}
                className="shrink-0 rounded-r-lg px-3 text-sm font-bold text-blue-700"
              >
                {showPasswordConfirm ? "非表示" : "表示"}
              </button>
            </div>
          </label>

          {errorMessage ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? "送信中..." : "新規登録"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-medium text-gray-800">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-bold text-blue-700 underline">
            ログインはこちら
          </Link>
        </p>
      </div>
    </main>
  );
}
