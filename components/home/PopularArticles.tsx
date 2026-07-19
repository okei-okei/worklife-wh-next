import Link from "next/link";
import type { Article } from "@/lib/articles";

export default function PopularArticles({ articles }: { articles: Article[] }) {
  return (
    <section
      data-scene="articles"
      data-background-scene="articles"
      className="relative overflow-hidden bg-white px-4 py-12 text-[#171717] md:px-6 md:py-20"
    >
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[34vw] bg-[#F4EFE7] md:block" />
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[0.36fr_0.64fr] md:items-start md:gap-8">
        <div className="relative z-10 bg-white/92 py-5 md:bg-transparent md:py-0">
          <div className="flex items-end justify-between gap-3 md:block">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
                USEFUL INFORMATION
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-[#171717] md:text-4xl">
                ニュージーランド生活の役立ち情報
              </h2>
              <p className="mt-3 max-w-md text-sm font-medium leading-6 text-[#666666]">
                現地経験をもとに、仕事・住まい・生活のポイントをまとめています。
              </p>
            </div>
            <Link
              href="/articles"
              className="shrink-0 text-xs font-black text-[#315C55] md:mt-5 md:inline-block md:text-sm"
            >
              ニュージーランド生活の記事を読む
            </Link>
          </div>
        </div>

        <div className="relative z-10 grid gap-3 md:grid-cols-[1.15fr_0.85fr] md:gap-5">
          {articles.slice(0, 1).map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block border-y border-[#D8D8D4] py-4 transition hover:bg-[#F7F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:border md:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black text-[#315C55]">
                  {article.category}
                </p>
                <p className="font-serif text-2xl italic leading-none text-[#235347]/25">
                  01
                </p>
              </div>
              <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-[#171717] md:text-2xl md:leading-8">
                {article.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#666666]">
                {article.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
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
            {articles.slice(1, 3).map((article, index) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group block px-0 py-4 transition hover:bg-[#F7F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:px-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-[#315C55]">
                      {article.category}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-base font-black leading-6 text-[#171717]">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-xs font-bold text-[#666666]">
                      更新日: {article.updated_at?.slice(0, 10) || "随時更新"}
                    </p>
                  </div>
                  <p className="shrink-0 font-serif text-2xl italic leading-none text-[#235347]/25">
                    0{index + 2}
                  </p>
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
