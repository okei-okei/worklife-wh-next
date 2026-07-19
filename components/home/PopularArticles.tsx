import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import HomeImagePlane from "@/components/home/HomeImagePlane";

export default function PopularArticles({ articles }: { articles: Article[] }) {
  const featuredArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);

  return (
    <section
      data-scene="articles"
      data-background-scene="articles"
      className="relative overflow-hidden bg-white px-4 py-10 text-[#171717] md:px-6 lg:bg-[#FBFAF7] lg:py-20"
    >
      <HomeImagePlane
        desktopSrc="/images/home/articles-desktop.webp"
        mobileSrc="/images/home/articles-mobile.webp"
        alt="ニュージーランド生活の情報を落ち着いて確認する風景"
        sizes="100vw"
        className="left-0 top-0 h-[230px] w-full bg-white lg:hidden"
        imageClassName="object-[50%_44%]"
      />
      <div className="absolute inset-x-0 top-[168px] h-[62px] bg-gradient-to-b from-transparent via-white/35 to-white lg:hidden" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-6 pt-[240px] lg:grid-cols-12 lg:gap-x-10 lg:gap-y-6 lg:pt-0">
        <div className="order-1 bg-white/94 py-5 lg:col-span-5 lg:col-start-8 lg:bg-transparent lg:py-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            USEFUL INFORMATION
          </p>
          <h2 className="home-heading mt-2 max-w-[680px] text-2xl font-black leading-tight text-[#171717] md:text-4xl">
            <span className="hidden sm:inline">
              <span className="home-nowrap">ニュージーランド生活の</span>
              <span className="home-nowrap">役立ち情報</span>
            </span>
            <span className="sm:hidden">
              <span className="home-nowrap">ニュージーランド生活の</span>
              <br />
              <span className="home-nowrap">役立ち情報</span>
            </span>
          </h2>
          <p className="home-copy mt-3 max-w-md text-sm font-medium leading-6 text-[#666666]">
            <span className="sm:hidden">
              <span className="home-nowrap">仕事・住まい・生活</span>のポイントを、
              現地経験をもとにまとめています。
            </span>
            <span className="hidden sm:inline">
              現地経験をもとに、<span className="home-nowrap">仕事・住まい・生活</span>のポイントをまとめています。
            </span>
          </p>
          <Link
            href="/articles"
            className="home-link-label mt-4 inline-block shrink-0 whitespace-nowrap text-xs font-black text-[#315C55] md:text-sm"
          >
            <span className="sm:hidden">記事を見る</span>
            <span className="hidden sm:inline">すべての記事を見る</span>
          </Link>
        </div>

        {featuredArticle ? (
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="group order-2 block overflow-hidden border-y border-[#D8D8D4] bg-white transition hover:bg-[#F7F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] lg:col-span-7 lg:row-span-2 lg:row-start-1 lg:border"
          >
            <div className="relative hidden aspect-[16/10] overflow-hidden border-b border-[#D8D8D4] lg:block">
              <Image
                src={featuredArticle.cover_image_url || "/images/home/articles-desktop.webp"}
                alt={`${featuredArticle.title}のイメージ`}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-[52%_56%] saturate-[0.92] transition-transform duration-700 group-hover:scale-[1.015] motion-reduce:transition-none"
              />
            </div>
            <div className="py-3 lg:p-5">
              <p className="text-[10px] font-black text-[#315C55]">
                {featuredArticle.category}
              </p>
              <h3 className="home-heading mt-2 line-clamp-3 text-base font-black leading-6 text-[#171717] md:line-clamp-2 md:text-2xl md:leading-8">
                {featuredArticle.title}
              </h3>
              <p className="home-copy mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#666666]">
                {featuredArticle.excerpt}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3 md:mt-4">
                <p className="text-xs font-bold text-[#666666]">
                  更新日: {featuredArticle.updated_at?.slice(0, 10) || "随時更新"}
                </p>
                <p className="home-link-label whitespace-nowrap text-xs font-black text-[#315C55] transition group-hover:translate-x-0.5 md:text-sm">
                  記事を読む
                </p>
              </div>
            </div>
          </Link>
        ) : null}

        <div className="order-3 divide-y divide-[#D8D8D4] border-y border-[#D8D8D4] bg-white lg:col-span-5 lg:col-start-8 lg:border">
          {secondaryArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block px-0 py-3 transition hover:bg-[#F7F7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#235347] lg:px-4 lg:py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-[#315C55]">
                    {article.category}
                  </p>
                  <h3 className="home-heading mt-1 line-clamp-2 text-base font-black leading-6 text-[#171717]">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-xs font-bold text-[#666666]">
                    更新日: {article.updated_at?.slice(0, 10) || "随時更新"}
                  </p>
                </div>
                <span
                  className="mt-5 shrink-0 text-xs font-black text-[#315C55] transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
