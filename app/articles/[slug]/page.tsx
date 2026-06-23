import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import type { Article } from "@/lib/articles";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
type Partner = { id: string; name: string; category: string; description: string | null; url: string | null; official_url?: string | null };

const categoryMap: Record<string, string> = { SIM: "sim", "SIM・通信": "sim", 銀行口座: "bank", "銀行・送金": "bank", 保険: "insurance", "電気・インターネット": "internet" };

async function getData(slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { article: null, partners: [] };
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await client.from("articles").select("*").eq("slug", slug).in("status", ["published", "approved"]).maybeSingle();
  const article = data as Article | null;
  if (!article) return { article: null, partners: [] };
  let query = client.from("partners").select("id,name,category,description,url,official_url").eq("is_active", true).limit(4);
  if (article.related_service_ids?.length) query = query.in("id", article.related_service_ids);
  else if (categoryMap[article.category]) query = query.eq("category", categoryMap[article.category]);
  else return { article, partners: [] };
  const result = await query;
  if (result.error?.message.includes("official_url")) {
    const fallback = await client.from("partners").select("id,name,category,description,url").eq("is_active", true).eq("category", categoryMap[article.category] || "_").limit(4);
    return { article, partners: (fallback.data || []) as Partner[] };
  }
  return { article, partners: (result.data || []) as Partner[] };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params; const { article, partners } = await getData(slug); if (!article) notFound();
  const paragraphs = article.content.split(/\n{2,}/).filter(Boolean); const serviceCategory = categoryMap[article.category];
  return <main className="min-h-screen bg-gray-100 px-4 py-8 text-gray-900 md:px-6 md:py-10"><ArticleViewTracker slug={slug} /><article className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-gray-200 bg-white">
    {article.cover_image_url ? <img src={article.cover_image_url} alt="" className="max-h-[420px] w-full object-cover" /> : null}
    <div className="p-4 md:p-8"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-emerald-700">{article.category}</span>{article.is_sponsored || article.is_affiliate ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">PR・広告/紹介リンク</span> : null}</div><h1 className="mt-2 text-2xl font-bold leading-tight md:text-4xl">{article.title}</h1><p className="mt-3 text-sm font-medium text-gray-600">更新 {new Date(article.updated_at).toLocaleDateString("ja-JP")} ・ {article.views.toLocaleString()} views</p>
      {article.is_sponsored || article.is_affiliate ? <p className="mt-5 rounded-md bg-gray-100 p-4 text-sm font-medium leading-6">この記事には広告・紹介リンクが含まれる場合があります。契約前には公式サイトで最新条件をご確認ください。{article.sponsor_name ? ` 提供・関連事業者: ${article.sponsor_name}` : ""}</p> : null}
      {article.excerpt ? <p className="mt-6 border-l-4 border-emerald-600 pl-4 font-medium leading-7 text-gray-800">{article.excerpt}</p> : null}
      <div className="mt-8 space-y-5">{paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-wrap font-medium leading-8 text-gray-800">{paragraph}</p>)}</div>
      {article.related_checklist_items?.length ? <section className="mt-10 border-t border-gray-200 pt-6"><h2 className="text-lg font-bold">関連するチェックリスト</h2><ul className="mt-3 space-y-2">{article.related_checklist_items.map((item) => <li key={item} className="rounded-md bg-gray-50 px-3 py-2 font-medium">{item}</li>)}</ul><Link href="/mypage/checklist" className="mt-4 inline-block font-bold text-emerald-700">チェックリストで確認する</Link></section> : null}
      {partners.length || serviceCategory ? <section className="mt-8 border-t border-gray-200 pt-6"><h2 className="text-lg font-bold">関連する比較・おすすめサービス</h2><p className="mt-2 text-xs font-medium text-gray-600">このセクションには広告・紹介リンクが含まれる場合があります。</p>{partners.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{partners.map((partner) => <article key={partner.id} className="rounded-md border border-gray-200 p-4"><h3 className="font-bold">{partner.name}</h3>{partner.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-700">{partner.description}</p> : null}<a href={partner.official_url || partner.url || `/partners?category=${partner.category}`} target="_blank" rel="noopener noreferrer sponsored" className="mt-3 inline-block font-bold text-emerald-700">公式情報を見る</a></article>)}</div> : null}<Link href={`/partners${serviceCategory ? `?category=${serviceCategory}` : ""}`} className="mt-4 inline-block font-bold text-emerald-700">比較・おすすめを見る</Link></section> : null}
      <div className="mt-10 space-y-4 border-t border-gray-200 pt-6"><Link href="/articles" className="inline-block font-bold text-emerald-700">役立ち情報一覧へ戻る</Link><div className="flex justify-end"><Link href="/mypage" className="w-full rounded-md bg-slate-700 px-4 py-3 text-center font-bold text-white sm:w-auto">マイページへ戻る</Link></div></div>
    </div></article></main>;
}
