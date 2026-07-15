"use client";

import { useEffect } from "react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { trackGAEvent } from "@/lib/services/ga";
import { trackPageView } from "@/lib/services/pageView";

export default function PageViewTracker() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    trackPageView(pathname);

    if (previousPathname.current === null) {
      previousPathname.current = pathname;
      return;
    }

    if (previousPathname.current !== pathname) {
      trackGAEvent("page_view", { page_path: pathname });
      previousPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}
