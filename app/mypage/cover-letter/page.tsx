"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  generateCoverLetter,
  type ApplicationResume,
  type ApplicationTarget,
  type ApplicationTargetType,
} from "@/lib/services/applicationWriter";

type SavedJob = {
  id: string;
  title: string;
  url: string | null;
};

type SavedProperty = {
  id: string;
  title: string;
  url: string | null;
  location: string | null;
  address: string | null;
};

type ResumeFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  signed_url?: string | null;
};

type ApplicationDocumentTarget = ApplicationTarget & {
  id: string;
  type: ApplicationTargetType;
};

const resumeBucketName = "resumes";
const applicationDocumentsBucketName = "application-documents";

function buildPdfFileName(targetTitle: string) {
  const safeTitle =
    targetTitle
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "cover-letter";

  return `${Date.now()}-${safeTitle}-cover-letter.pdf`;
}

async function createCoverLetterPdfBlob(title: string, content: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(title, maxWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, maxWidth);

  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    doc.text(line, margin, y);
    y += 16;
  }

  return doc.output("blob");
}

export default function CoverLetterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [targetType, setTargetType] = useState<ApplicationTargetType>("job");
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [resume, setResume] = useState<ApplicationResume | null>(null);
  const [latestResumeFile, setLatestResumeFile] = useState<ResumeFile | null>(
    null,
  );
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [coverLetterDraft, setCoverLetterDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPdfSaving, setIsPdfSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedTarget = useMemo<ApplicationDocumentTarget | null>(() => {
    if (targetType === "property") {
      const property =
        properties.find((item) => item.id === selectedPropertyId) || null;

      if (!property) return null;

      return {
        id: property.id,
        type: "property",
        title: property.title,
        url: property.url,
        location: property.location,
        address: property.address,
      };
    }

    const job = jobs.find((item) => item.id === selectedJobId) || null;

    if (!job) return null;

    return {
      id: job.id,
      type: "job",
      title: job.title,
      url: job.url,
    };
  }, [jobs, properties, selectedJobId, selectedPropertyId, targetType]);

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
      jobsResponse,
      propertiesResponse,
      resumeResponse,
      latestResumeFileResponse,
    ] =
      await Promise.all([
        supabase
          .from("saved_jobs")
          .select("id, title, url")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_properties")
          .select("id, title, url, location, address")
          .eq("user_id", user.id)
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

    if (jobsResponse.error) {
      setErrorMessage(
        `求人情報の読み込みに失敗しました。${jobsResponse.error.message}`,
      );
      setIsLoading(false);
      return;
    }

    if (propertiesResponse.error) {
      setErrorMessage(
        `物件情報の読み込みに失敗しました。${propertiesResponse.error.message}`,
      );
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

    if (latestResumeFileResponse.error) {
      setErrorMessage(
        `履歴書PDFの読み込みに失敗しました。${latestResumeFileResponse.error.message}`,
      );
      setIsLoading(false);
      return;
    }

    const loadedJobs = (jobsResponse.data || []) as SavedJob[];
    const loadedProperties = (propertiesResponse.data || []) as SavedProperty[];
    setJobs(loadedJobs);
    setProperties(loadedProperties);
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
    setSelectedJobId((current) => current || loadedJobs[0]?.id || "");
    setSelectedPropertyId(
      (current) => current || loadedProperties[0]?.id || "",
    );
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const handleTargetTypeChange = (nextType: ApplicationTargetType) => {
    setTargetType(nextType);
    setCoverLetterDraft("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleGenerate = () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedTarget) {
      setErrorMessage(
        targetType === "job"
          ? "カバーレターを作成する求人を選択してください。"
          : "カバーレターを作成する物件を選択してください。",
      );
      return;
    }

    if (!resume) {
      setErrorMessage(
        "履歴書情報がまだ保存されていません。先に履歴書管理から登録してください。",
      );
      return;
    }

    setCoverLetterDraft(
      generateCoverLetter({
        target: selectedTarget,
        resume,
      }),
    );
    setSuccessMessage("カバーレターの下書きを作成しました。");
  };

  const handleCopy = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!coverLetterDraft.trim()) {
      setErrorMessage("コピーするカバーレターがありません。");
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetterDraft);
      setSuccessMessage("カバーレターをコピーしました。");
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

    if (!selectedTarget) {
      setErrorMessage("保存先の対象を選択してください。");
      return;
    }

    if (!coverLetterDraft.trim()) {
      setErrorMessage("保存するカバーレターがありません。");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("application_documents").insert({
      user_id: userId,
      target_type: selectedTarget.type,
      target_id: selectedTarget.id,
      document_type: "cover_letter",
      title: `${selectedTarget.title} - Cover Letter`,
      content: coverLetterDraft,
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(`カバーレターの保存に失敗しました。${error.message}`);
      return;
    }

    setSuccessMessage("カバーレターを保存しました。");
  };

  const handleSavePdf = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!userId) {
      setErrorMessage("ログイン状態を確認できませんでした。再ログインしてください。");
      return;
    }

    if (!selectedTarget) {
      setErrorMessage("PDFを保存する対象を選択してください。");
      return;
    }

    if (!coverLetterDraft.trim()) {
      setErrorMessage("PDFで保存するカバーレターがありません。");
      return;
    }

    setIsPdfSaving(true);

    try {
      const title = `${selectedTarget.title} - Cover Letter`;
      const fileName = buildPdfFileName(selectedTarget.title);
      const filePath = `application-documents/${userId}/${fileName}`;
      const pdfBlob = await createCoverLetterPdfBlob(title, coverLetterDraft);

      const uploadResponse = await supabase.storage
        .from(applicationDocumentsBucketName)
        .upload(filePath, pdfBlob, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadResponse.error) {
        setErrorMessage(
          `PDFの保存に失敗しました。${uploadResponse.error.message}`,
        );
        setIsPdfSaving(false);
        return;
      }

      const insertResponse = await supabase
        .from("application_documents")
        .insert({
          user_id: userId,
          target_type: selectedTarget.type,
          target_id: selectedTarget.id,
          document_type: "cover_letter",
          title,
          content: coverLetterDraft,
          file_path: filePath,
        });

      if (insertResponse.error) {
        await supabase.storage
          .from(applicationDocumentsBucketName)
          .remove([filePath]);
        setErrorMessage(
          `PDF情報の保存に失敗しました。${insertResponse.error.message}`,
        );
        setIsPdfSaving(false);
        return;
      }

      const objectUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);

      setSuccessMessage("カバーレターPDFを保存しました。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `PDFの作成に失敗しました。${error.message}`
          : "PDFの作成に失敗しました。",
      );
    } finally {
      setIsPdfSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">
              カバーレター作成
            </h1>
            <p className="mt-2 text-base font-medium leading-7 text-gray-800">
              保存した求人・物件と履歴書情報から、英語のカバーレター下書きを作成して保存できます。
            </p>
          </div>
        </div>

        {isLoading ? (
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <p className="font-medium text-gray-800">読み込み中...</p>
          </section>
        ) : (
          <section className="space-y-5 rounded-2xl bg-white p-4 shadow md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => handleTargetTypeChange("job")}
                className={`w-full rounded-lg px-4 py-3 font-bold sm:w-auto ${
                  targetType === "job"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-900"
                }`}
              >
                求人向け
              </button>
              <button
                type="button"
                onClick={() => handleTargetTypeChange("property")}
                className={`w-full rounded-lg px-4 py-3 font-bold sm:w-auto ${
                  targetType === "property"
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-900"
                }`}
              >
                物件向け
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-900">
                  {targetType === "job" ? "保存済み求人" : "保存済み物件"}
                </span>
                {targetType === "job" ? (
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
                ) : (
                  <select
                    value={selectedPropertyId}
                    onChange={(event) =>
                      setSelectedPropertyId(event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {properties.length ? (
                      properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title}
                        </option>
                      ))
                    ) : (
                      <option value="">保存済み物件がありません</option>
                    )}
                  </select>
                )}
              </label>

              <div className="space-y-3 rounded-xl bg-blue-50 p-4 text-sm font-bold text-blue-800">
                <div>
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

                <div className="rounded-lg bg-white/70 p-3 text-gray-900">
                  {latestResumeFile ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="break-words">
                        最新PDF: {latestResumeFile.file_name}
                      </p>
                      {latestResumeFile.signed_url ? (
                        <a
                          href={latestResumeFile.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full rounded-lg border border-blue-200 px-3 py-2 text-center text-blue-700 sm:w-auto"
                        >
                          PDFを開く
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    <p>履歴書PDFは未登録です。</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white sm:w-auto"
              >
                カバーレターを作成
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full rounded-lg bg-green-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-green-300 sm:w-auto"
              >
                {isSaving ? "保存中..." : "保存"}
              </button>

              <button
                type="button"
                onClick={handleSavePdf}
                disabled={isPdfSaving}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-purple-300 sm:w-auto"
              >
                {isPdfSaving ? "PDF保存中..." : "PDFで保存"}
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
                生成されたカバーレター
              </span>
              <textarea
                value={coverLetterDraft}
                onChange={(event) => setCoverLetterDraft(event.target.value)}
                rows={18}
                placeholder={
                  targetType === "job"
                    ? "求人を選択してカバーレターを作成してください。"
                    : "物件を選択してカバーレターを作成してください。"
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium leading-7 text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </section>
        )}

        <div className="flex justify-center">
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
