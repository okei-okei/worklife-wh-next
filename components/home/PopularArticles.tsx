import Link from "next/link";
import type { Article } from "@/lib/articles";

export default function PopularArticles({ articles }: { articles: Article[] }) {
  return (
    <section className="bg-white px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-700">Articles</p>
            <h2 className="mt-1 text-lg font-black text-gray-900 md:text-2xl">
              人気の役立ち情報
            </h2>
          </div>
          <Link href="/articles" className="text-sm font-black text-blue-700">
            記事一覧
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <p className="text-[11px] font-black text-blue-700">
                {article.category}
              </p>
              <h3 className="mt-2 line-clamp-2 text-base font-black leading-6 text-gray-900">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                {article.excerpt}
              </p>
              <p className="mt-3 text-xs font-bold text-gray-600">
                更新日: {article.updated_at?.slice(0, 10) || "随時更新"}
              </p>
              <p className="mt-2 text-sm font-black text-blue-700">読む</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
