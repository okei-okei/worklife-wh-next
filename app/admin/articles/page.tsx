"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ARTICLE_STATUS_LABELS, type Article, type ArticleInput, type ArticleStatus } from "@/lib/articles";
import { supabase } from "@/lib/supabase";

const filters: Array<["all" | ArticleStatus, string]> = [["all", "すべて"], ["pending", "承認待ち"], ["draft", "下書き"], ["approved", "公開済み"], ["published", "管理者公開"], ["rejected", "却下"]];

function payload(article: Article, status: ArticleStatus, rejectedReason = ""): ArticleInput {
  return { title: article.title, slug: article.slug, excerpt: article.excerpt, content: article.content, category: article.category, country_code: article.country_code, region: article.region, article_type: article.article_type, cover_image_url: article.cover_image_url, status, is_sponsored: article.is_sponsored, is_affiliate: article.is_affiliate, sponsor_name: article.sponsor_name, related_checklist_items: article.related_checklist_items || [], related_service_ids: article.related_service_ids || [], rejected_reason: rejectedReason };
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<"all" | ArticleStatus>("pending");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.replace("/login?redirect=/admin/articles");
    const response = await fetch("/api/admin/articles", { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (response.status === 401 || response.status === 403) return router.replace("/");
    const data = (await response.json().catch(() => null)) as { articles?: Article[]; error?: string } | null;
    if (!response.ok) setError(data?.error || "記事一覧を取得できませんでした。"); else setArticles(data?.articles || []);
    setToken(session.access_token); setLoading(false);
  })(); }, [router]);

  const visible = useMemo(() => filter === "all" ? articles : articles.filter((article) => article.status === filter), [articles, filter]);
  const updateStatus = async (article: Article, status: ArticleStatus) => {
    const reason = status === "rejected" ? window.prompt("却下理由（投稿者への内部記録・任意）", "") || "" : "";
    const response = await fetch(`/api/admin/articles/${article.id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload(article, status, reason)) });
    const data = (await response.json().catch(() => null)) as { article?: Article; error?: string } | null;
    if (!response.ok || !data?.article) return setError(data?.error || "ステータスを更新できませんでした。");
    setArticles((current) => current.map((item) => item.id === article.id ? data.article! : item));
  };
  const remove = async (article: Article) => {
    if (!window.confirm(`「${article.title}」を削除しますか？`)) return;
    const response = await fetch(`/api/admin/articles/${article.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return setError("記事を削除できませんでした。");
    setArticles((current) => current.filter((item) => item.id !== article.id));
  };

  return <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold text-emerald-700">WorkLife WH Admin</p><h1 className="mt-1 text-2xl font-bold md:text-4xl">コラム審査・管理</h1></div><Link href="/admin/articles/new" className="w-full rounded-md bg-emerald-700 px-4 py-3 text-center font-bold text-white sm:w-auto">管理者記事を作成</Link></header>
    {error ? <p className="rounded-md border border-red-200 bg-red-50 p-4 font-bold text-red-700">{error}</p> : null}
    <nav className="flex gap-2 overflow-x-auto pb-1">{filters.map(([key, label]) => <button key={key} onClick={() => setFilter(key)} className={`shrink-0 rounded-md px-4 py-2 text-sm font-bold ${filter === key ? "bg-slate-900 text-white" : "border border-gray-300 bg-white"}`}>{label} ({key === "all" ? articles.length : articles.filter((a) => a.status === key).length})</button>)}</nav>
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">{loading ? <p className="p-5 font-bold">読み込み中...</p> : visible.length === 0 ? <p className="p-5 font-medium text-gray-700">該当する記事はありません。</p> : <div className="divide-y divide-gray-200">{visible.map((article) => <article key={article.id} className="p-4 md:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-slate-100 px-2 py-1">{article.category}</span><span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">{ARTICLE_STATUS_LABELS[article.status]}</span>{article.is_user_submitted ? <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">ユーザー投稿</span> : null}{article.is_sponsored || article.is_affiliate ? <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">PR/紹介</span> : null}</div><h2 className="mt-2 break-words text-lg font-bold">{article.title}</h2><p className="mt-1 text-sm text-gray-600">{article.views.toLocaleString()} views ・ 更新 {new Date(article.updated_at).toLocaleDateString("ja-JP")}</p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/articles/${article.id}/edit`} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-bold">編集</Link>{article.status === "pending" ? <><button onClick={() => updateStatus(article, "approved")} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white">承認・公開</button><button onClick={() => updateStatus(article, "rejected")} className="rounded-md border border-red-300 px-3 py-2 text-sm font-bold text-red-700">却下</button></> : null}{article.status === "approved" || article.status === "published" ? <button onClick={() => updateStatus(article, "draft")} className="rounded-md border border-amber-300 px-3 py-2 text-sm font-bold text-amber-800">非公開</button> : null}<button onClick={() => remove(article)} className="rounded-md border border-red-300 px-3 py-2 text-sm font-bold text-red-700">削除</button></div></div></article>)}</div>}</section>
    <div className="flex justify-end"><Link href="/admin" className="w-full rounded-md bg-slate-800 px-4 py-3 text-center font-bold text-white sm:w-auto">管理者ダッシュボードへ戻る</Link></div>
  </div></main>;
}
