import type { MetadataRoute } from "next";
import { staticArticles } from "@/lib/constants/articles";

const baseUrl = "https://worklife-wh-next.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/jobs",
    "/properties",
    "/simulator",
    "/planner",
    "/partners",
    "/articles",
    "/demo-planner",
    "/company/submit",
  ];

  const partnerRoutes = [
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
  ];

  const articleRoutes = staticArticles
    .filter(
      (article) =>
        article.status === "approved" ||
        article.status === "published" ||
        !article.status,
    )
    .map((article) => `/articles/${article.slug}`);

  const legalRoutes = [
    "/legal",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/cookie-policy",
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
    "/legal/disclaimer",
    "/terms",
    "/privacy",
    "/company-terms",
  ];

  const routes = Array.from(
    new Set([...staticRoutes, ...partnerRoutes, ...articleRoutes, ...legalRoutes]),
  );

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority:
      route === ""
        ? 1
        : route.startsWith("/partners")
          ? 0.8
          : route.startsWith("/articles")
            ? 0.7
            : 0.6,
  }));
}
