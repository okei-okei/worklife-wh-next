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
  structured_data?: Record<string, unknown> | null;
  image_urls?: string[] | null;
};

export default function AdminSubmissionsPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [submissions, setSubmissions] = useState<ListingSubmission[]>([]);
  const [selectedType, setSelectedType] = useState<"all" | "job" | "property">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectedReasons, setRejectedReasons] = useState<
    Record<string, string>
  >({});
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
      if (response.status === 401) {
        window.location.replace("/login?redirect=/admin/submissions");
        return;
      }
      if (response.status === 403) {
        window.location.replace("/");
        return;
      }
      setIsAdmin(response.status !== 401 && response.status !== 403);
      setIsLoading(false);
      return;
    }

    const data = (await response.json()) as {
      submissions: ListingSubmission[];
    };
    setSubmissions(data.submissions);
    setIsAdmin(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login?redirect=/admin/submissions");
        return;
      }

      setAccessToken(session.access_token);
      await loadSubmissions(session.access_token);
      setIsCheckingAuth(false);
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
        rejectedReason: rejectedReasons[submission.id] || "",
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

  const visibleSubmissions = submissions.filter((submission) =>
    selectedType === "all" ? true : submission.type === selectedType,
  );
  const jobCount = submissions.filter((submission) => submission.type === "job").length;
  const propertyCount = submissions.filter((submission) => submission.type === "property").length;

  const formatDetail = (value: unknown) => {
    if (value === true) return "あり";
    if (value === false) return "なし";
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
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
            <h1 className="text-2xl font-bold md:text-4xl">掲載申請の審査</h1>
            <p className="mt-2 text-gray-800">
              pending の求人・物件掲載申請を分けて確認し、承認または却下できます。
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
            <div>
              <h2 className="text-2xl font-bold">pending 申請</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  ["all", `すべて ${submissions.length}`],
                  ["job", `求人 ${jobCount}`],
                  ["property", `物件 ${propertyCount}`],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedType(key as "all" | "job" | "property")}
                    className={`rounded-lg px-4 py-2 text-sm font-bold ${
                      selectedType === key
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
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
          ) : visibleSubmissions.length === 0 ? (
            <p className="text-gray-800">審査待ちの申請はありません。</p>
          ) : (
            <div className="space-y-4">
              {visibleSubmissions.map((submission) => (
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
                        className="rounded-lg bg-blue-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        承認する
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(submission, "reject")}
                        disabled={updatingId === submission.id}
                        className="rounded-lg bg-red-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        却下する
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

                  {submission.image_urls?.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {submission.image_urls.map((imageUrl) => (
                        // Supabase Storage URLs are configured at runtime.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={imageUrl}
                          src={imageUrl}
                          alt=""
                          className="aspect-[4/3] w-full rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  ) : null}

                  {submission.structured_data ? (
                    <details className="mt-4 rounded-xl bg-gray-50 p-4">
                      <summary className="cursor-pointer font-bold text-gray-900">
                        詳細条件を確認
                      </summary>
                      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                        {[
                          ["地域", [submission.structured_data.region, submission.structured_data.district, submission.structured_data.area].filter(Boolean).join(" / ")],
                          ["住所", submission.structured_data.address],
                          ["採用形態", submission.structured_data.employment_type],
                          ["日本語対応", submission.structured_data.japanese_ok],
                          ["英語レベル", submission.structured_data.english_level],
                          ["ビザ条件", submission.structured_data.visa_conditions],
                          ["時給下限", submission.structured_data.hourly_rate_min],
                          ["時給上限", submission.structured_data.hourly_rate_max],
                          ["週勤務時間", submission.structured_data.weekly_hours],
                          ["週家賃", submission.structured_data.rent_weekly],
                          ["入居可能日", submission.structured_data.available_from],
                          ["光熱費込み", submission.structured_data.utilities_included],
                        ].map(([label, value]) => (
                          <div key={label as string} className="rounded-lg bg-white p-3">
                            <dt className="font-bold text-gray-700">{label as string}</dt>
                            <dd className="mt-1 break-words text-gray-900">
                              {formatDetail(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-gray-800">
                        {JSON.stringify(submission.structured_data, null, 2)}
                      </pre>
                    </details>
                  ) : null}

                  <label className="mt-4 block">
                    <span className="text-sm font-bold text-gray-900">
                      却下理由
                    </span>
                    <textarea
                      value={rejectedReasons[submission.id] || ""}
                      onChange={(event) =>
                        setRejectedReasons((current) => ({
                          ...current,
                          [submission.id]: event.target.value,
                        }))
                      }
                      rows={2}
                      placeholder="却下する場合に理由を入力"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900"
                    />
                  </label>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Link
            href="/mypage"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            ← マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
