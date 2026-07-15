"use client";

import { useEffect } from "react";

const LEAFLET_CSS_ID = "leaflet-css";

export default function LeafletStyles() {
  useEffect(() => {
    if (document.getElementById(LEAFLET_CSS_ID)) return;

    const link = document.createElement("link");
    link.id = LEAFLET_CSS_ID;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  return null;
}
