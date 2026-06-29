import type { MetadataRoute } from "next";

const baseUrl = "https://worklife-wh-next.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
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
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/affiliate-disclosure",
    "/legal/ai-policy",
    "/legal/community-guidelines",
    "/legal/data-policy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
