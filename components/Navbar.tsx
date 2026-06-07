import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-8 py-5 bg-white shadow">
      <h1 className="text-2xl font-bold text-blue-600">WorkLife WH</h1>

      <nav className="flex gap-6">
        <Link href="/">ホーム</Link>
        <Link href="/jobs">仕事</Link>
        <Link href="/properties">物件</Link>
        <div className="flex gap-4">
          <Link href="/login">ログイン</Link>

          <Link
            href="/register"
            className="
      bg-blue-600
      text-white
      px-4
      py-2
      rounded-lg
    "
          >
            無料登録
          </Link>
        </div>
      </nav>
    </header>
  );
}
