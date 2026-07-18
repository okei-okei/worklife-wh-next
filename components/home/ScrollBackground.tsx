"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ImageLayer = {
  desktop: string;
  mobile: string;
  frameClass: string;
  imageClass?: string;
  sizes: string;
};

type Scene = {
  baseClass: string;
  main?: ImageLayer;
  secondary?: ImageLayer;
  shapeClass: string;
  overlayClass: string;
  typography: string;
  typographyClass: string;
};

const scenes = {
  start: {
    baseClass: "bg-slate-950",
    main: {
      desktop: "/images/home/scene-start-desktop.webp",
      mobile: "/images/home/scene-start-mobile.webp",
      frameClass:
        "left-[-10%] top-[7%] h-[34vh] w-[92vw] rounded-[0_0_5rem_0] md:left-[4%] md:top-[10%] md:h-[46vh] md:w-[56vw] md:rounded-[0_0_9rem_0]",
      imageClass: "object-center",
      sizes: "(min-width: 768px) 56vw, 92vw",
    },
    secondary: {
      desktop: "/images/home/scene-work-home-desktop.webp",
      mobile: "/images/home/scene-work-home-mobile.webp",
      frameClass:
        "right-[6%] bottom-[9%] h-[132px] w-[132px] rounded-full md:right-[9%] md:bottom-[12%] md:h-[210px] md:w-[210px]",
      imageClass: "object-[58%_50%]",
      sizes: "(min-width: 768px) 210px, 132px",
    },
    shapeClass:
      "right-[-22%] top-[16%] h-[340px] w-[340px] rounded-full bg-cyan-300/18 blur-3xl md:h-[520px] md:w-[520px]",
    overlayClass:
      "bg-gradient-to-b from-slate-950/80 via-slate-950/46 to-slate-950/74 md:bg-gradient-to-r md:from-slate-950/76 md:via-slate-950/48 md:to-slate-950/24",
    typography: "01",
    typographyClass:
      "right-4 top-[18%] text-white/10 md:right-10 md:top-[20%]",
  },
  "work-home": {
    baseClass: "bg-[#071b2b]",
    main: {
      desktop: "/images/home/scene-work-home-desktop.webp",
      mobile: "/images/home/scene-work-home-mobile.webp",
      frameClass:
        "right-[-10%] top-[13%] h-[300px] w-[210px] rounded-t-full rounded-b-[2rem] md:right-[6%] md:top-[12%] md:h-[62vh] md:w-[34vw] md:rounded-t-full md:rounded-b-[3rem]",
      imageClass: "object-[58%_50%]",
      sizes: "(min-width: 768px) 34vw, 210px",
    },
    secondary: {
      desktop: "/images/home/scene-start-desktop.webp",
      mobile: "/images/home/scene-start-mobile.webp",
      frameClass:
        "left-[5%] bottom-[10%] h-[96px] w-[210px] rounded-full md:left-[9%] md:bottom-[13%] md:h-[150px] md:w-[360px]",
      imageClass: "object-[42%_52%]",
      sizes: "(min-width: 768px) 360px, 210px",
    },
    shapeClass:
      "left-[-18%] top-[18%] h-[330px] w-[330px] rounded-full bg-emerald-300/16 blur-3xl md:h-[540px] md:w-[540px]",
    overlayClass:
      "bg-gradient-to-b from-slate-950/74 via-[#071b2b]/46 to-slate-950/74 md:bg-gradient-to-r md:from-slate-950/76 md:via-[#071b2b]/34 md:to-slate-950/50",
    typography: "02",
    typographyClass:
      "left-4 bottom-[22%] text-white/9 md:left-10 md:bottom-[18%]",
  },
  planning: {
    baseClass: "bg-[#eef7f8]",
    main: {
      desktop: "/images/home/scene-planning-desktop.webp",
      mobile: "/images/home/scene-planning-mobile.webp",
      frameClass:
        "left-[13%] top-[16%] h-[220px] w-[76vw] rounded-full md:left-[24%] md:top-[14%] md:h-[44vh] md:w-[52vw]",
      imageClass: "object-[52%_46%]",
      sizes: "(min-width: 768px) 52vw, 76vw",
    },
    secondary: {
      desktop: "/images/home/scene-prepare-desktop.webp",
      mobile: "/images/home/scene-prepare-mobile.webp",
      frameClass:
        "left-[6%] bottom-[12%] h-[92px] w-[174px] rounded-[3rem_1rem_3rem_1rem] md:left-[8%] md:bottom-[12%] md:h-[150px] md:w-[280px]",
      imageClass: "object-[48%_50%]",
      sizes: "(min-width: 768px) 280px, 174px",
    },
    shapeClass:
      "right-[-18%] top-[12%] h-[340px] w-[340px] rounded-full bg-sky-200/48 blur-3xl md:h-[560px] md:w-[560px]",
    overlayClass:
      "bg-[radial-gradient(circle_at_80%_12%,rgba(14,165,233,0.14),transparent_34%),linear-gradient(180deg,rgba(238,247,248,0.92),rgba(248,250,252,0.96))]",
    typography: "03",
    typographyClass:
      "right-3 top-[42%] text-slate-900/8 md:right-10 md:top-[28%]",
  },
  prepare: {
    baseClass: "bg-[#e6f5f0]",
    main: {
      desktop: "/images/home/scene-prepare-desktop.webp",
      mobile: "/images/home/scene-prepare-mobile.webp",
      frameClass:
        "left-0 top-[-6%] h-[34vh] w-full rounded-b-[5rem] md:left-[4%] md:top-[8%] md:h-[38vh] md:w-[64vw] md:rounded-[0_0_8rem_0]",
      imageClass: "object-[50%_45%]",
      sizes: "(min-width: 768px) 64vw, 100vw",
    },
    secondary: {
      desktop: "/images/home/scene-planning-desktop.webp",
      mobile: "/images/home/scene-planning-mobile.webp",
      frameClass:
        "left-[7%] bottom-[13%] h-[112px] w-[112px] rounded-full md:left-[10%] md:bottom-[12%] md:h-[176px] md:w-[176px]",
      imageClass: "object-[50%_50%]",
      sizes: "(min-width: 768px) 176px, 112px",
    },
    shapeClass:
      "right-[-20%] bottom-[-8%] h-[360px] w-[360px] rounded-full bg-emerald-200/44 blur-3xl md:h-[560px] md:w-[560px]",
    overlayClass:
      "bg-[linear-gradient(160deg,rgba(230,245,240,0.22),rgba(230,245,240,0.95)_56%,rgba(248,250,252,0.98))]",
    typography: "04",
    typographyClass:
      "right-4 bottom-[20%] text-slate-900/8 md:right-12 md:bottom-[16%]",
  },
  information: {
    baseClass: "bg-[#f6f4ee]",
    main: {
      desktop: "/images/home/scene-start-desktop.webp",
      mobile: "/images/home/scene-start-mobile.webp",
      frameClass:
        "right-[5%] top-[9%] h-[112px] w-[168px] rounded-[4rem_1rem_4rem_1rem] opacity-70 md:right-[9%] md:top-[11%] md:h-[170px] md:w-[280px]",
      imageClass: "object-[48%_50%]",
      sizes: "(min-width: 768px) 280px, 168px",
    },
    secondary: {
      desktop: "/images/home/scene-work-home-desktop.webp",
      mobile: "/images/home/scene-work-home-mobile.webp",
      frameClass:
        "left-[5%] bottom-[10%] h-[98px] w-[98px] rounded-full opacity-70 md:left-[8%] md:bottom-[12%] md:h-[150px] md:w-[150px]",
      imageClass: "object-[58%_50%]",
      sizes: "(min-width: 768px) 150px, 98px",
    },
    shapeClass:
      "left-[-24%] top-[8%] h-[360px] w-[360px] rounded-full bg-blue-100/70 blur-3xl md:h-[560px] md:w-[560px]",
    overlayClass:
      "bg-[linear-gradient(180deg,rgba(246,244,238,0.92),rgba(248,250,252,0.98))]",
    typography: "INFO",
    typographyClass:
      "right-3 bottom-[18%] text-slate-900/6 md:right-10 md:bottom-[12%]",
  },
  final: {
    baseClass: "bg-slate-950",
    main: {
      desktop: "/images/home/scene-final-desktop.webp",
      mobile: "/images/home/scene-final-mobile.webp",
      frameClass:
        "right-[-8%] top-[9%] h-[32vh] w-[86vw] rounded-[5rem_0_0_5rem] md:right-[5%] md:top-[10%] md:h-[38vh] md:w-[54vw]",
      imageClass: "object-[50%_50%]",
      sizes: "(min-width: 768px) 54vw, 86vw",
    },
    secondary: {
      desktop: "/images/home/scene-start-desktop.webp",
      mobile: "/images/home/scene-start-mobile.webp",
      frameClass:
        "left-[7%] bottom-[12%] h-[126px] w-[126px] rounded-full md:left-[9%] md:bottom-[13%] md:h-[210px] md:w-[210px]",
      imageClass: "object-[42%_50%]",
      sizes: "(min-width: 768px) 210px, 126px",
    },
    shapeClass:
      "right-[-22%] bottom-[-8%] h-[360px] w-[360px] rounded-full bg-blue-300/18 blur-3xl md:h-[580px] md:w-[580px]",
    overlayClass:
      "bg-gradient-to-b from-slate-950/78 via-slate-950/50 to-slate-950/78 md:bg-gradient-to-r md:from-slate-950/78 md:via-slate-950/42 md:to-slate-950/52",
    typography: "06",
    typographyClass:
      "left-4 top-[20%] text-white/9 md:left-10 md:top-[18%]",
  },
} satisfies Record<string, Scene>;

type SceneId = keyof typeof scenes;

function isSceneId(value: string | null): value is SceneId {
  return Boolean(value && value in scenes);
}

function ScenePicture({
  layer,
  priority = false,
}: {
  layer: ImageLayer;
  priority?: boolean;
}) {
  return (
    <picture className={`absolute overflow-hidden ${layer.frameClass}`}>
      <source media="(min-width: 768px)" srcSet={layer.desktop} />
      <Image
        src={layer.mobile}
        alt=""
        fill
        sizes={layer.sizes}
        priority={priority}
        className={`scale-[1.018] object-cover transition-transform duration-[5200ms] ease-out motion-reduce:scale-100 ${
          layer.imageClass ?? ""
        }`}
      />
    </picture>
  );
}

function SceneCanvas({
  sceneId,
  isPrevious = false,
  isFadingPrevious = false,
}: {
  sceneId: SceneId;
  isPrevious?: boolean;
  isFadingPrevious?: boolean;
}) {
  const scene = scenes[sceneId];
  const opacityClass = isPrevious
    ? isFadingPrevious
      ? "opacity-0"
      : "opacity-100"
    : "opacity-100";

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${opacityClass}`}
    >
      <div className="absolute inset-0">
        {scene.main ? (
          <ScenePicture
            layer={scene.main}
            priority={sceneId === "start" && !isPrevious}
          />
        ) : null}
        {scene.secondary ? <ScenePicture layer={scene.secondary} /> : null}
      </div>
      <div
        className={`absolute transition-all duration-700 ${scene.shapeClass}`}
      />
      <div className={`absolute inset-0 ${scene.overlayClass}`} />
      <p
        className={`absolute select-none font-serif text-[7rem] font-black italic leading-none tracking-tight md:text-[14rem] ${scene.typographyClass}`}
      >
        {scene.typography}
      </p>
    </div>
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
          }, 800);
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
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-700 ${active.baseClass}`}
      aria-hidden="true"
    >
      {previousScene ? (
        <SceneCanvas
          sceneId={previousScene}
          isPrevious
          isFadingPrevious={isFadingPrevious}
        />
      ) : null}
      <SceneCanvas key={activeScene} sceneId={activeScene} />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/22 to-transparent" />
    </div>
  );
}
