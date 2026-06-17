import Link from "next/link";

type AdDisclosureNoticeProps = {
  compact?: boolean;
};

export default function AdDisclosureNotice({
  compact = false,
}: AdDisclosureNoticeProps) {
  return (
    <div
      className={`rounded-2xl border border-amber-200 bg-amber-50 text-amber-950 ${
        compact ? "p-4 text-sm" : "p-4 text-sm md:p-5"
      }`}
    >
      <p className="font-medium leading-7">
        このページには広告・紹介リンクが含まれる場合があります。掲載条件は
        WorkLife WHの基準に基づいて整理しています。契約前には必ず公式サイトをご確認ください。{" "}
        <Link
          href="/legal/affiliate-disclosure"
          className="font-bold text-amber-900 underline"
        >
          広告・紹介リンク開示
        </Link>
      </p>
    </div>
  );
}
