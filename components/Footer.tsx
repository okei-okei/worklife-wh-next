import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm font-medium text-gray-700 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-bold text-gray-900">© WorkLife WH</p>
          <p className="text-gray-700">学生個人運営 / worklife.wh@gmail.com</p>
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
            Cookie
          </Link>
          <Link href="/legal/affiliate-disclosure" className="hover:text-blue-600">
            広告開示
          </Link>
          <Link href="/legal/business-terms" className="hover:text-blue-600">
            掲載者向け
          </Link>
          <Link href="/mypage/privacy" className="hover:text-blue-600">
            プライバシー設定
          </Link>
        </nav>
      </div>
    </footer>
  );
}
