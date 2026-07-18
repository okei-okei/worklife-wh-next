"use client";

import { useEffect } from "react";

const scenes = [
  "hero",
  "jobs",
  "properties",
  "planner",
  "preparation",
  "articles",
  "partners",
  "final",
] as const;

type SceneId = (typeof scenes)[number];

function isSceneId(value: string | null): value is SceneId {
  return Boolean(value && scenes.includes(value as SceneId));
}

export default function ScrollBackground() {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-scene], [data-background-scene]",
      ),
    );
    if (!targets.length) return;
    let currentScene: SceneId = "hero";

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const center = window.innerHeight / 2;
            const aRect = a.boundingClientRect;
            const bRect = b.boundingClientRect;
            const aDistance = Math.abs(aRect.top + aRect.height / 2 - center);
            const bDistance = Math.abs(bRect.top + bRect.height / 2 - center);
            return aDistance - bDistance;
          })[0];
        if (!visibleEntry) return;

        const nextScene =
          (visibleEntry.target as HTMLElement).dataset.scene ??
          (visibleEntry.target as HTMLElement).dataset.backgroundScene ??
          null;
        if (!isSceneId(nextScene)) return;
        if (currentScene === nextScene) return;
        currentScene = nextScene;
        document.documentElement.dataset.homeScene = nextScene;
        window.dispatchEvent(
          new CustomEvent("homeSceneChange", { detail: nextScene }),
        );
      },
      {
        rootMargin: "0px",
        threshold: [0.02, 0.24, 0.5],
      },
    );

    targets.forEach((target) => observer.observe(target));
    document.documentElement.dataset.homeScene = "hero";
    window.dispatchEvent(new CustomEvent("homeSceneChange", { detail: "hero" }));

    return () => {
      observer.disconnect();
      delete document.documentElement.dataset.homeScene;
    };
  }, []);

  return null;
}
