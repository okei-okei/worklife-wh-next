"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Ranked = { name: string; count: number; href?: string };
type CategoryAnalytics = {
  category: string;
  pageViews: number;
  serviceClicks: number;
  adClicks: number;
  officialClicks: number;
  ctr: number;
};
type RecentEvent = {
  eventName: string;
  targetType: string;
  targetId: string;
  pagePath: string;
  createdAt: string;
};
type Metrics = {
  users: { total: number; newUsers: { today: number; days7: number; days30: number }; active7: number; active30: number; loggedIn: number; activeRate: number; countries: Record<string, number> };
  jobs: { publicTotal: number; active: number; pending: number; rejected: number; saved: number; applicationSupport: number; categories: Ranked[]; regions: Ranked[] };
  properties: { publicTotal: number; active: number; pending: number; rejected: number; saved: number; inquirySupport: number; regions: Ranked[]; averageWeeklyRent: number };
  planner: { uses: number; combinations: number; mapViews: number; trialUses: number };
  checklist: { users: number; completionRate: number; itemClicks: Ranked[]; partnerTransitions: number };
  comparison: { cardViews: number; cardClicks: number; externalClicks: number; affiliateClicks: number; categoryClicks: Ranked[]; ctr: number };
  articles: { published: number; drafts: number; pending: number; rejected: number; totalViews: number; partnerTransitions: number; popular: Ranked[] };
  risk: { reports: number; unresolvedReports: number; deletedPosts: number; pendingPosts: number; contacts: number; privacyRequests: number };
  popularPartners: Ranked[]; popularAffiliateLinks: Ranked[]; conversion: { visitorToSignup: number; partnerToAffiliate: number };
  analytics?: {
    kpis: {
      partnerViewsToday: number;
      partnerViews7Days: number;
      affiliateClicksToday: number;
      affiliateClicks7Days: number;
      affiliateClicksTotal: number;
      officialClicksToday: number;
      officialClicks7Days: number;
      officialClicksTotal: number;
      articleViewsToday: number;
      articleViews7Days: number;
      articleViewsTotal: number;
      partnerViewsTotal: number;
      checklistPartnerClicks: number;
    };
    categories: CategoryAnalytics[];
    popularServices: Ranked[];
    popularAdServices: Ranked[];
    popularArticles: Ranked[];
    articlePartnerTransitions: Ranked[];
    recentEvents: RecentEvent[];
  };
};

const Card = ({ label, value, note }: { label: string; value: string | number; note?: string }) => <article className="rounded-lg border border-gray-200 bg-white p-4"><p className="text-sm font-bold text-gray-600">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>{note ? <p className="mt-2 text-xs font-medium text-gray-600">{note}</p> : null}</article>;
const Group = ({ title, values }: { title: string; values: Array<[string, string | number]> }) => <section className="rounded-lg border border-gray-200 bg-white p-4 md:p-5"><h2 className="text-lg font-bold text-slate-950">{title}</h2><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">{values.map(([label, value]) => <div key={label} className="border-b border-gray-100 pb-2"><dt className="text-xs font-bold leading-5 text-gray-600">{label}</dt><dd className="mt-1 text-xl font-bold">{value}</dd></div>)}</dl></section>;
const Ranking = ({ title, items }: { title: string; items: Ranked[] }) => <section className="rounded-lg border border-gray-200 bg-white p-4 md:p-5"><h2 className="font-bold">{title}</h2>{items.length ? <ol className="mt-4 space-y-3">{items.map((item, index) => <li key={`${item.name}-${index}`} className="flex min-w-0 items-center gap-3"><span className="w-6 shrink-0 text-center text-xs font-bold text-gray-500">{index + 1}</span>{item.href ? <Link href={item.href} className="min-w-0 flex-1 truncate text-sm font-bold text-emerald-700">{item.name}</Link> : <span className="min-w-0 flex-1 truncate text-sm font-bold">{item.name}</span>}<strong className="text-sm text-emerald-700">{item.count}</strong></li>)}</ol> : <p className="mt-4 text-sm text-gray-600">データはまだありません。</p>}</section>;
const CategoryTable = ({ rows }: { rows: CategoryAnalytics[] }) => <section className="rounded-lg border border-gray-200 bg-white p-4 md:p-5"><h2 className="text-lg font-bold text-slate-950">カテゴリ別クリック状況</h2><div className="mt-4 overflow-x-auto"><table className="min-w-[760px] text-left text-sm"><thead><tr className="border-b bg-gray-50 text-gray-700"><th className="px-3 py-3">カテゴリ</th><th className="px-3 py-3">ページ閲覧</th><th className="px-3 py-3">サービスクリック</th><th className="px-3 py-3">広告クリック</th><th className="px-3 py-3">公式リンク</th><th className="px-3 py-3">CTR</th></tr></thead><tbody>{rows.map((row) => <tr key={row.category} className="border-b border-gray-100"><td className="px-3 py-3 font-bold">{row.category}</td><td className="px-3 py-3">{row.pageViews}</td><td className="px-3 py-3">{row.serviceClicks}</td><td className="px-3 py-3">{row.adClicks}</td><td className="px-3 py-3">{row.officialClicks}</td><td className="px-3 py-3">{row.ctr.toFixed(1)}%</td></tr>)}</tbody></table></div></section>;
const RecentEvents = ({ items }: { items: RecentEvent[] }) => <section className="rounded-lg border border-gray-200 bg-white p-4 md:p-5"><h2 className="text-lg font-bold text-slate-950">最近のイベント</h2>{items.length ? <div className="mt-4 overflow-x-auto"><table className="min-w-[720px] text-left text-sm"><thead><tr className="border-b bg-gray-50 text-gray-700"><th className="px-3 py-3">日時</th><th className="px-3 py-3">イベント</th><th className="px-3 py-3">対象</th><th className="px-3 py-3">ページ</th></tr></thead><tbody>{items.map((item, index) => <tr key={`${item.createdAt}-${index}`} className="border-b border-gray-100"><td className="px-3 py-3">{new Date(item.createdAt).toLocaleString("ja-JP")}</td><td className="px-3 py-3 font-bold">{item.eventName}</td><td className="px-3 py-3">{item.targetId || item.targetType || "-"}</td><td className="px-3 py-3">{item.pagePath || "-"}</td></tr>)}</tbody></table></div> : <p className="mt-4 text-sm text-gray-600">イベントはまだありません。</p>}</section>;

export default function AdminPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null); const [checking, setChecking] = useState(true); const [error, setError] = useState("");
  useEffect(() => { (async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session) return window.location.replace("/login?redirect=/admin"); const response = await fetch("/api/admin/metrics", { headers: { Authorization: `Bearer ${session.access_token}` } }); if ([401, 403].includes(response.status)) return window.location.replace("/"); const data = (await response.json().catch(() => null)) as (Metrics & { error?: string }) | null; if (!response.ok || !data) setError(data?.error || "管理指標を取得できませんでした。"); else setMetrics(data); setChecking(false); })(); }, []);
  if (checking) return <main className="min-h-screen bg-gray-100 p-6 text-gray-900"><p className="mx-auto max-w-7xl rounded-lg bg-white p-5 font-bold">管理者権限を確認中...</p></main>;
  const m = metrics;
  return <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6"><div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-bold text-emerald-700">WorkLife WH Admin</p><h1 className="mt-1 text-2xl font-bold md:text-4xl">管理者ダッシュボード</h1><p className="mt-2 text-sm font-medium text-gray-700">利用状況、掲載申請、比較サービスの状況を確認できます。</p></div><div className="flex flex-col gap-2 sm:flex-row"><Link href="/admin/launch-checklist" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-center font-bold text-emerald-800">公開前チェック</Link><Link href="/admin/listings" className="rounded-md border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900">公開掲載を管理</Link><Link href="/admin/submissions" className="rounded-md bg-slate-900 px-4 py-3 text-center font-bold text-white">掲載申請 {(m?.jobs.pending ?? 0) + (m?.properties.pending ?? 0)}件</Link></div></header>
    {error ? <p className="rounded-md border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}<span className="mt-2 block text-sm">Supabaseで最新版の analytics_and_articles.sql を実行してください。</span></p> : null}
    <section><h2 className="mb-3 text-lg font-bold">主要KPI</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card label="総ユーザー数" value={m?.users.total ?? 0} note={`30日アクティブ率 ${(m?.users.activeRate ?? 0).toFixed(1)}%`} /><Card label="30日間新規登録" value={m?.users.newUsers.days30 ?? 0} note={`今日 ${m?.users.newUsers.today ?? 0} / 7日 ${m?.users.newUsers.days7 ?? 0}`} /><Card label="30日アクティブ" value={m?.users.active30 ?? 0} note={`7日 ${m?.users.active7 ?? 0}`} /><Card label="紹介リンククリック" value={m?.comparison.affiliateClicks ?? 0} note={`CTR ${(m?.comparison.ctr ?? 0).toFixed(1)}%`} /></div></section>
    <section><h2 className="mb-3 text-lg font-bold">比較・記事計測KPI</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"><Card label="記事PV" value={m?.analytics?.kpis.articleViewsTotal ?? 0} note={`今日 ${m?.analytics?.kpis.articleViewsToday ?? 0} / 7日 ${m?.analytics?.kpis.articleViews7Days ?? 0}`} /><Card label="比較ページPV" value={m?.analytics?.kpis.partnerViewsTotal ?? 0} note={`今日 ${m?.analytics?.kpis.partnerViewsToday ?? 0} / 7日 ${m?.analytics?.kpis.partnerViews7Days ?? 0}`} /><Card label="広告クリック数" value={m?.analytics?.kpis.affiliateClicksTotal ?? 0} note={`今日 ${m?.analytics?.kpis.affiliateClicksToday ?? 0} / 7日 ${m?.analytics?.kpis.affiliateClicks7Days ?? 0}`} /><Card label="公式リンククリック数" value={m?.analytics?.kpis.officialClicksTotal ?? 0} note={`今日 ${m?.analytics?.kpis.officialClicksToday ?? 0} / 7日 ${m?.analytics?.kpis.officialClicks7Days ?? 0}`} /><Card label="チェックリスト遷移数" value={m?.analytics?.kpis.checklistPartnerClicks ?? 0} note="チェックリスト→比較ページ" /></div></section>
    <CategoryTable rows={m?.analytics?.categories || []} />
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Group title="ユーザー" values={[["ログイン済み", m?.users.loggedIn ?? 0], ["NZ", m?.users.countries.NZ ?? 0], ["AU", m?.users.countries.AU ?? 0], ["CA", m?.users.countries.CA ?? 0], ["その他", m?.users.countries.other ?? 0], ["訪問→登録CVR", `${(m?.conversion.visitorToSignup ?? 0).toFixed(1)}%`]]} />
      <Group title="求人" values={[["公開求人", m?.jobs.active ?? 0], ["承認待ち", m?.jobs.pending ?? 0], ["却下", m?.jobs.rejected ?? 0], ["保存数", m?.jobs.saved ?? 0], ["応募支援", m?.jobs.applicationSupport ?? 0]]} />
      <Group title="物件" values={[["公開物件", m?.properties.active ?? 0], ["承認待ち", m?.properties.pending ?? 0], ["却下", m?.properties.rejected ?? 0], ["保存数", m?.properties.saved ?? 0], ["問い合わせ支援", m?.properties.inquirySupport ?? 0], ["平均週家賃", `$${(m?.properties.averageWeeklyRent ?? 0).toFixed(0)}`]]} />
      <Group title="生活プランナー" values={[["利用回数", m?.planner.uses ?? 0], ["比較可能な組合せ", m?.planner.combinations ?? 0], ["地図表示", m?.planner.mapViews ?? 0], ["簡易版利用", m?.planner.trialUses ?? 0]]} />
      <Group title="チェックリスト" values={[["利用者", m?.checklist.users ?? 0], ["完了率", `${(m?.checklist.completionRate ?? 0).toFixed(1)}%`], ["比較ページ遷移", m?.checklist.partnerTransitions ?? 0]]} />
      <Group title="比較・おすすめ" values={[["カード表示", m?.comparison.cardViews ?? 0], ["カードクリック", m?.comparison.cardClicks ?? 0], ["外部リンク", m?.comparison.externalClicks ?? 0], ["CTR", `${(m?.comparison.ctr ?? 0).toFixed(1)}%`]]} />
      <Group title="リスク管理" values={[["通報", m?.risk.reports ?? 0], ["未対応通報", m?.risk.unresolvedReports ?? 0], ["問い合わせ", m?.risk.contacts ?? 0], ["プライバシー申請", m?.risk.privacyRequests ?? 0]]} />
      <Group title="地域・分類" values={[["求人カテゴリ数", m?.jobs.categories.length ?? 0], ["求人地域数", m?.jobs.regions.length ?? 0], ["物件地域数", m?.properties.regions.length ?? 0], ["比較→紹介CVR", `${(m?.conversion.partnerToAffiliate ?? 0).toFixed(1)}%`]]} />
    </section>
    <section><h2 className="mb-3 text-lg font-bold">人気コンテンツ</h2><div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Ranking title="クリック数TOP10" items={m?.analytics?.popularServices || m?.popularPartners || []} /><Ranking title="広告クリック数TOP10" items={m?.analytics?.popularAdServices || m?.popularAffiliateLinks || []} /><Ranking title="記事閲覧数TOP10" items={m?.analytics?.popularArticles || []} /><Ranking title="記事→比較ページ遷移TOP10" items={m?.analytics?.articlePartnerTransitions || []} /></div></section>
    <RecentEvents items={m?.analytics?.recentEvents || []} />
    <div className="flex justify-end"><Link href="/mypage" className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 hover:bg-gray-50 sm:w-auto">マイページへ戻る</Link></div>
  </div></main>;
}
