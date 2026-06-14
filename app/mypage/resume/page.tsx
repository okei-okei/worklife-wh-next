"use client";

import { useCallback, useEffect, useState } from "react";
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

export default function ResumePage() {
  const router = useRouter();
  const [form, setForm] = useState<ResumeForm>(initialResumeForm);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

    const { data, error } = await supabase
      .from("resumes")
      .select(
        "full_name, email, phone, current_city, visa_type, available_from, work_experience, skills, english_level, self_introduction",
      )
      .eq("user_id", user.id)
      .maybeSingle<Partial<ResumeForm>>();

    if (error) {
      setErrorMessage(`履歴書情報の読み込みに失敗しました。${error.message}`);
      setIsLoading(false);
      return;
    }

    if (data) {
      setForm({
        full_name: data.full_name || "",
        email: data.email || user.email || "",
        phone: data.phone || "",
        current_city: data.current_city || "",
        visa_type: data.visa_type || "",
        available_from: data.available_from || "",
        work_experience: data.work_experience || "",
        skills: data.skills || "",
        english_level: data.english_level || "",
        self_introduction: data.self_introduction || "",
      });
    } else {
      setForm({
        ...initialResumeForm,
        email: user.email || "",
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
              応募メールやカバーレター作成に使う基本情報を保存できます。
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

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto"
            >
              {isSaving ? "保存中..." : "保存する"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
