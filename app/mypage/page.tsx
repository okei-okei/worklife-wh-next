"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStatusBadgeClassName } from "@/lib/applicationStatus";

type StatusSummary = {
  savedJobCount: number;
  appliedJobCount: number;
  interviewJobCount: number;
  hiredJobCount: number;
  savedPropertyCount: number;
  propertyInquiredCount: number;
  viewingPropertyCount: number;
  confirmedPropertyCount: number;
};

const initialStatusSummary: StatusSummary = {
  savedJobCount: 0,
  appliedJobCount: 0,
  interviewJobCount: 0,
  hiredJobCount: 0,
  savedPropertyCount: 0,
  propertyInquiredCount: 0,
  viewingPropertyCount: 0,
  confirmedPropertyCount: 0,
};

export default function MyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [summary, setSummary] =
    useState<StatusSummary>(initialStatusSummary);

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

      const [jobsResponse, propertiesResponse] = await Promise.all([
        supabase.from("saved_jobs").select("status").eq("user_id", user.id),
        supabase
          .from("saved_properties")
          .select("status")
          .eq("user_id", user.id),
      ]);

      const jobRows = (jobsResponse.data || []) as Array<{
        status: string | null;
      }>;
      const propertyRows = (propertiesResponse.data || []) as Array<{
        status: string | null;
      }>;

      setSummary({
        savedJobCount: jobRows.length,
        appliedJobCount: jobRows.filter((row) => row.status === "応募済み")
          .length,
        interviewJobCount: jobRows.filter((row) => row.status === "面接予定")
          .length,
        hiredJobCount: jobRows.filter((row) => row.status === "採用").length,
        savedPropertyCount: propertyRows.length,
        propertyInquiredCount: propertyRows.filter(
          (row) => row.status === "問い合わせ済み",
        ).length,
        viewingPropertyCount: propertyRows.filter(
          (row) => row.status === "内見予定",
        ).length,
        confirmedPropertyCount: propertyRows.filter(
          (row) => row.status === "入居決定",
        ).length,
      });
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

        <section className="mb-6 rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
              応募・問い合わせ状況
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-800">
              保存した求人・物件の進捗をまとめて確認できます。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "保存済み求人", value: summary.savedJobCount },
              {
                label: "応募済み",
                value: summary.appliedJobCount,
                status: "応募済み",
              },
              {
                label: "面接予定",
                value: summary.interviewJobCount,
                status: "面接予定",
              },
              { label: "採用", value: summary.hiredJobCount, status: "採用" },
              { label: "保存済み物件", value: summary.savedPropertyCount },
              {
                label: "問い合わせ済み",
                value: summary.propertyInquiredCount,
                status: "問い合わせ済み",
              },
              {
                label: "内見予定",
                value: summary.viewingPropertyCount,
                status: "内見予定",
              },
              {
                label: "入居決定",
                value: summary.confirmedPropertyCount,
                status: "入居決定",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl p-4 ${
                  item.status
                    ? getStatusBadgeClassName(item.status)
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm font-bold">{item.label}</p>
                <p className="mt-2 text-3xl font-bold">
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

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

          <Link href="/mypage/applications" className="block min-w-0">
            <div className="min-w-0 cursor-pointer rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 shadow hover:shadow-lg md:p-6">
              <h2 className="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
                応募支援
              </h2>

              <p className="text-base font-medium leading-7 text-gray-800">
                求人応募・物件問い合わせの文書をまとめて作成できます。
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
