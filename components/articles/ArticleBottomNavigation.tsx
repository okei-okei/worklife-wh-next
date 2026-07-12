import Link from "next/link";

export default function ArticleBottomNavigation() {
  return (
    <div className="space-y-3 border-t border-gray-200 pt-5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Link
          href="/articles"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
        >
          記事一覧
        </Link>
        <Link
          href="/partners"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
        >
          比較トップ
        </Link>
        <Link
          href="/mypage"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-bold text-gray-900 hover:bg-gray-50"
        >
          マイページ
        </Link>
      </div>
    </div>
  );
}
