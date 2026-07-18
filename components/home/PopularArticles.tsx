import Link from "next/link";
import type { Article } from "@/lib/articles";

export default function PopularArticles({ articles }: { articles: Article[] }) {
  return (
    <section
      data-background-scene="information"
      className="px-4 py-16 text-gray-900 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-700">
              USEFUL INFORMATION
            </p>
            <h2 className="mt-2 text-xl font-black text-gray-900 md:text-4xl">
              ニュージーランド生活の役立ち情報
            </h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-gray-600">
              現地での経験をもとに、準備や暮らしのポイントをまとめています。
            </p>
          </div>
          <Link
            href="/articles"
            className="shrink-0 text-xs font-black text-blue-700 md:text-sm"
          >
            ニュージーランド生活の記事を読む
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1.15fr_0.85fr] md:gap-4">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className={`group transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 motion-reduce:hover:translate-y-0 ${
                index === 0
                  ? "rounded-[1.25rem_4rem_1.25rem_1.25rem] border border-gray-200 bg-white/82 p-4 shadow-sm backdrop-blur md:row-span-2 md:p-6"
                  : "border-t border-gray-300 py-4"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">
                  {article.category}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Article
                </p>
              </div>
              <h3
                className={`mt-3 line-clamp-2 font-black text-gray-900 ${
                  index === 0
                    ? "text-lg leading-6 md:text-2xl md:leading-8"
                    : "text-base leading-6"
                }`}
              >
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-700">
                {article.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-gray-600">
                  更新日: {article.updated_at?.slice(0, 10) || "随時更新"}
                </p>
                <p className="text-xs font-black text-blue-700 transition group-hover:translate-x-0.5 md:text-sm">
                  記事を読む
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
