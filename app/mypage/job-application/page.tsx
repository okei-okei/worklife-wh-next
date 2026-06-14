"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  generateJobApplicationEmail,
  generateJobCoverLetter,
  type ApplicationResume,
  type ApplicationTarget,
} from "@/lib/services/applicationWriter";
import { supabase } from "@/lib/supabase";

type SourceMode = "saved" | "manual";
type DocumentType = "application_email" | "cover_letter";

type SavedJob = {
  id: string;
  title: string;
  url: string | null;
  hourly_rate: number | null;
  work_hours: number | null;
  status: string | null;
  address: string | null;
};

type ResumeFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  signed_url?: string | null;
};

const emptyManualJob = {
  title: "",
  company: "",
  url: "",
  description: "",
  hourlyRate: "",
  workHours: "",
};

function formatMoney(value: number | null) {
  if (value === null) return "未設定";

  return `$${value}`;
}

function JobApplicationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedJobIdFromQuery = searchParams.get("saved_job_id") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(savedJobIdFromQuery);
  const [sourceMode, setSourceMode] = useState<SourceMode>("saved");
  const [documentType, setDocumentType] =
    useState<DocumentType>("application_email");
  const [resume, setResume] = useState<ApplicationResume | null>(null);
  const [latestResumeFile, setLatestResumeFile] = useState<ResumeFile | null>(
    null,
  );
  const [manualJob, setManualJob] = useState(emptyManualJob);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [
        savedJobsResult,
        resumeResult,
        resumeFileResult,
      ] = await Promise.all([
        supabase
          .from("saved_jobs")
          .select("id,title,url,hourly_rate,work_hours,status,address")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("resumes")
          .select(
            "full_name,email,phone,current_city,visa_type,available_from,work_experience,skills,english_level,self_introduction",
          )
          .eq("user_id", user.id)
          .maybeSingle<ApplicationResume>(),
        supabase
          .from("resume_files")
          .select("id,file_name,file_path,file_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<ResumeFile>(),
      ]);

      if (!isMounted) return;

      if (savedJobsResult.error) {
        setErrorMessage(savedJobsResult.error.message);
      } else {
        const jobs = savedJobsResult.data || [];
        setSavedJobs(jobs);

        if (!savedJobIdFromQuery && jobs[0]?.id) {
          setSelectedJobId(jobs[0].id);
        }
      }

      if (resumeResult.error) {
        setErrorMessage(resumeResult.error.message);
      } else {
        setResume(resumeResult.data);
      }

      if (resumeFileResult.error) {
        setErrorMessage(resumeFileResult.error.message);
      } else if (resumeFileResult.data) {
        const { data } = await supabase.storage
          .from("resumes")
          .createSignedUrl(resumeFileResult.data.file_path, 60 * 60);

        if (isMounted) {
          setLatestResumeFile({
            ...resumeFileResult.data,
            signed_url: data?.signedUrl || resumeFileResult.data.file_url,
          });
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    const timer = window.setTimeout(loadData, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [router, savedJobIdFromQuery]);

  const selectedJob = useMemo(() => {
    return savedJobs.find((job) => job.id === selectedJobId) || null;
  }, [savedJobs, selectedJobId]);

  const activeTarget = useMemo<ApplicationTarget | null>(() => {
    if (sourceMode === "saved") {
      if (!selectedJob) return null;

      return {
        type: "job",
        title: selectedJob.title,
        url: selectedJob.url,
        address: selectedJob.address,
        hourlyRate: selectedJob.hourly_rate,
        workHours: selectedJob.work_hours,
      };
    }

    return {
      type: "job",
      title: manualJob.title,
      company: manualJob.company,
      url: manualJob.url,
      description: manualJob.description,
      hourlyRate: manualJob.hourlyRate ? Number(manualJob.hourlyRate) : null,
      workHours: manualJob.workHours ? Number(manualJob.workHours) : null,
    };
  }, [manualJob, selectedJob, sourceMode]);

  const targetUrl = activeTarget?.url?.trim() || "";

  const handleGenerate = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!activeTarget?.title?.trim()) {
      setErrorMessage("求人タイトルを入力または選択してください。");
      return;
    }

    if (!resume) {
      setErrorMessage(
        "履歴書情報が未登録です。先に履歴書管理ページで基本情報を保存してください。",
      );
      return;
    }

    const content =
      documentType === "application_email"
        ? generateJobApplicationEmail({
            target: activeTarget,
            resume,
          })
        : generateJobCoverLetter({
            target: activeTarget,
            resume,
          });

    setDraft(content);
    setSuccessMessage("下書きを作成しました。内容を編集してから利用できます。");
  };

  const handleCopy = async () => {
    if (!draft.trim()) {
      setErrorMessage("コピーする本文がありません。先に文書を作成してください。");
      return;
    }

    await navigator.clipboard.writeText(draft);
    setSuccessMessage("本文をコピーしました。");
    setErrorMessage("");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-4 font-bold shadow md:p-6">
          読み込み中...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section>
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="break-words text-2xl font-bold md:text-4xl">
            求人応募支援
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
            保存済み求人、または外部求人URL・手入力情報をもとに、英語の応募メールとカバーレターを作成できます。
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">1. 求人を選ぶ</h2>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSourceMode("saved")}
              className={`w-full rounded-lg px-4 py-3 font-bold ${
                sourceMode === "saved"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              保存済み求人から選ぶ
            </button>
            <button
              type="button"
              onClick={() => setSourceMode("manual")}
              className={`w-full rounded-lg px-4 py-3 font-bold ${
                sourceMode === "manual"
                  ? "bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              外部求人URL・手入力で作成
            </button>
          </div>

          {sourceMode === "saved" ? (
            <div className="mt-4 space-y-4">
              {savedJobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-900">
                  <p className="font-bold">まず求人を保存してください。</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
                    公開求人から保存するか、マイページの保存求人で外部求人を登録すると、ここから応募文を作成できます。
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href="/jobs"
                      className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
                    >
                      公開求人を見る
                    </Link>
                    <Link
                      href="/mypage/jobs"
                      className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
                    >
                      保存求人を管理
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-900">
                      保存済み求人
                    </span>
                    <select
                      value={selectedJobId}
                      onChange={(event) => setSelectedJobId(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                    >
                      {savedJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                          {job.hourly_rate ? ` / $${job.hourly_rate}` : ""}
                          {job.work_hours ? ` / ${job.work_hours}h` : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedJob && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <h3 className="break-words text-lg font-bold text-gray-900">
                        {selectedJob.title}
                      </h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm font-medium text-gray-800 sm:grid-cols-2">
                        <p>時給: {formatMoney(selectedJob.hourly_rate)}</p>
                        <p>週勤務時間: {selectedJob.work_hours ?? "未設定"}</p>
                        <p className="sm:col-span-2">
                          住所: {selectedJob.address || "未設定"}
                        </p>
                        {selectedJob.url && (
                          <a
                            href={selectedJob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all font-bold text-blue-700 sm:col-span-2"
                          >
                            {selectedJob.url}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-gray-900">
                  求人タイトル
                </span>
                <input
                  value={manualJob.title}
                  onChange={(event) =>
                    setManualJob({ ...manualJob, title: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="Kitchen hand"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-900">会社名</span>
                <input
                  value={manualJob.company}
                  onChange={(event) =>
                    setManualJob({ ...manualJob, company: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="Company name"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-gray-900">
                  求人URL
                </span>
                <input
                  value={manualJob.url}
                  onChange={(event) =>
                    setManualJob({ ...manualJob, url: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="https://..."
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-900">時給</span>
                <input
                  type="number"
                  min="0"
                  value={manualJob.hourlyRate}
                  onChange={(event) =>
                    setManualJob({
                      ...manualJob,
                      hourlyRate: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="25"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-900">
                  週勤務時間
                </span>
                <input
                  type="number"
                  min="0"
                  value={manualJob.workHours}
                  onChange={(event) =>
                    setManualJob({
                      ...manualJob,
                      workHours: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="35"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-gray-900">
                  仕事内容メモ
                </span>
                <textarea
                  value={manualJob.description}
                  onChange={(event) =>
                    setManualJob({
                      ...manualJob,
                      description: event.target.value,
                    })
                  }
                  className="mt-2 min-h-28 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="求人票の要点、仕事内容、求められる経験など"
                />
              </label>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            2. 作成する文書を選ぶ
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setDocumentType("application_email")}
              className={`w-full rounded-lg px-4 py-3 font-bold ${
                documentType === "application_email"
                  ? "bg-green-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              応募メール
            </button>
            <button
              type="button"
              onClick={() => setDocumentType("cover_letter")}
              className={`w-full rounded-lg px-4 py-3 font-bold ${
                documentType === "cover_letter"
                  ? "bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              カバーレター
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">3. 履歴書情報</h2>
          {resume ? (
            <div className="mt-4 space-y-2 text-sm font-medium leading-6 text-gray-800">
              <p>
                氏名:{" "}
                <span className="font-bold text-gray-900">
                  {resume.full_name || "未設定"}
                </span>
              </p>
              <p>ビザ: {resume.visa_type || "未設定"}</p>
              <p>勤務開始可能日: {resume.available_from || "未設定"}</p>
              {latestResumeFile ? (
                <p>
                  添付予定の履歴書:{" "}
                  <a
                    href={latestResumeFile.signed_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-bold text-blue-700"
                  >
                    {latestResumeFile.file_name}
                  </a>
                </p>
              ) : (
                <p className="font-bold text-amber-700">
                  PDF履歴書は未アップロードです。
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-900">
              履歴書情報が未登録です。応募文に自己紹介や経験を反映するため、先に履歴書管理ページで基本情報を保存してください。
              <div className="mt-3">
                <Link
                  href="/mypage/resume"
                  className="inline-block w-full rounded-lg bg-amber-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
                >
                  履歴書管理へ
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              4. 作成・編集
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white sm:w-auto"
              >
                文書を作成
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="w-full rounded-lg bg-gray-700 px-4 py-3 font-bold text-white sm:w-auto"
              >
                コピー
              </button>
              {targetUrl && (
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-lg bg-green-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
                >
                  外部応募ページを開く
                </a>
              )}
            </div>
          </div>

          {errorMessage && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">
              {successMessage}
            </p>
          )}

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="mt-4 min-h-96 w-full rounded-lg border border-gray-300 p-4 font-mono text-sm leading-6 text-gray-900"
            placeholder="ここに応募メールまたはカバーレターの下書きが表示されます。"
          />
        </section>

        <div className="flex justify-end">
          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function JobApplicationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white p-4 font-bold shadow md:p-6">
            読み込み中...
          </div>
        </main>
      }
    >
      <JobApplicationPageContent />
    </Suspense>
  );
}
