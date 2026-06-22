"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type RankedItem = { name: string; count: number; href?: string };
type AdminMetrics = {
  totalMembers: number;
  newUsers: { today: number; days7: number; days30: number };
  loginUsers: { today: number; days7: number; days30: number };
  activeUsers30: number;
  activeRate: number;
  featureUsage: {
    planner: number;
    properties: number;
    jobs: number;
    checklist: number;
    emailTemplates: number;
    partnerViews: number;
    partnerClicks: number;
    affiliateClicks: number;
  };
  articles: { total: number; published: number; drafts: number };
  popularArticles: RankedItem[];
  popularPartners: RankedItem[];
  popularAffiliateLinks: RankedItem[];
  conversion: { visitorToSignup: number; partnerViewToAffiliate: number };
  pendingSubmissions: number;
};

function MetricCard({ label, value, note, accent = false }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <article className={`rounded-lg border p-4 md:p-5 ${accent ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
      <p className="text-sm font-bold text-gray-700">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-medium leading-5 text-gray-600">{note}</p>
    </article>
  );
}

function Ranking({ title, items }: { title: string; items: RankedItem[] }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 md:p-5">
      <h3 className="font-bold text-slate-950">{title}</h3>
      {items.length ? (
        <ol className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="flex min-w-0 items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{index + 1}</span>
              <div className="min-w-0 flex-1">
                {item.href ? <Link href={item.href} className="block truncate text-sm font-bold text-slate-900 hover:text-emerald-700">{item.name}</Link> : <p className="truncate text-sm font-bold text-slate-900">{item.name}</p>}
              </div>
              <span className="shrink-0 text-sm font-bold text-emerald-700">{item.count.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      ) : <p className="mt-4 text-sm font-medium text-gray-600">データはまだありません。</p>}
    </section>
  );
}

export default function AdminPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.replace("/login?redirect=/admin");
        return;
      }
      const response = await fetch("/api/admin/metrics", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (response.status === 401 || response.status === 403) {
        window.location.replace("/");
        return;
      }
      const data = (await response.json().catch(() => null)) as AdminMetrics & { error?: string } | null;
      if (!response.ok || !data) setErrorMessage(data?.error || "管理指標を取得できませんでした。");
      else setMetrics(data);
      setIsAdmin(response.ok || response.status >= 500);
      setIsCheckingAuth(false);
    };
    load();
  }, []);

  if (isCheckingAuth) return <main className="min-h-screen bg-gray-100 p-6 text-gray-900"><p className="mx-auto max-w-7xl rounded-lg bg-white p-5 font-bold">管理者権限を確認中...</p></main>;
  if (!isAdmin) return null;

  const kpis = [
    ["総会員数", metrics?.totalMembers ?? 0, "Supabase Authの登録ユーザー"],
    ["30日間新規登録", metrics?.newUsers.days30 ?? 0, "直近30日間に登録"],
    ["30日間アクティブ", metrics?.activeUsers30 ?? 0, `アクティブ率 ${(metrics?.activeRate ?? 0).toFixed(1)}%`],
    ["広告リンククリック", metrics?.featureUsage.affiliateClicks ?? 0, "計測開始後の累計", true],
  ] as const;

  const usage = [
    ["収支シミュレーター", metrics?.featureUsage.planner ?? 0],
    ["物件保存", metrics?.featureUsage.properties ?? 0],
    ["仕事保存", metrics?.featureUsage.jobs ?? 0],
    ["チェックリスト", metrics?.featureUsage.checklist ?? 0],
    ["メールテンプレート", metrics?.featureUsage.emailTemplates ?? 0],
    ["比較ページ閲覧", metrics?.featureUsage.partnerViews ?? 0],
    ["比較サービスクリック", metrics?.featureUsage.partnerClicks ?? 0],
    ["広告・紹介クリック", metrics?.featureUsage.affiliateClicks ?? 0],
  ] as const;

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm font-bold text-emerald-700">WorkLife WH Admin</p><h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-4xl">管理者ダッシュボード</h1><p className="mt-2 text-sm font-medium text-gray-700">会員、主要機能、比較導線、コラムの状況を確認できます。</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href="/admin/articles" className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-900 sm:w-auto">コラム管理</Link>
            <Link href="/admin/submissions" className="w-full rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white sm:w-auto">掲載申請 {metrics?.pendingSubmissions ?? 0}件</Link>
          </div>
        </header>

        {errorMessage ? <section className="rounded-lg border border-red-200 bg-red-50 p-4 font-bold text-red-700">{errorMessage}<p className="mt-2 text-sm font-medium">Supabaseで analytics_and_articles.sql を実行してください。</p></section> : null}

        <section><h2 className="mb-3 text-lg font-bold text-slate-950">主要KPI</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpis.map(([label, value, note, accent]) => <MetricCard key={label} label={label} value={value.toLocaleString()} note={note} accent={accent} />)}</div></section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-5"><h2 className="font-bold text-slate-950">新規登録者</h2><dl className="mt-4 grid grid-cols-3 gap-2">{[["今日", metrics?.newUsers.today], ["7日", metrics?.newUsers.days7], ["30日", metrics?.newUsers.days30]].map(([label, value]) => <div key={label} className="bg-gray-50 p-3 text-center"><dt className="text-xs font-bold text-gray-600">{label}</dt><dd className="mt-1 text-xl font-bold">{value ?? 0}</dd></div>)}</dl></div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-5"><h2 className="font-bold text-slate-950">ログインユーザー</h2><dl className="mt-4 grid grid-cols-3 gap-2">{[["今日", metrics?.loginUsers.today], ["7日", metrics?.loginUsers.days7], ["30日", metrics?.loginUsers.days30]].map(([label, value]) => <div key={label} className="bg-gray-50 p-3 text-center"><dt className="text-xs font-bold text-gray-600">{label}</dt><dd className="mt-1 text-xl font-bold">{value ?? 0}</dd></div>)}</dl></div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-5"><h2 className="font-bold text-slate-950">転換率</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt>訪問 → 会員登録</dt><dd className="font-bold text-emerald-700">{(metrics?.conversion.visitorToSignup ?? 0).toFixed(1)}%</dd></div><div className="flex justify-between gap-3"><dt>比較閲覧 → 広告クリック</dt><dd className="font-bold text-emerald-700">{(metrics?.conversion.partnerViewToAffiliate ?? 0).toFixed(1)}%</dd></div></dl><p className="mt-4 text-xs leading-5 text-gray-500">計測開始後の30日データを使用した参考値です。</p></div>
        </section>

        <section><h2 className="mb-3 text-lg font-bold text-slate-950">機能別利用状況</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{usage.map(([label, value]) => <article key={label} className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-xs font-bold leading-5 text-gray-600">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value.toLocaleString()}</p></article>)}</div></section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3"><MetricCard label="コラム記事数" value={(metrics?.articles.total ?? 0).toLocaleString()} note="下書きを含む全記事" /><MetricCard label="公開中の記事" value={(metrics?.articles.published ?? 0).toLocaleString()} note="ユーザーが閲覧可能" accent /><MetricCard label="下書きの記事" value={(metrics?.articles.drafts ?? 0).toLocaleString()} note="管理者のみ閲覧可能" /></section>

        <section><h2 className="mb-3 text-lg font-bold text-slate-950">人気コンテンツ</h2><div className="grid grid-cols-1 gap-4 lg:grid-cols-3"><Ranking title="人気コラム" items={metrics?.popularArticles || []} /><Ranking title="人気比較サービス" items={metrics?.popularPartners || []} /><Ranking title="広告リンククリック上位" items={metrics?.popularAffiliateLinks || []} /></div></section>

        <div className="flex justify-end"><Link href="/mypage" className="w-full rounded-md bg-slate-800 px-4 py-3 text-center font-bold text-white sm:w-auto">マイページへ戻る</Link></div>
      </div>
    </main>
  );
}
