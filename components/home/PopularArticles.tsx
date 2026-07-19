import Link from "next/link";
import type { Article } from "@/lib/articles";

export default function PopularArticles({ articles }: { articles: Article[] }) {
  return (
    <section
      data-scene="articles"
      data-background-scene="articles"
      className="relative overflow-hidden bg-white px-4 py-10 text-[#171717] md:px-6 md:py-20"
    >
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[34vw] bg-[#F4EFE7] md:block" />
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[0.36fr_0.64fr] md:items-start md:gap-8">
        <div className="relative z-10 bg-white/92 py-5 md:bg-transparent md:py-0">
          <div className="flex items-end justify-between gap-3 md:block">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
                USEFUL INFORMATION
              </p>
              <h2 className="mt-2 max-w-[680px] text-balance text-2xl font-black leading-tight text-[#171717] [word-break:auto-phrase] md:text-4xl">
                <span className="hidden sm:inline">
                  ニュージーランド生活の役立ち情報
                </span>
                <span className="sm:hidden">
                  ニュージーランド生活の
                  <br />
                  役立ち情報
                </span>
              </h2>
              <p className="mt-3 max-w-md text-pretty text-sm font-medium leading-6 text-[#666666]">
                <span className="sm:hidden">
                  現地で役立つ仕事・住まい・生活情報をまとめています。
                </span>
                <span className="hidden sm:inline">
                  現地経験をもとに、仕事・住まい・生活のポイントをまとめています。
                </span>
              </p>
            </div>
            <Link
              href="/articles"
              className="shrink-0 whitespace-nowrap text-xs font-black text-[#315C55] md:mt-5 md:inline-block md:text-sm"
            >
              <span className="sm:hidden">記事を見る</span>
              <span className="hidden sm:inline">ニュージーランド生活の記事を読む</span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 grid gap-3 md:grid-cols-[1.15fr_0.85fr] md:gap-5">
          {articles.slice(0, 1).map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block border-y border-[#D8D8D4] py-3 transition hover:bg-[#F7F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:border md:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black text-[#315C55]">
                  {article.category}
                </p>
              </div>
              <h3 className="mt-2 line-clamp-3 text-balance text-base font-black leading-6 text-[#171717] [word-break:auto-phrase] md:line-clamp-2 md:text-2xl md:leading-8">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-pretty text-sm font-medium leading-6 text-[#666666]">
                {article.excerpt}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 md:mt-4">
                <p className="text-xs font-bold text-[#666666]">
                  更新日: {article.updated_at?.slice(0, 10) || "随時更新"}
                </p>
                <p className="text-xs font-black text-[#315C55] transition group-hover:translate-x-0.5 md:text-sm">
                  記事を読む
                </p>
              </div>
            </Link>
          ))}
          <div className="divide-y divide-[#D8D8D4] border-y border-[#D8D8D4] md:border">
            {articles.slice(1, 3).map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group block px-0 py-3 transition hover:bg-[#F7F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:px-4 md:py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-[#315C55]">
                      {article.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-balance text-base font-black leading-6 text-[#171717] [word-break:auto-phrase]">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-xs font-bold text-[#666666]">
                      更新日: {article.updated_at?.slice(0, 10) || "随時更新"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs font-black text-[#315C55] transition group-hover:translate-x-0.5">
                  記事を読む
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
