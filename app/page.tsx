import ExperienceTrust from "@/components/home/ExperienceTrust";
import FeatureSummary from "@/components/home/FeatureSummary";
import GoalNavigation from "@/components/home/GoalNavigation";
import HomeFinalCTA from "@/components/home/HomeFinalCTA";
import HomeHero from "@/components/home/HomeHero";
import HomeSteps from "@/components/home/HomeSteps";
import PopularArticles from "@/components/home/PopularArticles";
import PopularPartners from "@/components/home/PopularPartners";
import JsonLd from "@/components/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";
import { staticArticles } from "@/lib/constants/articles";

const homeDescription =
  "ニュージーランドのワーホリで必要な仕事探し、家探し、生活費、SIM、銀行、海外送金、渡航準備をまとめて支援するサービスです。";

export const metadata = createPageMetadata({
  title: "ニュージーランドワーホリの仕事・住まい・生活支援｜WorkLife WH",
  description: homeDescription,
  path: "/",
  keywords: [
    "ニュージーランド",
    "ワーホリ",
    "ワーキングホリデー",
    "仕事探し",
    "家探し",
    "生活費",
    "SIM",
    "銀行",
    "海外送金",
    "海外保険",
    "チェックリスト",
    "ライフプランナー",
  ],
});

const preferredArticleSlugs = [
  "nz-homestay-vs-sharehouse",
  "nz-working-holiday-job-search-real",
  "nz-working-holiday-sim-esim-comparison",
];

const popularArticles = preferredArticleSlugs
  .map((slug) => staticArticles.find((article) => article.slug === slug))
  .filter((article): article is NonNullable<typeof article> => Boolean(article));

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    email: siteConfig.supportEmail,
    sameAs: [absoluteUrl("/about")],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: homeDescription,
    inLanguage: "ja",
  };

  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-white text-gray-900">
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd
        data={createBreadcrumbJsonLd([{ label: "ホーム", href: "/" }])}
      />

      <HomeHero />
      <GoalNavigation />
      <FeatureSummary />
      <HomeSteps />
      <PopularArticles articles={popularArticles} />
      <PopularPartners />
      <ExperienceTrust />
      <HomeFinalCTA />
    </main>
  );
}
