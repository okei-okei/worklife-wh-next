import type { MetadataRoute } from "next";
import { staticArticles } from "@/lib/constants/articles";
import { partnerSeoCategories } from "@/lib/constants/partnerSeo";

const siteUrl = "https://worklife-wh-next.vercel.app";

function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

const legalPaths = [
  "/legal",
  "/legal/affiliate-disclosure",
  "/legal/ai-policy",
  "/legal/business-terms",
  "/legal/community-guidelines",
  "/legal/company-terms",
  "/legal/cookies",
  "/legal/data-policy",
  "/legal/data-transfer",
  "/legal/data-use-transfer",
  "/legal/job-listing-terms",
  "/legal/job-posting",
  "/legal/privacy",
  "/legal/privacy-request",
  "/legal/property-listing-terms",
  "/legal/property-posting",
  "/legal/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    "/",
    "/jobs",
    "/properties",
    "/simulator",
    "/compare/sim",
    "/compare/insurance",
    "/compare/remittance",
    "/login",
    "/register",
    "/mypage",
    "/partners",
    "/articles",
    "/demo-planner",
  ];

  return [
    ...staticPaths.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...partnerSeoCategories.map((category) => ({
      url: absoluteUrl(category.path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...staticArticles
      .filter((article) => article.status === "approved" || article.status === "published")
      .map((article) => ({
        url: absoluteUrl(`/articles/${article.slug}`),
        lastModified: new Date(article.updated_at || article.published_at || article.created_at),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
    ...legalPaths.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
