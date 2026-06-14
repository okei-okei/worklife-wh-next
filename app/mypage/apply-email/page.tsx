"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  generateApplicationEmail,
  type ApplicationResume,
} from "@/lib/services/applicationWriter";

type SavedJob = {
  id: string;
  title: string;
  url: string | null;
};

export default function ApplyEmailPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [resume, setResume] = useState<ApplicationResume | null>(null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const [jobsResponse, resumeResponse] = await Promise.all([
      supabase
        .from("saved_jobs")
        .select("id, title, url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("resumes")
        .select(
          "full_name, email, phone, current_city, visa_type, available_from, work_experience, skills, english_level, self_introduction",
        )
        .eq("user_id", user.id)
        .maybeSingle<ApplicationResume>(),
    ]);

    if (jobsResponse.error) {
      setErrorMessage(`求人情報の読み込みに失敗しました。${jobsResponse.error.message}`);
      setIsLoading(false);
      return;
    }

    if (resumeResponse.error) {
      setErrorMessage(
        `履歴書情報の読み込みに失敗しました。${resumeResponse.error.message}`,
      );
      setIsLoading(false);
      return;
    }

    const loadedJobs = (jobsResponse.data || []) as SavedJob[];
    setJobs(loadedJobs);
    setResume(resumeResponse.data || null);
    setSelectedJobId((current) => current || loadedJobs[0]?.id || "");
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleGenerate = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedJob) {
      setErrorMessage("応募メールを作成する求人を選択してください。");
      return;
    }

    if (!resume) {
      setErrorMessage("履歴書情報がまだ保存されていません。先に履歴書管理から登録してください。");
      return;
    }

    setEmailDraft(
      generateApplicationEmail({
        job: selectedJob,
        resume,
      }),
    );
    setSuccessMessage("応募メールの下書きを作成しました。");
  };

  const handleCopy = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!emailDraft.trim()) {
      setErrorMessage("コピーする応募メールがありません。");
      return;
    }

    try {
      await navigator.clipboard.writeText(emailDraft);
      setSuccessMessage("応募メールをコピーしました。");
    } catch {
      setErrorMessage("コピーに失敗しました。textareaから手動でコピーしてください。");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">
              応募メール作成
            </h1>
            <p className="mt-2 text-base font-medium leading-7 text-gray-800">
              保存した求人と履歴書情報から、英語応募メールの下書きを作成します。
            </p>
          </div>

          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto sm:py-2"
          >
            ← マイページ
          </Link>
        </div>

        {isLoading ? (
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <p className="font-medium text-gray-800">読み込み中...</p>
          </section>
        ) : (
          <section className="space-y-5 rounded-2xl bg-white p-4 shadow md:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-900">
                  保存済み求人
                </span>
                <select
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {jobs.length ? (
                    jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))
                  ) : (
                    <option value="">保存済み求人がありません</option>
                  )}
                </select>
              </label>

              <div className="rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
                {resume ? (
                  <p>
                    履歴書情報を読み込み済み:{" "}
                    {resume.full_name || resume.email || "名前未設定"}
                  </p>
                ) : (
                  <p>
                    履歴書情報が未登録です。先に履歴書管理から保存してください。
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white sm:w-auto"
              >
                応募メールを作成
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-bold text-gray-900 sm:w-auto"
              >
                コピー
              </button>

              <Link
                href="/mypage/resume"
                className="w-full rounded-lg bg-gray-100 px-4 py-3 text-center font-bold text-gray-900 sm:w-auto"
              >
                履歴書を編集
              </Link>
            </div>

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

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-900">
                生成された応募メール
              </span>
              <textarea
                value={emailDraft}
                onChange={(event) => setEmailDraft(event.target.value)}
                rows={18}
                placeholder="求人を選択して応募メールを作成してください。"
                className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium leading-7 text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </section>
        )}
      </div>
    </main>
  );
}
