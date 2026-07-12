import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ニュージーランド求人一覧｜WorkLife WH",
  description:
    "ニュージーランドワーホリ向けの公開求人を地域、時給、勤務時間、採用形態などから探せます。",
  path: "/jobs",
});

export default function JobsLayout({ children }: { children: ReactNode }) {
  return children;
}
