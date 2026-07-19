import Image from "next/image";

type HomeImagePlaneProps = {
  desktopSrc: string;
  mobileSrc: string;
  alt: string;
  className: string;
  imageClassName?: string;
  fitClassName?: string;
  priority?: boolean;
  sizes: string;
};

export default function HomeImagePlane({
  desktopSrc,
  mobileSrc,
  alt,
  className,
  imageClassName = "object-center",
  fitClassName = "object-cover",
  priority = false,
  sizes,
}: HomeImagePlaneProps) {
  return (
    <picture className={`absolute block overflow-hidden ${className}`}>
      <source media="(min-width: 768px)" srcSet={desktopSrc} />
      <Image
        src={mobileSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`${fitClassName} saturate-[0.92] transition-transform duration-700 ease-out motion-reduce:transition-none ${imageClassName}`}
      />
    </picture>
  );
}
