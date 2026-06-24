"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_STATUS_LABELS,
  normalizeArticleSlug,
  type Article,
  type ArticleInput,
  type ArticleStatus,
} from "@/lib/articles";
import { supabase } from "@/lib/supabase";

const emptyForm: ArticleInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "渡航準備",
  country_code: "NZ",
  region: "",
  article_type: "general",
  cover_image_url: "",
  status: "draft",
  is_sponsored: false,
  is_affiliate: false,
  sponsor_name: "",
  related_checklist_items: [],
  related_service_ids: [],
  related_partner_url: "",
  related_checklist_url: "",
  rejected_reason: "",
};

const editableStatuses: ArticleStatus[] = ["draft", "approved", "archived"];

export default function ArticleEditorForm({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ArticleInput>(emptyForm);
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(articleId));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/admin/articles");
        return;
      }
      const accessResponse = await fetch("/api/admin/access", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!accessResponse.ok) {
        router.replace("/");
        return;
      }
      setAccessToken(session.access_token);
      if (!articleId) return;

      const response = await fetch(`/api/admin/articles/${articleId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      const data = (await response.json().catch(() => null)) as { article?: Article; error?: string } | null;
      if (!response.ok || !data?.article) {
        setErrorMessage(data?.error || "記事を読み込めませんでした。");
      } else {
        const article = data.article;
        setForm({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || "",
          content: article.content,
          category: article.category,
          country_code: article.country_code || "NZ",
          region: article.region || "",
          article_type: article.article_type || "general",
          cover_image_url: article.cover_image_url || "",
          status: article.status,
          is_sponsored: article.is_sponsored,
          is_affiliate: article.is_affiliate,
          sponsor_name: article.sponsor_name || "",
          related_checklist_items: article.related_checklist_items || [],
          related_service_ids: article.related_service_ids || [],
          related_partner_url: article.related_partner_url || "",
          related_checklist_url: article.related_checklist_url || "",
          rejected_reason: article.rejected_reason || "",
        });
      }
      setIsLoading(false);
    };
    initialize();
  }, [articleId, router]);

  const update = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleTitleChange = (title: string) => {
    setForm((current) => ({
      ...current,
      title,
      slug: current.slug || normalizeArticleSlug(title),
    }));
  };

  const handleSubmit = async (status: ArticleStatus = form.status) => {
    if (!accessToken || !form.title.trim() || !form.slug.trim()) {
      setErrorMessage("タイトルとslugを入力してください。");
      return;
    }
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");
    const response = await fetch(articleId ? `/api/admin/articles/${articleId}` : "/api/admin/articles", {
      method: articleId ? "PATCH" : "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status }),
    });
    const data = (await response.json().catch(() => null)) as { article?: Article; error?: string } | null;
    setIsSaving(false);
    if (!response.ok || !data?.article) {
      setErrorMessage(data?.error || "記事を保存できませんでした。");
      return;
    }
    setForm((current) => ({ ...current, status: data.article!.status }));
    setMessage(status === "approved" || status === "published" ? "記事を公開しました。" : "記事を保存しました。");
    if (!articleId) router.replace(`/admin/articles/${data.article.id}/edit`);
  };

  if (isLoading) return <p className="font-bold text-gray-700">記事を読み込み中...</p>;

  const inputClass = "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-3 font-medium text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="space-y-5">
      {errorMessage ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{errorMessage}</p> : null}
      {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p> : null}

      <section className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-2 md:p-6">
        <label className="md:col-span-2">
          <span className="text-sm font-bold">タイトル</span>
          <input value={form.title} onChange={(event) => handleTitleChange(event.target.value)} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-bold">URL slug</span>
          <input value={form.slug} onChange={(event) => update("slug", normalizeArticleSlug(event.target.value))} className={inputClass} placeholder="working-holiday-budget" />
        </label>
        <label>
          <span className="text-sm font-bold">関連国</span>
          <select value={form.country_code || "NZ"} onChange={(event) => update("country_code", event.target.value)} className={inputClass}>
            <option value="NZ">ニュージーランド</option><option value="AU">オーストラリア</option><option value="CA">カナダ</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-bold">関連地域（任意）</span>
          <input value={form.region || ""} onChange={(event) => update("region", event.target.value)} className={inputClass} />
        </label>
        <label>
          <span className="text-sm font-bold">カテゴリー</span>
          <select value={form.category} onChange={(event) => update("category", event.target.value as ArticleInput["category"])} className={inputClass}>
            {ARTICLE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>
          <span className="text-sm font-bold">ステータス</span>
          <select value={form.status} onChange={(event) => update("status", event.target.value as ArticleStatus)} className={inputClass}>
            {editableStatuses.map((status) => (
              <option key={status} value={status}>
                {ARTICLE_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-bold">概要</span>
          <textarea rows={3} value={form.excerpt || ""} onChange={(event) => update("excerpt", event.target.value)} className={inputClass} />
        </label>
        <div className="grid gap-3 rounded-md bg-gray-50 p-4 md:col-span-2 md:grid-cols-2">
          <label className="flex items-center gap-3"><input type="checkbox" checked={form.is_sponsored} onChange={(event) => update("is_sponsored", event.target.checked)} className="h-5 w-5" /><span className="text-sm font-bold">PR・広告記事</span></label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={form.is_affiliate} onChange={(event) => update("is_affiliate", event.target.checked)} className="h-5 w-5" /><span className="text-sm font-bold">アフィリエイトリンクを含む</span></label>
          <label className="md:col-span-2"><span className="text-sm font-bold">スポンサー名（任意）</span><input value={form.sponsor_name || ""} onChange={(event) => update("sponsor_name", event.target.value)} className={inputClass} /></label>
          <label><span className="text-sm font-bold">関連比較ページURL</span><input value={form.related_partner_url || ""} onChange={(event) => update("related_partner_url", event.target.value)} className={inputClass} placeholder="/partners/sim-esim" /></label>
          <label><span className="text-sm font-bold">関連チェックリストURL</span><input value={form.related_checklist_url || ""} onChange={(event) => update("related_checklist_url", event.target.value)} className={inputClass} placeholder="/mypage/checklist" /></label>
          <label><span className="text-sm font-bold">関連チェック項目（1行1件）</span><textarea rows={4} value={form.related_checklist_items.join("\n")} onChange={(event) => update("related_checklist_items", event.target.value.split("\n").filter(Boolean))} className={inputClass} /></label>
          <label><span className="text-sm font-bold">関連サービスID（1行1件）</span><textarea rows={4} value={form.related_service_ids.join("\n")} onChange={(event) => update("related_service_ids", event.target.value.split("\n").filter(Boolean))} className={inputClass} /></label>
        </div>
        <label className="md:col-span-2">
          <span className="text-sm font-bold">本文</span>
          <textarea rows={16} value={form.content} onChange={(event) => update("content", event.target.value)} className={inputClass} placeholder="段落の間を空行で区切って入力してください。" />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-bold">アイキャッチ画像URL</span>
          <input type="url" value={form.cover_image_url || ""} onChange={(event) => update("cover_image_url", event.target.value)} className={inputClass} placeholder="https://..." />
        </label>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/articles" className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-center font-bold text-gray-900 sm:w-auto">記事一覧へ戻る</Link>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => handleSubmit("draft")} disabled={isSaving} className="w-full rounded-md border border-slate-800 bg-white px-4 py-3 font-bold text-slate-900 disabled:opacity-50 sm:w-auto">下書き保存</button>
          <button type="button" onClick={() => handleSubmit(form.status)} disabled={isSaving} className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 font-bold text-gray-900 disabled:opacity-50 sm:w-auto">現在の状態で保存</button>
          <button type="button" onClick={() => handleSubmit("approved")} disabled={isSaving} className="w-full rounded-md bg-emerald-700 px-4 py-3 font-bold text-white disabled:opacity-50 sm:w-auto">{isSaving ? "保存中..." : "公開する"}</button>
        </div>
      </div>
    </div>
  );
}
