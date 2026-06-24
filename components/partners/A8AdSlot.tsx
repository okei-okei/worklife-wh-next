type A8AdSlotProps = {
  html: string;
  className?: string;
  size?: "text" | "banner300x250" | "banner728x120" | "banner120x60";
};

export default function A8AdSlot({
  html,
  className = "",
  size = "banner300x250",
}: A8AdSlotProps) {
  const isWide = size === "banner728x120";

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50/40 p-3 ${className}`}
    >
      <p className="mb-2 text-xs font-bold text-amber-700">広告・紹介リンク</p>
      <div
        className={`a8-ad-slot mx-auto max-w-full overflow-hidden ${
          isWide ? "hidden md:block" : ""
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
