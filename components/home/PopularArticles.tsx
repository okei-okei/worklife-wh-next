import Link from "next/link";
import HomeImagePlane from "@/components/home/HomeImagePlane";
import type { Article } from "@/lib/articles";

export default function PopularArticles({ articles }: { articles: Article[] }) {
  return (
    <section
      data-scene="articles"
      data-background-scene="articles"
      className="relative overflow-hidden bg-white px-4 py-16 text-[#171717] md:px-6 md:py-28"
    >
      <HomeImagePlane
        desktopSrc="/images/home/articles-desktop.webp"
        mobileSrc="/images/home/articles-mobile.webp"
        alt="落ち着いてニュージーランド生活情報を確認する雰囲気"
        sizes="(min-width: 768px) 46vw, 100vw"
        className="right-[-8vw] top-0 h-[48svh] w-[94vw] opacity-95 md:right-0 md:top-[12%] md:h-[70svh] md:w-[52vw]"
        imageClassName="object-[48%_50%]"
      />
      <div className="mx-auto grid max-w-6xl gap-8 pt-[50svh] md:min-h-[88svh] md:grid-cols-[0.44fr_0.56fr] md:items-start md:pt-0">
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
                現地での経験をもとに、準備や暮らしのポイントをまとめています。
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

        <div className="relative z-10 divide-y divide-[#D8D8D4] border-y border-[#D8D8D4] md:mt-[54svh]">
          {articles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block py-4 transition hover:bg-[#F7F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] md:px-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black text-[#315C55]">
                  {article.category}
                </p>
                <p className="font-serif text-2xl italic leading-none text-[#235347]/25">
                  0{index + 1}
                </p>
              </div>
              <h3
                className={`line-clamp-2 font-black text-[#171717] ${
                  index === 0
                    ? "mt-2 text-lg leading-6 md:text-2xl md:leading-8"
                    : "mt-1 text-base leading-6"
                }`}
              >
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
        </div>
      </div>
    </section>
  );
}
