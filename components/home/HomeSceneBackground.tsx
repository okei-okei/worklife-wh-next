"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const scenes = {
  hero: {
    desktop: "/images/home/hero-desktop.webp",
    mobile: "/images/home/hero-mobile.webp",
    colorClass: "bg-slate-950",
  },
  "work-home": {
    desktop: "/images/home/work-home-desktop.webp",
    mobile: "/images/home/work-home-mobile.webp",
    colorClass: "bg-slate-900",
  },
  "life-plan": {
    desktop: "/images/home/life-plan-desktop.webp",
    mobile: "/images/home/life-plan-mobile.webp",
    colorClass: "bg-blue-950",
  },
  preparation: {
    desktop: "/images/home/preparation-desktop.webp",
    mobile: "/images/home/preparation-mobile.webp",
    colorClass: "bg-emerald-950",
  },
  final: {
    desktop: "/images/home/final-desktop.webp",
    mobile: "/images/home/final-mobile.webp",
    colorClass: "bg-slate-950",
  },
} as const;

type SceneId = keyof typeof scenes;

function isSceneId(value: string | null): value is SceneId {
  return Boolean(value && value in scenes);
}

export default function HomeSceneBackground() {
  const [activeScene, setActiveScene] = useState<SceneId>("hero");
  const [previousScene, setPreviousScene] = useState<SceneId | null>(null);
  const [isFadingPrevious, setIsFadingPrevious] = useState(false);
  const clearPreviousTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-home-scene]"),
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) return;

        const nextScene =
          (visibleEntry.target as HTMLElement).dataset.homeScene ?? null;
        if (!isSceneId(nextScene)) return;

        setActiveScene((current) => {
          if (current === nextScene) return current;
          if (clearPreviousTimerRef.current) {
            window.clearTimeout(clearPreviousTimerRef.current);
          }
          setPreviousScene(current);
          setIsFadingPrevious(false);
          window.requestAnimationFrame(() => {
            setIsFadingPrevious(true);
          });
          clearPreviousTimerRef.current = window.setTimeout(() => {
            setPreviousScene(null);
            clearPreviousTimerRef.current = null;
          }, 760);
          return nextScene;
        });
      },
      {
        rootMargin: "-42% 0px -42% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      if (clearPreviousTimerRef.current) {
        window.clearTimeout(clearPreviousTimerRef.current);
      }
    };
  }, []);

  const previous = previousScene ? scenes[previousScene] : null;
  const active = scenes[activeScene];

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-700 ${active.colorClass}`}
      aria-hidden="true"
    >
      {previous ? (
        <picture
          className={`absolute inset-0 transition-opacity duration-700 motion-reduce:hidden ${
            isFadingPrevious ? "opacity-0" : "opacity-100"
          }`}
        >
          <source media="(min-width: 768px)" srcSet={previous.desktop} />
          <Image
            src={previous.mobile}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </picture>
      ) : null}
      <picture key={activeScene} className="absolute inset-0 opacity-100">
        <source media="(min-width: 768px)" srcSet={active.desktop} />
        <Image
          src={active.mobile}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/78 via-slate-950/42 to-slate-950/72 md:bg-gradient-to-r md:from-slate-950/72 md:via-slate-950/36 md:to-slate-950/58" />
    </div>
  );
}
