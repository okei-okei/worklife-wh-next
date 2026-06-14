"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ResumeForm = {
  full_name: string;
  email: string;
  phone: string;
  current_city: string;
  visa_type: string;
  available_from: string;
  work_experience: string;
  skills: string;
  english_level: string;
  self_introduction: string;
};

type ResumeFile = {
  id: string;
  user_id?: string;
  file_name: string;
  file_path: string;
  file_url: string | null;
  signed_url?: string | null;
  created_at: string;
};

const resumeBucketName = "resumes";

const initialResumeForm: ResumeForm = {
  full_name: "",
  email: "",
  phone: "",
  current_city: "",
  visa_type: "",
  available_from: "",
  work_experience: "",
  skills: "",
  english_level: "",
  self_introduction: "",
};

const textFields: Array<{
  key: keyof ResumeForm;
  label: string;
  placeholder: string;
  type?: string;
}> = [
  {
    key: "full_name",
    label: "氏名",
    placeholder: "Taro Yamada",
  },
  {
    key: "email",
    label: "メールアドレス",
    placeholder: "you@example.com",
    type: "email",
  },
  {
    key: "phone",
    label: "電話番号",
    placeholder: "+64 21 000 0000",
    type: "tel",
  },
  {
    key: "current_city",
    label: "現在の都市",
    placeholder: "Auckland",
  },
  {
    key: "visa_type",
    label: "ビザ種別",
    placeholder: "Working Holiday Visa",
  },
  {
    key: "available_from",
    label: "勤務開始可能日",
    placeholder: "",
    type: "date",
  },
  {
    key: "english_level",
    label: "英語レベル",
    placeholder: "Intermediate",
  },
];

const textAreaFields: Array<{
  key: keyof ResumeForm;
  label: string;
  placeholder: string;
}> = [
  {
    key: "work_experience",
    label: "職歴・経験",
    placeholder: "Hospitality, retail, farm work, office experience...",
  },
  {
    key: "skills",
    label: "スキル",
    placeholder: "Customer service, POS, barista, cleaning, driving...",
  },
  {
    key: "self_introduction",
    label: "自己紹介",
    placeholder: "応募時に使える自己紹介文を保存しておきましょう。",
  },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildResumeFilePath(userId: string, fileName: string) {
  const timestamp = Date.now();
  const safeFileName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  return `resumes/${userId}/${timestamp}-${safeFileName || "resume.pdf"}`;
}

export default function ResumePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ResumeForm>(initialResumeForm);
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadResume = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    const [resumeResponse, filesResponse] = await Promise.all([
      supabase
        .from("resumes")
        .select(
          "full_name, email, phone, current_city, visa_type, available_from, work_experience, skills, english_level, self_introduction",
        )
        .eq("user_id", user.id)
        .maybeSingle<Partial<ResumeForm>>(),
      supabase
        .from("resume_files")
        .select("id, user_id, file_name, file_path, file_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (resumeResponse.error) {
      setErrorMessage(
        `履歴書情報の読み込みに失敗しました。${resumeResponse.error.message}`,
      );
      setIsLoading(false);
      return;
    }

    if (filesResponse.error) {
      setErrorMessage(
        `履歴書PDFの読み込みに失敗しました。${filesResponse.error.message}`,
      );
      setIsLoading(false);
      return;
    }

    if (resumeResponse.data) {
      setForm({
        full_name: resumeResponse.data.full_name || "",
        email: resumeResponse.data.email || user.email || "",
        phone: resumeResponse.data.phone || "",
        current_city: resumeResponse.data.current_city || "",
        visa_type: resumeResponse.data.visa_type || "",
        available_from: resumeResponse.data.available_from || "",
        work_experience: resumeResponse.data.work_experience || "",
        skills: resumeResponse.data.skills || "",
        english_level: resumeResponse.data.english_level || "",
        self_introduction: resumeResponse.data.self_introduction || "",
      });
    } else {
      setForm({
        ...initialResumeForm,
        email: user.email || "",
      });
    }

    const files = (filesResponse.data || []) as ResumeFile[];
    const filesWithSignedUrls = await Promise.all(
      files.map(async (file) => {
        const { data } = await supabase.storage
          .from(resumeBucketName)
          .createSignedUrl(file.file_path, 60 * 60);

        return {
          ...file,
          signed_url: data?.signedUrl || file.file_url,
        };
      }),
    );

    setResumeFiles(filesWithSignedUrls);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadResume();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadResume]);

  const updateField = (key: keyof ResumeForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUserId) {
      setErrorMessage("ログインしてください。");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.from("resumes").upsert(
      {
        user_id: currentUserId,
        ...form,
        available_from: form.available_from || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    setIsSaving(false);

    if (error) {
      setErrorMessage(`保存に失敗しました。${error.message}`);
      return;
    }

    setSuccessMessage("履歴書情報を保存しました。");
  };

  const handleUpload = async () => {
    if (!currentUserId) {
      setErrorMessage("ログインしてください。");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("アップロードするPDFを選択してください。");
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("PDFファイルのみアップロードできます。");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const filePath = buildResumeFilePath(currentUserId, selectedFile.name);
    const uploadResponse = await supabase.storage
      .from(resumeBucketName)
      .upload(filePath, selectedFile, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadResponse.error) {
      setIsUploading(false);
      setErrorMessage(
        `PDFのアップロードに失敗しました。${uploadResponse.error.message}`,
      );
      return;
    }

    const insertResponse = await supabase.from("resume_files").insert({
      user_id: currentUserId,
      file_name: selectedFile.name,
      file_path: filePath,
      file_url: null,
    });

    setIsUploading(false);

    if (insertResponse.error) {
      await supabase.storage.from(resumeBucketName).remove([filePath]);
      setErrorMessage(
        `PDF情報の保存に失敗しました。${insertResponse.error.message}`,
      );
      return;
    }

    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSuccessMessage("履歴書PDFをアップロードしました。");
    await loadResume();
  };

  const handleDeleteFile = async (file: ResumeFile) => {
    setDeletingFileId(file.id);
    setErrorMessage("");
    setSuccessMessage("");

    const storageResponse = await supabase.storage
      .from(resumeBucketName)
      .remove([file.file_path]);

    if (storageResponse.error) {
      setDeletingFileId("");
      setErrorMessage(
        `PDFファイルの削除に失敗しました。${storageResponse.error.message}`,
      );
      return;
    }

    const deleteResponse = await supabase
      .from("resume_files")
      .delete()
      .eq("id", file.id);

    setDeletingFileId("");

    if (deleteResponse.error) {
      setErrorMessage(
        `PDF情報の削除に失敗しました。${deleteResponse.error.message}`,
      );
      return;
    }

    setResumeFiles((current) => current.filter((item) => item.id !== file.id));
    setSuccessMessage("履歴書PDFを削除しました。");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">履歴書管理</h1>
            <p className="mt-2 text-base font-medium leading-7 text-gray-800">
              応募メールやカバーレター作成に使う基本情報とPDF履歴書を保存できます。
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
          <>
            <form
              onSubmit={handleSave}
              className="space-y-6 rounded-2xl bg-white p-4 shadow md:p-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {textFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-900">
                      {field.label}
                    </span>
                    <input
                      type={field.type || "text"}
                      value={form[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-4">
                {textAreaFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-900">
                      {field.label}
                    </span>
                    <textarea
                      value={form[field.key]}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      rows={5}
                      className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
              >
                {isSaving ? "保存中..." : "基本情報を保存する"}
              </button>
            </form>

            <section className="space-y-5 rounded-2xl bg-white p-4 shadow md:p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
                  履歴書PDF
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
                  外部で作成したPDF履歴書を保存できます。応募メール・カバーレター作成画面では最新PDFを参照できます。
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-gray-900">
                    PDFファイル
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) =>
                      setSelectedFile(event.target.files?.[0] || null)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 text-base font-medium text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-bold file:text-blue-700"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="mt-4 w-full rounded-lg bg-green-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-green-300 sm:w-auto"
                >
                  {isUploading ? "アップロード中..." : "PDFをアップロード"}
                </button>
              </div>

              <div className="space-y-3">
                {resumeFiles.length ? (
                  resumeFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="break-words font-bold text-gray-900">
                          {file.file_name}
                          {index === 0 ? (
                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                              最新
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-700">
                          {formatDateTime(file.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        {file.signed_url ? (
                          <a
                            href={file.signed_url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-bold text-gray-900 sm:w-auto"
                          >
                            PDFを開く
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(file)}
                          disabled={deletingFileId === file.id}
                          className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-red-300 sm:w-auto"
                        >
                          {deletingFileId === file.id ? "削除中..." : "削除"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm font-bold text-gray-700">
                    保存済みPDFはまだありません。
                  </p>
                )}
              </div>
            </section>

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
          </>
        )}
      </div>
    </main>
  );
}
