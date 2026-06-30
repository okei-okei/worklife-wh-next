import type { MetadataRoute } from "next";
import { staticArticles } from "@/lib/constants/articles";

const baseUrl = "https://worklife-wh-next.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    "",
    "/jobs",
    "/properties",
    "/simulator",
    "/partners",
    "/partners/sim-esim",
    "/partners/insurance",
    "/partners/money-transfer",
    "/partners/bank",
    "/partners/electricity",
    "/partners/internet",
    "/partners/furniture",
    "/partners/language-school",
    "/partners/study-agency",
    "/partners/flights-transport",
    "/articles",
  ];

  const articleRoutes = staticArticles
    .filter((article) => article.status === "approved" || article.status === "published")
    .map((article) => `/articles/${article.slug}`);

  const legalRoutes = [
    "/legal",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/affiliate-disclosure",
    "/legal/ai-policy",
    "/legal/business-terms",
    "/legal/community-guidelines",
    "/legal/company-terms",
    "/legal/data-policy",
    "/legal/data-transfer",
    "/legal/data-use-transfer",
    "/legal/job-listing-terms",
    "/legal/job-posting",
    "/legal/privacy-request",
    "/legal/property-listing-terms",
    "/legal/property-posting",
  ];

  const routes = [...publicRoutes, ...articleRoutes, ...legalRoutes];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
