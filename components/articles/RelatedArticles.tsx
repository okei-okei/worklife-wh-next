import Link from "next/link";
import type { Article } from "@/lib/articles";

export default function RelatedArticles({
  articles,
  title = "関連記事",
}: {
  articles: Article[];
  title?: string;
}) {
  if (!articles.length) return null;

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4 md:p-5">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.slug}
            className="flex min-h-full flex-col rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                {article.category}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                {article.country_code || "NZ"}
              </span>
            </div>
            <h3 className="mt-3 text-base font-bold leading-6 text-gray-900">
              {article.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm font-medium leading-6 text-gray-700">
              {article.excerpt || "記事の内容を確認する"}
            </p>
            <div className="mt-auto pt-4">
              <Link
                href={`/articles/${article.slug}`}
                className="inline-flex w-full rounded-lg bg-blue-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-800 sm:w-auto"
              >
                読む
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
