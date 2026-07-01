import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import PageViewTracker from "@/components/PageViewTracker";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "WorkLife WH｜ニュージーランドワーホリの仕事・住まい・生活設計",
    template: "%s | WorkLife WH",
  },
  description:
    "ニュージーランドのワーホリ準備、仕事探し、家探し、SIM/eSIM、銀行口座、海外送金、生活費、チェックリスト、ライフプランナーをまとめて管理できるサービスです。",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: siteConfig.name,
    description:
      "ニュージーランドのワーホリ準備、仕事探し、家探し、SIM/eSIM、銀行口座、海外送金、生活費、チェックリスト、ライフプランナーをまとめて管理できるサービスです。",
    siteName: siteConfig.name,
    type: "website",
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description:
      "ニュージーランドのワーホリ準備、仕事探し、家探し、SIM/eSIM、銀行口座、海外送金、生活費、チェックリスト、ライフプランナーをまとめて管理できるサービスです。",
  },
  verification: {
    google: "ytCGn5QIlmLC9JVUPsbK_TAXizHlt0nH-ucXPsPM32M",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <GoogleAnalytics />
        <PageViewTracker />
        <Header />
        <div className="flex-1 pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
