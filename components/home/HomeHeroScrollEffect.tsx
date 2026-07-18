"use client";

import { useEffect } from "react";

export default function HomeHeroScrollEffect() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = document.querySelector<HTMLElement>("[data-home-hero]");
    const image = document.querySelector<HTMLElement>("[data-home-hero-image]");
    const content = document.querySelector<HTMLElement>(
      "[data-home-hero-content]",
    );
    const overlay = document.querySelector<HTMLElement>(
      "[data-home-hero-overlay]",
    );
    const scrollHint = document.querySelector<HTMLElement>(
      "[data-home-hero-scroll]",
    );
    if (!section) return;

    let frameId = 0;

    const updateHeroProgress = () => {
      frameId = 0;
      const rect = section.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, Math.abs(Math.min(rect.top, 0)) / (rect.height * 0.7)),
      );

      if (image) {
        image.style.transform = `scale(${1.035 - progress * 0.035}) translateY(${progress * -10}px)`;
      }
      if (content) {
        content.style.transform = `translateY(${progress * 10}px)`;
      }
      if (overlay) {
        overlay.style.opacity = String(0.9 - progress * 0.16);
      }
      if (scrollHint) {
        scrollHint.style.opacity = String(1 - progress * 1.5);
      }
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateHeroProgress);
    };

    updateHeroProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
