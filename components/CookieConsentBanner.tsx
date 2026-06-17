"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type CookiePreferences = {
  essential: true;
  analytics: boolean;
  ads: boolean;
  savedAt: string;
};

const storageKey = "worklife_cookie_preferences_v1";

function buildPreferences(analytics: boolean, ads: boolean): CookiePreferences {
  return {
    essential: true,
    analytics,
    ads,
    savedAt: new Date().toISOString(),
  };
}

async function syncPreferences(preferences: CookiePreferences) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("privacy_settings").upsert({
    user_id: user.id,
    cookie_preferences: preferences,
    updated_at: new Date().toISOString(),
  });
}

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [ads, setAds] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      void syncPreferences(JSON.parse(saved) as CookiePreferences);
      return;
    }

    const frame = window.requestAnimationFrame(() => setIsVisible(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const save = async (nextAnalytics: boolean, nextAds: boolean) => {
    const preferences = buildPreferences(nextAnalytics, nextAds);
    setIsSaving(true);
    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
    await syncPreferences(preferences);
    setIsSaving(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white px-4 py-4 shadow-2xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 text-gray-900">
          <p className="text-base font-bold">Cookieの利用について</p>
          <p className="mt-1 text-sm font-medium leading-6 text-gray-800">
            WorkLife WHでは、ログイン維持に必要なCookieを使用します。分析や広告計測は同意した場合のみ利用する設計です。{" "}
            <Link href="/legal/cookies" className="font-bold text-blue-700 underline">
              Cookieポリシー
            </Link>
          </p>

          {isSettingsOpen ? (
            <div className="mt-3 grid gap-2 text-sm font-medium text-gray-900 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <input type="checkbox" checked disabled />
                必須Cookie
              </label>
              <label className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                />
                分析を許可
              </label>
              <label className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <input
                  type="checkbox"
                  checked={ads}
                  onChange={(event) => setAds(event.target.checked)}
                />
                広告計測を許可
              </label>
            </div>
          ) : null}
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 md:min-w-80">
          <button
            type="button"
            onClick={() => save(false, false)}
            disabled={isSaving}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-bold text-gray-900 disabled:text-gray-400"
          >
            必須のみ
          </button>
          <button
            type="button"
            onClick={() => save(true, false)}
            disabled={isSaving}
            className="w-full rounded-lg border border-blue-300 px-4 py-3 text-sm font-bold text-blue-700 disabled:text-gray-400"
          >
            分析を許可
          </button>
          <button
            type="button"
            onClick={() => save(true, true)}
            disabled={isSaving}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300"
          >
            広告計測も許可
          </button>
          <button
            type="button"
            onClick={() =>
              isSettingsOpen ? save(analytics, ads) : setIsSettingsOpen(true)
            }
            disabled={isSaving}
            className="w-full rounded-lg bg-gray-800 px-4 py-3 text-sm font-bold text-white disabled:bg-gray-300"
          >
            {isSettingsOpen ? "設定を保存" : "設定する"}
          </button>
        </div>
      </div>
    </div>
  );
}
