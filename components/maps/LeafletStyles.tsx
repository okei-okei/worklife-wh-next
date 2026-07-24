"use client";

import { useEffect } from "react";

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_WORKLIFE_STYLE_ID = "leaflet-worklife-location-style";

export default function LeafletStyles() {
  useEffect(() => {
    if (document.getElementById(LEAFLET_CSS_ID)) return;

    const link = document.createElement("link");
    link.id = LEAFLET_CSS_ID;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (document.getElementById(LEAFLET_WORKLIFE_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = LEAFLET_WORKLIFE_STYLE_ID;
    style.textContent = `
      .current-location-marker {
        background: transparent;
        border: 0;
      }

      .current-location-marker__ring {
        display: grid;
        width: 24px;
        height: 24px;
        place-items: center;
        border: 2px solid #ffffff;
        border-radius: 9999px;
        background: rgba(22, 140, 102, 0.25);
        box-shadow: 0 0 0 2px rgba(22, 140, 102, 0.35);
      }

      .current-location-marker__dot {
        width: 10px;
        height: 10px;
        border-radius: 9999px;
        background: #168c66;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return null;
}
