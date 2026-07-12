import type { ReactNode } from "react";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "ライフプランナー｜ニュージーランドワーホリ｜WorkLife WH",
  description:
    "ニュージーランドワーホリの仕事と住まいを組み合わせて、生活費、通勤、帰国時点の収支を比較できます。",
  path: "/planner",
});

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return children;
}
