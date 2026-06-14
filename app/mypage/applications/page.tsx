"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  generateJobApplicationEmail,
  generateJobCoverLetter,
  generatePropertyInquiryEmail,
  type ApplicationResume,
  type ApplicationTarget,
} from "@/lib/services/applicationWriter";
import { getStatusBadgeClassName } from "@/lib/applicationStatus";

type TargetType = "job" | "property";
type TargetSource = "saved" | "public" | "manual";
type DocumentType = "application_email" | "property_inquiry" | "cover_letter";

type SavedJob = {
  id: string;
  title: string;
  url: string | null;
  address: string | null;
};

type SavedProperty = {
  id: string;
  title: string;
  url: string | null;
  location: string | null;
  address: string | null;
};

type PublicJob = {
  id: string;
  title: string;
  company: string | null;
  apply_url: string | null;
  address: string | null;
  city: string | null;
};

type PublicProperty = {
  id: string;
  title: string;
  owner_name: string | null;
  url: string | null;
  area: string | null;
  city: string | null;
  address: string | null;
};

type ResumeFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  signed_url?: string | null;
};

type SelectableTarget = ApplicationTarget & {
  id: string | null;
  source: TargetSource;
  type: TargetType;
};

const resumeBucketName = "resumes";

const targetTypeOptions: Array<{
  value: TargetType;
  label: string;
  description: string;
}> = [
  {
    value: "job",
    label: "求人に応募する",
    description: "応募メールまたはカバーレターを作成します。",
  },
  {
    value: "property",
    label: "物件に問い合わせる",
    description: "空室確認や内見希望の問い合わせメールを作成します。",
  },
];

const sourceOptions: Array<{
  value: TargetSource;
  jobLabel: string;
  propertyLabel: string;
}> = [
  {
    value: "saved",
    jobLabel: "保存済み求人",
    propertyLabel: "保存済み物件",
  },
  {
    value: "public",
    jobLabel: "公開求人",
    propertyLabel: "公開物件",
  },
  {
    value: "manual",
    jobLabel: "手入力 / 外部リンク",
    propertyLabel: "手入力 / 外部リンク",
  },
];

function getSourceLabel(targetType: TargetType, source: TargetSource) {
  const option = sourceOptions.find((item) => item.value === source);

  if (!option) return source;

  return targetType === "job" ? option.jobLabel : option.propertyLabel;
}

function getDocumentTypeLabel(documentType: DocumentType) {
  if (documentType === "application_email") return "応募メール";
  if (documentType === "cover_letter") return "カバーレター";
  return "問い合わせメール";
}

function parseTargetType(value: string | null): TargetType {
  return value === "property" ? "property" : "job";
}

function parseTargetSource(value: string | null): TargetSource {
  if (value === "public" || value === "manual") return value;

  return "saved";
}

function parseDocumentType(
  value: string | null,
  targetType: TargetType,
): DocumentType {
  if (targetType === "property") return "property_inquiry";
  if (value === "cover_letter") return "cover_letter";

  return "application_email";
}

function ApplicationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTargetType = parseTargetType(searchParams.get("target_type"));
  const initialTargetSource = parseTargetSource(
    searchParams.get("target_source"),
  );
  const initialDocumentType = parseDocumentType(
    searchParams.get("document_type"),
    initialTargetType,
  );
  const [userId, setUserId] = useState("");
  const [targetType, setTargetType] =
    useState<TargetType>(initialTargetType);
  const [targetSource, setTargetSource] =
    useState<TargetSource>(initialTargetSource);
  const [documentType, setDocumentType] =
    useState<DocumentType>(initialDocumentType);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [publicJobs, setPublicJobs] = useState<PublicJob[]>([]);
  const [publicProperties, setPublicProperties] = useState<PublicProperty[]>(
    [],
  );
  const [resume, setResume] = useState<ApplicationResume | null>(null);
  const [latestResumeFile, setLatestResumeFile] = useState<ResumeFile | null>(
    null,
  );
  const [selectedTargetId, setSelectedTargetId] = useState(
    searchParams.get("target_id") || "",
  );
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [draft, setDraft] = useState("");
  const [statusUpdateTarget, setStatusUpdateTarget] =
    useState<SelectableTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

    setUserId(user.id);

    const [
      savedJobsResponse,
      savedPropertiesResponse,
      publicJobsResponse,
      publicPropertiesResponse,
      resumeResponse,
      latestResumeFileResponse,
    ] = await Promise.all([
      supabase
        .from("saved_jobs")
        .select("id, title, url, address")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("saved_properties")
        .select("id, title, url, location, address")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("public_jobs")
        .select("id, title, company, apply_url, address, city")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("public_properties")
        .select("id, title, owner_name, url, area, city, address")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("resumes")
        .select(
          "full_name, email, phone, current_city, visa_type, available_from, work_experience, skills, english_level, self_introduction",
        )
        .eq("user_id", user.id)
        .maybeSingle<ApplicationResume>(),
      supabase
        .from("resume_files")
        .select("id, file_name, file_path, file_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ResumeFile>(),
    ]);

    const loadError =
      savedJobsResponse.error ||
      savedPropertiesResponse.error ||
      publicJobsResponse.error ||
      publicPropertiesResponse.error ||
      resumeResponse.error ||
      latestResumeFileResponse.error;

    if (loadError) {
      setErrorMessage(`応募支援データの読み込みに失敗しました。${loadError.message}`);
      setIsLoading(false);
      return;
    }

    setSavedJobs((savedJobsResponse.data || []) as SavedJob[]);
    setSavedProperties(
      (savedPropertiesResponse.data || []) as SavedProperty[],
    );
    setPublicJobs((publicJobsResponse.data || []) as PublicJob[]);
    setPublicProperties(
      (publicPropertiesResponse.data || []) as PublicProperty[],
    );
    setResume(resumeResponse.data || null);

    if (latestResumeFileResponse.data) {
      const { data } = await supabase.storage
        .from(resumeBucketName)
        .createSignedUrl(latestResumeFileResponse.data.file_path, 60 * 60);

      setLatestResumeFile({
        ...latestResumeFileResponse.data,
        signed_url: data?.signedUrl || latestResumeFileResponse.data.file_url,
      });
    } else {
      setLatestResumeFile(null);
    }

    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const targetOptions = useMemo<SelectableTarget[]>(() => {
    if (targetSource === "manual") return [];

    if (targetType === "job" && targetSource === "saved") {
      return savedJobs.map((job) => ({
        id: job.id,
        source: "saved",
        type: "job",
        title: job.title,
        url: job.url,
        address: job.address,
      }));
    }

    if (targetType === "job" && targetSource === "public") {
      return publicJobs.map((job) => ({
        id: job.id,
        source: "public",
        type: "job",
        title: job.title,
        url: job.apply_url,
        address: job.address || job.city,
        company: job.company,
      }));
    }

    if (targetType === "property" && targetSource === "saved") {
      return savedProperties.map((property) => ({
        id: property.id,
        source: "saved",
        type: "property",
        title: property.title,
        url: property.url,
        location: property.location,
        address: property.address,
      }));
    }

    return publicProperties.map((property) => ({
      id: property.id,
      source: "public",
      type: "property",
      title: property.title,
      url: property.url,
      location: property.area || property.city,
      address: property.address,
      ownerName: property.owner_name,
    }));
  }, [
    publicJobs,
    publicProperties,
    savedJobs,
    savedProperties,
    targetSource,
    targetType,
  ]);

  const effectiveSelectedTargetId =
    targetOptions.some((target) => target.id === selectedTargetId)
      ? selectedTargetId
      : targetOptions[0]?.id || "";

  const selectedTarget = useMemo<SelectableTarget | null>(() => {
    if (targetSource === "manual") {
      return {
        id: null,
        source: "manual",
        type: targetType,
        title: manualTitle,
        url: manualUrl,
        address: manualAddress,
        location: manualAddress,
      };
    }

    return (
      targetOptions.find((target) => target.id === effectiveSelectedTargetId) ||
      null
    );
  }, [
    effectiveSelectedTargetId,
    manualAddress,
    manualTitle,
    manualUrl,
    targetOptions,
    targetSource,
    targetType,
  ]);

  const availableDocumentTypes: Array<{
    value: DocumentType;
    label: string;
  }> =
    targetType === "job"
      ? [
          { value: "application_email", label: "応募メール" },
          { value: "cover_letter", label: "カバーレター" },
        ]
      : [{ value: "property_inquiry", label: "問い合わせメール" }];

  const handleGenerate = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setStatusUpdateTarget(null);

    if (!selectedTarget || !selectedTarget.title.trim()) {
      setErrorMessage("対象のタイトルを入力または選択してください。");
      return;
    }

    if (targetType === "job" && !resume) {
      setErrorMessage("求人応募には履歴書情報が必要です。先に履歴書管理から保存してください。");
      return;
    }

    if (documentType === "cover_letter") {
      setDraft(
        generateJobCoverLetter({
          target: selectedTarget,
          resume,
        }),
      );
    } else if (documentType === "property_inquiry") {
      setDraft(
        generatePropertyInquiryEmail({
          target: selectedTarget,
          resume,
        }),
      );
    } else {
      setDraft(
        generateJobApplicationEmail({
          target: selectedTarget,
          resume,
        }),
      );
    }

    setSuccessMessage(`${getDocumentTypeLabel(documentType)}を作成しました。`);
  };

  const handleCopy = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!draft.trim()) {
      setErrorMessage("コピーする文書がありません。");
      return;
    }

    try {
      await navigator.clipboard.writeText(draft);
      setSuccessMessage("文書をコピーしました。");
    } catch {
      setErrorMessage("コピーに失敗しました。textareaから手動でコピーしてください。");
    }
  };

  const handleSave = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setErrorMessage("ログイン状態を確認できませんでした。再ログインしてください。");
      return;
    }

    if (!selectedTarget || !selectedTarget.title.trim()) {
      setErrorMessage("保存先の対象を入力または選択してください。");
      return;
    }

    if (!draft.trim()) {
      setErrorMessage("保存する文書がありません。");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("application_documents").insert({
      user_id: userId,
      target_source: selectedTarget.source,
      target_type: selectedTarget.type,
      target_id: selectedTarget.id,
      document_type: documentType,
      title: `${selectedTarget.title} - ${getDocumentTypeLabel(documentType)}`,
      content: draft,
      status: "draft",
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(`保存に失敗しました。${error.message}`);
      return;
    }

    setSuccessMessage("下書きとして保存しました。");
    setStatusUpdateTarget(
      selectedTarget.source === "saved" ? selectedTarget : null,
    );
  };

  const handleUpdateTargetStatus = async (status: string) => {
    if (!statusUpdateTarget?.id) return;

    setIsUpdatingStatus(true);
    setErrorMessage("");
    setSuccessMessage("");

    const tableName =
      statusUpdateTarget.type === "job" ? "saved_jobs" : "saved_properties";
    const { error } = await supabase
      .from(tableName)
      .update({ status })
      .eq("id", statusUpdateTarget.id)
      .eq("user_id", userId);

    setIsUpdatingStatus(false);

    if (error) {
      setErrorMessage(`ステータス更新に失敗しました。${error.message}`);
      return;
    }

    setSuccessMessage(`ステータスを「${status}」に更新しました。`);
    setStatusUpdateTarget(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section>
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="text-2xl font-bold md:text-4xl">応募支援</h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
            保存済み・公開中・外部リンクの求人や物件から、応募メール、問い合わせメール、カバーレターを作成できます。
          </p>
        </section>

        {isLoading ? (
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <p className="font-medium text-gray-800">読み込み中...</p>
          </section>
        ) : (
          <>
            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-blue-700">Step 1</p>
                <h2 className="text-xl font-bold md:text-2xl">対象タイプ</h2>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {targetTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setTargetType(option.value);
                      setDocumentType(
                        option.value === "property"
                          ? "property_inquiry"
                          : "application_email",
                      );
                      setSelectedTargetId("");
                      setDraft("");
                      setStatusUpdateTarget(null);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`rounded-xl border p-4 text-left ${
                      targetType === option.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <span className="block text-lg font-bold text-gray-900">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-800">
                      {option.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-blue-700">Step 2</p>
                <h2 className="text-xl font-bold md:text-2xl">対象選択</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <span className="mb-2 block text-sm font-bold text-gray-900">
                    対象ソース
                  </span>
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {sourceOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setTargetSource(option.value);
                          setDraft("");
                          setStatusUpdateTarget(null);
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        className={`w-full rounded-lg px-4 py-3 font-bold sm:w-auto ${
                          targetSource === option.value
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 bg-white text-gray-900"
                        }`}
                      >
                        {targetType === "job"
                          ? option.jobLabel
                          : option.propertyLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {targetSource === "manual" ? (
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-900">
                        タイトル
                      </span>
                      <input
                        value={manualTitle}
                        onChange={(event) => setManualTitle(event.target.value)}
                        placeholder={
                          targetType === "job"
                            ? "Kitchen Hand / Farm Worker..."
                            : "Room in Auckland CBD..."
                        }
                        className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-900">
                        URL
                      </span>
                      <input
                        value={manualUrl}
                        onChange={(event) => setManualUrl(event.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-gray-900">
                        住所・エリア
                      </span>
                      <input
                        value={manualAddress}
                        onChange={(event) =>
                          setManualAddress(event.target.value)
                        }
                        placeholder="Auckland CBD"
                        className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-900">
                      {getSourceLabel(targetType, targetSource)}
                    </span>
                    <select
                      value={effectiveSelectedTargetId}
                      onChange={(event) =>
                        setSelectedTargetId(event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      {targetOptions.length ? (
                        targetOptions.map((target) => (
                          <option key={target.id || target.title} value={target.id || ""}>
                            {target.title}
                          </option>
                        ))
                      ) : (
                        <option value="">対象データがありません</option>
                      )}
                    </select>
                  </label>
                )}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-blue-700">Step 3</p>
                <h2 className="text-xl font-bold md:text-2xl">文書タイプ</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {availableDocumentTypes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setDocumentType(option.value);
                      setDraft("");
                      setStatusUpdateTarget(null);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className={`w-full rounded-lg px-4 py-3 font-bold sm:w-auto ${
                      documentType === option.value
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {targetType === "job" ? (
                <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
                  {latestResumeFile ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="break-words">
                        添付予定履歴書: {latestResumeFile.file_name}
                      </p>
                      {latestResumeFile.signed_url ? (
                        <a
                          href={latestResumeFile.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-center text-blue-700 sm:w-auto"
                        >
                          PDFを開く
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <p>履歴書PDFは未登録です。必要に応じて履歴書管理から追加できます。</p>
                  )}
                </div>
              ) : null}
            </section>

            <section className="space-y-5 rounded-2xl bg-white p-4 shadow md:p-6">
              <div>
                <p className="text-sm font-bold text-blue-700">Step 4</p>
                <h2 className="text-xl font-bold md:text-2xl">作成・保存</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white sm:w-auto"
                >
                  文書を作成
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-green-300 sm:w-auto"
                >
                  {isSaving ? "保存中..." : "下書き保存"}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-bold text-gray-900 sm:w-auto"
                >
                  コピー
                </button>
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

              {statusUpdateTarget ? (
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="font-bold text-gray-900">
                    対象の進捗も更新しますか？
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {statusUpdateTarget.title}
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {statusUpdateTarget.type === "job" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleUpdateTargetStatus("応募済み")}
                          disabled={isUpdatingStatus}
                          className={`w-full rounded-lg px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${getStatusBadgeClassName(
                            "応募済み",
                          )}`}
                        >
                          応募済みにする
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateTargetStatus("返信待ち")}
                          disabled={isUpdatingStatus}
                          className={`w-full rounded-lg px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${getStatusBadgeClassName(
                            "返信待ち",
                          )}`}
                        >
                          返信待ちにする
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateTargetStatus("問い合わせ済み")
                          }
                          disabled={isUpdatingStatus}
                          className={`w-full rounded-lg px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${getStatusBadgeClassName(
                            "問い合わせ済み",
                          )}`}
                        >
                          問い合わせ済みにする
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateTargetStatus("返信待ち")}
                          disabled={isUpdatingStatus}
                          className={`w-full rounded-lg px-4 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${getStatusBadgeClassName(
                            "返信待ち",
                          )}`}
                        >
                          返信待ちにする
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-900">
                  生成された文書
                </span>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={18}
                  placeholder="対象と文書タイプを選んで、文書を作成してください。"
                  className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium leading-7 text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </section>
          </>
        )}

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

export default function ApplicationsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
          <div className="mx-auto max-w-6xl rounded-2xl bg-white p-4 shadow md:p-6">
            <p className="font-medium text-gray-800">読み込み中...</p>
          </div>
        </main>
      }
    >
      <ApplicationsPageContent />
    </Suspense>
  );
}
