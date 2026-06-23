import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { Article } from "@/lib/articles";

export const dynamic = "force-dynamic";

async function getArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await client.from("articles").select("*").in("status", ["published", "approved"]).order("published_at", { ascending: false });
  return (data || []) as Article[];
}

export default async function ArticlesPage() {
  const articles = await getArticles();
  return <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10"><div className="mx-auto max-w-6xl space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div className="max-w-3xl"><p className="text-sm font-bold text-emerald-700">WorkLife WH コラム</p><h1 className="mt-2 text-2xl font-bold md:text-4xl">海外生活の役立ち情報</h1><p className="mt-3 font-medium leading-7 text-gray-700">渡航準備、仕事、住まい、お金について、行動前に確認したいポイントをまとめています。</p></div><Link href="/articles/submit" className="w-full rounded-md border border-emerald-700 bg-white px-4 py-3 text-center font-bold text-emerald-800 sm:w-auto">役立ち情報を投稿</Link></header>
    {articles.length ? <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <article key={article.id} className="flex overflow-hidden rounded-lg border border-gray-200 bg-white md:flex-col">{article.cover_image_url ? <img src={article.cover_image_url} alt="" className="h-36 w-32 shrink-0 object-cover md:aspect-[16/9] md:h-auto md:w-full" /> : null}<div className="min-w-0 flex-1 p-4 md:p-5"><div className="flex flex-wrap gap-2 text-xs font-bold"><span className="text-emerald-700">{article.category}</span>{article.is_sponsored || article.is_affiliate ? <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-800">PR・紹介</span> : null}</div><h2 className="mt-2 break-words text-lg font-bold leading-7 md:text-xl">{article.title}</h2><p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-gray-700">{article.excerpt || "記事の内容を確認する"}</p><p className="mt-4 text-xs font-medium text-gray-600">公開 {article.published_at ? new Date(article.published_at).toLocaleDateString("ja-JP") : "-"} ・ 更新 {new Date(article.updated_at).toLocaleDateString("ja-JP")}</p><Link href={`/articles/${article.slug}`} className="mt-4 inline-block font-bold text-emerald-700">記事を読む</Link></div></article>)}</section> : <section className="rounded-lg border border-gray-200 bg-white p-6"><h2 className="text-lg font-bold">記事を準備中です</h2><p className="mt-2 text-sm font-medium leading-6 text-gray-700">公開された記事がここに表示されます。</p></section>}
    <div className="flex justify-end"><Link href="/mypage" className="w-full rounded-md bg-slate-700 px-4 py-3 text-center font-bold text-white sm:w-auto">マイページへ戻る</Link></div>
  </div></main>;
}
