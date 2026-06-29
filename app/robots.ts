import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/mypage",
          "/mypage/",
          "/login",
          "/register",
          "/auth/",
          "/api/",
          "/cookie-preferences",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
