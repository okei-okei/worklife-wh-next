"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const record = async () => {
      const key = `article-view:${slug}`;
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch(`/api/articles/${encodeURIComponent(slug)}/view`, {
        method: "POST",
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
        keepalive: true,
      }).catch(() => undefined);
    };
    record();
  }, [slug]);

  return null;
}

