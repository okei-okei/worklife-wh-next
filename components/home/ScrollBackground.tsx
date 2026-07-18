"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const scenes = {
  start: {
    desktop: "/images/home/scene-start-desktop.webp",
    mobile: "/images/home/scene-start-mobile.webp",
    colorClass: "bg-slate-950",
    overlayClass:
      "bg-gradient-to-b from-slate-950/76 via-slate-950/38 to-slate-950/72 md:bg-gradient-to-r md:from-slate-950/74 md:via-slate-950/38 md:to-slate-950/18",
    lightClass: "bg-cyan-300/18 left-[-18%] top-[12%]",
  },
  "work-home": {
    desktop: "/images/home/scene-work-home-desktop.webp",
    mobile: "/images/home/scene-work-home-mobile.webp",
    colorClass: "bg-emerald-950",
    overlayClass:
      "bg-gradient-to-b from-slate-950/72 via-emerald-950/40 to-slate-950/72 md:bg-gradient-to-r md:from-slate-950/70 md:via-emerald-950/30 md:to-slate-950/44",
    lightClass: "bg-emerald-300/18 right-[-16%] top-[18%]",
  },
  planning: {
    desktop: "/images/home/scene-planning-desktop.webp",
    mobile: "/images/home/scene-planning-mobile.webp",
    colorClass: "bg-blue-950",
    overlayClass:
      "bg-gradient-to-b from-slate-950/74 via-blue-950/36 to-slate-950/74 md:bg-gradient-to-r md:from-slate-950/76 md:via-blue-950/30 md:to-slate-950/48",
    lightClass: "bg-sky-300/18 left-[48%] top-[12%]",
  },
  prepare: {
    desktop: "/images/home/scene-prepare-desktop.webp",
    mobile: "/images/home/scene-prepare-mobile.webp",
    colorClass: "bg-teal-950",
    overlayClass:
      "bg-gradient-to-b from-slate-950/68 via-teal-950/34 to-slate-950/70 md:bg-gradient-to-r md:from-slate-950/70 md:via-teal-950/26 md:to-slate-950/46",
    lightClass: "bg-amber-200/18 right-[-12%] bottom-[10%]",
  },
  information: {
    desktop: null,
    mobile: null,
    colorClass: "bg-[#edf4f3]",
    overlayClass:
      "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),linear-gradient(180deg,rgba(237,244,243,0.96),rgba(248,250,252,0.98))]",
    lightClass: "bg-blue-200/34 left-[-18%] top-[8%]",
  },
  final: {
    desktop: "/images/home/scene-final-desktop.webp",
    mobile: "/images/home/scene-final-mobile.webp",
    colorClass: "bg-slate-950",
    overlayClass:
      "bg-gradient-to-b from-slate-950/70 via-slate-950/34 to-slate-950/76 md:bg-gradient-to-r md:from-slate-950/74 md:via-slate-950/30 md:to-slate-950/42",
    lightClass: "bg-blue-300/18 right-[-18%] top-[16%]",
  },
} as const;

type SceneId = keyof typeof scenes;

function isSceneId(value: string | null): value is SceneId {
  return Boolean(value && value in scenes);
}

function SceneImage({
  sceneId,
  isPrevious = false,
  isFadingPrevious = false,
}: {
  sceneId: SceneId;
  isPrevious?: boolean;
  isFadingPrevious?: boolean;
}) {
  const scene = scenes[sceneId];
  if (!scene.mobile || !scene.desktop) return null;

  return (
    <picture
      className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
        isPrevious
          ? isFadingPrevious
            ? "opacity-0"
            : "opacity-100"
          : "opacity-100"
      }`}
    >
      <source media="(min-width: 768px)" srcSet={scene.desktop} />
      <Image
        src={scene.mobile}
        alt=""
        fill
        sizes="100vw"
        priority={sceneId === "start" && !isPrevious}
        className="scale-[1.018] object-cover object-center transition-transform duration-[6000ms] ease-out motion-reduce:scale-100"
      />
    </picture>
  );
}

export default function ScrollBackground() {
  const [activeScene, setActiveScene] = useState<SceneId>("start");
  const [previousScene, setPreviousScene] = useState<SceneId | null>(null);
  const [isFadingPrevious, setIsFadingPrevious] = useState(false);
  const clearPreviousTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-background-scene]"),
    );
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) return;

        const nextScene =
          (visibleEntry.target as HTMLElement).dataset.backgroundScene ?? null;
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
          window.dispatchEvent(
            new CustomEvent("homeSceneChange", { detail: nextScene }),
          );
          clearPreviousTimerRef.current = window.setTimeout(() => {
            setPreviousScene(null);
            clearPreviousTimerRef.current = null;
          }, 780);
          return nextScene;
        });
      },
      {
        rootMargin: "-44% 0px -44% 0px",
        threshold: [0.18, 0.34, 0.52],
      },
    );

    targets.forEach((target) => observer.observe(target));
    window.dispatchEvent(new CustomEvent("homeSceneChange", { detail: "start" }));

    return () => {
      observer.disconnect();
      if (clearPreviousTimerRef.current) {
        window.clearTimeout(clearPreviousTimerRef.current);
      }
    };
  }, []);

  const active = scenes[activeScene];

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-700 ${active.colorClass}`}
      aria-hidden="true"
    >
      {previousScene ? (
        <SceneImage
          sceneId={previousScene}
          isPrevious
          isFadingPrevious={isFadingPrevious}
        />
      ) : null}
      <SceneImage key={activeScene} sceneId={activeScene} />
      <div
        className={`absolute inset-0 transition-all duration-700 ${active.overlayClass}`}
      />
      <div
        className={`absolute h-[340px] w-[340px] rounded-full blur-3xl transition-all duration-700 md:h-[520px] md:w-[520px] ${active.lightClass}`}
      />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/38 to-transparent" />
    </div>
  );
}
