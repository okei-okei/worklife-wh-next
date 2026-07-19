import Link from "next/link";

type HomeLineLinkProps = {
  href: string;
  title: string;
  description?: string;
  className?: string;
};

export default function HomeLineLink({
  href,
  title,
  description,
  className = "",
}: HomeLineLinkProps) {
  return (
    <Link
      href={href}
      className={`group grid min-h-14 grid-cols-[minmax(0,1fr)_1.5rem] items-center gap-3 border-b border-[#D8D8D4] py-3 text-[#171717] transition hover:border-[#235347] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#235347] md:min-h-16 md:grid-cols-[minmax(0,1fr)_2rem] md:py-4 ${className}`}
    >
      <span className="min-w-0">
        <span className="block text-[15px] font-black leading-snug md:text-xl">
          {title}
        </span>
        {description ? (
          <span className="mt-1 block line-clamp-1 text-xs font-medium text-[#666666] md:text-sm">
            {description}
          </span>
        ) : null}
      </span>
      <span className="text-lg font-black text-[#235347] transition group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0">
        →
      </span>
    </Link>
  );
}
