import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm font-medium text-gray-700 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-bold text-gray-900">© WorkLife WH</p>
          <p className="text-gray-700">お問い合わせ: worklife.wh@gmail.com</p>
        </div>

        <nav className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link href="/legal" className="hover:text-blue-600">
            法務一覧
          </Link>
          <Link href="/legal/terms" className="hover:text-blue-600">
            利用規約
          </Link>
          <Link href="/legal/privacy" className="hover:text-blue-600">
            プライバシーポリシー
          </Link>
          <Link href="/legal/cookies" className="hover:text-blue-600">
            Cookieポリシー
          </Link>
          <Link href="/legal/affiliate-disclosure" className="hover:text-blue-600">
            広告・アフィリエイト開示
          </Link>
          <Link href="/legal/ai-policy" className="hover:text-blue-600">
            AI利用ポリシー
          </Link>
          <Link href="/legal/job-posting" className="hover:text-blue-600">
            求人掲載規約
          </Link>
          <Link href="/legal/property-posting" className="hover:text-blue-600">
            物件掲載規約
          </Link>
          <Link href="/legal/community-guidelines" className="hover:text-blue-600">
            コミュニティガイドライン
          </Link>
          <Link href="/legal/data-transfer" className="hover:text-blue-600">
            データ利用ポリシー
          </Link>
        </nav>
      </div>
    </footer>
  );
}
