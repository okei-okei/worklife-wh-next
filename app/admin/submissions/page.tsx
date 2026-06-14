"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ListingSubmission = {
  id: string;
  user_id: string | null;
  type: "job" | "property";
  title: string;
  company_or_owner: string | null;
  email: string | null;
  description: string | null;
  url: string | null;
  status: string;
  created_at: string;
};

const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminSubmissionsPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [submissions, setSubmissions] = useState<ListingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSubmissions = useCallback(async (token: string) => {
    setIsLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/admin/submissions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setErrorMessage(data?.error || "掲載申請を取得できませんでした。");
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as {
      submissions: ListingSubmission[];
    };
    setSubmissions(data.submissions);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const userEmail = session?.user.email;

      if (!adminEmail || !userEmail || userEmail !== adminEmail) {
        setIsAdmin(false);
        setIsCheckingAuth(false);
        return;
      }

      setIsAdmin(true);
      setAccessToken(session.access_token);
      setIsCheckingAuth(false);
      loadSubmissions(session.access_token);
    };

    initialize();
  }, [loadSubmissions]);

  const handleUpdate = async (
    submission: ListingSubmission,
    action: "approve" | "reject",
  ) => {
    if (!accessToken) return;

    setUpdatingId(submission.id);
    setErrorMessage("");

    const response = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: submission.id,
        action,
      }),
    });

    setUpdatingId(null);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setErrorMessage(data?.error || "申請ステータスを更新できませんでした。");
      return;
    }

    setSubmissions((current) =>
      current.filter((item) => item.id !== submission.id),
    );
  };

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white p-6 shadow">
          <p className="font-bold text-gray-700">管理者権限を確認中...</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-3xl space-y-4 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">権限がありません</h1>
          <p className="leading-7 text-gray-800">
            このページはWorkLife WHの運営者のみアクセスできます。
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-gray-500 px-4 py-2 text-white"
          >
            TOPへ戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH Admin
            </p>
            <h1 className="text-4xl font-bold">掲載申請の審査</h1>
            <p className="mt-2 text-gray-800">
              pending の求人・物件掲載申請を承認または却下できます。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-white sm:w-auto sm:py-2"
            >
              管理ダッシュボード
            </Link>
          </div>
        </div>

        {errorMessage ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <h2 className="text-xl font-bold">エラー</h2>
            <p className="mt-2">{errorMessage}</p>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">pending 申請</h2>
            <button
              type="button"
              onClick={() => loadSubmissions(accessToken)}
              disabled={isLoading}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? "更新中..." : "再読み込み"}
            </button>
          </div>

          {isLoading ? (
            <p className="text-gray-800">読み込み中...</p>
          ) : submissions.length === 0 ? (
            <p className="text-gray-800">審査待ちの申請はありません。</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <article
                  key={submission.id}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                          {submission.type === "job" ? "求人" : "物件"}
                        </span>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">
                          {submission.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold">
                        {submission.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-700">
                        申請日:{" "}
                        {new Date(submission.created_at).toLocaleString(
                          "ja-JP",
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(submission, "approve")}
                        disabled={updatingId === submission.id}
                        className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:bg-green-300"
                      >
                        approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(submission, "reject")}
                        disabled={updatingId === submission.id}
                        className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white disabled:cursor-not-allowed disabled:bg-red-300"
                      >
                        reject
                      </button>
                    </div>
                  </div>

                  <dl className="grid gap-3 text-sm md:grid-cols-2">
                    <div>
                      <dt className="font-bold text-gray-700">掲載者名</dt>
                      <dd>{submission.company_or_owner || "-"}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-gray-700">メール</dt>
                      <dd>{submission.email || "-"}</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="font-bold text-gray-700">説明</dt>
                      <dd className="whitespace-pre-wrap leading-7">
                        {submission.description || "-"}
                      </dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="font-bold text-gray-700">URL</dt>
                      <dd>
                        {submission.url ? (
                          <a
                            href={submission.url}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-blue-700 underline"
                          >
                            {submission.url}
                          </a>
                        ) : (
                          "-"
                        )}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            ← マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
