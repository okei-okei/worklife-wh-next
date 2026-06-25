"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  LegalConsentCheckboxes,
  LegalLink,
} from "@/components/LegalConsentCheckboxes";
import NzLocationPicker from "@/components/NzLocationPicker";
import { LEGAL_VERSION } from "@/app/legal/_data/legalDocuments";
import { supabase } from "@/lib/supabase";

type SubmissionType = "job" | "property";
type CountryCode = "NZ" | "AU" | "CA";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const draftStorageKey = "worklife-wh-listing-submission-draft";

type ListingDraft = {
  type: SubmissionType;
  countryCode: CountryCode;
  title: string;
  companyOrOwner: string;
  email: string;
  description: string;
  url: string;
  region: string;
  district: string;
  area: string;
  address: string;
  employmentType: string;
  hourlyRateMin: string;
  hourlyRateMax: string;
  weeklyHours: string;
  accommodationAvailable: boolean;
  startDate: string;
  applicationMethod: string;
  japaneseOk: boolean;
  englishLevel: string;
  visaConditions: string;
  rentWeekly: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  availableFrom: string;
  petsAllowed: boolean;
  furnished: boolean;
  utilitiesIncluded: boolean;
};

export default function CompanySubmitPage() {
  const [type, setType] = useState<SubmissionType>("job");
  const [countryCode, setCountryCode] = useState<CountryCode>("NZ");
  const [title, setTitle] = useState("");
  const [companyOrOwner, setCompanyOrOwner] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [hourlyRateMin, setHourlyRateMin] = useState("");
  const [hourlyRateMax, setHourlyRateMax] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [accommodationAvailable, setAccommodationAvailable] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [applicationMethod, setApplicationMethod] = useState("");
  const [japaneseOk, setJapaneseOk] = useState(false);
  const [englishLevel, setEnglishLevel] = useState("");
  const [visaConditions, setVisaConditions] = useState("");
  const [rentWeekly, setRentWeekly] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [agreedToPostingTerms, setAgreedToPostingTerms] = useState(false);
  const [agreedToBusinessTerms, setAgreedToBusinessTerms] = useState(false);
  const [agreedToPersonalDataUse, setAgreedToPersonalDataUse] = useState(false);
  const [agreedNoIllegalFee, setAgreedNoIllegalFee] = useState(false);
  const [agreedNoDiscrimination, setAgreedNoDiscrimination] = useState(false);
  const [agreedListingAuthority, setAgreedListingAuthority] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getDraft = (): ListingDraft => ({
    type,
    countryCode,
    title,
    companyOrOwner,
    email,
    description,
    url,
    region,
    district,
    area,
    address,
    employmentType,
    hourlyRateMin,
    hourlyRateMax,
    weeklyHours,
    accommodationAvailable,
    startDate,
    applicationMethod,
    japaneseOk,
    englishLevel,
    visaConditions,
    rentWeekly,
    bedrooms,
    bathrooms,
    parkingSpaces,
    availableFrom,
    petsAllowed,
    furnished,
    utilitiesIncluded,
  });

  const applyDraft = (draft: Partial<ListingDraft>) => {
    if (draft.type === "job" || draft.type === "property") setType(draft.type);
    if (draft.countryCode === "NZ" || draft.countryCode === "AU" || draft.countryCode === "CA") setCountryCode(draft.countryCode);
    setTitle(draft.title || "");
    setCompanyOrOwner(draft.companyOrOwner || "");
    setEmail(draft.email || "");
    setDescription(draft.description || "");
    setUrl(draft.url || "");
    setRegion(draft.region || "");
    setDistrict(draft.district || "");
    setArea(draft.area || "");
    setAddress(draft.address || "");
    setEmploymentType(draft.employmentType || "");
    setHourlyRateMin(draft.hourlyRateMin || "");
    setHourlyRateMax(draft.hourlyRateMax || "");
    setWeeklyHours(draft.weeklyHours || "");
    setAccommodationAvailable(Boolean(draft.accommodationAvailable));
    setStartDate(draft.startDate || "");
    setApplicationMethod(draft.applicationMethod || "");
    setJapaneseOk(Boolean(draft.japaneseOk));
    setEnglishLevel(draft.englishLevel || "");
    setVisaConditions(draft.visaConditions || "");
    setRentWeekly(draft.rentWeekly || "");
    setBedrooms(draft.bedrooms || "");
    setBathrooms(draft.bathrooms || "");
    setParkingSpaces(draft.parkingSpaces || "");
    setAvailableFrom(draft.availableFrom || "");
    setPetsAllowed(Boolean(draft.petsAllowed));
    setFurnished(Boolean(draft.furnished));
    setUtilitiesIncluded(Boolean(draft.utilitiesIncluded));
  };

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(draftStorageKey);
    if (!savedDraft) return;

    window.setTimeout(() => {
      try {
        applyDraft(JSON.parse(savedDraft) as Partial<ListingDraft>);
        setMessage("一時保存した入力内容を復元しました。");
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }, 0);
  }, []);

  const saveDraft = () => {
    window.localStorage.setItem(draftStorageKey, JSON.stringify(getDraft()));
    setMessage("入力内容をこのブラウザに一時保存しました。");
    setErrorMessage("");
  };

  const clearDraft = () => {
    window.localStorage.removeItem(draftStorageKey);
    setMessage("一時保存を削除しました。");
    setErrorMessage("");
  };

  const resetForm = () => {
    setTitle("");
    setCompanyOrOwner("");
    setEmail("");
    setDescription("");
    setUrl("");
    setRegion("");
    setDistrict("");
    setArea("");
    setAddress("");
    setEmploymentType("");
    setHourlyRateMin("");
    setHourlyRateMax("");
    setWeeklyHours("");
    setAccommodationAvailable(false);
    setStartDate("");
    setApplicationMethod("");
    setJapaneseOk(false);
    setEnglishLevel("");
    setVisaConditions("");
    setRentWeekly("");
    setBedrooms("");
    setBathrooms("");
    setParkingSpaces("");
    setAvailableFrom("");
    setPetsAllowed(false);
    setFurnished(false);
    setUtilitiesIncluded(false);
    setFiles([]);
    setAgreedToPostingTerms(false);
    setAgreedToBusinessTerms(false);
    setAgreedToPersonalDataUse(false);
    setAgreedNoIllegalFee(false);
    setAgreedNoDiscrimination(false);
    setAgreedListingAuthority(false);
  };

  const handleFiles = (selectedFiles: FileList | null) => {
    const nextFiles = Array.from(selectedFiles || []);
    const maxFiles = type === "job" ? 1 : 10;

    if (nextFiles.length > maxFiles) {
      setErrorMessage(
        type === "job"
          ? "求人画像は1枚までです。"
          : "物件画像は10枚までです。",
      );
      return;
    }

    const invalid = nextFiles.find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024,
    );

    if (invalid) {
      setErrorMessage("画像はjpg/png/webp、1枚5MB以下にしてください。");
      return;
    }

    setErrorMessage("");
    setFiles(nextFiles);
  };

  const uploadImages = async (submissionId: string) => {
    const imageUrls: string[] = [];

    for (const [index, file] of files.entries()) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${submissionId}/${Date.now()}-${index}.${extension}`;
      const { error } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file, { upsert: false });

      if (error) throw error;

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);
      imageUrls.push(data.publicUrl);
    }

    return imageUrls;
  };

  const submitMinimalDirectly = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("listing_submissions").insert({
      user_id: user?.id ?? null,
      type,
      title: title.trim(),
      company_or_owner: companyOrOwner.trim() || null,
      email: email.trim(),
      description: description.trim() || null,
      url: url.trim() || null,
      status: "pending",
    });

    if (error) throw error;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!title.trim() || !email.trim()) {
      setErrorMessage("タイトルと連絡先メールを入力してください。");
      return;
    }

    if (
      !agreedToPostingTerms ||
      !agreedToBusinessTerms ||
      !agreedToPersonalDataUse ||
      !agreedNoIllegalFee ||
      !agreedNoDiscrimination ||
      (type === "property" && !agreedListingAuthority)
    ) {
      setErrorMessage("必須の確認事項すべてへの同意が必要です。");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const baseStructuredData = {
        country_code: countryCode,
        region: region || null,
        district: district || null,
        suburb: area || null,
        area: area || null,
        address: address || null,
      };

      const structuredData =
        type === "job"
          ? {
              ...baseStructuredData,
              employment_type: employmentType || null,
              japanese_ok: japaneseOk,
              english_level: englishLevel || null,
              visa_conditions: visaConditions || null,
              visa_support:
                /ワーホリ|working holiday|work visa|就労/i.test(
                  visaConditions,
                ),
              hourly_rate_min: hourlyRateMin ? Number(hourlyRateMin) : null,
              hourly_rate_max: hourlyRateMax ? Number(hourlyRateMax) : null,
              weekly_hours: weeklyHours ? Number(weeklyHours) : null,
              accommodation_available: accommodationAvailable,
              start_date: startDate || null,
              application_method: applicationMethod || null,
            }
          : {
              ...baseStructuredData,
              rent_weekly: rentWeekly ? Number(rentWeekly) : null,
              bedrooms: bedrooms ? Number(bedrooms) : null,
              bathrooms: bathrooms ? Number(bathrooms) : null,
              parking_spaces: parkingSpaces ? Number(parkingSpaces) : null,
              available_from: availableFrom || null,
              pets_allowed: petsAllowed,
              furnished,
              utilities_included: utilitiesIncluded,
            };

      let imageUrls: string[] = [];
      if (files.length) {
        try {
          imageUrls = await uploadImages(`submission-${Date.now()}`);
        } catch (uploadError) {
          console.error(uploadError);
          imageUrls = [];
        }
      }

      const response = await fetch("/api/listing-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          type,
          title: title.trim(),
          company_or_owner: companyOrOwner.trim() || null,
          email: email.trim(),
          description: description.trim() || null,
          url: url.trim() || null,
          country_code: countryCode,
          region: region || null,
          district: district || null,
          suburb: area || null,
          area: area || null,
          address: address || null,
          structured_data: structuredData,
          image_urls: imageUrls,
          consent_versions: {
            posting_terms:
              type === "job" ? "job_posting" : "property_posting",
            business_terms: "business_terms",
            version: LEGAL_VERSION,
          },
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        try {
          await submitMinimalDirectly();
        } catch (fallbackError) {
          const fallbackMessage =
            fallbackError instanceof Error
              ? fallbackError.message
              : "直接送信にも失敗しました。";
          throw new Error(
            `${data?.error || "掲載申請を送信できませんでした。"} / fallback: ${fallbackMessage}`,
          );
        }
      }

      setMessage("掲載申請を受け付けました。確認後、承認された内容を公開します。");
      window.localStorage.removeItem(draftStorageKey);
      resetForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "掲載申請を送信できませんでした。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-blue-700">
              WorkLife WH 掲載申請
            </p>
            <h1 className="text-2xl font-bold md:text-4xl">
              求人・物件の掲載申請
            </h1>
            <p className="mt-2 max-w-3xl font-medium leading-7 text-gray-700">
              申請内容を運営者が確認し、承認後に公開します。
            </p>
          </div>
          <Link
            href="/"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-bold text-gray-900 sm:w-auto"
          >
            TOPへ戻る
          </Link>
        </header>

        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium leading-6 text-blue-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>
              入力途中の内容は、このブラウザに一時保存できます。送信前の下書きとして利用してください。
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={saveDraft}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-bold text-white hover:bg-blue-700 sm:w-auto"
              >
                入力内容を一時保存
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-center font-bold text-blue-800 hover:bg-blue-50 sm:w-auto"
              >
                一時保存を削除
              </button>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <h2 className="text-xl font-bold">1. 掲載種別</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["job", "property"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setType(value);
                    setFiles([]);
                  }}
                  className={`rounded-lg px-4 py-3 font-bold ${
                    type === value
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  {value === "job" ? "求人掲載" : "物件掲載"}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <h2 className="text-xl font-bold">2. 基本情報</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-sm font-bold">タイトル</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={inputClass}
                  required
                />
              </label>
              <label>
                <span className="text-sm font-bold">
                  {type === "job" ? "会社名" : "掲載者・管理者名"}
                </span>
                <input
                  value={companyOrOwner}
                  onChange={(event) => setCompanyOrOwner(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-sm font-bold">連絡先メール</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  required
                />
              </label>
              <label>
                <span className="text-sm font-bold">外部URL</span>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="text-sm font-bold">国</span>
                <select
                  value={countryCode}
                  onChange={(event) =>
                    setCountryCode(event.target.value as CountryCode)
                  }
                  className={inputClass}
                >
                  <option value="NZ">New Zealand</option>
                  <option value="AU">Australia</option>
                  <option value="CA">Canada</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">住所</span>
                <input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className={inputClass}
                  placeholder={
                    type === "job"
                      ? "例: Queen Street, Auckland"
                      : "例: 123 Queen Street, Auckland"
                  }
                />
                <span className="mt-1 block text-xs font-medium text-gray-600">
                  承認後、座標が登録されている場合はライフプランナーの地図ビューで利用できます。
                </span>
              </label>
            </div>

            <div className="mt-4">
              {countryCode === "NZ" ? (
                <NzLocationPicker
                  label="地域"
                  onChange={() => undefined}
                  allLabel="未設定"
                  showCurrentLocation={false}
                  onSelectionChange={(selection) => {
                    setRegion(selection.region);
                    setDistrict(selection.district);
                    setArea(selection.area);
                  }}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Region", region, setRegion],
                    ["City / District", district, setDistrict],
                    ["Area / Suburb", area, setArea],
                  ].map(([label, value, setter]) => (
                    <label key={label as string}>
                      <span className="text-sm font-bold">{label as string}</span>
                      <input
                        value={value as string}
                        onChange={(event) =>
                          (setter as (value: string) => void)(event.target.value)
                        }
                        className={inputClass}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>

          {type === "job" ? (
            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <h2 className="text-xl font-bold">3. 求人条件</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <label>
                  <span className="text-sm font-bold">採用形態</span>
                  <select
                    value={employmentType}
                    onChange={(event) => setEmploymentType(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">選択してください</option>
                    {[
                      "Full-time",
                      "Part-time",
                      "Casual",
                      "Seasonal",
                      "Fixed-term",
                      "Internship",
                    ].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="text-sm font-bold">時給下限</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRateMin}
                    onChange={(event) => setHourlyRateMin(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="text-sm font-bold">時給上限</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRateMax}
                    onChange={(event) => setHourlyRateMax(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="text-sm font-bold">週勤務時間</span>
                  <input
                    type="number"
                    min="0"
                    value={weeklyHours}
                    onChange={(event) => setWeeklyHours(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label>
                  <span className="text-sm font-bold">勤務開始可能日</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 font-bold">
                  <input
                    type="checkbox"
                    checked={accommodationAvailable}
                    onChange={(event) =>
                      setAccommodationAvailable(event.target.checked)
                    }
                    className="h-5 w-5"
                  />
                  住み込み可能
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 font-bold">
                  <input
                    type="checkbox"
                    checked={japaneseOk}
                    onChange={(event) => setJapaneseOk(event.target.checked)}
                    className="h-5 w-5"
                  />
                  日本語対応あり
                </label>
                <label>
                  <span className="text-sm font-bold">必要な英語レベル</span>
                  <select
                    value={englishLevel}
                    onChange={(event) => setEnglishLevel(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">未設定</option>
                    <option value="初級">初級</option>
                    <option value="中級">中級</option>
                    <option value="上級">上級</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-bold">応募方法</span>
                <input
                  value={applicationMethod}
                  onChange={(event) => setApplicationMethod(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-bold">ビザ条件</span>
                <select
                  value={visaConditions}
                  onChange={(event) => setVisaConditions(event.target.value)}
                  className={inputClass}
                >
                  <option value="">未設定</option>
                  <option value="ワーホリビザ可">ワーホリビザ可</option>
                  <option value="学生ビザ可">学生ビザ可</option>
                  <option value="就労可能なビザ必須">就労可能なビザ必須</option>
                </select>
              </label>
            </section>
          ) : (
            <section className="rounded-2xl bg-white p-4 shadow md:p-6">
              <h2 className="text-xl font-bold">3. 物件条件</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  ["週家賃", rentWeekly, setRentWeekly],
                  ["ベッドルーム数", bedrooms, setBedrooms],
                  ["バスルーム数", bathrooms, setBathrooms],
                  ["駐車場数", parkingSpaces, setParkingSpaces],
                ].map(([label, value, setter]) => (
                  <label key={label as string}>
                    <span className="text-sm font-bold">{label as string}</span>
                    <input
                      type="number"
                      min="0"
                      value={value as string}
                      onChange={(event) =>
                        (setter as (value: string) => void)(event.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                ))}
                <label>
                  <span className="text-sm font-bold">入居可能日</span>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(event) => setAvailableFrom(event.target.value)}
                    className={inputClass}
                  />
                </label>
                {[
                  ["ペット可", petsAllowed, setPetsAllowed],
                  ["家具付き", furnished, setFurnished],
                  ["光熱費込み", utilitiesIncluded, setUtilitiesIncluded],
                ].map(([label, checked, setter]) => (
                  <label
                    key={label as string}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 font-bold"
                  >
                    <input
                      type="checkbox"
                      checked={checked as boolean}
                      onChange={(event) =>
                        (setter as (value: boolean) => void)(
                          event.target.checked,
                        )
                      }
                      className="h-5 w-5"
                    />
                    {label as string}
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
            <h2 className="text-xl font-bold">4. 説明と画像</h2>
            <label className="mt-4 block">
              <span className="text-sm font-bold">
                {type === "job" ? "職務内容" : "物件説明"}
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                className={inputClass}
              />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-bold">
                画像（{type === "job" ? "任意・1枚" : "最大10枚"}）
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={type === "property"}
                onChange={(event) => handleFiles(event.target.files)}
                className={inputClass}
              />
              <span className="mt-1 block text-xs font-medium text-gray-600">
                jpg/png/webp、1枚5MB以下
              </span>
            </label>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow md:p-6">
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
                        <LegalLink href="/legal/job-listing-terms">
                          求人掲載規約
                        </LegalLink>
                        に同意します
                      </>
                    ) : (
                      <>
                        <LegalLink href="/legal/property-listing-terms">
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
                      ? "応募者情報を採用目的の範囲でのみ利用します"
                      : "問い合わせ者情報を入居関連目的の範囲でのみ利用します",
                },
                {
                  id: "illegal-fee",
                  checked: agreedNoIllegalFee,
                  onChange: setAgreedNoIllegalFee,
                  required: true,
                  label:
                    type === "job"
                      ? "応募者に違法な費用負担を求めません"
                      : "違法なletting feeを請求しません",
                },
                {
                  id: "discrimination",
                  checked: agreedNoDiscrimination,
                  onChange: setAgreedNoDiscrimination,
                  required: true,
                  label:
                    type === "job"
                      ? "差別的な求人ではありません"
                      : "差別的な条件・広告ではありません",
                },
                ...(type === "property"
                  ? [
                      {
                        id: "listing-authority",
                        checked: agreedListingAuthority,
                        onChange: setAgreedListingAuthority,
                        required: true,
                        label: "この物件を掲載する正当な権限があります",
                      },
                    ]
                  : []),
              ]}
            />

            {errorMessage ? (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
                {errorMessage}
              </p>
            ) : null}
            {message ? (
              <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">
                {message}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-gray-300 sm:w-auto"
              >
                {isSubmitting ? "送信中..." : "掲載申請を送信"}
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}
