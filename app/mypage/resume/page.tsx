"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function ResumePage() {
  const router = useRouter();
  const [form, setForm] = useState<ResumeForm>(initialResumeForm);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
              応募メールやカバーレター作成に使うプロフィール、職歴、スキルを保存できます。
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
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            ← マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
