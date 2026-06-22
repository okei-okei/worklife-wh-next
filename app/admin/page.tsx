"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type AdminMetrics = {
  registeredUsers: number;
  savedJobs: number;
  savedProperties: number;
  completedChecklistItems: number;
  activePartners: number;
  pendingListingSubmissions: number;
  leadClicksByCategory: {
    category: string;
    count: number;
  }[];
};

const metricLabels = [
  {
    key: "registeredUsers",
    label: "登録ユーザー数",
    description: "Supabase Authに登録されたユーザー",
  },
  {
    key: "savedJobs",
    label: "保存求人数",
    description: "ユーザーが保存した求人",
  },
  {
    key: "savedProperties",
    label: "保存物件数",
    description: "ユーザーが保存した物件",
  },
  {
    key: "completedChecklistItems",
    label: "チェックリスト完了数",
    description: "完了済みチェック項目",
  },
  {
    key: "activePartners",
    label: "有効掲載数",
    description: "表示中の提携サービス",
  },
  {
    key: "pendingListingSubmissions",
    label: "掲載申請 pending",
    description: "審査待ちの求人・物件掲載申請",
  },
] as const;

export default function AdminPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAdminMetrics = async () => {
      setIsCheckingAuth(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsAdmin(false);
        setIsCheckingAuth(false);
        return;
      }

      const response = await fetch("/api/admin/metrics", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setErrorMessage(data?.error || "管理指標を取得できませんでした。");
        setIsAdmin(response.status !== 401 && response.status !== 403);
        setIsCheckingAuth(false);
        return;
      }

      const data = (await response.json()) as AdminMetrics;
      setIsAdmin(true);
      setMetrics(data);
      setIsCheckingAuth(false);
    };

    loadAdminMetrics();
  }, []);

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
        <div>
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH Admin
            </p>
            <h1 className="text-4xl font-bold">管理者ダッシュボード</h1>
            <p className="mt-2 text-gray-800">
              サービスの利用状況と提携導線の反応を確認できます。
            </p>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">掲載申請の審査</h2>
              <p className="mt-2 text-gray-800">
                pending の求人・物件申請を確認し、承認または却下できます。
              </p>
            </div>

            <Link
              href="/admin/submissions"
              className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white"
            >
              審査画面を開く
            </Link>
          </div>
        </section>

        {errorMessage ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <h2 className="text-xl font-bold">取得エラー</h2>
            <p className="mt-2">{errorMessage}</p>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metricLabels.map((metric) => (
            <div key={metric.key} className="rounded-2xl bg-white p-5 shadow">
              <p className="text-sm font-bold text-gray-700">{metric.label}</p>
              <p className="mt-2 text-4xl font-bold text-gray-900">
                {metrics ? metrics[metric.key].toLocaleString() : "-"}
              </p>
              <p className="mt-2 text-sm text-gray-800">
                {metric.description}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">
              lead_clicks カテゴリ別クリック数
            </h2>
            <p className="text-sm font-medium text-gray-700">
              提携サービス導線のクリック傾向
            </p>
          </div>

          {metrics && metrics.leadClicksByCategory.length > 0 ? (
            <div className="space-y-3">
              {metrics.leadClicksByCategory.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                >
                  <span className="font-bold text-gray-900">
                    {item.category}
                  </span>
                  <span className="text-2xl font-bold text-blue-700">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-800">
              まだリードクリックは記録されていません。
            </p>
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
