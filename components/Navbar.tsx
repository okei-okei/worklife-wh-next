import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white px-4 py-4 shadow md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="min-w-0 whitespace-normal break-words text-2xl font-bold text-blue-700 md:text-3xl">
          WorkLife WH
        </h1>

        <nav className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3 text-base font-bold text-gray-900 md:justify-end md:gap-x-5">
          <Link href="/" className="whitespace-normal break-words leading-none">
            ホーム
          </Link>
          <Link
            href="/jobs"
            className="whitespace-normal break-words leading-none"
          >
            仕事
          </Link>
          <Link
            href="/properties"
            className="whitespace-normal break-words leading-none"
          >
            物件
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center md:flex-none md:gap-4">
            <Link
              href="/login"
              className="w-full whitespace-normal break-words rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-900 min-[420px]:w-auto md:border-0 md:px-0 md:py-0"
            >
              ログイン
            </Link>

            <Link
              href="/register"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white min-[420px]:w-auto"
            >
              無料登録
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
