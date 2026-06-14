"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ChecklistItemDefinition = {
  key: string;
  label: string;
  partnerHref?: string;
};

type ChecklistRow = {
  item_key: string;
  is_completed: boolean;
};

const CHECKLIST_ITEMS: ChecklistItemDefinition[] = [
  { key: "electricity", label: "電気契約", partnerHref: "/partners/power" },
  {
    key: "internet",
    label: "インターネット契約",
    partnerHref: "/partners/internet",
  },
  { key: "sim_esim", label: "SIM / eSIM契約", partnerHref: "/partners/sim" },
  {
    key: "bank_account",
    label: "銀行口座開設",
    partnerHref: "/partners/bank",
  },
  { key: "ird_number", label: "IRD番号取得" },
  { key: "insurance", label: "保険加入", partnerHref: "/partners/insurance" },
  {
    key: "furniture",
    label: "家具・生活用品準備",
    partnerHref: "/partners/furniture",
  },
  { key: "resume", label: "CV / 履歴書準備" },
];

export default function ChecklistPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const loadChecklist = useCallback(
    async (userId: string) => {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("user_checklist_items")
        .select("item_key, is_completed")
        .eq("user_id", userId);

      if (error) {
        alert(error.message);
        setIsLoading(false);
        return;
      }

      const nextCheckedItems: Record<string, boolean> = {};

      for (const item of CHECKLIST_ITEMS) {
        nextCheckedItems[item.key] = false;
      }

      for (const row of (data || []) as ChecklistRow[]) {
        nextCheckedItems[row.item_key] = row.is_completed;
      }

      setCheckedItems(nextCheckedItems);
      setIsLoading(false);
    },
    [],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initializeChecklist = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUserId(user.id);
        loadChecklist(user.id);
      };

      initializeChecklist();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadChecklist, router]);

  const completedCount = useMemo(() => {
    return CHECKLIST_ITEMS.filter((item) => checkedItems[item.key]).length;
  }, [checkedItems]);

  const progressPercent = Math.round(
    (completedCount / CHECKLIST_ITEMS.length) * 100,
  );

  const handleToggle = async (item: ChecklistItemDefinition) => {
    if (!currentUserId) {
      alert("ログインしてください");
      return;
    }

    const nextChecked = !checkedItems[item.key];

    setCheckedItems((current) => ({
      ...current,
      [item.key]: nextChecked,
    }));
    setSavingKey(item.key);

    const { error } = await supabase.from("user_checklist_items").upsert(
      {
        user_id: currentUserId,
        item_key: item.key,
        label: item.label,
        is_completed: nextChecked,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,item_key",
      },
    );

    if (error) {
      setCheckedItems((current) => ({
        ...current,
        [item.key]: !nextChecked,
      }));
      alert(error.message);
    }

    setSavingKey(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div>
            <h1 className="text-2xl font-bold md:text-4xl">
              住居決定後チェックリスト
            </h1>
            <p className="mt-2 text-base font-medium leading-7 text-gray-800">
              入居後に必要な手続きをまとめて管理できます。
            </p>
          </div>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">進捗</h2>

            <div className="text-sm font-bold text-blue-700">
              {completedCount} / {CHECKLIST_ITEMS.length} 完了
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => {
              const checked = Boolean(checkedItems[item.key]);
              const isSaving = savingKey === item.key;

              return (
                <div
                  key={item.key}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isLoading || isSaving}
                      onChange={() => handleToggle(item)}
                      className="h-5 w-5"
                    />

                    <span
                      className={
                        checked
                          ? "font-bold text-gray-500 line-through"
                          : "font-bold text-gray-900"
                      }
                    >
                      {item.label}
                    </span>
                  </label>

                  <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    {item.partnerHref ? (
                      <Link
                        href={item.partnerHref}
                        className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-sm font-bold text-blue-700 hover:bg-blue-100 sm:w-auto"
                      >
                        おすすめサービスを見る
                      </Link>
                    ) : (
                      <span className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500">
                        案内準備中
                      </span>
                    )}

                    <span className="text-sm font-medium text-gray-500">
                      {isSaving ? "保存中..." : checked ? "完了" : "未完了"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

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
