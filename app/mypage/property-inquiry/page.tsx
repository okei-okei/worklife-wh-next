"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import NzLocationPicker from "@/components/NzLocationPicker";
import {
  generatePropertyInquiryEmail,
  type ApplicationResume,
  type ApplicationTarget,
  type PropertyInquiryDetails,
} from "@/lib/services/applicationWriter";
import { supabase } from "@/lib/supabase";

type SourceMode = "saved" | "manual";

type SavedProperty = {
  id: string;
  title: string;
  url: string | null;
  location: string | null;
  address: string | null;
  rent_weekly: number | null;
  status: string | null;
};

type DraftRow = {
  form_data: Partial<PropertyInquiryDetails> | null;
};

const emptyManualProperty = {
  title: "",
  url: "",
  location: "",
  address: "",
  ownerName: "",
  rentWeekly: "",
};

const emptyPropertyDetails: PropertyInquiryDetails = {
  fullName: "",
  currentCity: "",
  desiredMoveInDate: "",
  plannedStayDuration: "",
  occupants: "",
  occupation: "",
  selfIntroduction: "",
  viewingAvailability: "",
  questions: "",
  additionalMessage: "",
};

function formatRent(value: number | null) {
  if (value === null) return "未設定";

  return `$${value}/週`;
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

function PropertyInquiryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyIdFromQuery = searchParams.get("saved_property_id") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [userId, setUserId] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] =
    useState(propertyIdFromQuery);
  const [sourceMode, setSourceMode] = useState<SourceMode>("saved");
  const [manualProperty, setManualProperty] = useState(emptyManualProperty);
  const [propertyDetails, setPropertyDetails] =
    useState<PropertyInquiryDetails>(emptyPropertyDetails);
  const [draft, setDraft] = useState("");
  const [lastGenerationSignature, setLastGenerationSignature] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const buildResumeDefaults = (resumeData: ApplicationResume | null) => ({
    ...emptyPropertyDetails,
    fullName: resumeData?.full_name || "",
    currentCity: resumeData?.current_city || "",
    selfIntroduction: resumeData?.self_introduction || "",
    occupation: resumeData?.visa_type || "",
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
        .select("full_name,current_city,visa_type,self_introduction")
        .eq("user_id", user.id)
        .maybeSingle<ApplicationResume>();

      const resumeResult = isMissingRelationError(extendedResumeResult.error)
        ? { data: null, error: null }
        : extendedResumeResult.error &&
        isMissingColumnError(extendedResumeResult.error)
          ? await supabase
              .from("resumes")
              .select("full_name,current_city,visa_type,self_introduction")
              .eq("user_id", user.id)
              .maybeSingle<ApplicationResume>()
          : extendedResumeResult;

      const [propertiesResult, draftResult] = await Promise.all([
        supabase
          .from("saved_properties")
          .select("id,title,url,location,address,rent_weekly,status")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_form_drafts")
          .select("form_data")
          .eq("user_id", user.id)
          .eq("draft_type", "property_inquiry")
          .maybeSingle<DraftRow>(),
      ]);

      if (!isMounted) return;

      if (propertiesResult.error) {
        setErrorMessage(propertiesResult.error.message);
        setProperties([]);
      } else {
        const savedProperties = propertiesResult.data || [];
        setProperties(savedProperties);

        if (!propertyIdFromQuery && savedProperties[0]?.id) {
          setSelectedPropertyId(savedProperties[0].id);
        }
      }

      const resumeDefaults = resumeResult.error
        ? emptyPropertyDetails
        : buildResumeDefaults(resumeResult.data);

      if (draftResult.error) {
        console.warn(draftResult.error.message);
        setPropertyDetails(resumeDefaults);
      } else if (draftResult.data?.form_data) {
        setPropertyDetails({
          ...resumeDefaults,
          ...draftResult.data.form_data,
        });
      } else {
        setPropertyDetails(resumeDefaults);
      }

      setIsLoading(false);
    };

    const timer = window.setTimeout(loadData, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
    };
  }, [propertyIdFromQuery, router]);

  const selectedProperty = useMemo(() => {
    return (
      properties.find((property) => property.id === selectedPropertyId) || null
    );
  }, [properties, selectedPropertyId]);

  const activeTarget = useMemo<ApplicationTarget | null>(() => {
    if (sourceMode === "saved") {
      if (!selectedProperty) return null;

      return {
        type: "property",
        title: selectedProperty.title,
        url: selectedProperty.url,
        location: selectedProperty.location,
        address: selectedProperty.address,
        rentWeekly: selectedProperty.rent_weekly,
      };
    }

    return {
      type: "property",
      title: manualProperty.title,
      url: manualProperty.url,
      location: manualProperty.location,
      address: manualProperty.address,
      ownerName: manualProperty.ownerName,
      rentWeekly: manualProperty.rentWeekly
        ? Number(manualProperty.rentWeekly)
        : null,
    };
  }, [manualProperty, selectedProperty, sourceMode]);

  const targetUrl = activeTarget?.url?.trim() || "";

  const saveDraft = async (showMessage = true) => {
    if (!userId) return false;

    const { error } = await supabase.from("user_form_drafts").upsert(
      {
        user_id: userId,
        draft_type: "property_inquiry",
        form_data: propertyDetails,
      },
      {
        onConflict: "user_id,draft_type",
      },
    );

    if (error) {
      setErrorMessage(
        "入力内容の保存に失敗しました。Supabaseに user_form_drafts テーブルが作成されているか確認してください。",
      );
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
      .eq("draft_type", "property_inquiry");

    if (error) {
      setErrorMessage("保存済み入力内容のリセットに失敗しました。");
      return;
    }

    setPropertyDetails(emptyPropertyDetails);
    setSuccessMessage("保存済み入力内容をリセットしました。");
    setErrorMessage("");
  };

  const handleGenerate = async (useAi = false) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!activeTarget?.title?.trim()) {
      setErrorMessage("物件名を入力または選択してください。");
      return;
    }

    if (!propertyDetails.fullName?.trim()) {
      setErrorMessage("氏名を入力してください。");
      return;
    }

    saveDraft(false);

    const generationSignature = JSON.stringify({
      target: activeTarget,
      propertyDetails,
    });

    if (
      draft.trim() &&
      lastGenerationSignature === generationSignature &&
      !window.confirm("同じ入力内容で再生成しますか？")
    ) {
      return;
    }

    const fallbackContent = generatePropertyInquiryEmail({
      target: activeTarget,
      resume: null,
      propertyDetails,
    });

    if (!useAi) {
      setDraft(fallbackContent);
      setLastGenerationSignature(generationSignature);
      setSuccessMessage(
        "テンプレートで問い合わせメールの下書きを作成しました。",
      );
      return;
    }

    try {
      const response = await fetch("/api/ai/application-writer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: "property_inquiry",
          target: activeTarget,
          propertyDetails,
        }),
      });
      const data = (await response.json()) as {
        content?: string | null;
        fallback?: boolean;
      };

      setDraft(data.content || fallbackContent);
      setLastGenerationSignature(generationSignature);
      setSuccessMessage(
        data.content
          ? "より自然な英語の問い合わせメールを作成しました。"
          : "テンプレートで問い合わせメールの下書きを作成しました。",
      );
    } catch {
      setDraft(fallbackContent);
      setLastGenerationSignature(generationSignature);
      setSuccessMessage("テンプレートで問い合わせメールの下書きを作成しました。");
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
            物件問い合わせ支援
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
            保存済み物件、または外部物件URL・手入力情報をもとに、英語の問い合わせメールを作成できます。
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">1. 物件を選ぶ</h2>

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
              保存済み物件から選ぶ
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
              外部物件URL・手入力で作成
            </button>
          </div>

          {sourceMode === "saved" ? (
            <div className="mt-4 space-y-4">
              {properties.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-gray-900">
                  <p className="font-bold">まず物件を保存してください。</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
                    公開物件から保存するか、マイページの保存物件で外部物件を登録すると、ここから問い合わせメールを作成できます。
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href="/properties"
                      className="w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
                    >
                      公開物件を見る
                    </Link>
                    <Link
                      href="/mypage/properties"
                      className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
                    >
                      保存物件を管理
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <label className="block">
                    <span className="text-sm font-bold text-gray-900">
                      保存済み物件
                    </span>
                    <select
                      value={selectedPropertyId}
                      onChange={(event) =>
                        setSelectedPropertyId(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                    >
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title}
                          {property.location ? ` / ${property.location}` : ""}
                          {property.rent_weekly
                            ? ` / $${property.rent_weekly}/週`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedProperty && (
                    <div className="rounded-xl bg-gray-50 p-4">
                      <h3 className="break-words text-lg font-bold text-gray-900">
                        {selectedProperty.title}
                      </h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm font-medium text-gray-800 sm:grid-cols-2">
                        <p>
                          エリア: {selectedProperty.location || "未設定"}
                        </p>
                        <p>
                          家賃: {formatRent(selectedProperty.rent_weekly)}
                        </p>
                        <p className="sm:col-span-2">
                          住所: {selectedProperty.address || "未設定"}
                        </p>
                        {selectedProperty.url && (
                          <a
                            href={selectedProperty.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all font-bold text-blue-700 sm:col-span-2"
                          >
                            {selectedProperty.url}
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
                <span className="text-sm font-bold text-gray-900">物件名</span>
                <input
                  value={manualProperty.title}
                  onChange={(event) =>
                    setManualProperty({
                      ...manualProperty,
                      title: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="Room in Auckland CBD"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-900">家賃</span>
                <input
                  type="number"
                  min="0"
                  value={manualProperty.rentWeekly}
                  onChange={(event) =>
                    setManualProperty({
                      ...manualProperty,
                      rentWeekly: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="250"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-900">
                  管理者・オーナー名
                </span>
                <input
                  value={manualProperty.ownerName}
                  onChange={(event) =>
                    setManualProperty({
                      ...manualProperty,
                      ownerName: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="例: Property Manager"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-gray-900">
                  物件URL
                </span>
                <input
                  value={manualProperty.url}
                  onChange={(event) =>
                    setManualProperty({
                      ...manualProperty,
                      url: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="https://..."
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-900">エリア</span>
                <input
                  value={manualProperty.location}
                  onChange={(event) =>
                    setManualProperty({
                      ...manualProperty,
                      location: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="Auckland CBD"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-gray-900">住所</span>
                <input
                  value={manualProperty.address}
                  onChange={(event) =>
                    setManualProperty({
                      ...manualProperty,
                      address: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                  placeholder="Street, city"
                />
              </label>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                2. 問い合わせ内容を入力する
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
                日本語で入力してください。出力は英語の問い合わせメールとして整えます。
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
                value={propertyDetails.fullName || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    fullName: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: Kei Tanaka"
              />
            </label>
            <div className="md:col-span-2">
              <NzLocationPicker
                label="現在地"
                value={propertyDetails.currentCity || ""}
                onChange={(value) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    currentCity: value,
                  })
                }
                onCoordinatesChange={(coords) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    currentCity:
                      coords.latitude && coords.longitude
                        ? "現在地"
                        : propertyDetails.currentCity || "",
                    currentLatitude: coords.latitude,
                    currentLongitude: coords.longitude,
                  })
                }
                allLabel="未設定"
              />
            </div>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">
                入居希望日
              </span>
              <input
                type="date"
                value={propertyDetails.desiredMoveInDate || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    desiredMoveInDate: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">
                滞在予定期間
              </span>
              <input
                value={propertyDetails.plannedStayDuration || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    plannedStayDuration: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 3か月以上"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">入居人数</span>
              <input
                value={propertyDetails.occupants || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    occupants: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 1人"
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-gray-900">
                職業・学校など
              </span>
              <input
                value={propertyDetails.occupation || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    occupation: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: ワーホリで仕事を探している / 語学学校に通学中"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">自己紹介</span>
              <textarea
                value={propertyDetails.selfIntroduction || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    selfIntroduction: event.target.value,
                  })
                }
                className="mt-2 min-h-28 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: きれい好きで静かに暮らします。ワーホリでニュージーランドに滞在中です。"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">
                内見可能日時
              </span>
              <input
                value={propertyDetails.viewingAvailability || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    viewingAvailability: event.target.value,
                  })
                }
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: 平日夕方、土日は終日可能"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">
                質問したいこと
              </span>
              <textarea
                value={propertyDetails.questions || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    questions: event.target.value,
                  })
                }
                className="mt-2 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: ボンドはいくらですか？光熱費は家賃に含まれますか？"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-gray-900">
                追加で伝えたいこと
              </span>
              <textarea
                value={propertyDetails.additionalMessage || ""}
                onChange={(event) =>
                  setPropertyDetails({
                    ...propertyDetails,
                    additionalMessage: event.target.value,
                  })
                }
                className="mt-2 min-h-24 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
                placeholder="例: すぐに返信できます。必要であれば身分証明書も提示できます。"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900">3. 作成・編集</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white sm:w-auto"
              >
                テンプレートで作成
              </button>
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                className="w-full rounded-lg border border-blue-700 px-4 py-3 font-bold text-blue-700 sm:w-auto"
              >
                より自然な英語で作成
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
                  物件ページを開く
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
            placeholder="ここに問い合わせメールの下書きが表示されます。"
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

export default function PropertyInquiryPage() {
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
      <PropertyInquiryPageContent />
    </Suspense>
  );
}
