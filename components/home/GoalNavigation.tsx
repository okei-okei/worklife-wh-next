import HomeImagePlane from "@/components/home/HomeImagePlane";
import HomeLineLink from "@/components/home/HomeLineLink";

const propertyLinks = [
  {
    number: "01",
    title: "公開物件を見る",
    description: "地域や家賃を確認",
    href: "/properties",
  },
  {
    number: "02",
    title: "保存物件を管理",
    description: "候補をあとで比較",
    href: "/mypage/properties",
  },
  {
    number: "03",
    title: "問い合わせ文を作る",
    description: "英語テンプレートを作成",
    href: "/mypage/property-inquiry",
  },
];

export default function GoalNavigation() {
  return (
    <section
      data-scene="properties"
      data-background-scene="properties"
      className="relative overflow-hidden bg-white px-4 py-16 text-[#171717] md:px-6 md:py-28"
    >
      <HomeImagePlane
        desktopSrc="/images/home/properties-desktop.webp"
        mobileSrc="/images/home/properties-mobile.webp"
        alt="ニュージーランドで住まいを探す住宅街の風景"
        sizes="(min-width: 768px) 100vw, 100vw"
        className="left-0 top-0 h-[40svh] w-full md:left-0 md:top-0 md:h-[62svh] md:w-full"
        imageClassName="object-[52%_48%]"
      />
      <div className="absolute inset-x-0 top-0 h-[40svh] bg-gradient-to-b from-transparent via-transparent to-white md:h-[62svh]" />
      <div className="mx-auto grid max-w-6xl gap-7 pt-[40svh] md:min-h-[88svh] md:grid-cols-[0.42fr_0.58fr] md:items-end md:gap-12 md:pt-[50svh]">
        <div className="relative z-10 bg-white/92 py-5 md:bg-white/0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#315C55]">
            PROPERTY SEARCH
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight md:text-4xl">
            暮らしやすい
            <br />
            住まいを探す
          </h2>
          <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-[#666666]">
            地域、家賃、住所を見ながら候補を比較できます。
          </p>
        </div>

        <div className="relative z-10 border-t border-[#D8D8D4] bg-white/92 md:bg-white/0">
          {propertyLinks.map((goal) => (
            <HomeLineLink
              key={goal.href}
              href={goal.href}
              number={goal.number}
              title={goal.title}
              description={goal.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
