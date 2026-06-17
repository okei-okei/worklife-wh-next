"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  LegalConsentCheckboxes,
  LegalLink,
} from "@/components/LegalConsentCheckboxes";
import { LEGAL_VERSION } from "@/app/legal/_data/legalDocuments";
import { supabase } from "@/lib/supabase";

type SubmissionType = "job" | "property";

export default function CompanySubmitPage() {
  const [type, setType] = useState<SubmissionType>("job");
  const [title, setTitle] = useState("");
  const [companyOrOwner, setCompanyOrOwner] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [agreedToPostingTerms, setAgreedToPostingTerms] = useState(false);
  const [agreedToBusinessTerms, setAgreedToBusinessTerms] = useState(false);
  const [agreedToPersonalDataUse, setAgreedToPersonalDataUse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setType("job");
    setTitle("");
    setCompanyOrOwner("");
    setEmail("");
    setDescription("");
    setUrl("");
    setAgreedToPostingTerms(false);
    setAgreedToBusinessTerms(false);
    setAgreedToPersonalDataUse(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("タイトルを入力してください。");
      return;
    }

    if (
      !agreedToPostingTerms ||
      !agreedToBusinessTerms ||
      !agreedToPersonalDataUse
    ) {
      setErrorMessage("掲載に必要な規約と個人情報取扱いへの同意が必要です。");
      return;
    }

    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const submissionPayload = {
      user_id: user?.id ?? null,
      type,
      title: title.trim(),
      company_or_owner: companyOrOwner.trim() || null,
      email: email.trim() || null,
      description: description.trim() || null,
      url: url.trim() || null,
      status: "pending",
      consent_versions: {
        posting_terms:
          type === "job" ? "job_posting" : "property_posting",
        business_terms: "business_terms",
        version: LEGAL_VERSION,
        agreed_to_personal_data_use: true,
      },
    };

    let { error } = await supabase
      .from("listing_submissions")
      .insert(submissionPayload);

    if (error?.message.includes("column")) {
      const fallbackPayload = {
        user_id: submissionPayload.user_id,
        type: submissionPayload.type,
        title: submissionPayload.title,
        company_or_owner: submissionPayload.company_or_owner,
        email: submissionPayload.email,
        description: submissionPayload.description,
        url: submissionPayload.url,
        status: submissionPayload.status,
      };
      const fallbackResult = await supabase
        .from("listing_submissions")
        .insert(fallbackPayload);
      error = fallbackResult.error;
    }

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("掲載申請を受け付けました。運営側で内容を確認します。");
    resetForm();
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 掲載申請
            </p>
            <h1 className="text-4xl font-bold">求人・物件の掲載申請</h1>
            <p className="mt-2 text-gray-600">
              求人掲載企業・物件オーナー向けの申請フォームです。
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg bg-gray-500 px-4 py-2 text-white"
          >
            ← TOPへ戻る
          </Link>
        </div>

        <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-900">
          <h2 className="text-xl font-bold">掲載前の注意</h2>
          <p className="mt-2 leading-7">
            違法求人、最低賃金違反、虚偽条件の掲載、ビザ違反を誘導する内容、
            差別的な条件提示、詐欺的な募集や物件掲載は禁止です。申請内容は運営が確認し、
            不適切と判断した場合は掲載を見送ることがあります。
          </p>
        </section>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow">
          <div className="space-y-5">
            <div>
              <span className="mb-2 block text-sm font-bold text-gray-700">
                掲載種別
              </span>

              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={
                    type === "job"
                      ? "cursor-pointer rounded-xl border-2 border-blue-500 bg-blue-50 p-4"
                      : "cursor-pointer rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                  }
                >
                  <input
                    type="radio"
                    name="type"
                    value="job"
                    checked={type === "job"}
                    onChange={() => setType("job")}
                    className="mr-2"
                  />
                  <span className="font-bold">求人掲載</span>
                </label>

                <label
                  className={
                    type === "property"
                      ? "cursor-pointer rounded-xl border-2 border-blue-500 bg-blue-50 p-4"
                      : "cursor-pointer rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
                  }
                >
                  <input
                    type="radio"
                    name="type"
                    value="property"
                    checked={type === "property"}
                    onChange={() => setType("property")}
                    className="mr-2"
                  />
                  <span className="font-bold">物件掲載</span>
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-700">
                タイトル
              </span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例: Auckland CBD カフェスタッフ募集"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">
                  掲載者名
                </span>
                <input
                  type="text"
                  value={companyOrOwner}
                  onChange={(event) => setCompanyOrOwner(event.target.value)}
                  placeholder="会社名・店舗名・オーナー名"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">
                  メールアドレス
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="contact@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-700">
                説明
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={7}
                placeholder="仕事内容、勤務条件、物件条件、家賃、所在地、応募・問い合わせ方法などを入力してください。"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-gray-700">
                関連URL
              </span>
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/listing"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <LegalConsentCheckboxes
              items={[
                {
                  id: "posting-terms",
                  checked: agreedToPostingTerms,
                  onChange: setAgreedToPostingTerms,
                  required: true,
                  label:
                    type === "job" ? (
                      <>
                        <LegalLink href="/legal/job-posting">
                          求人掲載規約
                        </LegalLink>
                        に同意します
                      </>
                    ) : (
                      <>
                        <LegalLink href="/legal/property-posting">
                          物件掲載規約
                        </LegalLink>
                        に同意します
                      </>
                    ),
                },
                {
                  id: "business-terms",
                  checked: agreedToBusinessTerms,
                  onChange: setAgreedToBusinessTerms,
                  required: true,
                  label: (
                    <>
                      <LegalLink href="/legal/business-terms">
                        企業・掲載者向け利用規約
                      </LegalLink>
                      に同意します
                    </>
                  ),
                },
                {
                  id: "personal-data",
                  checked: agreedToPersonalDataUse,
                  onChange: setAgreedToPersonalDataUse,
                  required: true,
                  label:
                    type === "job"
                      ? "応募者情報を採用目的の範囲でのみ利用し、適用法令を遵守します"
                      : "問い合わせ者情報を入居関連目的の範囲でのみ利用し、適用法令を遵守します",
                },
              ]}
            />

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? "送信中..." : "掲載申請を送信"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
