"use client";

import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GA_SCRIPT_ID = "google-analytics-script";

export default function GoogleAnalytics() {
  useEffect(() => {
    if (!GA_ID) return;
    if (document.getElementById(GA_SCRIPT_ID)) return;

    const loadAnalytics = () => {
      if (document.getElementById(GA_SCRIPT_ID)) return;

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };

      const script = document.createElement("script");
      script.id = GA_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);

      window.gtag("js", new Date());
      window.gtag("config", GA_ID, {
        page_path: window.location.pathname,
      });
    };

    const timeoutId = window.setTimeout(loadAnalytics, 12000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
