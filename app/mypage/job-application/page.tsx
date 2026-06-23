"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import ExperiencePeriodFields from "@/components/ExperiencePeriodFields";
import NzLocationPicker from "@/components/NzLocationPicker";
import { skillOptions } from "@/lib/constants/applicationOptions";
import {
  generateJobApplicationEmail,
  generateJobApplicationEmailWithAI,
  generateJobCoverLetter,
  generateJobCoverLetterWithAI,
  type AiAvailability,
  type ApplicationResume,
  type ApplicationTarget,
  type ExperienceItem,
  type JobApplicationDetails,
} from "@/lib/services/applicationWriter";
import { supabase } from "@/lib/supabase";
import { trackMetric } from "@/lib/analytics";

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

type DraftRow = {
  form_data: Partial<JobApplicationDetails> | null;
};

const emptyManualJob = {
  title: "",
  company: "",
  url: "",
  location: "",
  description: "",
  hourlyRate: "",
  workHours: "",
};

const emptyJobDetails: JobApplicationDetails = {
  fullName: "",
  currentCity: "",
  visaType: "",
  availableFrom: "",
  availability: "",
  englishLevel: "",
  relevantExperience: "",
  experienceItems: [],
  skills: "",
  skillsList: [],
  selfPromotion: "",
  motivation: "",
  attachResume: true,
  interviewAvailability: "",
  additionalMessage: "",
};

function formatMoney(value: number | null) {
  if (value === null) return "未設定";

  return `$${value}`;
}

function isMissingColumnError(error: { message?: string } | null) {
  return Boolean(
    error?.message?.includes("column") ||
      error?.message?.includes("schema cache") ||
      error?.message?.includes("relation"),
  );
}

function isMissingRelationError(error: { message?: string } | null) {
  return Boolean(error?.message?.includes("relation"));
}

function JobApplicationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const savedJobIdFromQuery = searchParams.get("saved_job_id") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [userId, setUserId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(savedJobIdFromQuery);
  const [sourceMode, setSourceMode] = useState<SourceMode>("saved");
  const [documentType, setDocumentType] =
    useState<DocumentType>("application_email");
  const [resume, setResume] = useState<ApplicationResume | null>(null);
  const [latestResumeFile, setLatestResumeFile] = useState<ResumeFile | null>(
    null,
  );
  const [manualJob, setManualJob] = useState(emptyManualJob);
  const [jobDetails, setJobDetails] =
    useState<JobApplicationDetails>(emptyJobDetails);
  const [draft, setDraft] = useState("");
  const [lastGenerationSignature, setLastGenerationSignature] = useState("");
  const [lastAiGeneration, setLastAiGeneration] = useState<{
    signature: string;
    content: string;
  } | null>(null);
  const [aiAvailability, setAiAvailability] = useState<AiAvailability>({
    enabled: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [customSkill, setCustomSkill] = useState("");

  const buildResumeDefaults = (resumeData: ApplicationResume | null) => ({
    ...emptyJobDetails,
    fullName: resumeData?.full_name || "",
    currentCity: resumeData?.current_city || "",
    visaType: resumeData?.visa_type || "",
    availableFrom: resumeData?.available_from || "",
    englishLevel: resumeData?.english_level || "",
    relevantExperience: resumeData?.work_experience || "",
    experienceItems: resumeData?.experience_items || [],
    skills: resumeData?.skills || "",
    skillsList: resumeData?.skills_list || [],
    selfPromotion: resumeData?.self_introduction || "",
  });

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

      setUserId(user.id);

      const extendedResumeResult = await supabase
        .from("resumes")
        .select(
          "full_name,email,phone,current_city,visa_type,available_from,work_experience,skills,skills_list,experience_items,english_level,self_introduction",
        )
        .eq("user_id", user.id)
        .maybeSingle<ApplicationResume>();

      const resumeResult = isMissingRelationError(extendedResumeResult.error)
        ? { data: null, error: null }
        : extendedResumeResult.error &&
        isMissingColumnError(extendedResumeResult.error)
          ? await supabase
              .from("resumes")
              .select(
                "full_name,email,phone,current_city,visa_type,available_from,work_experience,skills,english_level,self_introduction",
              )
              .eq("user_id", user.id)
              .maybeSingle<ApplicationResume>()
          : extendedResumeResult;

      const [savedJobsResult, resumeFileResult, draftResult] =
        await Promise.all([
        supabase
          .from("saved_jobs")
          .select("id,title,url,hourly_rate,work_hours,status,address")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("resume_files")
          .select("id,file_name,file_path,file_url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle<ResumeFile>(),
        supabase
          .from("user_form_drafts")
          .select("form_data")
          .eq("user_id", user.id)
          .eq("draft_type", "job_application")
          .maybeSingle<DraftRow>(),
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

        const resumeDefaults = buildResumeDefaults(resumeResult.data);

        if (draftResult.error) {
          console.warn(draftResult.error.message);
          setJobDetails(resumeDefaults);
        } else if (draftResult.data?.form_data) {
          setJobDetails({
            ...resumeDefaults,
            ...draftResult.data.form_data,
          });
        } else {
          setJobDetails(resumeDefaults);
        }
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
        location: selectedJob.address,
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
      location: manualJob.location,
      description: manualJob.description,
      hourlyRate: manualJob.hourlyRate ? Number(manualJob.hourlyRate) : null,
      workHours: manualJob.workHours ? Number(manualJob.workHours) : null,
    };
  }, [manualJob, selectedJob, sourceMode]);

  const targetUrl = activeTarget?.url?.trim() || "";

  const saveDraft = async (showMessage = true) => {
    if (!userId) return false;

    const { error } = await supabase.from("user_form_drafts").upsert(
      {
        user_id: userId,
        draft_type: "job_application",
        form_data: jobDetails,
      },
      {
        onConflict: "user_id,draft_type",
      },
    );

    if (error) {
      console.error("Failed to save job application draft:", error);
      if (showMessage) {
        setErrorMessage(
          "入力内容を保存できませんでした。管理者がSupabaseの user_form_drafts 設定を確認してください。",
        );
        setSuccessMessage("");
      }
      return false;
    }

    if (showMessage) {
      setSuccessMessage("入力内容を保存しました。");
      setErrorMessage("");
    }

    return true;
  };

  const resetDraft = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("user_form_drafts")
      .delete()
      .eq("user_id", userId)
      .eq("draft_type", "job_application");

    if (error) {
      setErrorMessage("保存済み入力内容のリセットに失敗しました。");
      return;
    }

    setJobDetails(buildResumeDefaults(resume));
    setSuccessMessage("保存済み入力内容をリセットしました。");
    setErrorMessage("");
  };

  const updateExperienceItem = (
    index: number,
    key: keyof ExperienceItem,
    value: string | boolean,
  ) => {
    setJobDetails((current) => {
      const nextItems = [...(current.experienceItems || [])];
      nextItems[index] = {
        ...nextItems[index],
        [key]: value,
      };

      return {
        ...current,
        experienceItems: nextItems,
      };
    });
  };

  const addExperienceItem = () => {
    setJobDetails((current) => ({
      ...current,
      experienceItems: [
        ...(current.experienceItems || []),
        {
          company: "",
          role: "",
          period: "",
          startYear: "",
          startMonth: "",
          endYear: "",
          endMonth: "",
          isCurrent: false,
          description: "",
          achievement: "",
        },
      ],
    }));
  };

  const removeExperienceItem = (index: number) => {
    setJobDetails((current) => ({
      ...current,
      experienceItems: (current.experienceItems || []).filter(
        (_item, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const toggleSkill = (skill: string) => {
    setJobDetails((current) => {
      const currentSkills = current.skillsList || [];
      const exists = currentSkills.includes(skill);

      return {
        ...current,
        skillsList: exists
          ? currentSkills.filter((item) => item !== skill)
          : [...currentSkills, skill],
      };
    });
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();

    if (!skill) return;

    setJobDetails((current) => {
      const currentSkills = current.skillsList || [];

      return {
        ...current,
        skillsList: currentSkills.includes(skill)
          ? currentSkills
          : [...currentSkills, skill],
      };
    });
    setCustomSkill("");
  };

  const handleGenerate = async (useAi = false) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!activeTarget?.title?.trim()) {
      setErrorMessage("求人タイトルを入力または選択してください。");
      return;
    }

    if (!jobDetails.fullName?.trim()) {
      setErrorMessage("氏名を入力してください。");
      return;
    }

    const draftSaved = await saveDraft(false);

    const generationSignature = JSON.stringify({
      documentType,
      target: activeTarget,
      resume,
      jobDetails,
    });

    if (
      draft.trim() &&
      lastGenerationSignature === generationSignature &&
      !window.confirm("同じ入力内容で再生成しますか？")
    ) {
      return;
    }

    const fallbackContent =
      documentType === "application_email"
        ? generateJobApplicationEmail({
            target: activeTarget,
            resume,
            jobDetails,
          })
        : generateJobCoverLetter({
            target: activeTarget,
            resume,
            jobDetails,
          });

    trackMetric("job_application_template_generate", {
      eventType: "feature",
      pagePath: "/mypage/job-application",
      metadata: { documentType, aiRequested: useAi },
    });

    if (!useAi) {
      setDraft(fallbackContent);
      setLastGenerationSignature(generationSignature);
      setSuccessMessage(
        draftSaved
          ? "テンプレートで下書きを作成し、入力内容を保存しました。"
          : "テンプレートで下書きを作成しました。入力内容の自動保存は現在利用できません。",
      );
      return;
    }

    if (lastAiGeneration?.signature === generationSignature) {
      setDraft(lastAiGeneration.content);
      setSuccessMessage("直近のAI生成結果を再利用しました。");
      return;
    }

    if (!aiAvailability.enabled) {
      setDraft(fallbackContent);
      setLastGenerationSignature(generationSignature);
      setSuccessMessage(
        "AI生成は現在利用できません。テンプレートで下書きを作成しました。",
      );
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const data =
        documentType === "application_email"
          ? await generateJobApplicationEmailWithAI(
              {
                target: activeTarget,
                resume,
                jobDetails,
              },
              session?.access_token,
            )
          : await generateJobCoverLetterWithAI(
              {
                target: activeTarget,
                resume,
                jobDetails,
              },
              session?.access_token,
            );

      setDraft(data.content || fallbackContent);
      setLastGenerationSignature(generationSignature);
      if (data.content) {
        setLastAiGeneration({
          signature: generationSignature,
          content: data.content,
        });
        setAiAvailability((current) => ({
          ...current,
          usedToday: data.usedToday ?? current.usedToday,
          remainingToday: data.remainingToday ?? current.remainingToday,
          enabled:
            typeof data.remainingToday === "number"
              ? data.remainingToday > 0
              : current.enabled,
        }));
      }
      setSuccessMessage(
        data.content
          ? "より自然な英語の下書きを作成しました。内容を編集してから利用できます。"
          : "テンプレートで下書きを作成しました。内容を編集してから利用できます。",
      );
    } catch {
      setDraft(fallbackContent);
      setLastGenerationSignature(generationSignature);
      setSuccessMessage(
        "テンプレートで下書きを作成しました。内容を編集してから利用できます。",
      );
    }
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
            保存済み求人、または外部求人URL・手入力情報をもとに、英語の応募メールとカバーレターのテンプレートを作成できます。
          </p>
          <p className="mt-3 max-w-3xl rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium leading-6 text-blue-900">
            現在は入力内容をもとに英語テンプレートを作成します。AIによる自然な英文生成は今後追加予定です。正確な文面にするため、入力は英語を推奨します。
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
              <label className="block">
                <span className="text-sm font-bold text-gray-900">勤務地</span>
                <input
                  value={manualJob.location}
                  onChange={(event) =>
                    setManualJob({ ...manualJob, location: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="例: Auckland CBD"
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
                  step="0.01"
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                2. 応募者情報を入力する
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
                現在はテンプレート方式です。入力した文章は自動翻訳されないため、経験・自己PR・応募理由などは英語での入力を推奨します。履歴書情報がある項目は初期値として反映しています。
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => saveDraft(true)}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white sm:w-auto"
              >
                入力内容を保存
              </button>
              <button
                type="button"
                onClick={resetDraft}
                className="w-full rounded-lg bg-gray-200 px-4 py-3 font-bold text-gray-900 sm:w-auto"
              >
                入力内容をリセット
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-gray-900">氏名</span>
              <input
                value={jobDetails.fullName || ""}
                onChange={(event) =>
                  setJobDetails({ ...jobDetails, fullName: event.target.value })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: Kei Tanaka"
              />
            </label>
            <div className="md:col-span-2">
              <NzLocationPicker
                label="現在地"
                value={jobDetails.currentCity || ""}
                onChange={(value) =>
                  setJobDetails({
                    ...jobDetails,
                    currentCity: value,
                  })
                }
                onCoordinatesChange={(coords) =>
                  setJobDetails({
                    ...jobDetails,
                    currentCity:
                      coords.latitude && coords.longitude
                        ? "現在地"
                        : jobDetails.currentCity || "",
                    currentLatitude: coords.latitude,
                    currentLongitude: coords.longitude,
                  })
                }
                allLabel="未設定"
              />
            </div>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">
                ビザの種類
              </span>
              <input
                value={jobDetails.visaType || ""}
                onChange={(event) =>
                  setJobDetails({ ...jobDetails, visaType: event.target.value })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: Working Holiday Visa"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">
                勤務開始可能日
              </span>
              <input
                type="date"
                value={jobDetails.availableFrom || ""}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    availableFrom: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">
                働ける曜日・時間帯
              </span>
              <input
                value={jobDetails.availability || ""}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    availability: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 平日夕方と週末、週30時間程度"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">
                英語レベル
              </span>
              <input
                value={jobDetails.englishLevel || ""}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    englishLevel: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 日常会話レベル"
              />
            </label>
            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">職歴・経験</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-gray-800">
                    複数の職歴を分けて入力すると、生成文で自然な職務経験として整理されます。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addExperienceItem}
                  className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white sm:w-auto"
                >
                  職歴を追加
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {(jobDetails.experienceItems || []).map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="font-bold text-gray-900">
                        経験 {index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeExperienceItem(index)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                      >
                        削除
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        value={item.company || ""}
                        onChange={(event) =>
                          updateExperienceItem(
                            index,
                            "company",
                            event.target.value,
                          )
                        }
                        className="rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
                        placeholder="会社名"
                      />
                      <input
                        value={item.role || ""}
                        onChange={(event) =>
                          updateExperienceItem(
                            index,
                            "role",
                            event.target.value,
                          )
                        }
                        className="rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
                        placeholder="役職"
                      />
                      <ExperiencePeriodFields
                        item={item}
                        onChange={(key, value) =>
                          updateExperienceItem(index, key, value)
                        }
                      />
                      <textarea
                        value={item.description || ""}
                        onChange={(event) =>
                          updateExperienceItem(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        className="min-h-20 rounded-lg border border-gray-300 p-3 font-medium text-gray-900 md:col-span-2"
                        placeholder="業務内容"
                      />
                      <textarea
                        value={item.achievement || ""}
                        onChange={(event) =>
                          updateExperienceItem(
                            index,
                            "achievement",
                            event.target.value,
                          )
                        }
                        className="min-h-20 rounded-lg border border-gray-300 p-3 font-medium text-gray-900 md:col-span-2"
                        placeholder="実績・強み"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
              <h3 className="font-bold text-gray-900">キースキルを選ぶ</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skillOptions.map((skill) => {
                  const selected = (jobDetails.skillsList || []).includes(skill);

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`rounded-full px-3 py-2 text-sm font-bold ${
                        selected
                          ? "bg-blue-700 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={customSkill}
                  onChange={(event) => setCustomSkill(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
                  placeholder="自分のスキルを追加"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="w-full rounded-lg bg-gray-700 px-4 py-3 font-bold text-white sm:w-auto"
                >
                  追加
                </button>
              </div>
            </section>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">自己PR</span>
              <textarea
                value={jobDetails.selfPromotion || ""}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    selfPromotion: event.target.value,
                  })
                }
                className="mt-2 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 明るく責任感があり、新しい仕事も早く覚えるタイプです。"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">応募理由</span>
              <textarea
                value={jobDetails.motivation || ""}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    motivation: event.target.value,
                  })
                }
                className="mt-2 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 接客経験を活かしながら、英語環境で働きたいため。"
              />
            </label>
            <label className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 font-bold text-gray-900 md:col-span-2">
              <input
                type="checkbox"
                checked={jobDetails.attachResume ?? true}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    attachResume: event.target.checked,
                  })
                }
                className="h-5 w-5"
              />
              履歴書を添付する
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">
                面接可能日時
              </span>
              <input
                value={jobDetails.interviewAvailability || ""}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    interviewAvailability: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 平日午後、週末は終日可能"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">
                追加で伝えたいこと
              </span>
              <textarea
                value={jobDetails.additionalMessage || ""}
                onChange={(event) =>
                  setJobDetails({
                    ...jobDetails,
                    additionalMessage: event.target.value,
                  })
                }
                className="mt-2 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: すぐに面接可能です。必要であればリファレンスも提出できます。"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">
            3. 作成する文書を選ぶ
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
          <h2 className="text-xl font-bold text-gray-900">4. 履歴書情報</h2>
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
              履歴書情報が未登録です。上のフォームに直接入力して作成できますが、履歴書管理ページに保存しておくと次回から初期値として使えます。
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
              5. 作成・編集
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white sm:w-auto"
              >
                テンプレートを作成
              </button>
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 font-bold text-gray-600 sm:w-auto"
              >
                AI英文生成（準備中）
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

          <p className="mt-3 text-sm font-medium leading-6 text-gray-700">
            作成後は内容を確認し、応募先に合わせて編集してから送信してください。
          </p>

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
