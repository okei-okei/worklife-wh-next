import Image from "next/image";
import type { Article } from "@/lib/articles";

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ja-JP");
}

export default function ArticleHero({
  article,
  readingMinutes,
}: {
  article: Article;
  readingMinutes: number;
}) {
  return (
    <header className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {article.cover_image_url ? (
        <div className="relative h-40 w-full bg-gray-100 md:h-56">
          <Image
            src={article.cover_image_url}
            alt={`${article.title}のアイキャッチ画像`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      ) : null}
      <div className="p-4 md:p-6">
        <p className="text-xs font-bold text-blue-700 md:text-sm">
          WorkLife WH
        </p>
        <p className="mt-1 text-xs font-bold text-gray-600">
          海外生活を、もっとリアルに。
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
            {article.category}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700">
            {article.country_code || "NZ"}
          </span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            読了 {readingMinutes}分
          </span>
          {article.is_sponsored || article.is_affiliate ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
              広告・紹介リンク
            </span>
          ) : null}
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
          {article.title}
        </h1>
        {article.excerpt ? (
          <p className="mt-3 text-sm font-medium leading-6 text-gray-700 md:text-base md:leading-7">
            {article.excerpt}
          </p>
        ) : null}
        <div className="mt-3 grid grid-cols-1 gap-1 text-xs font-medium text-gray-600 sm:grid-cols-2 md:text-sm">
          <p>公開日: {formatDate(article.published_at || article.created_at)}</p>
          <p>最終更新日: {formatDate(article.updated_at)}</p>
        </div>
      </div>
    </header>
  );
}
