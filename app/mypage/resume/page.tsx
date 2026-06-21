"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ExperiencePeriodFields from "@/components/ExperiencePeriodFields";
import NzLocationPicker from "@/components/NzLocationPicker";
import { skillOptions } from "@/lib/constants/applicationOptions";
import type { ExperienceItem } from "@/lib/services/applicationWriter";
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
  skills_list: string[];
  experience_items: ExperienceItem[];
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

const initialResumeForm: ResumeForm = {
  full_name: "",
  email: "",
  phone: "",
  current_city: "",
  visa_type: "",
  available_from: "",
  work_experience: "",
  skills: "",
  skills_list: [],
  experience_items: [],
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
  const [customSkill, setCustomSkill] = useState("");

  const getAccessToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token || "";
  };

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

    const accessToken = await getAccessToken();
    const response = await fetch("/api/mypage/resume", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = (await response.json()) as {
      resume: Partial<ResumeForm> | null;
      files: ResumeFile[];
      email: string;
      message?: string;
    };

    if (!response.ok) {
      setErrorMessage(
        `履歴書情報の読み込みに失敗しました。${data.message || "時間をおいて再度お試しください。"}`,
      );
      setIsLoading(false);
      return;
    }

    if (data.resume) {
      setForm({
        full_name: data.resume.full_name || "",
        email: data.resume.email || data.email || "",
        phone: data.resume.phone || "",
        current_city: data.resume.current_city || "",
        visa_type: data.resume.visa_type || "",
        available_from: data.resume.available_from || "",
        work_experience: data.resume.work_experience || "",
        skills: data.resume.skills || "",
        skills_list: data.resume.skills_list || [],
        experience_items: data.resume.experience_items || [],
        english_level: data.resume.english_level || "",
        self_introduction: data.resume.self_introduction || "",
      });
    } else {
      setForm({
        ...initialResumeForm,
        email: data.email || user.email || "",
      });
    }

    setResumeFiles(data.files || []);
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

  const updateExperienceItem = (
    index: number,
    key: keyof ExperienceItem,
    value: string | boolean,
  ) => {
    setForm((current) => {
      const nextItems = [...current.experience_items];
      nextItems[index] = {
        ...nextItems[index],
        [key]: value,
      };

      return {
        ...current,
        experience_items: nextItems,
      };
    });
  };

  const addExperienceItem = () => {
    setForm((current) => ({
      ...current,
      experience_items: [
        ...current.experience_items,
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
    setForm((current) => ({
      ...current,
      experience_items: current.experience_items.filter(
        (_item, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const toggleSkill = (skill: string) => {
    setForm((current) => {
      const exists = current.skills_list.includes(skill);

      return {
        ...current,
        skills_list: exists
          ? current.skills_list.filter((item) => item !== skill)
          : [...current.skills_list, skill],
      };
    });
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();

    if (!skill) return;

    setForm((current) => ({
      ...current,
      skills_list: current.skills_list.includes(skill)
        ? current.skills_list
        : [...current.skills_list, skill],
    }));
    setCustomSkill("");
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

    const payload = {
      ...form,
      available_from: form.available_from || null,
    };
    const accessToken = await getAccessToken();
    const response = await fetch("/api/mypage/resume", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
      setIsSaving(false);
      setErrorMessage(
        `保存に失敗しました。${data.message || "時間をおいて再度お試しください。"}`,
      );
      return;
    }

    await loadResume();
    setIsSaving(false);

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

    const formData = new FormData();
    formData.append("file", selectedFile);
    const accessToken = await getAccessToken();
    const uploadResponse = await fetch("/api/mypage/resume/file", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
    const uploadData = (await uploadResponse.json()) as { message?: string };

    if (!uploadResponse.ok) {
      setIsUploading(false);
      setErrorMessage(
        `PDFのアップロードに失敗しました。${uploadData.message || "時間をおいて再度お試しください。"}`,
      );
      return;
    }

    setIsUploading(false);

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

    const accessToken = await getAccessToken();
    const deleteResponse = await fetch(
      `/api/mypage/resume/file?id=${encodeURIComponent(file.id)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const deleteData = (await deleteResponse.json()) as { message?: string };

    if (!deleteResponse.ok) {
      setDeletingFileId("");
      setErrorMessage(
        `PDFファイルの削除に失敗しました。${deleteData.message || "時間をおいて再度お試しください。"}`,
      );
      return;
    }

    setDeletingFileId("");

    setResumeFiles((current) => current.filter((item) => item.id !== file.id));
    setSuccessMessage("履歴書PDFを削除しました。");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="min-w-0">
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">履歴書管理</h1>
            <p className="mt-2 text-base font-medium leading-7 text-gray-800">
              応募メールやカバーレター作成に使う基本情報とPDF履歴書を保存できます。
            </p>
          </div>
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
                      value={String(form[field.key] || "")}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 p-3 text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>

              <NzLocationPicker
                label="現在地（地域・市区町村・地区）"
                value={form.current_city}
                onChange={(value) => updateField("current_city", value)}
                allLabel="未設定"
                showCurrentLocation={false}
              />

              <div className="space-y-4">
                {textAreaFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-2 block text-sm font-bold text-gray-900">
                      {field.label}
                    </span>
                    <textarea
                      value={String(form[field.key] || "")}
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

              <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      職歴・経験
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-gray-800">
                      応募文で自然な英語の職務経験として使います。
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
                  {form.experience_items.length === 0 ? (
                    <p className="rounded-lg bg-white p-3 text-sm font-bold text-gray-700">
                      まだ構造化された経験はありません。
                    </p>
                  ) : (
                    form.experience_items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-white p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="font-bold text-gray-900">
                            経験 {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeExperienceItem(index)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
                          >
                            削除
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="block">
                            <span className="text-sm font-bold text-gray-900">
                              会社名
                            </span>
                            <input
                              value={item.company || ""}
                              onChange={(event) =>
                                updateExperienceItem(
                                  index,
                                  "company",
                                  event.target.value,
                                )
                              }
                              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
                              placeholder="例: ABC Cafe"
                            />
                          </label>
                          <label className="block">
                            <span className="text-sm font-bold text-gray-900">
                              役職
                            </span>
                            <input
                              value={item.role || ""}
                              onChange={(event) =>
                                updateExperienceItem(
                                  index,
                                  "role",
                                  event.target.value,
                                )
                              }
                              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
                              placeholder="例: Cafe staff"
                            />
                          </label>
                          <ExperiencePeriodFields
                            item={item}
                            onChange={(key, value) =>
                              updateExperienceItem(index, key, value)
                            }
                          />
                          <label className="block md:col-span-2">
                            <span className="text-sm font-bold text-gray-900">
                              業務内容
                            </span>
                            <textarea
                              value={item.description || ""}
                              onChange={(event) =>
                                updateExperienceItem(
                                  index,
                                  "description",
                                  event.target.value,
                                )
                              }
                              rows={3}
                              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
                              placeholder="例: 接客、レジ、清掃、簡単な調理を担当"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="text-sm font-bold text-gray-900">
                              実績・強み
                            </span>
                            <textarea
                              value={item.achievement || ""}
                              onChange={(event) =>
                                updateExperienceItem(
                                  index,
                                  "achievement",
                                  event.target.value,
                                )
                              }
                              rows={3}
                              className="mt-2 w-full rounded-lg border border-gray-300 p-3 font-medium text-gray-900"
                              placeholder="例: 忙しい時間帯でも落ち着いて対応できる"
                            />
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h2 className="text-lg font-bold text-gray-900">
                  キースキル
                </h2>
                <p className="mt-1 text-sm font-medium leading-6 text-gray-800">
                  よく使うスキルを選択できます。自分で追加もできます。
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {skillOptions.map((skill) => {
                    const selected = form.skills_list.includes(skill);

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

                {form.skills_list.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.skills_list.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"
                      >
                        {skill} ×
                      </button>
                    ))}
                  </div>
                ) : null}
              </section>

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
