import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";

import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "WorkLife WH",
    template: "%s",
  },
  description:
    "ニュージーランドのワーホリ準備、仕事、住まい、生活費、比較サービスをまとめて管理できるサービスです。",
  openGraph: {
    title: siteConfig.name,
    description:
      "ニュージーランドのワーホリ準備、仕事、住まい、生活費、比較サービスをまとめて管理できます。",
    siteName: siteConfig.name,
    type: "website",
    url: absoluteUrl("/"),
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
        <PageViewTracker />
        <Header />
        <div className="flex-1 pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
