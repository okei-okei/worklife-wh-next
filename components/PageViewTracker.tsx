"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackMetric } from "@/lib/analytics";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    trackMetric("page_view", { eventType: "page_view", pagePath: pathname });
  }, [pathname]);

  return null;
}

