import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ニュージーランド物件一覧｜WorkLife WH",
  description:
    "ニュージーランドワーホリ向けの公開物件を地域、週家賃、入居可能日、ペット可否などから探せます。",
  path: "/properties",
});

export default function PropertiesLayout({ children }: { children: ReactNode }) {
  return children;
}
