import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-8 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 text-base font-medium text-gray-700 md:flex-row md:items-center md:justify-between">
        <p className="text-gray-900">© WorkLife WH</p>

        <nav className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link href="/terms" className="hover:text-blue-600">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-blue-600">
            プライバシーポリシー
          </Link>
          <Link href="/company-terms" className="hover:text-blue-600">
            掲載者向け規約
          </Link>
        </nav>
      </div>
    </footer>
  );
}
