"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LEGAL_VERSION,
  OPERATOR_EMAIL,
} from "@/app/legal/_data/legalDocuments";
import { supabase } from "@/lib/supabase";

type PrivacySettings = {
  data_sharing_opt_out: boolean;
  marketing_opt_in: boolean;
  cookie_preferences: {
    essential?: boolean;
    analytics?: boolean;
    ads?: boolean;
    savedAt?: string;
  };
};

type ConsentRow = {
  document_key: string;
  consent_version: string;
  consent_at: string;
};

const defaultSettings: PrivacySettings = {
  data_sharing_opt_out: false,
  marketing_opt_in: false,
  cookie_preferences: {
    essential: true,
    analytics: false,
    ads: false,
  },
};

export default function MyPagePrivacyPage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [consents, setConsents] = useState<ConsentRow[]>([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const settingsResult = await supabase
        .from("privacy_settings")
        .select("data_sharing_opt_out, marketing_opt_in, cookie_preferences")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsResult.data) {
        setSettings({
          data_sharing_opt_out:
            settingsResult.data.data_sharing_opt_out ?? false,
          marketing_opt_in: settingsResult.data.marketing_opt_in ?? false,
          cookie_preferences:
            settingsResult.data.cookie_preferences ||
            defaultSettings.cookie_preferences,
        });
      }

      const consentResult = await supabase
        .from("user_consents")
        .select("document_key, consent_version, consent_at")
        .eq("user_id", user.id)
        .order("consent_at", { ascending: false });

      if (!consentResult.error) {
        setConsents((consentResult.data || []) as ConsentRow[]);
      }

      setIsLoading(false);
    };

    load();
  }, []);

  const saveSettings = async () => {
    if (!userId) return;
    setMessage("");
    setErrorMessage("");
    setIsSaving(true);

    const { error } = await supabase.from("privacy_settings").upsert({
      user_id: userId,
      data_sharing_opt_out: settings.data_sharing_opt_out,
      marketing_opt_in: settings.marketing_opt_in,
      cookie_preferences: {
        ...settings.cookie_preferences,
        essential: true,
        savedAt: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    window.localStorage.setItem(
      "worklife_cookie_preferences_v1",
      JSON.stringify(settings.cookie_preferences),
    );
    setMessage("プライバシー設定を保存しました。");
  };

  const createPrivacyRequest = async (
    requestType:
      | "access"
      | "correction"
      | "deletion"
      | "restriction"
      | "portability"
      | "third_party_stop",
  ) => {
    if (!userId) return;
    setMessage("");
    setErrorMessage("");
    setIsSaving(true);

    const { error } = await supabase.from("privacy_requests").insert({
      user_id: userId,
      request_type: requestType,
      details: {
        email,
        requested_from: "/mypage/privacy",
      },
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(
      requestType === "deletion"
        ? "データ削除申請を受け付けました。"
        : "データエクスポート申請を受け付けました。",
    );
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 font-bold shadow md:p-6">
          読み込み中...
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-4 shadow md:p-6">
          <h1 className="text-2xl font-bold">ログインが必要です</h1>
          <p className="mt-2 font-medium text-gray-800">
            プライバシー設定を変更するにはログインしてください。
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block w-full rounded-lg bg-blue-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            ログインへ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="text-2xl font-bold md:text-4xl">
            プライバシー設定
          </h1>
          <p className="mt-2 text-base font-medium leading-7 text-gray-800">
            データ共有、マーケティング、Cookie、データ削除申請を管理できます。
          </p>
          <p className="mt-3 text-sm font-bold text-gray-700">
            現行規約バージョン: {LEGAL_VERSION}
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">現在の同意状況</h2>
          {consents.length === 0 ? (
            <p className="mt-3 font-medium text-gray-800">
              同意履歴はまだ保存されていません。新規登録または再同意時に記録されます。
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {consents.map((consent) => (
                <div
                  key={`${consent.document_key}-${consent.consent_version}-${consent.consent_at}`}
                  className="rounded-xl border border-gray-200 p-3 text-sm font-medium text-gray-800"
                >
                  <p className="font-bold text-gray-900">
                    {consent.document_key} / v{consent.consent_version}
                  </p>
                  <p>{new Date(consent.consent_at).toLocaleString("ja-JP")}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">設定</h2>
          <label className="flex gap-3 rounded-xl bg-gray-50 p-4 text-sm font-medium leading-6 text-gray-900">
            <input
              type="checkbox"
              checked={settings.data_sharing_opt_out}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  data_sharing_opt_out: event.target.checked,
                }))
              }
              className="mt-1 h-4 w-4 shrink-0"
            />
            個人を特定できない統計利用や提携先向け参考データへの利用を停止希望にする
          </label>

          <label className="flex gap-3 rounded-xl bg-gray-50 p-4 text-sm font-medium leading-6 text-gray-900">
            <input
              type="checkbox"
              checked={settings.marketing_opt_in}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  marketing_opt_in: event.target.checked,
                }))
              }
              className="mt-1 h-4 w-4 shrink-0"
            />
            提携サービスや新機能のお知らせを受け取る
          </label>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="font-bold text-gray-900">Cookie設定</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <input type="checkbox" checked disabled />
                必須
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={Boolean(settings.cookie_preferences.analytics)}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      cookie_preferences: {
                        ...current.cookie_preferences,
                        analytics: event.target.checked,
                      },
                    }))
                  }
                />
                分析
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={Boolean(settings.cookie_preferences.ads)}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      cookie_preferences: {
                        ...current.cookie_preferences,
                        ads: event.target.checked,
                      },
                    }))
                  }
                />
                広告計測
              </label>
            </div>
            <Link
              href="/legal/cookies"
              className="mt-3 inline-block text-sm font-bold text-blue-700 underline"
            >
              Cookieポリシーを確認する
            </Link>
          </div>

          {errorMessage ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">
              {errorMessage}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-lg bg-green-50 p-3 text-sm font-bold text-green-700">
              {message}
            </p>
          ) : null}

          <button
            type="button"
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-bold text-white disabled:bg-gray-300 sm:w-auto"
          >
            設定を保存
          </button>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <h2 className="text-xl font-bold text-gray-900">データ申請</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-gray-800">
            データエクスポートや削除を申請できます。本人確認や処理に時間がかかる場合があります。
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => createPrivacyRequest("portability")}
              disabled={isSaving}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 font-bold text-gray-900 disabled:text-gray-400 sm:w-auto"
            >
              データエクスポート申請
            </button>
            <button
              type="button"
              onClick={() => createPrivacyRequest("deletion")}
              disabled={isSaving}
              className="w-full rounded-lg bg-red-700 px-4 py-3 font-bold text-white disabled:bg-gray-300 sm:w-auto"
            >
              データ削除申請
            </button>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-800">
            問い合わせ窓口:{" "}
            <a href={`mailto:${OPERATOR_EMAIL}`} className="font-bold text-blue-700 underline">
              {OPERATOR_EMAIL}
            </a>
          </p>
        </section>

        <div className="flex justify-end">
          <Link
            href="/mypage"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
          >
            マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
