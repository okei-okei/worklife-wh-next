"use client";

import { useEffect, useState } from "react";

type ImageOrientation = "landscape" | "portrait" | "square" | "unknown";
type JobImageMode = "card" | "map" | "popup" | "detail";

type ResponsiveJobImageProps = {
  src: string | null | undefined;
  alt: string;
  mode: JobImageMode;
  className?: string;
};

export function getSafeJobImageUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const lowered = trimmed.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return null;

  return trimmed;
}

function getImageOrientation(
  naturalWidth: number,
  naturalHeight: number,
): ImageOrientation {
  if (!naturalWidth || !naturalHeight) return "unknown";

  const ratio = naturalWidth / naturalHeight;
  if (ratio > 1.2) return "landscape";
  if (ratio < 0.85) return "portrait";

  return "square";
}

function getContainerClassName(mode: JobImageMode, className?: string) {
  const base =
    "relative w-full overflow-hidden bg-[#F7F7F5] text-gray-900";
  const modeClassName =
    mode === "popup"
      ? "mb-2 aspect-[4/3] max-h-60 rounded-lg"
      : mode === "detail"
        ? "aspect-[4/3] max-h-[520px] rounded-xl md:aspect-[3/2]"
        : mode === "map"
          ? "aspect-[4/3] border-b border-gray-100 md:max-h-64"
          : "aspect-[4/3] border-b border-gray-100";

  return [base, modeClassName, className].filter(Boolean).join(" ");
}

export default function ResponsiveJobImage({
  src,
  alt,
  mode,
  className,
}: ResponsiveJobImageProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [orientation, setOrientation] =
    useState<ImageOrientation>("unknown");
  const safeSrc = getSafeJobImageUrl(src);

  useEffect(() => {
    setHasImageError(false);
    setOrientation("unknown");
  }, [safeSrc]);

  if (!safeSrc || hasImageError) return null;

  const shouldContain =
    orientation === "portrait" ||
    orientation === "square" ||
    orientation === "unknown";
  const imageClassName = shouldContain
    ? "h-full w-full object-contain object-center p-1.5"
    : "h-full w-full object-cover object-center";

  return (
    <div className={getContainerClassName(mode, className)}>
      {/* Job images are uploaded/user-provided URLs configured at runtime. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeSrc}
        alt={alt}
        className={imageClassName}
        loading="lazy"
        onError={() => setHasImageError(true)}
        onLoad={(event) => {
          setOrientation(
            getImageOrientation(
              event.currentTarget.naturalWidth,
              event.currentTarget.naturalHeight,
            ),
          );
        }}
      />
    </div>
  );
}
