import type { MetadataRoute } from "next";

const siteUrl = "https://worklife-wh-next.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/auth/",
          "/api/",
          "/cookie-preferences",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
