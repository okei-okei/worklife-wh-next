import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex justify-between items-center px-8 py-5 bg-white shadow">
      <h1 className="text-2xl font-bold text-blue-600">WorkLife WH</h1>

      <nav className="flex gap-6">
        <Link href="/">ホーム</Link>
        <Link href="/jobs">仕事</Link>
        <Link href="/properties">物件</Link>
        <Link href="/login">ログイン</Link>
      </nav>
    </header>
  );
}
