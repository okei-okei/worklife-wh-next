"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Article } from "@/lib/articles";
import { supabase } from "@/lib/supabase";

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace("/login?redirect=/admin/articles");
      const response = await fetch("/api/admin/articles", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (response.status === 401 || response.status === 403) return router.replace("/");
      const data = (await response.json().catch(() => null)) as { articles?: Article[]; error?: string } | null;
      if (!response.ok) setErrorMessage(data?.error || "記事一覧を取得できませんでした。");
      else setArticles(data?.articles || []);
      setToken(session.access_token);
      setIsLoading(false);
    };
    load();
  }, [router]);

  const deleteArticle = async (article: Article) => {
    if (!window.confirm(`「${article.title}」を削除しますか？`)) return;
    const response = await fetch(`/api/admin/articles/${article.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setErrorMessage(data?.error || "記事を削除できませんでした。");
      return;
    }
    setArticles((current) => current.filter((item) => item.id !== article.id));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-700">WorkLife WH Admin</p>
            <h1 className="mt-1 text-2xl font-bold md:text-4xl">コラム管理</h1>
          </div>
          <Link href="/admin/articles/new" className="w-full rounded-md bg-emerald-700 px-4 py-3 text-center font-bold text-white sm:w-auto">新しい記事を作成</Link>
        </header>
        {errorMessage ? <p className="rounded-md border border-red-200 bg-red-50 p-4 font-bold text-red-700">{errorMessage}</p> : null}
        <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {isLoading ? <p className="p-5 font-bold">読み込み中...</p> : articles.length === 0 ? <p className="p-5 font-medium text-gray-700">記事はまだありません。</p> : (
            <div className="divide-y divide-gray-200">
              {articles.map((article) => (
                <article key={article.id} className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">{article.category}</span>
                      <span className={article.status === "published" ? "rounded-full bg-emerald-50 px-2 py-1 text-emerald-700" : "rounded-full bg-amber-50 px-2 py-1 text-amber-700"}>{article.status === "published" ? "公開中" : "下書き"}</span>
                    </div>
                    <h2 className="mt-2 break-words text-lg font-bold">{article.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">{article.views.toLocaleString()} views ・ 更新 {new Date(article.updated_at).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href={`/admin/articles/${article.id}/edit`} className="w-full rounded-md border border-slate-300 px-4 py-2 text-center font-bold sm:w-auto">編集</Link>
                    <button type="button" onClick={() => deleteArticle(article)} className="w-full rounded-md border border-red-300 px-4 py-2 font-bold text-red-700 sm:w-auto">削除</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <div className="flex justify-end"><Link href="/admin" className="w-full rounded-md bg-slate-800 px-4 py-3 text-center font-bold text-white sm:w-auto">管理者ダッシュボードへ戻る</Link></div>
      </div>
    </main>
  );
}

