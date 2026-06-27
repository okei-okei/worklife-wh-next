"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { trackMetric } from "@/lib/analytics";

type PhaseKey =
  | "渡航前"
  | "到着後すぐ"
  | "英語・学習"
  | "仕事探し"
  | "物件探し"
  | "生活インフラ"
  | "応募・問い合わせ準備";

type Urgency = "high" | "medium" | "low";

type ChecklistItemDefinition = {
  key: string;
  phase: PhaseKey;
  label: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  partnerCategory?: string;
  urgency: Urgency;
};

type ChecklistRow = {
  item_key: string;
  is_completed: boolean;
};

const PHASES: PhaseKey[] = [
  "渡航前",
  "到着後すぐ",
  "英語・学習",
  "仕事探し",
  "物件探し",
  "生活インフラ",
  "応募・問い合わせ準備",
];

const urgencyRank: Record<Urgency, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const urgencyStyles: Record<Urgency, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-gray-100 text-gray-700",
};

const CHECKLIST_ITEMS: ChecklistItemDefinition[] = [
  {
    key: "passport_check",
    phase: "渡航前",
    label: "パスポート確認",
    description: "有効期限、氏名表記、残存期間を確認します。",
    primaryHref: "/guides/passport",
    primaryLabel: "確認ポイントを見る",
    urgency: "high",
  },
  {
    key: "visa_check",
    phase: "渡航前",
    label: "ビザ確認",
    description: "ワーホリビザの条件、入国期限、就労条件を確認します。",
    primaryHref: "/guides/visa",
    primaryLabel: "確認ポイントを見る",
    urgency: "high",
  },
  {
    key: "sim_prepare_before_departure",
    phase: "渡航前",
    label: "SIM/eSIMを準備する",
    description: "到着直後から地図や連絡が使えるように通信手段を確認します。",
    primaryHref: "/partners/sim-esim",
    primaryLabel: "比較を見る",
    partnerCategory: "sim-esim",
    urgency: "high",
  },
  {
    key: "insurance_compare",
    phase: "渡航前",
    label: "海外保険を比較する",
    description:
      "ワーホリでは医療費が高額になるケースもあります。渡航前に保険内容を比較しておきましょう。",
    primaryHref: "/partners/insurance",
    primaryLabel: "比較を見る",
    partnerCategory: "insurance",
    urgency: "high",
  },
  {
    key: "flights_transport_compare",
    phase: "渡航前",
    label: "航空券・移動手段を確認する",
    description: "日本からNZへの航空券や、到着後の長距離移動を確認します。",
    primaryHref: "/partners/flights-transport",
    primaryLabel: "比較を見る",
    partnerCategory: "flights-transport",
    urgency: "high",
  },
  {
    key: "money_transfer_compare",
    phase: "渡航前",
    label: "海外送金方法を比較する",
    description: "生活費や初期費用の送金方法を事前に比較しておきましょう。",
    primaryHref: "/partners/money-transfer",
    primaryLabel: "比較を見る",
    partnerCategory: "money-transfer",
    urgency: "medium",
  },
  {
    key: "money_transfer_receiving_account",
    phase: "渡航前",
    label: "海外送金後の受取口座を確認する",
    description:
      "日本からNZへ送金した資金を、どの銀行口座や多通貨サービスで受け取るか確認します。",
    primaryHref: "/partners/bank",
    primaryLabel: "銀行口座を比較する",
    partnerCategory: "bank",
    urgency: "medium",
  },
  {
    key: "initial_costs",
    phase: "渡航前",
    label: "初期費用の目安を確認する",
    description: "仕事、家賃、生活費を組み合わせて月の収支を確認します。",
    primaryHref: "/planner",
    primaryLabel: "生活プランを見る",
    urgency: "medium",
  },
  {
    key: "resume_prepare",
    phase: "渡航前",
    label: "英文CVを準備する",
    description: "応募に使う履歴書情報、職歴、スキルを保存します。",
    primaryHref: "/mypage/resume",
    primaryLabel: "履歴書を準備する",
    urgency: "medium",
  },
  {
    key: "sim_compare",
    phase: "到着後すぐ",
    label: "現地SIMを検討する",
    description: "到着直後から連絡や地図が使えるように通信手段を確認します。",
    primaryHref: "/partners/sim-esim",
    primaryLabel: "比較を見る",
    partnerCategory: "sim-esim",
    urgency: "high",
  },
  {
    key: "bank_prepare",
    phase: "到着後すぐ",
    label: "銀行口座を開設する",
    description:
      "給与受け取りや生活費管理に使う銀行口座を確認します。",
    primaryHref: "/partners/bank",
    primaryLabel: "銀行口座を比較する",
    partnerCategory: "bank",
    urgency: "high",
  },
  {
    key: "salary_receiving_account",
    phase: "到着後すぐ",
    label: "給与受取用の口座を準備する",
    description:
      "現地で働く予定がある場合は、雇用主が給与を振り込める口座条件を確認します。",
    primaryHref: "/partners/bank",
    primaryLabel: "銀行口座を比較する",
    partnerCategory: "bank",
    urgency: "high",
  },
  {
    key: "ird_number",
    phase: "到着後すぐ",
    label: "IRD番号を取得する",
    description: "ニュージーランドで働くために税務番号の取得手順を確認します。",
    primaryHref: "/guides/ird",
    primaryLabel: "手順を確認する",
    urgency: "high",
  },
  {
    key: "transport_check",
    phase: "到着後すぐ",
    label: "交通手段を確認する",
    description: "通勤や内見に使う交通手段、交通カード、移動費を確認します。",
    primaryHref: "/partners/flights-transport",
    primaryLabel: "比較を見る",
    partnerCategory: "flights-transport",
    urgency: "medium",
  },
  {
    key: "language_school_compare",
    phase: "英語・学習",
    label: "語学学校を比較する",
    description: "英語学習や仕事探し準備に使える語学学校を確認します。",
    primaryHref: "/partners/language-school",
    primaryLabel: "比較を見る",
    partnerCategory: "language-school",
    urgency: "low",
  },
  {
    key: "public_jobs",
    phase: "仕事探し",
    label: "公開求人を見る",
    description: "WorkLife WH内の公開求人を確認します。",
    primaryHref: "/jobs",
    primaryLabel: "求人を見る",
    urgency: "medium",
  },
  {
    key: "save_jobs",
    phase: "仕事探し",
    label: "気になる求人を保存する",
    description: "応募したい求人を保存して、後から比較できるようにします。",
    primaryHref: "/mypage/jobs",
    primaryLabel: "保存求人を見る",
    urgency: "medium",
  },
  {
    key: "job_application_writer",
    phase: "仕事探し",
    label: "応募メール・カバーレターを作る",
    description: "日本語入力から英語の応募メールとカバーレターを作成します。",
    primaryHref: "/mypage/job-application",
    primaryLabel: "応募文を作る",
    urgency: "high",
  },
  {
    key: "public_properties",
    phase: "物件探し",
    label: "公開物件を見る",
    description: "WorkLife WH内の公開物件を確認します。",
    primaryHref: "/properties",
    primaryLabel: "物件を見る",
    urgency: "medium",
  },
  {
    key: "save_properties",
    phase: "物件探し",
    label: "気になる物件を保存する",
    description: "気になる物件を保存して、問い合わせ前に比較できるようにします。",
    primaryHref: "/mypage/properties",
    primaryLabel: "保存物件を見る",
    urgency: "medium",
  },
  {
    key: "property_inquiry_writer",
    phase: "物件探し",
    label: "問い合わせメールを作る",
    description: "日本語入力から英語の物件問い合わせメールを作成します。",
    primaryHref: "/mypage/property-inquiry",
    primaryLabel: "問い合わせ文を作る",
    urgency: "high",
  },
  {
    key: "rent_contract_check",
    phase: "物件探し",
    label: "家賃・デポジット・契約条件を確認する",
    description: "家賃、ボンド、退去条件、光熱費込みかを確認します。",
    primaryHref: "/guides/rental-contract",
    primaryLabel: "注意点を見る",
    urgency: "high",
  },
  {
    key: "power_compare",
    phase: "生活インフラ",
    label: "電気契約を確認する",
    description: "入居後に必要な電気契約の選択肢を確認します。",
    primaryHref: "/partners/electricity",
    primaryLabel: "比較を見る",
    partnerCategory: "electricity",
    urgency: "medium",
  },
  {
    key: "internet_compare",
    phase: "生活インフラ",
    label: "インターネット契約を確認する",
    description: "固定回線やホームインターネットの選択肢を確認します。",
    primaryHref: "/partners/internet",
    primaryLabel: "比較を見る",
    partnerCategory: "internet",
    urgency: "medium",
  },
  {
    key: "furniture_prepare",
    phase: "生活インフラ",
    label: "家具・生活用品を準備する",
    description: "寝具、机、調理用品など生活開始に必要な用品を確認します。",
    primaryHref: "/partners/furniture",
    primaryLabel: "比較を見る",
    partnerCategory: "furniture",
    urgency: "low",
  },
  {
    key: "rent_living_payment_method",
    phase: "生活インフラ",
    label: "家賃支払い・生活費管理の方法を決める",
    description:
      "家賃、デポジット、生活費をどの口座やカードで管理するか確認します。",
    primaryHref: "/partners/bank",
    primaryLabel: "銀行口座を比較する",
    partnerCategory: "bank",
    urgency: "medium",
  },
  {
    key: "resume_saved",
    phase: "応募・問い合わせ準備",
    label: "履歴書情報を保存する",
    description: "応募文作成で使う氏名、職歴、スキルを保存します。",
    primaryHref: "/mypage/resume",
    primaryLabel: "履歴書を保存する",
    urgency: "high",
  },
  {
    key: "job_support_use",
    phase: "応募・問い合わせ準備",
    label: "求人応募支援を使う",
    description: "保存済み求人や外部求人URLから応募文を作成します。",
    primaryHref: "/mypage/job-application",
    primaryLabel: "求人応募支援へ",
    urgency: "medium",
  },
  {
    key: "property_support_use",
    phase: "応募・問い合わせ準備",
    label: "物件問い合わせ支援を使う",
    description: "保存済み物件や外部物件URLから問い合わせ文を作成します。",
    primaryHref: "/mypage/property-inquiry",
    primaryLabel: "物件問い合わせへ",
    urgency: "medium",
  },
];

export default function ChecklistPage() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const loadChecklist = useCallback(async (userId: string) => {
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
  }, []);

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

  const itemsByPhase = useMemo(() => {
    return PHASES.map((phase) => {
      const items = CHECKLIST_ITEMS.filter((item) => item.phase === phase).sort(
        (a, b) => {
          const aChecked = checkedItems[a.key] ? 1 : 0;
          const bChecked = checkedItems[b.key] ? 1 : 0;

          if (aChecked !== bChecked) return aChecked - bChecked;

          return urgencyRank[a.urgency] - urgencyRank[b.urgency];
        },
      );

      const completed = items.filter((item) => checkedItems[item.key]).length;

      return { phase, items, completed };
    });
  }, [checkedItems]);

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
    } else {
      trackMetric(nextChecked ? "checklist_item_complete" : "checklist_used", {
        eventType: "feature",
        pagePath: "/mypage/checklist",
        metadata: { itemKey: item.key, completed: nextChecked },
      });
    }

    setSavingKey(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section>
          <p className="mb-2 text-sm font-bold text-blue-700">WorkLife WH</p>
          <h1 className="text-2xl font-bold md:text-4xl">
            渡航・生活チェックリスト
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-gray-800">
            渡航前、到着後、仕事探し、物件探し、生活インフラ、応募準備まで、次に必要な行動を確認できます。
          </p>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">全体進捗</h2>
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

        <div className="space-y-6">
          {itemsByPhase.map(({ phase, items, completed }) => (
            <section key={phase} className="rounded-2xl bg-white p-4 shadow md:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-gray-900">{phase}</h2>
                <span className="text-sm font-bold text-blue-700">
                  {completed} / {items.length} 完了
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const checked = Boolean(checkedItems[item.key]);
                  const isSaving = savingKey === item.key;

                  return (
                    <article
                      key={item.key}
                      className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={isLoading || isSaving}
                            onChange={() => handleToggle(item)}
                            className="mt-1 h-5 w-5 shrink-0"
                          />
                          <span>
                            <span
                              className={
                                checked
                                  ? "block font-bold text-gray-500 line-through"
                                  : "block font-bold text-gray-900"
                              }
                            >
                              {item.label}
                            </span>
                            <span className="mt-1 block text-sm font-medium leading-6 text-gray-700">
                              {item.description}
                            </span>
                          </span>
                        </label>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
                        <span
                          className={`w-full rounded-full px-3 py-2 text-center text-xs font-bold sm:w-auto ${urgencyStyles[item.urgency]}`}
                        >
                          {item.urgency === "high"
                            ? "重要"
                            : item.urgency === "medium"
                              ? "確認"
                              : "余裕があれば"}
                        </span>
                        <Link
                          href={item.primaryHref}
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50 sm:w-auto"
                        >
                          {item.primaryLabel}
                        </Link>
                        <span className="text-center text-xs font-bold text-gray-600 sm:text-left">
                          {isSaving ? "保存中..." : checked ? "完了" : "未完了"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

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
