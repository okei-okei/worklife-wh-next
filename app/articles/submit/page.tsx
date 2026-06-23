"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ARTICLE_CATEGORIES } from "@/lib/articles";
import { supabase } from "@/lib/supabase";

export default function ArticleSubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", category: "体験談", countryCode: "NZ", region: "", coverImageUrl: "", articleType: "experience", noAdvertising: false, noPersonalInfo: false, guidelineAccepted: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputClass = "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const submit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push("/login?redirect=/articles/submit");
    setIsSubmitting(true); setError(""); setMessage("");
    const response = await fetch("/api/articles/submit", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setIsSubmitting(false);
    if (!response.ok) return setError(data?.error || "投稿を送信できませんでした。");
    setMessage("投稿を受け付けました。管理者確認後に公開されます。");
    setForm((current) => ({ ...current, title: "", excerpt: "", content: "", region: "", coverImageUrl: "" }));
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header><p className="text-sm font-bold text-emerald-700">WorkLife WH コラム</p><h1 className="mt-1 text-2xl font-bold md:text-4xl">役立ち情報を投稿</h1><p className="mt-3 max-w-2xl font-medium leading-7 text-gray-700">実体験や生活準備の情報を共有できます。投稿は管理者が内容を確認してから公開します。</p></header>
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-7 text-amber-950">投稿内容には、他人の個人情報、パスポート情報、住所、電話番号、勤務先の内部情報、誹謗中傷、虚偽情報、無断転載画像を含めないでください。投稿は管理者確認後に公開されます。</p>
        {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 font-bold text-red-700">{error}</p> : null}
        {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-800">{message}</p> : null}
        <section className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2 md:p-6">
          <label className="md:col-span-2"><span className="text-sm font-bold">タイトル</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} /></label>
          <label><span className="text-sm font-bold">カテゴリー</span><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>{ARTICLE_CATEGORIES.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label><span className="text-sm font-bold">記事の種類</span><select value={form.articleType} onChange={(e) => setForm({ ...form, articleType: e.target.value })} className={inputClass}><option value="experience">体験談</option><option value="general">一般情報</option></select></label>
          <label><span className="text-sm font-bold">関連国</span><select value={form.countryCode} onChange={(e) => setForm({ ...form, countryCode: e.target.value })} className={inputClass}><option value="NZ">ニュージーランド</option><option value="AU">オーストラリア</option><option value="CA">カナダ</option></select></label>
          <label><span className="text-sm font-bold">関連地域（任意）</span><input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputClass} /></label>
          <label className="md:col-span-2"><span className="text-sm font-bold">要約（任意）</span><textarea rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className={inputClass} /></label>
          <label className="md:col-span-2"><span className="text-sm font-bold">本文</span><textarea rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputClass} placeholder="段落の間を空行で区切ってください。" /></label>
          <label className="md:col-span-2"><span className="text-sm font-bold">画像URL（任意）</span><input type="url" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className={inputClass} placeholder="ご自身が利用権を持つ画像のURL" /></label>
          <div className="space-y-3 md:col-span-2">{[["noAdvertising", "広告・紹介を目的とした投稿ではありません"], ["noPersonalInfo", "個人情報や機密情報を含めていません"], ["guidelineAccepted", "コミュニティガイドラインに同意します"]].map(([key, label]) => <label key={key} className="flex items-start gap-3 rounded-md bg-gray-50 p-3"><input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} className="mt-1 h-5 w-5" /><span className="font-medium">{label}</span></label>)}</div>
        </section>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><Link href="/articles" className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-center font-bold sm:w-auto">一覧へ戻る</Link><button type="button" onClick={submit} disabled={isSubmitting} className="w-full rounded-md bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-50 sm:w-auto">{isSubmitting ? "送信中..." : "確認を依頼する"}</button></div>
      </div>
    </main>
  );
}
